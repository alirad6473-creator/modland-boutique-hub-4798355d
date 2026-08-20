import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        محصولی با این مشخصات پیدا نشد.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
