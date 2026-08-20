import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const listSchema = z.object({
  categorySlug: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "cheapest", "expensive", "discount"]).default("newest"),
  featuredOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).default(60),
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("categories")
    .select("id, slug, name, description, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data: input }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const supabase = getPublicClient();

    let categoryId: string | null = null;
    if (input.categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", input.categorySlug)
        .maybeSingle();
      if (!cat) return [];
      categoryId = cat.id;
    }

    let q = supabase
      .from("products")
      .select(
        "id, name, code, description, price, compare_at_price, stock, sizes, colors, material, brand, main_image_url, created_at, category_id, categories(slug, name)",
      )
      .eq("is_active", true);

    if (categoryId) q = q.eq("category_id", categoryId);
    if (input.featuredOnly) q = q.eq("is_featured", true);
    if (input.search && input.search.trim()) {
      const s = input.search.trim().replace(/[%,]/g, " ");
      q = q.or(`name.ilike.%${s}%,code.ilike.%${s}%,description.ilike.%${s}%`);
    }

    if (input.sort === "cheapest") q = q.order("price", { ascending: true });
    else if (input.sort === "expensive") q = q.order("price", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    const { data, error } = await q.limit(input.limit);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    if (input.sort === "discount") {
      rows.sort((a, b) => {
        const da = a.compare_at_price ? (Number(a.compare_at_price) - Number(a.price)) / Number(a.compare_at_price) : 0;
        const db = b.compare_at_price ? (Number(b.compare_at_price) - Number(b.price)) / Number(b.compare_at_price) : 0;
        return db - da;
      });
    }
    return rows;
  });

export const getProductByCode = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ code: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const supabase = getPublicClient();
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id, name, code, description, price, compare_at_price, stock, sizes, colors, material, brand, main_image_url, created_at, categories(slug, name)",
      )
      .eq("code", data.code)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return null;
    const { data: images } = await supabase
      .from("product_images")
      .select("id, url, sort_order")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true });
    return { ...product, images: images ?? [] };
  });

export const listWholesaleProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("wholesale_products")
    .select(
      "id, name, code, description, wholesale_price, min_order_qty, stock, sizes, colors, material, main_image_url",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient().from("store_settings").select("key, value");
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return map;
});
