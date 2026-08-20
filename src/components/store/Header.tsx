import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { toFaDigits } from "@/lib/format";

const NAV = [
  { label: "خانه", to: "/" as const },
  { label: "فروشگاه", to: "/shop" as const },
];

const CATEGORIES = [
  { label: "شلوار", slug: "shalvar" },
  { label: "کاپشن", slug: "kapshan" },
  { label: "تیشرت", slug: "tishirt" },
  { label: "کتونی", slug: "katoni" },
  { label: "اکسسوری", slug: "accessory" },
  { label: "کلاه", slug: "kolah" },
];

export function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setSearchOpen(false);
    navigate({ to: "/shop", search: { q: term.trim(), sort: "newest" } });
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all ${
        scrolled
          ? "border-border bg-background/90 backdrop-blur-xl"
          : "border-transparent bg-background"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
        <div className="flex items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="منو">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs border-border bg-background">
              <SheetTitle className="brand-title px-4 pt-2 text-lg">MOD LAND</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-2 pb-8">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 text-sm text-foreground hover:bg-secondary"
                  >
                    {n.label}
                  </Link>
                ))}
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                ))}
                <Link
                  to="/wholesale"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm text-foreground hover:bg-secondary"
                >
                  عمده‌فروشی
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm text-foreground hover:bg-secondary"
                >
                  تماس با ما
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="brand-title text-base sm:text-lg">
            MOD LAND
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {c.label}
            </Link>
          ))}
          <Link
            to="/wholesale"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            عمده‌فروشی
          </Link>
          <Link
            to="/contact"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            تماس با ما
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="جستجو"
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="سبد خرید">
            <Link to="/cart" className="relative">
              <ShoppingBag className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {toFaDigits(itemCount)}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={submitSearch} className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex gap-2">
              <Input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="جستجوی نام محصول، کد محصول یا دسته‌بندی..."
                className="h-11"
              />
              <Button type="submit" className="h-11 px-6">
                جستجو
              </Button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
