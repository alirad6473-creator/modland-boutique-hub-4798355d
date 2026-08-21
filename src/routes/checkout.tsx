import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { createOrder } from "@/lib/orders.functions";
import { formatToman } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "تسویه حساب | مد لند" },
      { name: "description", content: "ثبت سفارش بدون نیاز به ثبت‌نام در فروشگاه مد لند." },
      { property: "og:title", content: "تسویه حساب | مد لند" },
      { property: "og:description", content: "ثبت سریع سفارش مهمان در فروشگاه مد لند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const submit = useServerFn(createOrder);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">سبد خرید خالی است</h1>
        <Button asChild className="mt-6">
          <Link to="/shop">رفتن به فروشگاه</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const result = await submit({
        data: {
          customer: {
            fullName: String(fd.get("fullName") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            province: String(fd.get("province") ?? ""),
            city: String(fd.get("city") ?? ""),
            address: String(fd.get("address") ?? ""),
            postalCode: String(fd.get("postalCode") ?? ""),
            note: String(fd.get("note") ?? ""),
          },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size ?? "",
            color: i.color ?? "",
          })),
        },
      });
      clear();
      if (result.payment.kind === "redirect") {
        window.location.href = result.payment.url;
        return;
      }
      navigate({ to: "/order-success", search: { order: result.orderNumber } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ثبت سفارش انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">تسویه حساب</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        بدون ثبت‌نام سفارش دهید؛ فقط اطلاعات ارسال را کامل کنید.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">نام و نام خانوادگی</Label>
              <Input id="fullName" name="fullName" required minLength={3} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input
                id="phone"
                name="phone"
                required
                inputMode="numeric"
                placeholder="09xxxxxxxxx"
                pattern="09[0-9]{9}"
                className="mt-2"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="province">استان</Label>
              <Input id="province" name="province" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="city">شهر</Label>
              <Input id="city" name="city" className="mt-2" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">آدرس کامل پستی</Label>
            <Textarea id="address" name="address" required minLength={10} rows={3} className="mt-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="postalCode">کد پستی</Label>
              <Input id="postalCode" name="postalCode" className="mt-2" dir="ltr" />
            </div>
            <div>
              <Label htmlFor="note">توضیحات سفارش</Label>
              <Input id="note" name="note" className="mt-2" />
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">سفارش شما</h2>
          <ul className="mt-4 space-y-3 text-xs">
            {items.map((i) => (
              <li key={`${i.productId}${i.size}${i.color}`} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span className="shrink-0 text-foreground">{formatToman(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">جمع کالاها</span>
            <span className="font-semibold text-foreground">{formatToman(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            هزینه ارسال پس از ثبت سفارش محاسبه و اعلام می‌شود.
          </p>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? "در حال ثبت..." : "ثبت نهایی سفارش"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
