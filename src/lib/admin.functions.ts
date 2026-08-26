import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orderStatusSchema = z.enum([
  "new",
  "reviewing",
  "ready",
  "shipped",
  "delivered",
  "canceled",
]);

type AuthContext = {
  userId: string;
  claims?: { email?: string } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
};

/**
 * بررسی واقعی نقش مدیر روی سرور. مخفی‌کردن مسیر در فرانت‌اند کافی نیست و
 * هر عملیات مدیریتی ابتدا از این نگهبان عبور می‌کند.
 */
async function requireAdmin(context: AuthContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("دسترسی مدیریتی ندارید.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { writeAuditLog } = await import("./audit.server");
  return {
    admin: supabaseAdmin,
    writeAuditLog,
    actorId: context.userId,
    actorEmail: context.claims?.email ?? null,
  };
}

/** تغییر وضعیت سفارش (بدون امکان دست‌کاری وضعیت پرداخت). */
export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid(), status: orderStatusSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, writeAuditLog, actorId, actorEmail } = await requireAdmin(context as AuthContext);
    const { data: before } = await admin
      .from("orders")
      .select("order_status, order_number")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!before) throw new Error("سفارش پیدا نشد.");

    const { error } = await admin
      .from("orders")
      .update({ order_status: data.status })
      .eq("id", data.orderId);
    if (error) throw new Error("به‌روزرسانی سفارش انجام نشد.");

    await writeAuditLog(admin, {
      actorId,
      actorEmail,
      action: "order.status_changed",
      entityType: "order",
      entityId: data.orderId,
      metadata: { from: before.order_status, to: data.status, order_number: before.order_number },
    });
    return { ok: true };
  });

/** لغو سفارش توسط مدیر. پرداخت موفق لغو نمی‌شود و نیاز به گردش‌کار بازپرداخت دارد. */
export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ orderId: z.string().uuid(), reason: z.string().trim().max(500).optional().default("") })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, writeAuditLog, actorId, actorEmail } = await requireAdmin(context as AuthContext);
    const { data: order } = await admin
      .from("orders")
      .select("payment_status, order_number")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) throw new Error("سفارش پیدا نشد.");

    const patch =
      order.payment_status === "paid"
        ? { order_status: "canceled" }
        : { order_status: "canceled", payment_status: "canceled" };

    const { error } = await admin.from("orders").update(patch).eq("id", data.orderId);
    if (error) throw new Error("لغو سفارش انجام نشد.");

    await writeAuditLog(admin, {
      actorId,
      actorEmail,
      action: "order.canceled",
      entityType: "order",
      entityId: data.orderId,
      metadata: { reason: data.reason, order_number: order.order_number, was_paid: order.payment_status === "paid" },
    });
    return { ok: true };
  });

/** علامت‌گذاری سفارش برای بررسی پرداخت (بدون تغییر وضعیت پرداخت). */
export const markPaymentForReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ orderId: z.string().uuid(), note: z.string().trim().max(500).optional().default("") })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, writeAuditLog, actorId, actorEmail } = await requireAdmin(context as AuthContext);
    const { error } = await admin
      .from("orders")
      .update({ order_status: "reviewing" })
      .eq("id", data.orderId);
    if (error) throw new Error("ثبت درخواست بررسی انجام نشد.");
    await writeAuditLog(admin, {
      actorId,
      actorEmail,
      action: "payment.review_requested",
      entityType: "order",
      entityId: data.orderId,
      metadata: { note: data.note },
    });
    return { ok: true };
  });

/**
 * تایید دستی پرداخت (مثلاً کارت به کارت). گردش‌کار جدا از تغییر مستقیم وضعیت است،
 * شماره پیگیری بانکی الزامی است و همه چیز در گزارش عملیات ثبت می‌شود.
 */
export const verifyPaymentManually = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        reference: z.string().trim().min(4).max(80),
        note: z.string().trim().max(500).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, writeAuditLog, actorId, actorEmail } = await requireAdmin(context as AuthContext);
    const { data: order } = await admin
      .from("orders")
      .select("payment_status, total, order_number")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) throw new Error("سفارش پیدا نشد.");
    if (order.payment_status === "paid") return { ok: true, alreadyPaid: true };

    const { error } = await admin
      .from("orders")
      .update({ payment_status: "paid", payment_ref: `manual:${data.reference}` })
      .eq("id", data.orderId)
      .neq("payment_status", "paid");
    if (error) throw new Error("ثبت تایید پرداخت انجام نشد.");

    await writeAuditLog(admin, {
      actorId,
      actorEmail,
      action: "payment.manual_verification",
      entityType: "order",
      entityId: data.orderId,
      metadata: {
        reference: data.reference,
        note: data.note,
        amount: order.total,
        order_number: order.order_number,
      },
    });
    return { ok: true, alreadyPaid: false };
  });

/** مشاهده گزارش عملیات حساس. */
export const listAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(200).optional().default(100) }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { admin } = await requireAdmin(context as AuthContext);
    const { data: rows } = await admin
      .from("admin_audit_log")
      .select("id, created_at, actor_email, action, entity_type, entity_id, metadata")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    return rows ?? [];
  });
