import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

import { STORE_ADDRESS, STORE_PHONE } from "@/lib/constants";
import { toFaDigits, whatsappLink } from "@/lib/format";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="brand-title text-lg">MOD LAND</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            فروشگاه تخصصی پوشاک و اکسسوری مردانه. استایل متفاوت، انتخاب متفاوت.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            خانه
          </Link>
          <Link to="/shop" className="text-muted-foreground hover:text-foreground">
            فروشگاه
          </Link>
          <Link to="/wholesale" className="text-muted-foreground hover:text-foreground">
            عمده‌فروشی
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            تماس با ما
          </Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground">
            قوانین و مقررات
          </Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
            حریم خصوصی
          </Link>
          <Link to="/shipping" className="text-muted-foreground hover:text-foreground">
            شرایط ارسال
          </Link>
          <Link to="/returns" className="text-muted-foreground hover:text-foreground">
            بازگشت کالا
          </Link>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <a href={`tel:${STORE_PHONE}`} className="flex items-center gap-2 hover:text-foreground">
            <Phone className="size-4" />
            {toFaDigits(STORE_PHONE)}
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-foreground"
          >
            ارتباط در واتساپ
          </a>
          <p className="flex items-start gap-2 leading-7">
            <MapPin className="mt-1 size-4 shrink-0" />
            {STORE_ADDRESS}
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {toFaDigits(new Date().getFullYear())} MOD LAND — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
