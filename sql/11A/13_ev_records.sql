-- =========================================================
-- EV RECORDS
-- =========================================================

create table if not exists public.ev_records (

    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null
        references public.vehicles(id)
        on delete cascade,

    travel_request_id uuid
        references public.travel_requests(id)
        on delete set null,

    driver_id uuid
        references public.drivers(id)
        on delete set null,

    mileage_start numeric(12,2),

    mileage_end numeric(12,2),

    battery_start_percent numeric(5,2),

    battery_end_percent numeric(5,2),

    charging_status public.charging_status
        not null default 'not_charging',

    charging_start timestamptz,

    charging_end timestamptz,

    energy_consumed_kwh numeric(10,2),

    charging_cost numeric(12,2),

    notes text,

    created_at timestamptz not null default now(),

    constraint chk_ev_mileage
        check (
            mileage_end is null
            or mileage_start is null
            or mileage_end >= mileage_start
        ),

    constraint chk_ev_battery_start
        check (
            battery_start_percent is null
            or (
                battery_start_percent >= 0
                and battery_start_percent <= 100
            )
        ),

    constraint chk_ev_battery_end
        check (
            battery_end_percent is null
            or (
                battery_end_percent >= 0
                and battery_end_percent <= 100
            )
        )
);

create index if not exists idx_ev_records_vehicle
on public.ev_records(vehicle_id);

create index if not exists idx_ev_records_driver
on public.ev_records(driver_id);

create index if not exists idx_ev_records_travel
on public.ev_records(travel_request_id);
