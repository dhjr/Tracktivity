create or replace function public.handle_update_user()
returns trigger as $$
begin
  -- 1. Update public.profiles
  update public.profiles
  set role = new.raw_user_meta_data->>'role'
  where id = new.id;

  -- 2. Update students or faculty depending on role
  if new.raw_user_meta_data->>'role' = 'student' then
    update public.students
    set full_name = new.raw_user_meta_data->>'name',
        department = new.raw_user_meta_data->>'department',
        ktuid = new.raw_user_meta_data->>'ktuId',
        student_type = COALESCE(new.raw_user_meta_data->>'studentCategory', 'regular')
    where id = new.id;
  elsif new.raw_user_meta_data->>'role' = 'faculty' then
    update public.faculty
    set full_name = new.raw_user_meta_data->>'name',
        department = new.raw_user_meta_data->>'department'
    where id = new.id;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop the trigger if it exists to avoid errors
drop trigger if exists on_auth_user_updated on auth.users;

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_update_user();
