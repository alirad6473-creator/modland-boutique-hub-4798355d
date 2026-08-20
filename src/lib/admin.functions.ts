import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * اولین کاربر ثبت‌نام‌شده می‌تواند نقش مدیر را دریافت کند (راه‌اندازی اولیه فروشگاه).
 * پس از آنکه یک مدیر وجود داشت، این عملیات برای بقیه کاربران مسدود می‌شود.
 */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false, reason: "مدیر فروشگاه قبلاً تعیین شده است." };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) return { granted: false, reason: "خطا در ثبت نقش مدیر." };
    return { granted: true };
  });
