-- Which Thinking Level the child has already been congratulated on.
--
-- The rank itself is computed from activity, never stored — a stored total can
-- drift out of sync with what actually happened. This column only remembers
-- what has been *shown*, so a promotion is celebrated once rather than on every
-- visit, and on every device rather than per browser.
alter table public.children
  add column seen_rank text not null default 'noticer';
