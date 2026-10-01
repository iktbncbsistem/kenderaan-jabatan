-- =========================================================
-- FASA 11A-16
-- OFFICIAL DRIVER POSTS
-- =========================================================

create table if not exists public.driver_posts (

    id uuid primary key default gen_random_uuid(),

    post_code text not null unique,

    post_name text not null,

    position_no integer not null unique,

    is_filled boolean not null default false,

    driver_id uuid
        references public.drivers(id)
        on delete set null,

    created_at timestamptz not null default now()
);


-- =========================================================
-- INDEX
-- =========================================================

create index if not exists idx_driver_posts_driver
on public.driver_posts(driver_id);

create index if not exists idx_driver_posts_filled
on public.driver_posts(is_filled);


-- =========================================================
-- 4 JAWATAN PEMANDU RASMI
-- =========================================================

insert into public.driver_posts
    (
        post_code,
        post_name,
        position_no,
        is_filled
    )
values
    (
        'PDR-01',
        'Pemandu Kenderaan Jabatan',
        1,
        false
    ),
    (
        'PDR-02',
        'Pemandu Kenderaan Jabatan',
        2,
        false
    ),
    (
        'PDR-03',
        'Pemandu Kenderaan Jabatan',
        3,
        false
    ),
    (
        'PDR-04',
        'Pemandu Kenderaan Jabatan',
        4,
        false
    )
on conflict (post_code) do nothing;
