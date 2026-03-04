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

create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  ktuid text not null unique,
  full_name text not null,
  department text not null,
  created_at timestamp with time zone default now()
);

-- alter table public.students enable row level security;

-- create policy "Student can view own record"
-- on public.students
-- for select
-- using (auth.uid() = id);

-- create policy "Student can update own record"
-- on public.students
-- for update
-- using (auth.uid() = id);

create table public.faculty (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  department text not null,
  created_at timestamp with time zone default now()
);

-- alter table public.faculty enable row level security;

-- create policy "Faculty can view own record"
-- on public.faculty
-- for select
-- using (auth.uid() = id);