-- Listen Close: the listening skill.
--
-- Every activity in the product until now has been read-then-write. A child
-- who struggles to read struggles with all of it, and listening comprehension
-- -- which is a genuinely separate skill, and the one that carries a child
-- through a classroom, a conversation and an argument -- was never touched.
--
-- A short passage is spoken aloud with no text on screen. The child answers
-- what happened, then what it implies, then writes why they think so. The
-- transcript appears only afterwards.

create table public.listening_passages (
  id uuid primary key default gen_random_uuid(),

  locale text not null default 'en',

  -- Shown only AFTER listening. Seeing the title first gives away the answer
  -- to half the comprehension questions.
  title text not null,
  topic text not null,

  -- The words that get spoken. Revealed once the questions are answered, so a
  -- child can check what they actually missed rather than just being told.
  transcript text not null,

  -- Recall: did you catch what was said. Inference: what does it imply.
  -- Both are needed -- recall alone is a memory test, inference alone is
  -- unanswerable if you missed the facts.
  recall_question   text not null,
  recall_options    jsonb not null,
  inference_question text not null,
  inference_options  jsonb not null,

  -- The written follow-up on the inference question, where the reasoning
  -- grader takes over.
  defend_prompt text not null,

  status text not null default 'draft' check (status in ('draft', 'ready')),
  model  text,
  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A passage short enough to hold in your head. Longer than this and the
  -- exercise stops measuring listening and starts measuring memory.
  constraint transcript_length check (char_length(transcript) between 120 and 1200)
);

create index listening_passages_locale_idx
  on public.listening_passages (locale, created_at) where status = 'ready';

create table public.listening_attempts (
  id uuid primary key default gen_random_uuid(),

  child_id   uuid not null references public.children(id) on delete cascade,
  passage_id uuid not null references public.listening_passages(id) on delete cascade,

  -- Replaying is allowed and never penalised, but it is recorded: needing to
  -- hear something three times is real information about a child's listening,
  -- and hiding it would make the skill unmeasurable.
  plays int not null default 1 check (plays between 1 and 20),

  recall_correct    boolean not null,
  inference_correct boolean not null,

  -- The written explanation, graded by the same reasoning grader every other
  -- written activity uses. Same columns, so it feeds the same counters, the
  -- same archive and the same safety queue.
  text     text not null check (char_length(text) between 1 and 600),
  quality  text not null check (quality in ('developing', 'solid', 'excellent')),
  moves    jsonb not null default '[]'::jsonb,
  response text not null,
  pushback text not null,
  flagged  boolean not null default false,

  created_at timestamptz not null default now(),

  unique (child_id, passage_id)
);

create index listening_attempts_child_idx
  on public.listening_attempts (child_id, created_at desc);

create index listening_attempts_flagged_idx
  on public.listening_attempts (created_at desc) where flagged;

create trigger listening_passages_touch_updated_at
  before update on public.listening_passages
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.listening_passages enable row level security;
alter table public.listening_attempts enable row level security;

create policy "read published passages"
  on public.listening_passages for select
  to authenticated
  using (status = 'ready' or public.is_admin());

create policy "admins write passages"
  on public.listening_passages for insert
  to authenticated
  with check (public.is_admin());

create policy "admins update passages"
  on public.listening_passages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete passages"
  on public.listening_passages for delete
  to authenticated
  using (public.is_admin());

create policy "parents read own children listening attempts"
  on public.listening_attempts for select
  to authenticated
  using (public.owns_child(child_id) or public.is_admin());

create policy "parents write own children listening attempts"
  on public.listening_attempts for insert
  to authenticated
  with check (public.owns_child(child_id));

-- No update policy, as everywhere else: a child's words are never rewritten.

-- The safety queue reads every surface a child writes on.
-- Written to be safely re-runnable. The first attempt at this migration
-- applied the tables above but not this block, leaving the safety queue unable
-- to record a review of flagged listening writing -- so it has to be possible
-- to run again without erroring on what already exists.
alter table public.attempt_reviews
  add column if not exists listening_attempt_id uuid
    references public.listening_attempts(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'attempt_reviews_listening_attempt_id_key'
  ) then
    alter table public.attempt_reviews
      add constraint attempt_reviews_listening_attempt_id_key unique (listening_attempt_id);
  end if;
end $$;

alter table public.attempt_reviews
  drop constraint if exists attempt_reviews_one_source;

alter table public.attempt_reviews
  add constraint attempt_reviews_one_source
  check (num_nonnulls(attempt_id, steelman_attempt_id, listening_attempt_id) = 1);
