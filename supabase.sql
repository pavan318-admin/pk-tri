-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  rating int check (rating between 1 and 5),
  message text,
  email text,
  version text,
  ua text
);
alter table public.feedback enable row level security;
-- anyone may send feedback; nobody can read it except you (in the Supabase dashboard)
create policy "anyone can send feedback" on public.feedback for insert to anon, authenticated with check (true);
