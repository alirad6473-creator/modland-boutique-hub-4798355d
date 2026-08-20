/**
 * لایه انتزاعی درگاه پرداخت.
 *
 * برای اتصال درگاه ایرانی (زرین‌پال، آیدی‌پی، نکست‌پی و ...) کافیست یک پیاده‌سازی
 * جدید از اینترفیس PaymentGateway بسازید و آن را در getGateway() برگردانید.
 * کلیدهای درگاه فقط از طریق متغیرهای محیطی سمت سرور خوانده می‌شوند.
 */
export type PaymentInitResult =
  | { kind: "redirect"; url: string; authority: string }
  | { kind: "manual"; message: string };

export interface PaymentGateway {
  readonly name: string;
  createPayment(input: {
    orderNumber: string;
    amount: number;
    callbackUrl: string;
    phone: string;
  }): Promise<PaymentInitResult>;
  verifyPayment(input: {
    orderNumber: string;
    amount: number;
    authority: string;
  }): Promise<{ ok: boolean; ref?: string }>;
}

/** درگاه پیش‌فرض: تا زمانی که کلید درگاه ایرانی تنظیم نشده، سفارش به صورت «در انتظار پرداخت» ثبت می‌شود. */
const manualGateway: PaymentGateway = {
  name: "manual",
  async createPayment() {
    return {
      kind: "manual",
      message: "سفارش ثبت شد. همکاران ما برای هماهنگی پرداخت با شما تماس می‌گیرند.",
    };
  },
  async verifyPayment() {
    return { ok: false };
  },
};

export function getGateway(): PaymentGateway {
  // نمونه: if (process.env["ZARINPAL_MERCHANT_ID"]) return zarinpalGateway();
  return manualGateway;
}
