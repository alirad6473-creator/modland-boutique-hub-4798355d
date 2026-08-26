import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * راه‌اندازی امن اولین مدیر فروشگاه.
 *
 * فقط با ارسال هدر مخفی سمت سرور (ADMIN_BOOTSTRAP_SECRET) قابل استفاده است،
 * هرگز از رابط کاربری فراخوانی نمی‌شود و idempotent است: اگر مدیری وجود داشته
 * باشد هیچ مدیر جدیدی ساخته نمی‌شود.
 *
 * نمونه استفاده:
 *   curl -X POST https://<domain>/api/public/admin-bootstrap \
 *     -H "content-type: application/json" \
 *     -H "x-admin-bootstrap-secret: <secret>" \
 *     -d '{"email":"owner@example.com"}'
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/admin-bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["ADMIN_BOOTSTRAP_SECRET"];
        if (!expected) {
          return Response.json({ error: "bootstrap is not configured" }, { status: 503 });
        }

        const provided = request.headers.get("x-admin-bootstrap-secret") ?? "";
        if (!provided || !secretMatches(provided, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let email = "";
        try {
          const body = (await request.json()) as { email?: unknown };
          email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        } catch {
          return Response.json({ error: "invalid json body" }, { status: 400 });
        }
        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
          return Response.json({ error: "valid email is required" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { writeAuditLog } = await import("@/lib/audit.server");

        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) > 0) {
          // idempotent: مدیر قبلاً تعیین شده است
          return Response.json({ ok: true, alreadyConfigured: true });
        }

        const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (listError) {
          return Response.json({ error: "could not read users" }, { status: 500 });
        }
        const user = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
        if (!user) {
          return Response.json(
            { error: "user not found; sign up with this email first" },
            { status: 404 },
          );
        }

        const { error: insertError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: user.id, role: "admin" });
        if (insertError) {
          return Response.json({ error: "could not grant admin role" }, { status: 500 });
        }

        await writeAuditLog(supabaseAdmin, {
          actorId: user.id,
          actorEmail: user.email ?? email,
          action: "admin.bootstrap_granted",
          entityType: "user_role",
          entityId: user.id,
          metadata: { via: "server bootstrap endpoint" },
        });

        return Response.json({ ok: true, alreadyConfigured: false, userId: user.id });
      },
    },
  },
});
