revoke all on function public.protect_order_payment_fields() from public;
revoke all on function public.protect_user_roles() from public;
revoke all on function public.update_updated_at_column() from public;
grant execute on function public.update_updated_at_column() to service_role;