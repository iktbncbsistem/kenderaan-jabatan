/*
 VMS Auth foundation for self-registration + Google Sign-In.
 Run in Supabase SQL Editor only after checking the existing profiles schema.
 This trigger creates/updates a basic profile for new Auth users and NEVER
 trusts a client-supplied admin role: all self-registered accounts become pemohon.
*/

create or replace function public.handle_vms_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    role,
    is_active
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    nullif(new.raw_user_meta_data->>'phone', ''),
    new.email,
    'pemohon',
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone);

  return new;
end;
$$;

drop trigger if exists on_vms_auth_user_created on auth.users;

create trigger on_vms_auth_user_created
after insert on auth.users
for each row
execute function public.handle_vms_new_user();
