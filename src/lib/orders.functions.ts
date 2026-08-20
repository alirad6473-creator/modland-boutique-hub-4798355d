import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/u, "شماره موبایل معتبر نیست");

const checkoutSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(3).max(120),
    phone: phoneSchema,
    province: z.string().trim().max(60).optional().default(""),
    city: z.string().trim().max(60).optional().default(""),
    address: z.string().trim().min(10).max(500),
    postalCode: z.string().trim().max(20).optional().default(""),
    note: z.string().trim().max(1000).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
        size: z.string().trim().max(40).optional().default(""),
        color: z.string().trim().max(40).optional().default(""),
      }),
    )
    .min(1)
    .max(40),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getGateway } = await import("./payment.server");

    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("id, name, code, price, stock, is_active")
      .in("id", ids);
    if (prodError) throw new Error("خطا در خواندن محصولات");

    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    const lines = data.items.map((item) => {
      const p = byId.get(item.productId);
      if (!p || !p.is_active) throw new Error("یکی از محصولات سبد خرید دیگر موجود نیست.");
      if (p.stock < item.quantity) throw new Error(`موجودی «${p.name}» کافی نیست.`);
      const unitPrice = Number(p.price);
      return {
        product_id: p.id,
        product_name: p.name,
        product_code: p.code,
        size: item.size || null,
        color: item.color || null,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: unitPrice * item.quantity,
      };
    });

    const { data: settingsRows } = await supabaseAdmin
      .from("store_settings")
      .select("key, value")
      .in("key", ["shipping_cost", "free_shipping_threshold"]);
    const settings: Record<string, string> = {};
    for (const r of settingsRows ?? []) settings[r.key] = r.value ?? "";

    const itemsTotal = lines.reduce((sum, l) => sum + l.line_total, 0);
    const baseShipping = Number(settings["shipping_cost"] ?? 0);
    const threshold = Number(settings["free_shipping_threshold"] ?? 0);
    const shipping = threshold > 0 && itemsTotal >= threshold ? 0 : baseShipping;
    const total = itemsTotal + shipping;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer.fullName,
        phone: data.customer.phone,
        province: data.customer.province || null,
        city: data.customer.city || null,
        address: data.customer.address,
        postal_code: data.customer.postalCode || null,
        note: data.customer.note || null,
        items_total: itemsTotal,
        shipping_cost: shipping,
        total,
        payment_status: "pending",
        order_status: "new",
      })
      .select("id, order_number, created_at")
      .single();
    if (orderError || !order) throw new Error("ثبت سفارش انجام نشد. دوباره تلاش کنید.");

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("ثبت اقلام سفارش انجام نشد.");
    }

    const payment = await getGateway().createPayment({
      orderNumber: order.order_number,
      amount: total,
      callbackUrl: "/api/public/payment/callback",
      phone: data.customer.phone,
    });

    return {
      orderNumber: order.order_number,
      itemsTotal,
      shipping,
      total,
      payment,
    };
  });

export const getOrderPublic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ orderNumber: z.string().trim().min(3).max(30), phone: phoneSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, created_at, customer_name, phone, province, city, address, postal_code, note, items_total, shipping_cost, total, payment_status, order_status",
      )
      .eq("order_number", data.orderNumber)
      .eq("phone", data.phone)
      .maybeSingle();
    if (!order) return null;
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_name, product_code, size, color, unit_price, quantity, line_total")
      .eq("order_id", order.id);
    return { ...order, items: items ?? [] };
  });

export const submitWholesaleInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(3).max(120),
        storeName: z.string().trim().max(120).optional().default(""),
        phone: phoneSchema,
        city: z.string().trim().max(60).optional().default(""),
        approxQuantity: z.string().trim().max(60).optional().default(""),
        productsWanted: z.string().trim().max(1000).optional().default(""),
        note: z.string().trim().max(1000).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("wholesale_inquiries").insert({
      full_name: data.fullName,
      store_name: data.storeName || null,
      phone: data.phone,
      city: data.city || null,
      approx_quantity: data.approxQuantity || null,
      products_wanted: data.productsWanted || null,
      note: data.note || null,
    });
    if (error) throw new Error("ثبت درخواست انجام نشد.");
    return { ok: true };
  });
