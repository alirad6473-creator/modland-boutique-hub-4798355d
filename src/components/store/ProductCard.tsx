import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/store/Price";
import { useCart } from "@/lib/cart";

export type ProductCardData = {
  id: string;
  name: string;
  code: string;
  price: number | string;
  compare_at_price?: number | string | null;
  stock: number;
  main_image_url?: string | null;
  sizes?: string[];
  colors?: string[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const inStock = product.stock > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/40">
      <Link
        to="/product/$code"
        params={{ code: product.code }}
        className="relative block aspect-[3/4] overflow-hidden bg-secondary"
      >
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            بدون تصویر
          </div>
        )}
        {!inStock && (
          <span className="absolute top-3 right-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground">
            ناموجود
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to="/product/$code" params={{ code: product.code }} className="min-h-[2.5rem]">
          <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-foreground">
            {product.name}
          </h3>
        </Link>
        <Price price={product.price} compareAt={product.compare_at_price} size="sm" />
        <div className="mt-auto flex gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/product/$code" params={{ code: product.code }}>
              مشاهده
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={!inStock}
            onClick={() => {
              add({
                productId: product.id,
                code: product.code,
                name: product.name,
                price: Number(product.price),
                image: product.main_image_url ?? null,
                stock: product.stock,
                size: product.sizes?.[0],
                color: product.colors?.[0],
              });
              toast.success("به سبد خرید اضافه شد");
            }}
          >
            <ShoppingBag className="size-4" />
            {inStock ? "افزودن" : "ناموجود"}
          </Button>
        </div>
      </div>
    </article>
  );
}
