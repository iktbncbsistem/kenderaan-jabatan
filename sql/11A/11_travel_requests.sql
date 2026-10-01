-- =========================================================
-- TRAVEL REQUESTS
-- =========================================================

create table if not exists public.travel_requests (

    id uuid primary key default gen_random_uuid(),

    request_no text not null unique,

    applicant_id uuid not null
        references public.profiles(id)
        on delete restrict,

    purpose text not null,

    location text not null,

    departure_datetime timestamptz not null,

    return_datetime timestamptz not null,

    passenger_count integer not null,

    driver_waiting public.driver_waiting_type
        not null,

    official_duty_letter_path text not null,

    status public.request_status
        not null default 'draft',

    submitted_at timestamptz,

    reviewed_by uuid
        references public.profiles(id)
        on delete set null,

    reviewed_at timestamptz,

    rejection_reason text,

    notes text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint chk_travel_time
        check (
            return_datetime > departure_datetime
        ),

    constraint chk_passengers
        check (
            passenger_count > 0
        )
);

create index if not exists idx_travel_requests_applicant
on public.travel_requests(applicant_id);

create index if not exists idx_travel_requests_status
on public.travel_requests(status);

create index if not exists idx_travel_requests_dates
on public.travel_requests(
    departure_datetime,
    return_datetime
);
