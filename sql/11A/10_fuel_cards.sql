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
