-- =========================================================
-- TRAVEL ASSIGNMENTS
-- =========================================================

create table if not exists public.travel_assignments (

    id uuid primary key default gen_random_uuid(),

    travel_request_id uuid not null
        references public.travel_requests(id)
        on delete cascade,

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete restrict,

    driver_id uuid
        references public.drivers(id)
        on delete restrict,

    assigned_by uuid not null
        references public.profiles(id)
        on delete restrict,

    assignment_status public.assignment_status
        not null default 'assigned',

    assigned_at timestamptz not null default now(),

    notes text
);

create index if not exists idx_travel_assignments_request
on public.travel_assignments(travel_request_id);

create index if not exists idx_travel_assignments_vehicle
on public.travel_assignments(vehicle_id);

create index if not exists idx_travel_assignments_driver
on public.travel_assignments(driver_id);
