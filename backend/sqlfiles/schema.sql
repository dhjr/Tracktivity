create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','faculty')),
  created_at timestamp with time zone default now()
);


create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  ktuid text not null unique,
  full_name text not null,
  department text not null,
  created_at timestamp with time zone default now()
);



create table public.faculty (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  department text not null,
  created_at timestamp with time zone default now()
);



create table public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  batch_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create index idx_batches_created_by on public.batches(created_by);




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



CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id),

  activity_id TEXT NOT NULL,
  points_awarded INTEGER NOT NULL CHECK (points_awarded >= 0),

  activity_name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  level TEXT,                   

  academic_year INTEGER NOT NULL CHECK (academic_year BETWEEN 1 AND 4),
  certificate_date DATE NOT NULL,
  certificate_url TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- need to add index
-- CREATE INDEX idx_submissions_student_id ON submissions(student_id);
-- CREATE INDEX idx_submissions_status ON submissions(status);
-- CREATE INDEX idx_submissions_activity_id ON submissions(activity_id);



-- edits

ALTER TABLE public.submissions
  RENAME COLUMN rejection_reason TO comments;


alter table public.batch_faculty rename column can_verify to is_admin;

ALTER TABLE public.students
  ADD COLUMN student_type TEXT NOT NULL DEFAULT 'regular'
    CHECK (student_type IN ('regular', 'lateralEntry', 'pwd')),

  ADD COLUMN grp1_points INTEGER NOT NULL DEFAULT 0
    CHECK (grp1_points >= 0 AND grp1_points <= 40),
  ADD COLUMN grp2_points INTEGER NOT NULL DEFAULT 0
    CHECK (grp2_points >= 0 AND grp2_points <= 40),
  ADD COLUMN grp3_points INTEGER NOT NULL DEFAULT 0
    CHECK (grp3_points >= 0 AND grp3_points <= 40),

  ADD CONSTRAINT total_points_regular
    CHECK (student_type != 'regular' OR (grp1_points + grp2_points + grp3_points) <= 120),
  ADD CONSTRAINT total_points_lateral
    CHECK (student_type != 'lateralEntry' OR (grp1_points + grp2_points + grp3_points) <= 90),
  ADD CONSTRAINT total_points_pwd
    CHECK (student_type != 'pwd' OR (grp1_points + grp2_points + grp3_points) <= 60);