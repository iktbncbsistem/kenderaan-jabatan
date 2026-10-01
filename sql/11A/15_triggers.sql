-- =========================================================
-- UPDATED AT FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;
drop trigger if exists trg_profiles_updated_at
on public.profiles;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists trg_vehicles_updated_at
on public.vehicles;

create trigger trg_vehicles_updated_at
before update on public.vehicles
for each row
execute function public.set_updated_at();


drop trigger if exists trg_drivers_updated_at
on public.drivers;

create trigger trg_drivers_updated_at
before update on public.drivers
for each row
execute function public.set_updated_at();


drop trigger if exists trg_driver_licenses_updated_at
on public.driver_licenses;

create trigger trg_driver_licenses_updated_at
before update on public.driver_licenses
for each row
execute function public.set_updated_at();


drop trigger if exists trg_vehicle_maintenance_updated_at
on public.vehicle_maintenance;

create trigger trg_vehicle_maintenance_updated_at
before update on public.vehicle_maintenance
for each row
execute function public.set_updated_at();


drop trigger if exists trg_travel_requests_updated_at
on public.travel_requests;

create trigger trg_travel_requests_updated_at
before update on public.travel_requests
for each row
execute function public.set_updated_at();
