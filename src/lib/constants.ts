export const SITE_URL = "https://modland.ir";
export const BRAND = "MOD LAND";
export const BRAND_FA = "مد لند";
export const STORE_PHONE = "09936463169";
export const STORE_ADDRESS = "شهرکرد - چهارراه فردوسی - پاساژ نگین - طبقه همکف";
export const STORE_OWNER = "عباس رئیسی";

export const ORDER_STATUSES = {
  new: "جدید",
  reviewing: "در حال بررسی",
  ready: "آماده ارسال",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  canceled: "لغو شده",
} as const;

export const PAYMENT_STATUSES = {
  unpaid: "پرداخت نشده",
  pending: "در انتظار پرداخت",
  paid: "پرداخت موفق",
  failed: "پرداخت ناموفق",
  canceled: "لغو شده",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
export type PaymentStatus = keyof typeof PAYMENT_STATUSES;
