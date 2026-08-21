import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "شرایط ارسال | مد لند" },
      { name: "description", content: "زمان و هزینه ارسال سفارش‌های فروشگاه مد لند به سراسر ایران." },
      { property: "og:title", content: "شرایط ارسال | مد لند" },
      { property: "og:description", content: "زمان و هزینه ارسال سفارش‌های فروشگاه مد لند به سراسر ایران." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const SECTIONS = [
  { title: "روش ارسال", body: "ارسال سفارش‌ها از طریق پست پیشتاز و تیپاکس به سراسر ایران انجام می‌شود." },
  { title: "زمان ارسال", body: "سفارش‌ها حداکثر تا ۴۸ ساعت کاری پس از تایید ارسال می‌شوند. زمان تحویل بسته به مقصد بین ۲ تا ۵ روز کاری است." },
  { title: "هزینه ارسال", body: "هزینه ارسال بر اساس وزن و مقصد محاسبه و پیش از ارسال به شما اعلام می‌شود. برای سفارش‌های بالای سقف تعیین‌شده ارسال رایگان است." },
  { title: "تحویل حضوری", body: "امکان تحویل حضوری سفارش در فروشگاه شهرکرد، پاساژ نگین وجود دارد." },
];

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-foreground">شرایط ارسال</h1>
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
