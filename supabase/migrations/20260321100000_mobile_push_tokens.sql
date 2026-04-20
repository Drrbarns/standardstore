-- Mobile push token registry for Expo notifications
create table if not exists public.mobile_push_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    email text,
    token text not null unique,
    platform text,
    device_name text,
    app_version text,
    is_active boolean not null default true,
    last_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_mobile_push_tokens_user_id
    on public.mobile_push_tokens(user_id);

create index if not exists idx_mobile_push_tokens_email
    on public.mobile_push_tokens(email);

create index if not exists idx_mobile_push_tokens_active
    on public.mobile_push_tokens(is_active);

create or replace function public.touch_mobile_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_touch_mobile_push_tokens_updated_at on public.mobile_push_tokens;
create trigger trg_touch_mobile_push_tokens_updated_at
before update on public.mobile_push_tokens
for each row
execute procedure public.touch_mobile_push_tokens_updated_at();
