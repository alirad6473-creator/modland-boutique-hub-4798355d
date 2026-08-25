-- Trigger/utility functions must not be callable through the API
revoke all on function public.protect_order_payment_fields() from anon, authenticated;
revoke all on function public.protect_user_roles() from anon, authenticated;
revoke all on function public.update_updated_at_column() from anon, authenticated;

-- has_role is only needed by signed-in users (admin UI gate)
revoke all on function public.has_role(uuid, app_role) from anon;
grant execute on function public.has_role(uuid, app_role) to authenticated, service_role;