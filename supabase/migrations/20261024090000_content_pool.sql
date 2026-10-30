-- The content bank stops being finite.
--
-- Until now every activity came from `content/*.ts` -- 7,000-odd lines of
-- TypeScript generated offline and shipped in the bundle. That bank is a fixed
-- size, and `yle/progress.ts` says what it costs: "the bank lives in content
-- files, so the database has no table to exclude against", so what a child has
-- already seen has to be filtered in memory after loading everything.
--
-- This is the shared pool instead. The first child to want a (skill, level,
-- kind) that nobody has generated pays for the generation; every child after
-- them gets an indexed read. The bank grows for as long as the product is used
-- and never runs out.
--
-- ONE table for all four skills rather than one per skill. The rotation, the
-- seen-filter and the generate-on-miss path are then written and tested once,
-- and adding speaking costs no schema at all. The price is that the activity
-- itself is jsonb -- which is the right trade here, because every generation
-- already passes through a Zod schema in `generateJson()` before it is stored.
-- That validation is stricter than a column check could be, and it is the same
-- schema the reader parses with.

create table public.content_pool (
  id uuid primary key default gen_random_uuid(),

  skill text not null check (skill in ('listening', 'reading', 'writing', 'speaking')),

  -- CEFR, and deliberately per skill rather than one level per child: a child
  -- is routinely B1 reading and A1 speaking, and a single global level would
  -- mis-serve three skills to fit one.
  level text not null check (level in ('pre-a1', 'a1', 'a2', 'b1')),

  -- The activity shape within a skill -- 'listen-close', a YLE part, a writing
  -- task. Free text rather than an enum so a new activity is a code change and
  -- a seeder run, not a migration.
  kind text not null check (char_length(kind) between 1 and 40),

  topic  text not null default 'any',
  locale text not null default 'en',

  -- The activity. Shape is owned by the Zod schema named in `kind`.
  payload jsonb not null,

  -- Bumped when a kind's schema changes incompatibly. Rows at an older version
  -- are skipped by the serve query rather than deleted -- a child's history
  -- still points at them, and they cost nothing sitting there.
  payload_version int not null default 1 check (payload_version > 0),

  -- Least-used-first rotation. Keeps a cold pool spreading evenly instead of
  -- hammering whichever row happens to sort first.
  usage_count int not null default 0 check (usage_count >= 0),

  source text not null default 'ai' check (source in ('ai', 'seeded', 'hand')),
  model  text,

  -- 'draft' is generated-but-unreviewed; 'retired' is withdrawn without being
  -- deleted, because attempts still reference it.
  status text not null default 'ready' check (status in ('draft', 'ready', 'retired')),

  created_at timestamptz not null default now()
);

comment on table public.content_pool is
  'Shared, ever-growing activity bank. Generated on a miss, served from here on every hit.';

-- The serve query: narrow to (skill, level, kind, locale), drop what this child
-- has seen, take the least-used. Partial on status so the index holds only rows
-- that can actually be served.
create index content_pool_serve_idx
  on public.content_pool (skill, level, kind, locale, payload_version, usage_count)
  where status = 'ready';

-- Same query with a topic pinned, for "more like this one".
create index content_pool_topic_idx
  on public.content_pool (skill, level, kind, topic, usage_count)
  where status = 'ready';

-- ---------------------------------------------------------------------------
-- content_seen: what this child has already been given
-- ---------------------------------------------------------------------------
-- Written when content is SERVED, not when it is completed. A child who opens
-- an activity and walks away should still get something new next time -- being
-- handed the thing you just abandoned reads as the product being broken.
--
-- Separate from the per-skill attempt tables on purpose. Those record how the
-- work went and differ in shape for every skill; this records only "you have
-- had this one", which is what the pool query needs and is identical for all
-- four skills. One generic table keeps the serve path free of per-skill SQL.
create table public.content_seen (
  child_id uuid not null references public.children(id) on delete cascade,
  pool_id  uuid not null references public.content_pool(id) on delete cascade,
  seen_at  timestamptz not null default now(),

  -- Composite key, so re-serving the same row is an idempotent
  -- `on conflict do nothing` and the exclusion subquery is an index scan.
  primary key (child_id, pool_id)
);

create index content_seen_child_idx on public.content_seen (child_id, seen_at desc);

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.content_pool enable row level security;
alter table public.content_seen enable row level security;

-- Pool content is not anybody's private data -- it is the product. Any signed-in
-- user reads what is ready; admins also see drafts and retired rows.
create policy "read ready pool content"
  on public.content_pool for select
  to authenticated
  using (status = 'ready' or public.is_admin());

-- No insert, update or delete policy for `authenticated`, and that is the point.
-- Generated rows are authored by the SYSTEM, not by the child whose request
-- happened to trigger the generation, so the serve path writes them with the
-- service-role client. Giving every signed-in user insert on the shared bank
-- would let one account poison what every other child is served.
create policy "admins write pool content"
  on public.content_pool for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "parents read own children seen rows"
  on public.content_seen for select
  to authenticated
  using (public.owns_child(child_id) or public.is_admin());

create policy "parents write own children seen rows"
  on public.content_seen for insert
  to authenticated
  with check (public.owns_child(child_id));

-- No update and no delete: the seen list is a history, and a child who could
-- clear it could farm the same easy activity forever.

-- ---------------------------------------------------------------------------
-- bump_pool_usage: atomic rotation counter
-- ---------------------------------------------------------------------------
-- `usage_count` is what makes rotation fair, and read-then-write from the
-- application would lose increments exactly when the pool is busiest -- two
-- children served the same row at once both write the same number back, so the
-- row looks less used than it is and keeps winning the sort.
--
-- security definer because the table is admin-write by policy and this is the
-- one mutation an ordinary serve is allowed to make. It can only ever add one
-- to a counter on a row that already exists.
create or replace function public.bump_pool_usage(target uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.content_pool
     set usage_count = usage_count + 1
   where id = target;
$$;

revoke all on function public.bump_pool_usage(uuid) from public;
grant execute on function public.bump_pool_usage(uuid) to authenticated;
