-- ---------------------------------------------------------------------------
-- A daily goal
--
-- The streak already answers "did you show up?". It does not answer "how much
-- is enough today?", and without that the honest answer is "more", which is
-- the answer that makes a child close the tab.
--
-- A small, stated, reachable target does the opposite: it ends. A child who
-- finishes two sets has finished, and can stop having won rather than stop
-- having given up. The number is deliberately low by default, because a goal
-- that is usually missed is worse than no goal.
--
-- It lives on the child rather than in a constant so that the parent can move
-- it. A nine-year-old three weeks from an exam and a six-year-old starting out
-- do not want the same number, and the person who knows which is which is not
-- us.
-- ---------------------------------------------------------------------------

alter table public.children
  add column daily_goal int not null default 2
    check (daily_goal between 1 and 10);

comment on column public.children.daily_goal is
  'Practice sets per day this child is aiming for. Set by the parent. '
  'Caps at 10 deliberately: beyond that it stops being a goal and becomes a '
  'quota, and this product does not measure children by volume.';
