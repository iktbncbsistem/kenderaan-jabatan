-- =========================================================
-- SPK IKTBN CHEMBONG
-- FASA 11A
-- DATABASE FOUNDATION
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- ENUM TYPES
-- =========================================================

do $$
begin

    if not exists (
        select 1 from pg_type where typname = 'user_role'
    ) then
        create type public.user_role as enum (
            'admin',
            'pegawai_kenderaan',
            'pemandu',
            'pemandu_gantian',
            'pemohon',
            'pelajar'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'vehicle_type'
    ) then
        create type public.vehicle_type as enum (
            'sedan',
            'van',
            'lori',
            'bas',
            'ev'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'vehicle_status'
    ) then
        create type public.vehicle_status as enum (
            'available',
            'maintenance',
            'service',
            'breakdown',
            'inactive',
            'retired'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'driver_type'
    ) then
        create type public.driver_type as enum (
            'official',
            'replacement',
            'external'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'driver_status'
    ) then
        create type public.driver_status as enum (
            'active',
            'inactive',
            'suspended'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'request_status'
    ) then
        create type public.request_status as enum (
            'draft',
            'submitted',
            'under_review',
            'approved',
            'rejected',
            'scheduled',
            'in_progress',
            'completed',
            'cancelled'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'driver_waiting_type'
    ) then
        create type public.driver_waiting_type as enum (
            'waiting',
            'not_waiting'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'assignment_status'
    ) then
        create type public.assignment_status as enum (
            'assigned',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled'
        );
    end if;

    if not exists (
        select 1 from pg_type where typname = 'charging_status'
    ) then
        create type public.charging_status as enum (
            'not_charging',
            'charging',
            'fully_charged'
        );
    end if;

end $$;
