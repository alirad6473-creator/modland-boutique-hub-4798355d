import { getRequestHeader } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";

/** اثر انگشت درخواست‌کننده بر اساس IP و مرورگر (هش‌شده، بدون ذخیره IP خام). */
export function requestFingerprint(extra = ""): string {
  const ip =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
    getRequestHeader("x-real-ip") ??
    "unknown";
  const ua = getRequestHeader("user-agent") ?? "";
  return createHash("sha256").update(`${ip}|${ua}|${extra}`).digest("hex").slice(0, 48);
}

/**
 * محدودسازی نرخ درخواست برای endpointهای عمومی.
 * در صورت عبور از سقف، خطا پرتاب می‌شود.
 */
export async function enforceRateLimit(options: {
  action: string;
  fingerprint: string;
  limit: number;
  windowSeconds: number;
  message?: string;
}): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - options.windowSeconds * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("public_request_log")
    .select("id", { count: "exact", head: true })
    .eq("action", options.action)
    .eq("fingerprint", options.fingerprint)
    .gte("created_at", since);

  if ((count ?? 0) >= options.limit) {
    throw new Error(options.message ?? "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.");
  }

  await supabaseAdmin
    .from("public_request_log")
    .insert({ action: options.action, fingerprint: options.fingerprint } as never);
}
