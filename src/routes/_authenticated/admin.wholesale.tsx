import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/store/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { uploadProductImage } from "@/lib/upload";
import { formatToman, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/wholesale")({
  component: AdminWholesale,
});

type Row = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  wholesale_price: number;
  min_order_qty: number;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  material: string | null;
  main_image_url: string | null;
  is_active: boolean;
};

const csv = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);

function AdminWholesale() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: rows } = useQuery({
    queryKey: ["admin-wholesale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wholesale_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      code: String(fd.get("code") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      wholesale_price: Number(fd.get("wholesale_price") ?? 0),
      min_order_qty: Number(fd.get("min_order_qty") ?? 1),
      stock: Number(fd.get("stock") ?? 0),
      sizes: csv(fd.get("sizes")),
      colors: csv(fd.get("colors")),
      material: String(fd.get("material") ?? "").trim() || null,
      main_image_url: imageUrl,
      is_active: fd.get("is_active") === "on",
    };
    const { error } = editing
      ? await supabase.from("wholesale_products").update(payload).eq("id", editing.id)
      : await supabase.from("wholesale_products").insert(payload);
    if (error) {
      toast.error("ذخیره انجام نشد: " + error.message);
      return;
    }
    toast.success("ذخیره شد");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-wholesale"] });
  }

  async function remove(id: string) {
    if (!confirm("حذف شود؟")) return;
    const { error } = await supabase.from("wholesale_products").delete().eq("id", id);
    if (error) toast.error("حذف انجام نشد.");
    else qc.invalidateQueries({ queryKey: ["admin-wholesale"] });
  }

  return (
    <AdminShell title="محصولات عمده">
      <div className="flex justify-between">
        <p className="text-xs text-muted-foreground">{toFaDigits(rows?.length ?? 0)} محصول عمده</p>
        <Button
          onClick={() => {
            setEditing(null);
            setImageUrl(null);
            setOpen(true);
          }}
        >
          افزودن محصول عمده
        </Button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">نام</Label>
            <Input id="name" name="name" required defaultValue={editing?.name ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="code">کد</Label>
            <Input id="code" name="code" required defaultValue={editing?.code ?? ""} dir="ltr" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="wholesale_price">قیمت عمده (تومان)</Label>
            <Input
              id="wholesale_price"
              name="wholesale_price"
              type="number"
              required
              defaultValue={editing?.wholesale_price ?? ""}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="min_order_qty">حداقل سفارش</Label>
            <Input
              id="min_order_qty"
              name="min_order_qty"
              type="number"
              defaultValue={editing?.min_order_qty ?? 10}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="stock">موجودی</Label>
            <Input id="stock" name="stock" type="number" defaultValue={editing?.stock ?? 0} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="material">جنس</Label>
            <Input id="material" name="material" defaultValue={editing?.material ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="sizes">سایزها</Label>
            <Input id="sizes" name="sizes" defaultValue={(editing?.sizes ?? []).join("، ")} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="colors">رنگ‌ها</Label>
            <Input id="colors" name="colors" defaultValue={(editing?.colors ?? []).join("، ")} className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={editing?.description ?? ""} className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="image">تصویر</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setImageUrl(await uploadProductImage(file));
                  toast.success("تصویر آپلود شد");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "آپلود ناموفق بود");
                }
              }}
            />
            {imageUrl && <img src={imageUrl} alt="" className="mt-3 h-24 w-28 rounded-md object-cover" />}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
            <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} /> فعال
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit">ذخیره</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {(rows ?? []).map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
              {p.main_image_url && <img src={p.main_image_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatToman(p.wholesale_price)} • حداقل {toFaDigits(p.min_order_qty)} عدد
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="ویرایش"
              onClick={() => {
                setEditing(p);
                setImageUrl(p.main_image_url);
                setOpen(true);
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="حذف" onClick={() => remove(p.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {!rows?.length && (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            محصول عمده‌ای ثبت نشده است.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
