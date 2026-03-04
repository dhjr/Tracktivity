create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','faculty')),
  created_at timestamp with time zone default now()
);

-- alter table public.profiles enable row level security;

-- create policy "Users can insert own profile"
-- on public.profiles
-- for insert
-- with check (auth.uid() = id);

-- create policy "Users can view own profile"
-- on public.profiles
-- for select
-- using (auth.uid() = id);

-- create policy "Users can update own profile except role"
-- on public.profiles
-- for update
-- using (auth.uid() = id);

