import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { STORE_PHONE } from "@/lib/constants";
import { toFaDigits, whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/order-success")({
  validateSearch: z.object({ order: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "سفارش ثبت شد | مد لند" },
      { name: "description", content: "سفارش شما در فروشگاه مد لند با موفقیت ثبت شد." },
      { property: "og:title", content: "سفارش ثبت شد | مد لند" },
      { property: "og:description", content: "سفارش شما ثبت شد و به‌زودی با شما تماس می‌گیریم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { order } = Route.useSearch();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto size-14 text-foreground" />
      <h1 className="mt-6 text-2xl font-bold text-foreground">سفارش شما ثبت شد</h1>
      {order && (
        <p className="mt-3 text-sm text-muted-foreground">
          شماره پیگیری سفارش: <span className="font-bold text-foreground">{toFaDigits(order)}</span>
        </p>
      )}
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        کارشناسان مد لند برای تایید سفارش، هزینه ارسال و هماهنگی پرداخت با شما تماس می‌گیرند. شماره
        پیگیری را نگه دارید.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/track">پیگیری سفارش</Link>
        </Button>
        <Button asChild variant="outline">
          <a href={whatsappLink(`سلام، سفارش ${order ?? ""} را ثبت کردم.`)} target="_blank" rel="noreferrer">
            پیگیری در واتساپ
          </a>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/shop">ادامه خرید</Link>
        </Button>
      </div>
      <p className="mt-8 text-xs text-muted-foreground" dir="ltr">
        {toFaDigits(STORE_PHONE)}
      </p>
    </div>
  );
}
