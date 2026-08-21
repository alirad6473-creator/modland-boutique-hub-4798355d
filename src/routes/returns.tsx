import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "رویه بازگشت کالا | مد لند" },
      { name: "description", content: "شرایط تعویض و مرجوع کردن کالا در فروشگاه مد لند." },
      { property: "og:title", content: "رویه بازگشت کالا | مد لند" },
      { property: "og:description", content: "شرایط تعویض و مرجوع کردن کالا در فروشگاه مد لند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const SECTIONS = [
  { title: "مهلت بازگشت", body: "تا ۷ روز پس از تحویل، در صورت عدم استفاده و سالم بودن برچسب‌ها، امکان تعویض یا مرجوع کردن کالا وجود دارد." },
  { title: "کالای معیوب", body: "اگر کالا ایراد تولیدی داشته باشد یا اشتباه ارسال شده باشد، هزینه ارسال رفت و برگشت بر عهده فروشگاه است." },
  { title: "مراحل", body: "برای شروع فرآیند، شماره پیگیری سفارش را از طریق واتساپ برای ما ارسال کنید." },
  { title: "استثناها", body: "اقلام حراج ویژه و اکسسوری‌های بهداشتی مشمول بازگشت نمی‌شوند." },
];

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-foreground">رویه بازگشت کالا</h1>
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
