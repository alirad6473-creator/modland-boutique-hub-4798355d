import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "حریم خصوصی | مد لند" },
      { name: "description", content: "سیاست حفظ حریم خصوصی و نگهداری اطلاعات مشتریان در فروشگاه مد لند." },
      { property: "og:title", content: "حریم خصوصی | مد لند" },
      { property: "og:description", content: "سیاست حفظ حریم خصوصی و نگهداری اطلاعات مشتریان در فروشگاه مد لند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const SECTIONS = [
  { title: "اطلاعاتی که جمع‌آوری می‌کنیم", body: "نام، شماره موبایل و آدرس پستی صرفاً برای پردازش و ارسال سفارش دریافت می‌شود." },
  { title: "استفاده از اطلاعات", body: "اطلاعات شما تنها برای تکمیل سفارش، پیگیری و اطلاع‌رسانی وضعیت خرید استفاده می‌شود." },
  { title: "اشتراک‌گذاری", body: "اطلاعات مشتریان در اختیار هیچ شخص یا شرکت ثالثی جز شرکت پستی مسئول ارسال قرار نمی‌گیرد." },
  { title: "امنیت", body: "اطلاعات روی بستر امن و رمزنگاری‌شده ذخیره می‌شود و دسترسی به آن محدود به مدیر فروشگاه است." },
];

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-foreground">حریم خصوصی</h1>
      <div className="mt-8 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-sm font-semibold text-foreground">{s.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
