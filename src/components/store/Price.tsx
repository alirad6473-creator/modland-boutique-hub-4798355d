import { discountPercent, formatToman, toFaDigits } from "@/lib/format";

export function Price({
  price,
  compareAt,
  size = "md",
}: {
  price: number | string;
  compareAt?: number | string | null;
  size?: "sm" | "md" | "lg";
}) {
  const off = discountPercent(price, compareAt);
  const cls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className={`${cls} font-bold text-foreground`}>{formatToman(price)}</span>
      {off > 0 && (
        <>
          <span className="text-xs text-muted-foreground line-through">
            {formatToman(compareAt!)}
          </span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
            {toFaDigits(off)}٪ تخفیف
          </span>
        </>
      )}
    </div>
  );
}
