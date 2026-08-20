const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]!);
}

export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return toFaDigits(n.toLocaleString("en-US"));
}

export function formatToman(value: number | string | null | undefined): string {
  return `${formatPrice(value)} تومان`;
}

export function discountPercent(
  price: number | string | null | undefined,
  compareAt: number | string | null | undefined,
): number {
  const p = Number(price ?? 0);
  const c = Number(compareAt ?? 0);
  if (!c || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}

export function formatDate(value: string): string {
  try {
    return toFaDigits(
      new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value)),
    );
  } catch {
    return value;
  }
}

export const WHATSAPP_NUMBER = "09936463169";
export const WHATSAPP_INTL = "989936463169";

export function whatsappLink(message = "سلام، برای سفارش و سوال درباره محصولات مد لند تماس گرفتم.") {
  return `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(message)}`;
}
