import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/store/Price";
import { ProductGrid } from "@/components/store/ProductGrid";
import { getProductByCode, listProducts } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { toFaDigits, whatsappLink } from "@/lib/format";

const productQuery = (code: string) =>
  queryOptions({
    queryKey: ["product", code],
    queryFn: async () => {
      const product = await getProductByCode({ data: { code } });
      if (!product) return { product: null, related: [] };
      const related = await listProducts({
        data: {
          sort: "newest",
          limit: 8,
          ...(product.categories?.slug ? { categorySlug: product.categories.slug } : {}),
        },
      });
      return { product, related: related.filter((r) => r.code !== code).slice(0, 4) };
    },
  });

export const Route = createFileRoute("/product/$code")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.code));
    if (!data.product) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
      return { meta: [{ title: "محصول یافت نشد | مد لند" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    const desc = (p.description || `خرید ${p.name} از فروشگاه مد لند با ارسال به سراسر ایران.`).slice(0, 155);
    const meta: Array<Record<string, string>> = [
      { title: `${p.name} | مد لند` },
      { name: "description", content: desc },
      { property: "og:title", content: `${p.name} | مد لند` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (p.main_image_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: p.main_image_url });
      meta.push({ name: "twitter:image", content: p.main_image_url });
    }
    return { meta };
  },
  component: ProductPage,
});

function ProductPage() {
  const { code } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(code));
  const product = data.product!;
  const { add } = useCart();

  const gallery = [product.main_image_url, ...product.images.map((i) => i.url)].filter(
    Boolean,
  ) as string[];
  const [active, setActive] = useState(0);
  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [qty, setQty] = useState(1);
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          خانه
        </Link>
        <span className="mx-2">/</span>
        {product.categories ? (
          <>
            <Link
              to="/category/$slug"
              params={{ slug: product.categories.slug }}
              className="hover:text-foreground"
            >
              {product.categories.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        ) : null}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-xl border border-border bg-secondary">
            {gallery.length ? (
              <img
                src={gallery[active]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                بدون تصویر
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {gallery.map((g, i) => (
                <button
                  key={g}
                  onClick={() => setActive(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-md border ${
                    i === active ? "border-foreground" : "border-border"
                  }`}
                  aria-label={`تصویر ${i + 1}`}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          <p className="mt-2 text-xs text-muted-foreground">کد محصول: {toFaDigits(product.code)}</p>
          <div className="mt-5">
            <Price price={product.price} compareAt={product.compare_at_price} size="lg" />
          </div>

          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground">سایز</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">رنگ</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      color === c
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <button
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="کاهش"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm">{toFaDigits(qty)}</span>
              <button
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                aria-label="افزایش"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {inStock ? `${toFaDigits(product.stock)} عدد موجود` : "ناموجود"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={!inStock}
              onClick={() => {
                add(
                  {
                    productId: product.id,
                    code: product.code,
                    name: product.name,
                    price: Number(product.price),
                    image: product.main_image_url ?? null,
                    stock: product.stock,
                    size,
                    color,
                  },
                  qty,
                );
                toast.success("به سبد خرید اضافه شد");
              }}
            >
              <ShoppingBag className="size-4" />
              افزودن به سبد خرید
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={whatsappLink(`سلام، درباره محصول ${product.name} (کد ${product.code}) سوال داشتم.`)}
                target="_blank"
                rel="noreferrer"
              >
                سوال در واتساپ
              </a>
            </Button>
          </div>

          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-foreground">توضیحات</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            {product.brand && (
              <div>
                <dt className="inline font-semibold text-foreground">برند: </dt>
                <dd className="inline">{product.brand}</dd>
              </div>
            )}
            {product.material && (
              <div>
                <dt className="inline font-semibold text-foreground">جنس: </dt>
                <dd className="inline">{product.material}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground">محصولات مشابه</h2>
          <div className="mt-6">
            <ProductGrid products={data.related} />
          </div>
        </section>
      )}
    </div>
  );
}
