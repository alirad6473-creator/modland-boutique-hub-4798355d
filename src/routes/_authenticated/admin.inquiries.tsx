import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminShell } from "@/components/store/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: Inquiries,
});

function Inquiries() {
  const { data } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("wholesale_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return rows ?? [];
    },
  });

  return (
    <AdminShell title="درخواست‌های خرید عمده">
      <div className="space-y-3">
        {(data ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-foreground">{r.full_name}</span>
              <span dir="ltr" className="text-muted-foreground">
                {toFaDigits(r.phone)}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {[r.store_name, r.city, r.approx_quantity].filter(Boolean).join(" • ")}
            </p>
            {r.products_wanted && (
              <p className="mt-1 text-xs text-muted-foreground">محصولات: {r.products_wanted}</p>
            )}
            {r.note && <p className="mt-1 text-xs text-muted-foreground">توضیح: {r.note}</p>}
          </div>
        ))}
        {!data?.length && (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            درخواستی ثبت نشده است.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
