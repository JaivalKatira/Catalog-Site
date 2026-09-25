-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null
);

-- Lock the table down. With RLS enabled and no SELECT/UPDATE/DELETE
-- policy, the public anon key used in the website can ONLY insert new
-- rows -- it can never read, edit, or delete anything. Only you, logged
-- into the Supabase dashboard as the project owner, can view the data
-- (via Table Editor, which uses a privileged connection, not this key).

alter table public.leads enable row level security;

create policy "Public can insert leads"
on public.leads
for insert
to anon
with check (true);

-- No SELECT / UPDATE / DELETE policy is created for "anon" on purpose.
