import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatToman, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سبد خرید | مد لند" },
      { name: "description", content: "سبد خرید شما در فروشگاه پوشاک مردانه مد لند." },
      { property: "og:title", content: "سبد خرید | مد لند" },
      { property: "og:description", content: "بررسی و تکمیل سفارش در فروشگاه مد لند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQuantity, remove, keyOf } = useCart();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">سبد خرید شما خالی است</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          از میان محصولات مد لند انتخاب کنید و به سبد خرید اضافه کنید.
        </p>
        <Button asChild className="mt-8">
          <Link to="/shop">رفتن به فروشگاه</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">سبد خرید</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => {
            const k = keyOf(item);
            return (
              <div
                key={k}
                className="flex gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <Link
                    to="/product/$code"
                    params={{ code: item.code }}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[item.size, item.color].filter(Boolean).join(" • ") || "—"}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{formatToman(item.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity(k, item.quantity - 1)}
                        aria-label="کاهش"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-9 text-center text-sm">{toFaDigits(item.quantity)}</span>
                      <button
                        className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity(k, item.quantity + 1)}
                        aria-label="افزایش"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(k)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">خلاصه سفارش</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">جمع کالاها</span>
            <span className="font-semibold text-foreground">{formatToman(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            هزینه ارسال در مرحله تسویه حساب محاسبه می‌شود.
          </p>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link to="/checkout">ادامه و تسویه حساب</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/shop">ادامه خرید</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
