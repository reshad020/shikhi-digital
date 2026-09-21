-- Spot the Trick: the puzzle half of hub C.
--
-- The artefact is stored as jsonb rather than as an image because it is drawn
-- from data at render time — a truncated axis has to actually be truncated, and
-- a picture of one cannot be translated, resized or read by a screen reader.

create table public.trick_puzzles (
  id uuid primary key default gen_random_uuid(),

  -- Technique slug from src/lib/tricks/techniques.ts.
  technique text not null,
  locale    text not null default 'en',

  -- The Artefact shape from src/lib/tricks/types.ts.
  artefact jsonb not null,
  -- Technique slugs offered as answers, including the correct one.
  options  jsonb not null,

  explanation text not null,

  status text not null default 'draft' check (status in ('draft', 'ready')),
  model  text,
  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trick_puzzles_ready_idx
  on public.trick_puzzles (locale, technique) where status = 'ready';

create table public.puzzle_attempts (
  id uuid primary key default gen_random_uuid(),

  child_id  uuid not null references public.children(id) on delete cascade,
  puzzle_id uuid not null references public.trick_puzzles(id) on delete cascade,

  correct     boolean not null,
  chosen      text not null,
  created_at  timestamptz not null default now(),

  unique (child_id, puzzle_id)
);

create index puzzle_attempts_child_idx on public.puzzle_attempts (child_id, created_at desc);

create trigger trick_puzzles_touch_updated_at
  before update on public.trick_puzzles
  for each row execute function public.touch_updated_at();

alter table public.trick_puzzles   enable row level security;
alter table public.puzzle_attempts enable row level security;

create policy "read published puzzles"
  on public.trick_puzzles for select
  to authenticated
  using (status = 'ready' or public.is_admin());

create policy "admins write puzzles"
  on public.trick_puzzles for insert to authenticated with check (public.is_admin());
create policy "admins update puzzles"
  on public.trick_puzzles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete puzzles"
  on public.trick_puzzles for delete to authenticated using (public.is_admin());

create policy "parents read own children puzzle attempts"
  on public.puzzle_attempts for select to authenticated
  using (public.owns_child(child_id) or public.is_admin());
create policy "parents write own children puzzle attempts"
  on public.puzzle_attempts for insert to authenticated
  with check (public.owns_child(child_id));
