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

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type ProductRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  material: string | null;
  brand: string | null;
  main_image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
};

const csv = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name, slug").order("sort_order");
      return data ?? [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, code, description, price, compare_at_price, stock, sizes, colors, material, brand, main_image_url, category_id, is_active, is_featured",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ProductRow[];
    },
  });

  function startNew() {
    setEditing(null);
    setImageUrl(null);
    setOpen(true);
  }

  function startEdit(p: ProductRow) {
    setEditing(p);
    setImageUrl(p.main_image_url);
    setOpen(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      code: String(fd.get("code") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      price: Number(fd.get("price") ?? 0),
      compare_at_price: fd.get("compare_at_price") ? Number(fd.get("compare_at_price")) : null,
      stock: Number(fd.get("stock") ?? 0),
      sizes: csv(fd.get("sizes")),
      colors: csv(fd.get("colors")),
      material: String(fd.get("material") ?? "").trim() || null,
      brand: String(fd.get("brand") ?? "").trim() || null,
      category_id: String(fd.get("category_id") ?? "") || null,
      main_image_url: imageUrl,
      is_active: fd.get("is_active") === "on",
      is_featured: fd.get("is_featured") === "on",
    };
    setSaving(true);
    const { error } = editing
      ? await supabase.from("products").update(payload as never).eq("id", editing.id)
      : await supabase.from("products").insert(payload as never);
    setSaving(false);
    if (error) {
      toast.error("ذخیره محصول انجام نشد: " + error.message);
      return;
    }
    toast.success("محصول ذخیره شد");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function remove(id: string) {
    if (!confirm("این محصول حذف شود؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("حذف انجام نشد.");
    else {
      toast.success("محصول حذف شد");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    }
  }

  return (
    <AdminShell title="مدیریت محصولات">
      <div className="flex justify-between">
        <p className="text-xs text-muted-foreground">{toFaDigits(products?.length ?? 0)} محصول</p>
        <Button onClick={startNew}>افزودن محصول</Button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">نام محصول</Label>
            <Input id="name" name="name" required defaultValue={editing?.name ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="code">کد محصول</Label>
            <Input id="code" name="code" required defaultValue={editing?.code ?? ""} dir="ltr" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="price">قیمت (تومان)</Label>
            <Input id="price" name="price" type="number" required defaultValue={editing?.price ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="compare_at_price">قیمت قبل از تخفیف</Label>
            <Input
              id="compare_at_price"
              name="compare_at_price"
              type="number"
              defaultValue={editing?.compare_at_price ?? ""}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="stock">موجودی</Label>
            <Input id="stock" name="stock" type="number" defaultValue={editing?.stock ?? 0} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="category_id">دسته‌بندی</Label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={editing?.category_id ?? ""}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">بدون دسته</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sizes">سایزها (با کاما)</Label>
            <Input id="sizes" name="sizes" defaultValue={(editing?.sizes ?? []).join("، ")} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="colors">رنگ‌ها (با کاما)</Label>
            <Input id="colors" name="colors" defaultValue={(editing?.colors ?? []).join("، ")} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="material">جنس</Label>
            <Input id="material" name="material" defaultValue={editing?.material ?? ""} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="brand">برند</Label>
            <Input id="brand" name="brand" defaultValue={editing?.brand ?? ""} className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={editing?.description ?? ""} className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="image">تصویر اصلی</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const url = await uploadProductImage(file);
                  setImageUrl(url);
                  toast.success("تصویر آپلود شد");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "آپلود ناموفق بود");
                }
              }}
            />
            {imageUrl && <img src={imageUrl} alt="" className="mt-3 h-28 w-24 rounded-md object-cover" />}
          </div>
          <div className="flex gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} /> فعال
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="is_featured" defaultChecked={editing?.is_featured ?? false} /> محصول منتخب
            </label>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {(products ?? []).map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
              {p.main_image_url && <img src={p.main_image_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {toFaDigits(p.code)} • {formatToman(p.price)} • موجودی {toFaDigits(p.stock)}
                {!p.is_active && " • غیرفعال"}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(p)} aria-label="ویرایش">
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => remove(p.id)} aria-label="حذف">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {!products?.length && (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            هنوز محصولی ثبت نشده است.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
