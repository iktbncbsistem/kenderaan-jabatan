-- =========================================================
-- DRIVER APPOINTMENTS
-- =========================================================

create table if not exists public.driver_appointments (

    id uuid primary key default gen_random_uuid(),

    driver_id uuid not null
        references public.drivers(id)
        on delete cascade,

    appointment_type text not null
        default 'replacement_driver',

    appointing_authority text not null
        default 'Pengarah IKTBN Chembong',

    appointment_reference_no text,

    appointment_date date not null,

    start_date date not null,

    end_date date,

    appointment_letter_path text not null,

    verified_by uuid references public.profiles(id)
        on delete set null,

    verified_at timestamptz,

    is_active boolean not null default true,

    notes text,

    created_at timestamptz not null default now()
);

create index if not exists idx_driver_appointments_driver
on public.driver_appointments(driver_id);

create index if not exists idx_driver_appointments_active
on public.driver_appointments(is_active);
