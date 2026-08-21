import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "قوانین و مقررات | مد لند" },
      { name: "description", content: "قوانین و مقررات خرید از فروشگاه اینترنتی مد لند." },
      { property: "og:title", content: "قوانین و مقررات | مد لند" },
      { property: "og:description", content: "قوانین و مقررات خرید از فروشگاه اینترنتی مد لند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const SECTIONS = [
  { title: "ثبت سفارش", body: "با ثبت سفارش در مد لند، شما تایید می‌کنید اطلاعات ارسال را به‌درستی وارد کرده‌اید. سفارش‌ها پس از تایید تلفنی پردازش می‌شوند." },
  { title: "قیمت‌ها", body: "تمام قیمت‌ها به تومان و شامل ارزش افزوده است. قیمت‌ها ممکن است بدون اطلاع قبلی تغییر کند، اما قیمت لحظه ثبت سفارش ملاک است." },
  { title: "موجودی کالا", body: "در صورت اتمام موجودی پس از ثبت سفارش، مبلغ پرداختی به‌طور کامل بازگردانده یا کالای جایگزین با توافق مشتری ارسال می‌شود." },
  { title: "مسئولیت", body: "مد لند مسئولیتی در قبال آدرس ناقص یا شماره تماس نادرست ثبت‌شده توسط مشتری ندارد." },
];

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-foreground">قوانین و مقررات</h1>
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
