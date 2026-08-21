import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/admin", label: "داشبورد و سفارش‌ها", exact: true },
  { to: "/admin/products", label: "محصولات" },
  { to: "/admin/wholesale", label: "محصولات عمده" },
  { to: "/admin/inquiries", label: "درخواست‌های عمده" },
  { to: "/admin/settings", label: "تنظیمات فروشگاه" },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-border pb-4">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: "exact" in n }}
            className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "!border-foreground !bg-foreground !text-background" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
