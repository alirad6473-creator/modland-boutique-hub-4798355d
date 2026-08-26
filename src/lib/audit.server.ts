import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditEntry = {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * ثبت رویداد حساس در گزارش عملیات مدیریتی.
 * فقط از کد سرور با کلاینت سرویس فراخوانی می‌شود.
 */
export async function writeAuditLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, any, any>,
  entry: AuditEntry,
): Promise<void> {
  await admin.from("admin_audit_log").insert({
    actor_id: entry.actorId ?? null,
    actor_email: entry.actorEmail ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: entry.metadata ?? {},
  } as never);
}
