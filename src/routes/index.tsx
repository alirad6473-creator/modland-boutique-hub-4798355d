import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, Truck, Headphones, Package } from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import wholesaleImg from "@/assets/wholesale.jpg";
import categoryFallback from "@/assets/category-fallback.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/ProductCard";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { BRAND, BRAND_FA } from "@/lib/constants";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [categories, featured, latest] = await Promise.all([
      listCategories(),
      listProducts({ data: { sort: "newest", featuredOnly: true, limit: 8 } }),
      listProducts({ data: { sort: "newest", limit: 8 } }),
    ]);
    return { categories, featured, latest };
  },
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "سرزمین مد" },
      {
        name: "description",
        content:
          "خرید آنلاین پوشاک مردانه از بوتیک مد لند شهرکرد؛ شلوار، کاپشن، تیشرت، کتونی و اکسسوری با ارسال به سراسر ایران و امکان خرید عمده.",
      },
      { property: "og:title", content: "سرزمین مد" },
      {
        property: "og:description",
        content: "پوشاک مردانه شیک و باکیفیت، خرید تکی و عمده با ارسال سریع به سراسر ایران.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Truck, title: "ارسال به سراسر ایران", desc: "ارسال سریع با پست و تیپاکس" },
  { icon: ShieldCheck, title: "ضمانت اصالت کالا", desc: "کیفیت تضمین‌شده در هر سفارش" },
  { icon: Package, title: "فروش عمده", desc: "قیمت ویژه برای همکاران و بوتیک‌ها" },
  { icon: Headphones, title: "پشتیبانی واتساپ", desc: "پاسخگویی سریع در ساعات کاری" },
];

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const featured = data.featured.length ? data.featured : data.latest;

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="پوشاک مردانه مد لند"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-24">
          <span className="text-xs tracking-[0.4em] text-muted-foreground">{BRAND}</span>
          <h1 className="brand-title mt-4 max-w-2xl text-4xl font-black leading-tight text-foreground sm:text-6xl">
            استایل مردانه، شیک و بی‌نقص
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            بوتیک {BRAND_FA} در شهرکرد؛ مجموعه‌ای منتخب از شلوار، کاپشن، تیشرت، کتونی و اکسسوری
            مردانه. خرید تکی و عمده با ارسال به سراسر ایران.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop">
                مشاهده محصولات <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/wholesale">فروش عمده</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <f.icon className="mt-1 size-5 shrink-0 text-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">دسته‌بندی‌ها</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {data.categories.map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-border"
            >
              <img
                src={c.image_url || categoryFallback}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="hero-overlay absolute inset-0" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-bold text-foreground">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground">محصولات منتخب</h2>
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
            مشاهده همه
          </Link>
        </div>
        {featured.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            هنوز محصولی ثبت نشده است. از پنل مدیریت محصولات را اضافه کنید.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img
            src={wholesaleImg}
            alt="فروش عمده پوشاک مردانه"
            loading="lazy"
            width={1600}
            height={900}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0 flex flex-col justify-center gap-4 p-8 sm:p-14">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              خرید عمده برای بوتیک‌ها و همکاران
            </h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              قیمت ویژه، حداقل سفارش مشخص و ارسال مطمئن. درخواست خود را ثبت کنید تا کارشناسان ما
              تماس بگیرند.
            </p>
            <div>
              <Button asChild>
                <Link to="/wholesale">ثبت درخواست عمده</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
