-- =========================================================
-- VEHICLE AVAILABILITY
-- =========================================================

create table if not exists public.vehicle_availability (

    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    start_datetime timestamptz not null,

    end_datetime timestamptz not null,

    availability_type text not null,

    reference_id uuid,

    reason text,

    created_by uuid references public.profiles(id)
        on delete set null,

    created_at timestamptz not null default now(),

    constraint chk_vehicle_availability_time
        check (end_datetime > start_datetime)
);

create index if not exists idx_vehicle_availability_vehicle
on public.vehicle_availability(vehicle_id);

create index if not exists idx_vehicle_availability_dates
on public.vehicle_availability(
    start_datetime,
    end_datetime
);
