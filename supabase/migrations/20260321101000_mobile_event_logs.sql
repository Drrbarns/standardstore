create table if not exists public.mobile_event_logs (
    id uuid primary key default gen_random_uuid(),
    event text not null,
    payload jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_mobile_event_logs_event
    on public.mobile_event_logs(event);

create index if not exists idx_mobile_event_logs_created_at
    on public.mobile_event_logs(created_at desc);
