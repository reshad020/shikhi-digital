-- Steelman Arena.
--
-- The ladder has always topped out at "Steelmanner" — the child who can make
-- the strongest possible case against themselves — and nothing in the product
-- trained it. Defend Your Answer was also the only activity that could move the
-- quality counters at all, so the top of the progression was effectively
-- unreachable by design accident.
--
-- Here a child is given a claim, says which side they actually believe, and is
-- then asked to argue the OTHER one. The grade is about how fairly they
-- represented a view they disagree with. Winning is not a category.

create table public.steelman_prompts (
  id uuid primary key default gen_random_uuid(),

  locale text not null default 'en',

  -- The disagreement, phrased so an 8-13 year old has a real opinion about it.
  claim   text not null,
  context text not null,

  -- The two sides, each stated in the words someone who holds it would use.
  side_a text not null,
  side_b text not null,

  -- The strongest point for each side. Revealed only AFTER the child has
  -- written, so they can see whether they found it themselves. Withholding it
  -- until then is the whole exercise; showing it up front turns the activity
  -- into copying.
  best_for_a text not null,
  best_for_b text not null,

  status text not null default 'draft' check (status in ('draft', 'ready')),
  model  text,
  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A claim with an obviously correct side is not a steelman exercise, so both
  -- sides must actually be written out.
  constraint sides_not_empty check (
    char_length(trim(side_a)) > 0 and char_length(trim(side_b)) > 0
  )
);

create index steelman_prompts_locale_idx
  on public.steelman_prompts (locale, created_at) where status = 'ready';

create table public.steelman_attempts (
  id uuid primary key default gen_random_uuid(),

  child_id  uuid not null references public.children(id) on delete cascade,
  prompt_id uuid not null references public.steelman_prompts(id) on delete cascade,

  -- Which side the child actually holds. Recorded because the graded text is
  -- the case for the other one, and without this the writing is unreadable.
  believes text not null check (believes in ('a', 'b')),

  -- The child's own words, arguing against themselves. Regulated personal
  -- data; deletion cascades from the child and from the parent above that.
  text text not null check (char_length(text) between 1 and 600),

  quality text not null check (quality in ('developing', 'solid', 'excellent')),

  -- The axis that makes this a steelman grader rather than an essay grader:
  -- did they represent the other side as its holders would recognise it?
  fairness text not null check (fairness in ('strawman', 'partial', 'fair', 'generous')),

  moves    jsonb not null default '[]'::jsonb,
  response text not null,
  pushback text not null,
  flagged  boolean not null default false,

  created_at timestamptz not null default now(),

  -- One go per claim. Rewriting until the grader is satisfied would teach
  -- pleasing a grader, which is the opposite of the skill.
  unique (child_id, prompt_id)
);

create index steelman_attempts_child_idx
  on public.steelman_attempts (child_id, created_at desc);

-- Mirrors reasoning_attempts: the safety queue reads across both.
create index steelman_attempts_flagged_idx
  on public.steelman_attempts (created_at desc) where flagged;

create trigger steelman_prompts_touch_updated_at
  before update on public.steelman_prompts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.steelman_prompts  enable row level security;
alter table public.steelman_attempts enable row level security;

create policy "read published steelman prompts"
  on public.steelman_prompts for select
  to authenticated
  using (status = 'ready' or public.is_admin());

create policy "admins write steelman prompts"
  on public.steelman_prompts for insert
  to authenticated
  with check (public.is_admin());

create policy "admins update steelman prompts"
  on public.steelman_prompts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete steelman prompts"
  on public.steelman_prompts for delete
  to authenticated
  using (public.is_admin());

create policy "parents read own children steelman attempts"
  on public.steelman_attempts for select
  to authenticated
  using (public.owns_child(child_id) or public.is_admin());

create policy "parents write own children steelman attempts"
  on public.steelman_attempts for insert
  to authenticated
  with check (public.owns_child(child_id));

-- No update policy and no delete policy, exactly as for reasoning_attempts:
-- a child's words are never rewritten after the fact.

-- ---------------------------------------------------------------------------
-- the safety queue has to see this writing too
-- ---------------------------------------------------------------------------
--
-- Steelman Arena is a second place a child writes freely, so it is a second
-- place the grader can raise `flagged`. Shipping it without extending the
-- review queue would recreate exactly the bug /admin/flagged was built to fix:
-- a column that is written, indexed, and never read by a human.
--
-- A nullable second reference rather than dropping the foreign key: both
-- sources keep their delete cascade, so reviews of a deleted child's writing
-- go with it.

alter table public.attempt_reviews
  alter column attempt_id drop not null;

alter table public.attempt_reviews
  add column steelman_attempt_id uuid unique
    references public.steelman_attempts(id) on delete cascade;

-- Exactly one source per review row. Without this a review could point at
-- nothing, or at two different pieces of writing.
alter table public.attempt_reviews
  add constraint attempt_reviews_one_source
  check (num_nonnulls(attempt_id, steelman_attempt_id) = 1);
