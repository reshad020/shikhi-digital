-- ---------------------------------------------------------------------------
-- YLE progress
--
-- Until now YLE practice was anonymous. Every set was marked in the browser
-- and then thrown away, which meant a child could work through the whole bank
-- and have nothing to show for it: the streak did not move, the rank did not
-- move, and the weekly report said the week had been empty. The two largest
-- sections of the product were invisible to every mechanism that exists to
-- make a child come back.
--
-- These two tables are what an account buys.
-- ---------------------------------------------------------------------------

-- One go at one practice set.
--
-- Repeats are allowed on purpose and there is no unique constraint, because
-- repetition IS the product here: a child preparing for an exam should be able
-- to sit the same part again next week and see the score move. Progress is
-- therefore computed from the BEST attempt per set, never the latest, so
-- trying again can only ever help.
create table public.yle_attempts (
  id uuid primary key default gen_random_uuid(),

  child_id uuid not null references public.children(id) on delete cascade,

  -- Deliberately not a foreign key. The practice bank lives in `content/*.ts`
  -- and ships with the app, so it is versioned in git and reviewed in diffs
  -- rather than stored as rows. A set that is retired later leaves its history
  -- behind, which is correct: the child did the work.
  set_id text not null check (char_length(set_id) between 1 and 160),

  level text not null check (level in ('starters', 'movers', 'flyers')),
  paper text not null check (paper in ('listening', 'reading-writing', 'speaking')),
  part  int  not null check (part between 1 and 7),
  kind  text not null check (char_length(kind) between 1 and 40),

  correct int not null check (correct >= 0),
  total   int not null check (total > 0),

  -- Stored rather than derived, so the curve in `syllabus.ts` can be retuned
  -- without silently rewriting what a child was told at the time.
  shields int not null check (shields between 0 and 5),

  -- Which questions went wrong, as [{id, correct}]. Keeping this is the whole
  -- point of the table: "weak on Flyers Part 4" is a thing a parent can act
  -- on, and it cannot be recovered from a score out of ten.
  answers jsonb not null default '[]'::jsonb,

  -- Null when the browser could not measure it. Never used for marking.
  seconds int check (seconds between 0 and 7200),

  created_at timestamptz not null default now(),

  constraint correct_within_total check (correct <= total)
);

create index yle_attempts_child_idx
  on public.yle_attempts (child_id, created_at desc);

-- Progress is read per level and per part far more often than anything else.
create index yle_attempts_child_part_idx
  on public.yle_attempts (child_id, level, paper, part);

-- Which sets a child has already seen, for serving something new.
create index yle_attempts_child_set_idx
  on public.yle_attempts (child_id, set_id);

-- The Flyers Part 7 story: the one YLE task that cannot be marked by matching
-- strings, and so the one worth storing in full.
create table public.yle_story_attempts (
  id uuid primary key default gen_random_uuid(),

  child_id  uuid not null references public.children(id) on delete cascade,
  prompt_id text not null check (char_length(prompt_id) between 1 and 160),

  -- The child's own words. Same shape as every other written activity, so it
  -- reaches the same archive and the same safety queue.
  text text not null check (char_length(text) between 1 and 1200),

  mark       int not null check (mark between 0 and 5),
  covers_all boolean not null,
  strength   text not null,
  -- [{quote, better, why}], at most three.
  fixes      jsonb not null default '[]'::jsonb,
  next_time  text not null,
  flagged    boolean not null default false,

  created_at timestamptz not null default now()
);

create index yle_story_attempts_child_idx
  on public.yle_story_attempts (child_id, created_at desc);

create index yle_story_attempts_flagged_idx
  on public.yle_story_attempts (created_at desc) where flagged;

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.yle_attempts       enable row level security;
alter table public.yle_story_attempts enable row level security;

create policy "parents read own children yle attempts"
  on public.yle_attempts for select
  to authenticated
  using (public.owns_child(child_id));

create policy "parents write own children yle attempts"
  on public.yle_attempts for insert
  to authenticated
  with check (public.owns_child(child_id));

create policy "parents read own children yle story attempts"
  on public.yle_story_attempts for select
  to authenticated
  using (public.owns_child(child_id));

create policy "parents write own children yle story attempts"
  on public.yle_story_attempts for insert
  to authenticated
  with check (public.owns_child(child_id));

-- No update or delete policy, as everywhere else in this schema: a child's own
-- work is never rewritten, and a score they were shown is never quietly
-- changed afterwards.

-- A flagged story belongs in the same review queue as every other piece of
-- writing, rather than a second one nobody remembers to open.
alter table public.attempt_reviews
  add column yle_story_attempt_id uuid
    references public.yle_story_attempts(id) on delete cascade;

alter table public.attempt_reviews
  drop constraint if exists attempt_reviews_one_source;

alter table public.attempt_reviews
  add constraint attempt_reviews_one_source
  check (
    num_nonnulls(
      attempt_id,
      steelman_attempt_id,
      listening_attempt_id,
      yle_story_attempt_id
    ) = 1
  );
