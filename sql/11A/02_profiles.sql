-- =========================================================
-- PROFILES
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name text not null,

    staff_no text unique,

    phone text,

    email text,

    department text,

    position_title text,

    role public.user_role not null default 'pemohon',

    is_active boolean not null default true,

    last_seen_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role
on public.profiles(role);

create index if not exists idx_profiles_active
on public.profiles(is_active);
