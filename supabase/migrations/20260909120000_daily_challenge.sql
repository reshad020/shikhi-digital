-- Fake or Real: the daily habit engine.
--
-- One challenge per calendar day per locale. A child sees two claims, picks the
-- false one, then names the tell. Ninety seconds, every day — this is what makes
-- a subscription worth renewing, where Defend Your Answer is what makes it worth
-- buying.

create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(),

  -- The day this goes live. One per locale per day.
  publish_on date not null,
  locale     text not null default 'en',

  true_claim  text not null,
  false_claim text not null,

  -- The correct tell slug from src/lib/daily/tells.ts.
  tell text not null,
  -- 3-4 tell slugs including the correct one, in display order.
  tell_options jsonb not null,

  -- Shown after answering: why the false claim is false, and what is actually true.
  explanation text not null,
  -- Where the true claim comes from. Non-negotiable — see the check below.
  source_note text not null,

  status text not null default 'draft' check (status in ('draft', 'ready')),
  model  text,
  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (publish_on, locale),
  -- A "spot the false claim" game that cannot say where the true claim came from
  -- teaches the wrong lesson. Enforced in the database, not just in review.
  constraint source_note_not_empty check (char_length(trim(source_note)) > 0)
);

create index daily_challenges_publish_idx
  on public.daily_challenges (locale, publish_on desc) where status = 'ready';

-- One attempt per child per challenge. The unique constraint is the anti-retry
-- rule: a daily challenge you can redo until you get it right is not a habit.
create table public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),

  child_id     uuid not null references public.children(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,

  picked_correctly boolean not null,
  tell_correct     boolean not null,
  -- The tell the child actually chose, for the "what do they miss" analysis.
  chosen_tell text not null,

  created_at timestamptz not null default now(),

  unique (child_id, challenge_id)
);

create index challenge_attempts_child_idx
  on public.challenge_attempts (child_id, created_at desc);

create trigger daily_challenges_touch_updated_at
  before update on public.daily_challenges
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.daily_challenges  enable row level security;
alter table public.challenge_attempts enable row level security;

-- A child may read today's challenge and any earlier one, never a future one:
-- tomorrow's answer must not be fetchable today.
create policy "read published challenges"
  on public.daily_challenges for select
  to authenticated
  using ((status = 'ready' and publish_on <= (now() at time zone 'utc')::date) or public.is_admin());

create policy "admins write challenges"
  on public.daily_challenges for insert
  to authenticated
  with check (public.is_admin());

create policy "admins update challenges"
  on public.daily_challenges for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete challenges"
  on public.daily_challenges for delete
  to authenticated
  using (public.is_admin());

create policy "parents read own children attempts"
  on public.challenge_attempts for select
  to authenticated
  using (public.owns_child(child_id) or public.is_admin());

create policy "parents write own children attempts"
  on public.challenge_attempts for insert
  to authenticated
  with check (public.owns_child(child_id));

-- No update policy: an answered challenge stays answered.
