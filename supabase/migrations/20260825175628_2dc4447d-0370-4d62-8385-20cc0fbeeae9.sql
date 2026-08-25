-- 1) Audit log for sensitive admin actions
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin read audit log" on public.admin_audit_log;
create policy "admin read audit log"
  on public.admin_audit_log for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_entity_idx on public.admin_audit_log (entity_type, entity_id);

-- 2) Money and payment fields on orders may only be changed by trusted server code
create or replace function public.protect_order_payment_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user <> 'service_role' then
    if new.payment_status is distinct from old.payment_status
      or new.payment_ref is distinct from old.payment_ref
      or new.items_total is distinct from old.items_total
      or new.shipping_cost is distinct from old.shipping_cost
      or new.total is distinct from old.total
      or new.order_number is distinct from old.order_number then
      raise exception 'payment status and order amounts can only be changed by the server payment workflow';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_protect_payment on public.orders;
create trigger orders_protect_payment
  before update on public.orders
  for each row execute function public.protect_order_payment_fields();

-- 3) Roles can never be created or changed through the Data API (no self-promotion)
create or replace function public.protect_user_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user <> 'service_role' then
    raise exception 'user roles can only be changed by trusted server code';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists user_roles_protect on public.user_roles;
create trigger user_roles_protect
  before insert or update or delete on public.user_roles
  for each row execute function public.protect_user_roles();

-- 4) Rate-limit ledger for public endpoints (tracking / wholesale inquiries)
create table if not exists public.public_request_log (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  action text not null,
  created_at timestamptz not null default now()
);

grant all on public.public_request_log to service_role;

alter table public.public_request_log enable row level security;

create index if not exists public_request_log_lookup_idx
  on public.public_request_log (action, fingerprint, created_at desc);