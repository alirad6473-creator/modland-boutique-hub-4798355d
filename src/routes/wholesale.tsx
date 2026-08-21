import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import wholesaleImg from "@/assets/wholesale.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listWholesaleProducts } from "@/lib/catalog.functions";
import { submitWholesaleInquiry } from "@/lib/orders.functions";
import { formatToman, toFaDigits, whatsappLink } from "@/lib/format";

const wholesaleQuery = queryOptions({
  queryKey: ["wholesale-products"],
  queryFn: () => listWholesaleProducts(),
});

export const Route = createFileRoute("/wholesale")({
  loader: ({ context }) => context.queryClient.ensureQueryData(wholesaleQuery),
  head: () => ({
    meta: [
      { title: "فروش عمده پوشاک مردانه | مد لند" },
      {
        name: "description",
        content:
          "خرید عمده پوشاک مردانه از مد لند؛ قیمت ویژه همکاران، حداقل سفارش مشخص و ارسال به سراسر ایران.",
      },
      { property: "og:title", content: "فروش عمده پوشاک مردانه | مد لند" },
      { property: "og:description", content: "قیمت ویژه بوتیک‌ها و همکاران، ثبت درخواست آنلاین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wholesale,
});

function Wholesale() {
  const { data: products } = useSuspenseQuery(wholesaleQuery);
  const send = useServerFn(submitWholesaleInquiry);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await send({
        data: {
          fullName: String(fd.get("fullName") ?? ""),
          storeName: String(fd.get("storeName") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          city: String(fd.get("city") ?? ""),
          approxQuantity: String(fd.get("approxQuantity") ?? ""),
          productsWanted: String(fd.get("productsWanted") ?? ""),
          note: String(fd.get("note") ?? ""),
        },
      });
      setSent(true);
      toast.success("درخواست شما ثبت شد. به‌زودی تماس می‌گیریم.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ثبت درخواست انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={wholesaleImg}
          alt="فروش عمده پوشاک مردانه"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <h1 className="text-3xl font-black text-foreground sm:text-4xl">فروش عمده مد لند</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            مخصوص بوتیک‌داران، همکاران و فروشندگان آنلاین. قیمت‌های عمده، تنوع سایز و رنگ، و ارسال
            مطمئن به سراسر ایران.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xl font-bold text-foreground">محصولات عمده</h2>
        {products.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="aspect-[4/3] bg-secondary">
                  {p.main_image_url ? (
                    <img src={p.main_image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                  <p className="text-sm font-bold text-foreground">{formatToman(p.wholesale_price)}</p>
                  <p className="text-xs text-muted-foreground">
                    حداقل سفارش: {toFaDigits(p.min_order_qty)} عدد
                  </p>
                  {p.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                  )}
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a
                      href={whatsappLink(`سلام، برای خرید عمده ${p.name} (کد ${p.code}) درخواست دارم.`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      استعلام قیمت عمده
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            لیست محصولات عمده به‌زودی به‌روزرسانی می‌شود. درخواست خود را ثبت کنید.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">ثبت درخواست خرید عمده</h2>
          {sent ? (
            <p className="mt-4 text-sm text-muted-foreground">
              درخواست شما ثبت شد. همکاران ما در اولین فرصت با شما تماس می‌گیرند.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                <Input id="fullName" name="fullName" required minLength={3} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="storeName">نام فروشگاه</Label>
                <Input id="storeName" name="storeName" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input id="phone" name="phone" required pattern="09[0-9]{9}" dir="ltr" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="city">شهر</Label>
                <Input id="city" name="city" className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="approxQuantity">تعداد تقریبی سفارش</Label>
                <Input id="approxQuantity" name="approxQuantity" className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="productsWanted">محصولات مورد نظر</Label>
                <Textarea id="productsWanted" name="productsWanted" rows={3} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="note">توضیحات</Label>
                <Textarea id="note" name="note" rows={2} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? "در حال ارسال..." : "ارسال درخواست"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
