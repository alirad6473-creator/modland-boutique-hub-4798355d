import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/store/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: Settings,
});

const FIELDS = [
  { key: "store_phone", label: "شماره تماس" },
  { key: "store_address", label: "آدرس فروشگاه" },
  { key: "instagram_url", label: "لینک اینستاگرام" },
  { key: "telegram_url", label: "لینک تلگرام" },
  { key: "shipping_cost", label: "هزینه ارسال (تومان)" },
  { key: "free_shipping_threshold", label: "سقف ارسال رایگان (تومان)" },
  { key: "hero_title", label: "عنوان صفحه اصلی" },
  { key: "hero_subtitle", label: "زیرعنوان صفحه اصلی" },
];

function Settings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("store_settings").select("key, value");
      if (error) throw new Error(error.message);
      const map: Record<string, string> = {};
      for (const r of rows ?? []) map[r.key] = r.value ?? "";
      return map;
    },
  });

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  async function save() {
    setSaving(true);
    const rows = FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
    const { error } = await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("ذخیره انجام نشد.");
    else toast.success("تنظیمات ذخیره شد.");
  }

  return (
    <AdminShell title="تنظیمات فروشگاه">
      <div className="grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              className="mt-2"
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
