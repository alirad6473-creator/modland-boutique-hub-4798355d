import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود مدیر | مد لند" },
      { name: "description", content: "ورود به پنل مدیریت فروشگاه مد لند." },
      { property: "og:title", content: "ورود مدیر | مد لند" },
      { property: "og:description", content: "ورود اختصاصی مدیر فروشگاه." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ورود انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("ورود با گوگل انجام نشد.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-center text-xl font-bold text-foreground">پنل مدیریت {BRAND}</h1>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        این بخش مخصوص مدیر فروشگاه است.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <Label htmlFor="email">ایمیل</Label>
          <Input id="email" name="email" type="email" required dir="ltr" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="password">رمز عبور</Label>
          <Input id="password" name="password" type="password" required minLength={6} dir="ltr" className="mt-2" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "لطفاً صبر کنید..." : mode === "signin" ? "ورود" : "ثبت‌نام"}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={google}>
          ورود با گوگل
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "حساب ندارید؟ ثبت‌نام مدیر" : "قبلاً ثبت‌نام کرده‌اید؟ ورود"}
        </button>
      </form>
    </div>
  );
}
