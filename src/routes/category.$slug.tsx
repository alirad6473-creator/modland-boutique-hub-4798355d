import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/store/ProductGrid";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { toFaDigits } from "@/lib/format";

const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const [categories, products] = await Promise.all([
        listCategories(),
        listProducts({ data: { categorySlug: slug, sort: "newest", limit: 120 } }),
      ]);
      const category = categories.find((c) => c.slug === slug) ?? null;
      return { category, products };
    },
  });

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(categoryQuery(params.slug));
    if (!data.category) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "دسته‌بندی یافت نشد | مد لند" }, { name: "robots", content: "noindex" }] };
    }
    const name = loaderData.category!.name;
    const desc = loaderData.category!.description || `خرید ${name} مردانه از فروشگاه مد لند با ارسال به سراسر ایران.`;
    return {
      meta: [
        { title: `${name} مردانه | مد لند` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} مردانه | مد لند` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(categoryQuery(slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">{data.category?.name}</h1>
      {data.category?.description && (
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          {data.category.description}
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{toFaDigits(data.products.length)} محصول</p>
      <div className="mt-8">
        <ProductGrid products={data.products} />
      </div>
    </div>
  );
}
