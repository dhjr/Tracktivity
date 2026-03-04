-- Fixes the signup error (Database error saving new user)
-- The old trigger tried to insert 'email' and 'name' into 'profiles', 
-- which were removed in the latest schema update.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Insert into profiles with just id and role (as per new schema)
  insert into public.profiles (id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'role'
  );

  -- 2. Insert into role-specific tables
  -- Note: 'department' is set as NOT NULL in the schema but isn't collected during signup.
  -- Here we use a placeholder 'Pending' so the insert succeeds.
  if new.raw_user_meta_data->>'role' = 'student' then
    insert into public.students (id, ktuid, full_name, department)
    values (
      new.id, 
      new.raw_user_meta_data->>'ktuId', 
      new.raw_user_meta_data->>'name', 
      'Pending'
    );
  elsif new.raw_user_meta_data->>'role' = 'faculty' then
    insert into public.faculty (id, full_name, department)
    values (
      new.id, 
      new.raw_user_meta_data->>'name', 
      'Pending'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
