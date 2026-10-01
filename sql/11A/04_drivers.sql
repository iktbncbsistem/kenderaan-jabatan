-- =========================================================
-- DRIVERS
-- =========================================================

create table if not exists public.drivers (

    id uuid primary key default gen_random_uuid(),

    profile_id uuid references public.profiles(id)
        on delete set null,

    driver_type public.driver_type not null,

    driver_status public.driver_status
        not null default 'active',

    is_official_post boolean not null default false,

    official_post_no text,

    appointment_start_date date,

    appointment_end_date date,

    appointment_letter_path text,

    appointment_letter_uploaded_at timestamptz,

    notes text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_drivers_type
on public.drivers(driver_type);

create index if not exists idx_drivers_status
on public.drivers(driver_status);

create index if not exists idx_drivers_profile
on public.drivers(profile_id);
