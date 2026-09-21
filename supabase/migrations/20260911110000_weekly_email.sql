-- Weekly report delivery.
--
-- Until now a report only existed if a child happened to hand a device to a
-- parent at the right moment. The artefact the whole product is for was
-- therefore read by almost nobody, and a subscription whose value nobody sees
-- each week is a subscription that gets cancelled.

-- Sent exactly once per report. A report freezes when it is generated, so
-- re-sending would mail an identical page twice; more importantly a crashed or
-- retried job must never mail a parent the same thing again.
alter table public.weekly_reports
  add column emailed_at timestamptz;

create index weekly_reports_unsent_idx
  on public.weekly_reports (week_start) where emailed_at is null;

-- Opt-out. Default on, because a parent who created an account to read weekly
-- reports about their child has asked for weekly reports about their child --
-- and the unsubscribe link in every email flips this with no login required.
alter table public.profiles
  add column weekly_email boolean not null default true;

-- No new policy, and deliberately no column grants.
--
-- The existing "update own profile" policy in the initial migration already
-- covers this column, and it already solves the problem a new policy would
-- have had to solve: its `with check` pins `role` to whatever the row already
-- holds, so a parent updating their own profile cannot promote themselves to
-- admin. Adding a second policy here would have been redundant, and narrowing
-- the table to a column-level grant would have quietly removed the ability to
-- update anything else on your own profile.
