-- Shikhi Digital schema.
--
-- Account model: the PARENT holds the account. Children are profiles hanging off
-- it and never hold credentials of their own — under-13s cannot meaningfully
-- consent to data processing, and this keeps consent captured at one place.
--
-- Every table is protected by row level security. Server actions run with the
-- signed-in user's session, so these policies are the real access control, not
-- a second line of defence behind application checks.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on signup
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'parent' check (role in ('parent', 'admin')),
  -- Recorded at signup. Presence of a timestamp is the consent record.
  consented_at timestamptz,
  created_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'Set to admin manually in the dashboard. Never self-assignable — see the update policy.';

-- ---------------------------------------------------------------------------
-- children: the learners
-- ---------------------------------------------------------------------------
create table public.children (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  birth_year int check (birth_year between 1990 and 2030),
  -- A motif slug from src/lib/storyboard/art.ts, so avatars need no uploads.
  avatar     text not null default 'star',
  locale     text not null default 'en',
  -- Reserved so individual child logins can be added later without a migration.
  user_id    uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create index children_parent_id_idx on public.children (parent_id);

-- ---------------------------------------------------------------------------
-- lessons: admin-authored, read by everyone signed in
-- ---------------------------------------------------------------------------
create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  subject     text not null,
  locale      text not null default 'en',
  source_text text not null,
  status      text not null default 'draft'
              check (status in ('draft', 'generating', 'ready', 'failed')),
  error       text,
  storyboard  jsonb,
  model       text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index lessons_status_idx on public.lessons (status);
create index lessons_locale_idx on public.lessons (locale);

-- ---------------------------------------------------------------------------
-- reasoning_attempts: a child explaining their own answer
-- ---------------------------------------------------------------------------
create table public.reasoning_attempts (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references public.children(id) on delete cascade,
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  question_id    text not null,
  answer_correct boolean not null,
  -- The child's own words. Regulated personal data; deletion cascades from the
  -- child, and from the parent's account above that.
  text           text not null check (char_length(text) between 1 and 600),
  quality        text not null check (quality in ('developing', 'solid', 'excellent')),
  moves          jsonb not null default '[]'::jsonb,
  response       text not null,
  pushback       text not null,
  flagged        boolean not null default false,
  created_at     timestamptz not null default now()
);

create index reasoning_attempts_child_created_idx
  on public.reasoning_attempts (child_id, created_at desc);
create index reasoning_attempts_flagged_idx
  on public.reasoning_attempts (flagged) where flagged;

-- ---------------------------------------------------------------------------
-- weekly_reports: frozen once written
-- ---------------------------------------------------------------------------
create table public.weekly_reports (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references public.children(id) on delete cascade,
  week_start       date not null,
  locale           text not null default 'en',
  attempt_count    int not null,
  lesson_count     int not null,
  lessons          jsonb not null,
  quote_attempt_id uuid not null references public.reasoning_attempts(id) on delete cascade,
  quote_text       text not null,
  quote_question   text not null,
  climbing_move    text not null,
  next_move        text not null,
  headline         text not null,
  summary          text not null,
  dinner_questions jsonb not null,
  model            text not null,
  created_at       timestamptz not null default now(),
  unique (child_id, week_start)
);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

-- security definer so it can read profiles without recursing through its own
-- RLS policy; search_path pinned so it cannot be hijacked by a rogue schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.owns_child(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.children
    where id = target and parent_id = auth.uid()
  );
$$;

-- Every new auth user gets a profile. Runs as definer because the user does not
-- exist in public.profiles yet, so no policy could permit the insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, consented_at)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lessons_touch_updated_at
  before update on public.lessons
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.children           enable row level security;
alter table public.lessons            enable row level security;
alter table public.reasoning_attempts enable row level security;
alter table public.weekly_reports     enable row level security;

-- profiles ------------------------------------------------------------------
create policy "read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Role is deliberately excluded from what a user may change: the check clause
-- pins it to whatever it already is, so nobody can promote themselves to admin.
create policy "update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- children ------------------------------------------------------------------
create policy "parents manage own children"
  on public.children for all
  using (parent_id = auth.uid() or public.is_admin())
  with check (parent_id = auth.uid());

-- lessons -------------------------------------------------------------------
-- Anyone signed in may read a published lesson. Drafts and failures stay with admins.
create policy "read published lessons"
  on public.lessons for select
  to authenticated
  using (status = 'ready' or public.is_admin());

create policy "admins write lessons"
  on public.lessons for insert
  to authenticated
  with check (public.is_admin());

create policy "admins update lessons"
  on public.lessons for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete lessons"
  on public.lessons for delete
  to authenticated
  using (public.is_admin());

-- reasoning_attempts --------------------------------------------------------
create policy "parents read own children attempts"
  on public.reasoning_attempts for select
  to authenticated
  using (public.owns_child(child_id) or public.is_admin());

create policy "parents write own children attempts"
  on public.reasoning_attempts for insert
  to authenticated
  with check (public.owns_child(child_id));

-- Deliberately no update policy: a child's words are never edited after the
-- fact. The weekly report quotes this table, and a quote has to be what they
-- actually wrote.

create policy "parents delete own children attempts"
  on public.reasoning_attempts for delete
  to authenticated
  using (public.owns_child(child_id));

-- weekly_reports ------------------------------------------------------------
create policy "parents read own children reports"
  on public.weekly_reports for select
  to authenticated
  using (public.owns_child(child_id) or public.is_admin());

create policy "parents write own children reports"
  on public.weekly_reports for insert
  to authenticated
  with check (public.owns_child(child_id));

-- No update policy: reports freeze once written.
