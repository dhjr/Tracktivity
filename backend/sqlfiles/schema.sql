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

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  batch_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create index idx_batches_created_by on public.batches(created_by);

-- alter table public.batches enable row level security;


create table public.batch_members (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','faculty','student')),
  joined_at timestamp with time zone default now(),
  unique(batch_id, user_id)
);

create index idx_batch_members_batch_id on public.batch_members(batch_id);
create index idx_batch_members_user_id on public.batch_members(user_id);

-- alter table public.batch_members enable row level security;


