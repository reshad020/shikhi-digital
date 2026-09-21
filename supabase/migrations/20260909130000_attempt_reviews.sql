-- The review queue for flagged reasoning.
--
-- Deliberately a separate table rather than a `reviewed_at` column on
-- reasoning_attempts: that table has no update policy at all, because a child's
-- words are never edited after the fact. Adding one so a moderator could tick a
-- box would open a hole for the sake of a timestamp.

create table public.attempt_reviews (
  id uuid primary key default gen_random_uuid(),

  attempt_id  uuid not null unique references public.reasoning_attempts(id) on delete cascade,
  reviewed_by uuid not null references public.profiles(id) on delete cascade,

  -- ok            = normal childhood, no action
  -- needs_contact = the parent should be told
  outcome text not null check (outcome in ('ok', 'needs_contact')),
  note    text,

  created_at timestamptz not null default now()
);

alter table public.attempt_reviews enable row level security;

create policy "admins read reviews"
  on public.attempt_reviews for select
  to authenticated
  using (public.is_admin());

create policy "admins write reviews"
  on public.attempt_reviews for insert
  to authenticated
  with check (public.is_admin() and reviewed_by = auth.uid());
