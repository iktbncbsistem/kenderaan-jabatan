-- =========================================================
-- FUEL CARD
-- =========================================================

create table if not exists public.fuel_cards (

    id uuid primary key default gen_random_uuid(),

    card_name text not null default 'Kad Minyak Jabatan',

    card_identifier text,

    provider text,

    is_active boolean not null default true,

    created_at timestamptz not null default now()
);

create unique index if not exists uq_active_fuel_card
on public.fuel_cards(is_active)
where is_active = true;

-- =========================================================
-- FUEL CARD ASSIGNMENT
-- =========================================================

create table if not exists public.fuel_card_assignments (

    id uuid primary key default gen_random_uuid(),

    fuel_card_id uuid not null
        references public.fuel_cards(id)
        on delete cascade,

    driver_id uuid
        references public.drivers(id)
        on delete set null,

    issued_by uuid
        references public.profiles(id)
        on delete set null,

    issued_at timestamptz not null default now(),

    returned_at timestamptz,

    notes text
);

create index if not exists idx_fuel_card_assignment_driver
on public.fuel_card_assignments(driver_id);

create index if not exists idx_fuel_card_assignment_card
on public.fuel_card_assignments(fuel_card_id);
