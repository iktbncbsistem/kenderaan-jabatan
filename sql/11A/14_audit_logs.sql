-- =========================================================
-- AUDIT LOG
-- =========================================================

create table if not exists public.audit_logs (

    id uuid primary key default gen_random_uuid(),

    user_id uuid
        references public.profiles(id)
        on delete set null,

    action text not null,

    table_name text,

    record_id uuid,

    old_data jsonb,

    new_data jsonb,

    ip_address inet,

    user_agent text,

    created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user
on public.audit_logs(user_id);

create index if not exists idx_audit_logs_table
on public.audit_logs(table_name);

create index if not exists idx_audit_logs_created
on public.audit_logs(created_at);
