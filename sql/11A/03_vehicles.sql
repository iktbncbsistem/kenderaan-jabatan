-- =========================================================
-- VEHICLES
-- =========================================================

create table if not exists public.vehicles (

    id uuid primary key default gen_random_uuid(),

    registration_no text not null unique,

    vehicle_name text not null,

    vehicle_type public.vehicle_type not null,

    brand text,

    model text,

    manufacture_year integer,

    seating_capacity integer,

    fuel_type text,

    status public.vehicle_status not null default 'available',

    is_ev boolean not null default false,

    current_mileage numeric(12,2) default 0,

    battery_capacity_kwh numeric(10,2),

    current_battery_percent numeric(5,2),

    current_charging_status public.charging_status
        default 'not_charging',

    notes text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint chk_vehicle_seating
        check (
            seating_capacity is null
            or seating_capacity > 0
        ),

    constraint chk_vehicle_mileage
        check (
            current_mileage >= 0
        ),

    constraint chk_vehicle_battery
        check (
            current_battery_percent is null
            or (
                current_battery_percent >= 0
                and current_battery_percent <= 100
            )
        )
);

create index if not exists idx_vehicles_status
on public.vehicles(status);

create index if not exists idx_vehicles_type
on public.vehicles(vehicle_type);

create index if not exists idx_vehicles_ev
on public.vehicles(is_ev);
