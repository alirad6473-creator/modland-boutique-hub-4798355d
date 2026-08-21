import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrderPublic } from "@/lib/orders.functions";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/constants";
import { formatDate, formatToman, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "پیگیری سفارش | مد لند" },
      { name: "description", content: "وضعیت سفارش خود را با شماره پیگیری و شماره موبایل ببینید." },
      { property: "og:title", content: "پیگیری سفارش | مد لند" },
      { property: "og:description", content: "رهگیری آنلاین سفارش‌های فروشگاه مد لند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

type OrderResult = Awaited<ReturnType<typeof getOrderPublic>>;

function TrackPage() {
  const lookup = useServerFn(getOrderPublic);
  const [order, setOrder] = useState<OrderResult>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await lookup({
        data: {
          orderNumber: String(fd.get("orderNumber") ?? "").trim(),
          phone: String(fd.get("phone") ?? "").trim(),
        },
      });
      if (!res) toast.error("سفارشی با این مشخصات پیدا نشد.");
      setOrder(res);
    } catch {
      toast.error("اطلاعات وارد شده معتبر نیست.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">پیگیری سفارش</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        شماره پیگیری و شماره موبایل ثبت‌شده در سفارش را وارد کنید.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="orderNumber">شماره پیگیری</Label>
          <Input id="orderNumber" name="orderNumber" required className="mt-2" dir="ltr" placeholder="ML-10001" />
        </div>
        <div>
          <Label htmlFor="phone">شماره موبایل</Label>
          <Input id="phone" name="phone" required className="mt-2" dir="ltr" pattern="09[0-9]{9}" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "در حال جستجو..." : "مشاهده وضعیت"}
          </Button>
        </div>
      </form>

      {order && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">{toFaDigits(order.order_number)}</h2>
            <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-3 py-1 text-foreground">
              وضعیت: {ORDER_STATUSES[order.order_status as OrderStatus] ?? order.order_status}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-foreground">
              پرداخت: {PAYMENT_STATUSES[order.payment_status as PaymentStatus] ?? order.payment_status}
            </span>
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3 border-b border-border pb-2">
                <span className="text-muted-foreground">
                  {i.product_name} × {toFaDigits(i.quantity)}
                </span>
                <span className="text-foreground">{formatToman(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">هزینه ارسال</span>
              <span className="text-foreground">{formatToman(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-foreground">مبلغ کل</span>
              <span className="text-foreground">{formatToman(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
