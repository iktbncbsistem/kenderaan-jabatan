-- =========================================================
-- VEHICLE MAINTENANCE
-- =========================================================

create table if not exists public.vehicle_maintenance (

    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    maintenance_type text not null,

    description text,

    start_date date not null,

    expected_end_date date,

    actual_end_date date,

    workshop text,

    status text not null default 'open',

    created_by uuid references public.profiles(id)
        on delete set null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_vehicle_maintenance_vehicle
on public.vehicle_maintenance(vehicle_id);

create index if not exists idx_vehicle_maintenance_status
on public.vehicle_maintenance(status);
