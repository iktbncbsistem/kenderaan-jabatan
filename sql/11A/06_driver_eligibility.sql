-- =========================================================
-- DRIVER VEHICLE ELIGIBILITY
-- =========================================================

create table if not exists public.driver_vehicle_eligibility (

    id uuid primary key default gen_random_uuid(),

    driver_id uuid not null
        references public.drivers(id)
        on delete cascade,

    vehicle_type public.vehicle_type not null,

    is_eligible boolean not null default true,

    verified_by uuid references public.profiles(id)
        on delete set null,

    verified_at timestamptz,

    notes text,

    unique(driver_id, vehicle_type)
);

create index if not exists idx_driver_eligibility
on public.driver_vehicle_eligibility(
    driver_id,
    vehicle_type
);
