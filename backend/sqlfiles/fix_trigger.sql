create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Insert into public.profiles
  insert into public.profiles (id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'role'
  );

  -- 2. Insert into students or faculty depending on role
  if new.raw_user_meta_data->>'role' = 'student' then
    insert into public.students (id, ktuid, full_name, department, student_type)
    values (
      new.id,
      new.raw_user_meta_data->>'ktuId',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'department',
      COALESCE(new.raw_user_meta_data->>'studentCategory', 'regular')
    );
  elsif new.raw_user_meta_data->>'role' = 'faculty' then
    insert into public.faculty (id, full_name, department)
    values (
      new.id,
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'department'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
