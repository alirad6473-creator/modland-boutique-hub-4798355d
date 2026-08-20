import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

import { ProductGrid } from "@/components/store/ProductGrid";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { toFaDigits } from "@/lib/format";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "cheapest", "expensive", "discount"]).default("newest"),
});

const shopQuery = (s: { q?: string | undefined; category?: string | undefined; sort: "newest" | "cheapest" | "expensive" | "discount" }) =>
  queryOptions({
    queryKey: ["shop", s],
    queryFn: async () => {
      const [categories, products] = await Promise.all([
        listCategories(),
        listProducts({
          data: {
            sort: s.sort,
            limit: 120,
            ...(s.q ? { search: s.q } : {}),
            ...(s.category ? { categorySlug: s.category } : {}),
          },
        }),
      ]);
      return { categories, products };
    },
  });

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(shopQuery(deps)),
  head: () => ({
    meta: [
      { title: "فروشگاه | خرید پوشاک مردانه مد لند" },
      {
        name: "description",
        content: "لیست کامل محصولات مد لند؛ شلوار، کاپشن، تیشرت، کتونی و اکسسوری مردانه با فیلتر و جستجو.",
      },
      { property: "og:title", content: "فروشگاه مد لند" },
      { property: "og:description", content: "خرید آنلاین پوشاک مردانه با ارسال به سراسر ایران." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const SORTS = [
  { value: "newest", label: "جدیدترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
] as const;

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data } = useSuspenseQuery(shopQuery(search));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">فروشگاه</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {toFaDigits(data.products.length)} محصول
        {search.q ? ` برای «${search.q}»` : ""}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          to="/shop"
          search={(prev) => ({ ...prev, category: undefined })}
          className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
            !search.category
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          همه
        </Link>
        {data.categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={(prev) => ({ ...prev, category: c.slug })}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              search.category === c.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.name}
          </Link>
        ))}
        <select
          value={search.sort}
          onChange={(e) =>
            navigate({
              search: (prev) => ({ ...prev, sort: e.target.value as typeof search.sort }),
            })
          }
          className="mr-auto rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground"
          aria-label="مرتب‌سازی"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        <ProductGrid products={data.products} />
      </div>
    </div>
  );
}
