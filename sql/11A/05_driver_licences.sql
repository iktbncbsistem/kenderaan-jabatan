-- =========================================================
-- DRIVER LICENCES
-- =========================================================

create table if not exists public.driver_licenses (

    id uuid primary key default gen_random_uuid(),

    driver_id uuid not null
        references public.drivers(id)
        on delete cascade,

    licence_class text not null,

    licence_no text,

    issue_date date,

    expiry_date date not null,

    is_valid boolean not null default true,

    document_path text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_driver_licenses_driver
on public.driver_licenses(driver_id);

create index if not exists idx_driver_licenses_expiry
on public.driver_licenses(expiry_date);
