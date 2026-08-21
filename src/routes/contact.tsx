import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, MessageCircle, Instagram } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND_FA, STORE_ADDRESS, STORE_OWNER, STORE_PHONE } from "@/lib/constants";
import { toFaDigits, whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما | بوتیک مد لند شهرکرد" },
      {
        name: "description",
        content: "آدرس، شماره تماس و واتساپ بوتیک مردانه مد لند در شهرکرد، پاساژ نگین.",
      },
      { property: "og:title", content: "تماس با ما | مد لند" },
      { property: "og:description", content: "راه‌های ارتباط با بوتیک مردانه مد لند شهرکرد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-foreground">تماس با ما</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        بوتیک {BRAND_FA} — مدیریت: {STORE_OWNER}. برای مشاوره خرید، پیگیری سفارش یا همکاری عمده با ما
        در تماس باشید.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
          <MapPin className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">آدرس فروشگاه</p>
            <p className="mt-1 text-sm text-muted-foreground">{STORE_ADDRESS}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
          <Phone className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">تلفن و واتساپ</p>
            <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
              {toFaDigits(STORE_PHONE)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
          <Instagram className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">اینستاگرام</p>
            <p className="mt-1 text-sm text-muted-foreground">
              جدیدترین محصولات را در پیج فروشگاه ببینید.
            </p>
          </div>
        </div>
      </div>

      <Button asChild size="lg" className="mt-8">
        <a href={whatsappLink()} target="_blank" rel="noreferrer">
          <MessageCircle className="size-4" /> گفتگو در واتساپ
        </a>
      </Button>
    </div>
  );
}
