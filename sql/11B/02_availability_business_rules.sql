-- ============================================================
-- SPK IKTBN CHEMBONG
-- FASA 11B: AVAILABILITY ENGINE + BUSINESS RULES
-- Jalankan selepas Fasa 11A Core Schema
-- ============================================================

-- 1. Semak pertembungan jadual perjalanan
create or replace function public.vehicle_has_trip_conflict(
  p_vehicle_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_exclude_trip_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips t
    where t.vehicle_id = p_vehicle_id
      and t.status <> 'cancelled'
      and (p_exclude_trip_id is null or t.id <> p_exclude_trip_id)
      and tstzrange(t.scheduled_departure,
                    coalesce(t.scheduled_return, t.scheduled_departure),
                    '[]')
          && tstzrange(p_start, p_end, '[]')
  );
$$;

-- 2. Semak maintenance/service/breakdown pada tempoh perjalanan
create or replace function public.vehicle_has_maintenance_conflict(
  p_vehicle_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vehicle_maintenance m
    where m.vehicle_id = p_vehicle_id
      and lower(m.status) not in ('cancelled','completed')
      and tstzrange(m.start_datetime,
                    coalesce(m.end_datetime, m.start_datetime),
                    '[]')
          && tstzrange(p_start, p_end, '[]')
  );
$$;

-- 3. Satu fungsi utama untuk menentukan availability
create or replace function public.is_vehicle_available(
  p_vehicle_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_exclude_trip_id uuid default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status public.vehicle_status;
  v_active boolean;
begin
  select status, is_active
    into v_status, v_active
  from public.vehicles
  where id = p_vehicle_id;

  if not found then return false; end if;
  if v_active = false then return false; end if;

  if v_status in (
    'under_maintenance','service','breakdown','inactive','retired'
  ) then
    return false;
  end if;

  if public.vehicle_has_trip_conflict(
       p_vehicle_id,p_start,p_end,p_exclude_trip_id
     ) then
    return false;
  end if;

  if public.vehicle_has_maintenance_conflict(
       p_vehicle_id,p_start,p_end
     ) then
    return false;
  end if;

  return true;
end;
$$;

-- 4. Senarai kenderaan yang boleh dipilih untuk sesuatu tempoh
create or replace function public.get_available_vehicles(
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  id uuid,
  registration_no text,
  vehicle_type_id bigint,
  fuel_type public.fuel_type,
  status public.vehicle_status
)
language sql
stable
security definer
set search_path = public
as $$
  select v.id, v.registration_no, v.vehicle_type_id,
         v.fuel_type, v.status
  from public.vehicles v
  where public.is_vehicle_available(v.id,p_start,p_end)
  order by v.registration_no;
$$;

-- 5. Pastikan trip baharu tidak bypass availability
create or replace function public.validate_trip_vehicle_availability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_vehicle_available(
    new.vehicle_id,
    new.scheduled_departure,
    coalesce(new.scheduled_return,new.scheduled_departure),
    case when tg_op='UPDATE' then old.id else null end
  ) then
    raise exception 'Kenderaan tidak tersedia untuk tempoh perjalanan yang dipilih.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_trip_vehicle_availability
on public.trips;

create trigger trg_validate_trip_vehicle_availability
before insert or update of vehicle_id, scheduled_departure, scheduled_return, status
on public.trips
for each row
when (new.status <> 'cancelled')
execute function public.validate_trip_vehicle_availability();

-- 6. Cegah mileage balik lebih kecil daripada mileage bertolak
create or replace function public.validate_trip_mileage()
returns trigger
language plpgsql
as $$
begin
  if new.start_mileage is not null
     and new.end_mileage is not null
     and new.end_mileage < new.start_mileage then
    raise exception 'Mileage balik tidak boleh lebih rendah daripada mileage bertolak.';
  end if;

  if new.mileage_entered_by is null and
     (new.start_mileage is not null or new.end_mileage is not null) then
    new.mileage_entered_by := auth.uid();
    new.mileage_entered_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_trip_mileage on public.trip_logs;

create trigger trg_validate_trip_mileage
before insert or update on public.trip_logs
for each row execute function public.validate_trip_mileage();

-- 7. Pastikan hanya kenderaan EV menerima rekod charging
create or replace function public.validate_ev_charging_vehicle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fuel public.fuel_type;
begin
  select fuel_type into v_fuel
  from public.vehicles
  where id = new.vehicle_id;

  if v_fuel is distinct from 'electric' then
    raise exception 'Sesi charging hanya dibenarkan untuk kenderaan EV.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_ev_charging_vehicle
on public.ev_charging_sessions;

create trigger trg_validate_ev_charging_vehicle
before insert or update on public.ev_charging_sessions
for each row execute function public.validate_ev_charging_vehicle();

-- 8. Pastikan hanya satu kad minyak aktif dan satu pemandu memegangnya pada satu masa
create unique index if not exists uq_active_fuel_card_assignment
on public.fuel_card_assignments(fuel_card_id)
where returned_at is null;

-- 9. Pemandu gantian mesti ada lantikan aktif yang telah diverifikasi
create or replace function public.replacement_driver_is_valid(
  p_driver_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.drivers d
    join public.driver_appointments a on a.driver_id=d.id
    where d.id=p_driver_id
      and d.category='replacement'
      and d.is_active=true
      and a.status='active'
      and a.verified_at is not null
      and (a.appointment_end_date is null
           or a.appointment_end_date >= current_date)
  );
$$;

create or replace function public.validate_trip_driver()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category public.driver_category;
begin
  select category into v_category
  from public.drivers
  where id=new.driver_id;

  if v_category='replacement'
     and not public.replacement_driver_is_valid(new.driver_id) then
    raise exception 'Pemandu gantian tidak mempunyai surat lantikan Pengarah yang sah dan telah disahkan.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_trip_driver on public.trips;

create trigger trg_validate_trip_driver
before insert or update of driver_id on public.trips
for each row execute function public.validate_trip_driver();

-- 10. Index untuk availability
create index if not exists idx_trips_vehicle_status_time
on public.trips(vehicle_id,status,scheduled_departure,scheduled_return);

create index if not exists idx_maintenance_vehicle_status_time
on public.vehicle_maintenance(vehicle_id,status,start_datetime,end_datetime);

-- 11. RLS untuk operasi penting
alter table public.vehicle_maintenance enable row level security;
alter table public.ev_charging_sessions enable row level security;
alter table public.fuel_transactions enable row level security;
alter table public.fuel_card_assignments enable row level security;
alter table public.incidents enable row level security;

drop policy if exists "maintenance authenticated read"
on public.vehicle_maintenance;
create policy "maintenance authenticated read"
on public.vehicle_maintenance for select
to authenticated
using (true);

drop policy if exists "maintenance management write"
on public.vehicle_maintenance;
create policy "maintenance management write"
on public.vehicle_maintenance for all
to authenticated
using (
  public.has_role('admin')
  or public.has_role('pegawai_kenderaan')
  or public.has_role('penyelia')
)
with check (
  public.has_role('admin')
  or public.has_role('pegawai_kenderaan')
  or public.has_role('penyelia')
);

drop policy if exists "ev charging authenticated read"
on public.ev_charging_sessions;
create policy "ev charging authenticated read"
on public.ev_charging_sessions for select
to authenticated
using (true);

drop policy if exists "ev charging operations write"
on public.ev_charging_sessions;
create policy "ev charging operations write"
on public.ev_charging_sessions for insert
to authenticated
with check (
  public.has_role('admin')
  or public.has_role('pegawai_kenderaan')
  or public.has_role('penyelia')
  or public.has_role('pemandu')
);

drop policy if exists "fuel assignment authenticated read"
on public.fuel_card_assignments;
create policy "fuel assignment authenticated read"
on public.fuel_card_assignments for select
to authenticated
using (true);

drop policy if exists "fuel assignment management write"
on public.fuel_card_assignments;
create policy "fuel assignment management write"
on public.fuel_card_assignments for all
to authenticated
using (
  public.has_role('admin')
  or public.has_role('pegawai_kenderaan')
  or public.has_role('penyelia')
)
with check (
  public.has_role('admin')
  or public.has_role('pegawai_kenderaan')
  or public.has_role('penyelia')
);

-- 12. Contoh semakan manual selepas SQL dijalankan:
-- select * from public.get_available_vehicles(
--   '2026-10-01 08:00+08',
--   '2026-10-01 17:00+08'
-- );
--
-- select public.is_vehicle_available(
--   '<vehicle-uuid>',
--   '2026-10-01 08:00+08',
--   '2026-10-01 17:00+08'
-- );
