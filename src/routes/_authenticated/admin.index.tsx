import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AdminShell } from "@/components/store/AdminShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  cancelOrder,
  markPaymentForReview,
  updateOrderStatus,
  verifyPaymentManually,
} from "@/lib/admin.functions";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus } from "@/lib/constants";
import { formatDate, formatToman, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, created_at, customer_name, phone, province, city, address, postal_code, note, items_total, shipping_cost, total, payment_status, order_status, order_items(product_name, quantity, size, color, line_total)",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return orders ?? [];
    },
  });

  const stats = {
    count: data?.length ?? 0,
    revenue: (data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0),
    open: (data ?? []).filter((o) => o.order_status === "new").length,
  };

  async function update(id: string, patch: Record<string, string>) {
    const { error } = await supabase.from("orders").update(patch as never).eq("id", id);
    if (error) toast.error("به‌روزرسانی انجام نشد.");
    else {
      toast.success("به‌روزرسانی شد");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  }

  return (
    <AdminShell title="داشبورد و سفارش‌ها">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "تعداد سفارش", value: toFaDigits(stats.count) },
          { label: "سفارش جدید", value: toFaDigits(stats.open) },
          { label: "مجموع فروش", value: formatToman(stats.revenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-sm font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">در حال بارگذاری...</p>
      ) : (
        <div className="mt-8 space-y-4">
          {(data ?? []).map((o) => (
            <details key={o.id} className="rounded-lg border border-border bg-card p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-bold text-foreground">{toFaDigits(o.order_number)}</span>
                <span className="text-muted-foreground">{o.customer_name}</span>
                <span className="text-muted-foreground" dir="ltr">
                  {toFaDigits(o.phone)}
                </span>
                <span className="text-foreground">{formatToman(o.total)}</span>
                <span className="text-xs text-muted-foreground">{formatDate(o.created_at)}</span>
              </summary>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="text-xs leading-6 text-muted-foreground">
                  <p>
                    آدرس: {[o.province, o.city, o.address].filter(Boolean).join("، ")}
                  </p>
                  {o.postal_code && <p>کد پستی: {toFaDigits(o.postal_code)}</p>}
                  {o.note && <p>یادداشت: {o.note}</p>}
                  <ul className="mt-2 space-y-1">
                    {o.order_items.map((i, idx) => (
                      <li key={idx}>
                        {i.product_name} × {toFaDigits(i.quantity)}{" "}
                        {[i.size, i.color].filter(Boolean).join(" / ")} — {formatToman(i.line_total)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">هزینه ارسال: {formatToman(o.shipping_cost)}</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs text-muted-foreground">
                    وضعیت سفارش
                    <select
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      value={o.order_status}
                      onChange={(e) => update(o.id, { order_status: e.target.value })}
                    >
                      {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    وضعیت پرداخت
                    <select
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      value={o.payment_status}
                      onChange={(e) => update(o.id, { payment_status: e.target.value })}
                    >
                      {Object.entries(PAYMENT_STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </details>
          ))}
          {!data?.length && (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              هنوز سفارشی ثبت نشده است.
            </p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
