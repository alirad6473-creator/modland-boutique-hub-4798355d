import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const claim = useServerFn(claimAdmin);
  const [claiming, setClaiming] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return false;
      const { data: ok } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      return Boolean(ok);
    },
  });

  if (isLoading) {
    return <div className="p-16 text-center text-sm text-muted-foreground">در حال بررسی دسترسی...</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-foreground">دسترسی مدیریت ندارید</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          اگر شما مالک فروشگاه هستید و هنوز مدیری تعیین نشده، می‌توانید نقش مدیر را دریافت کنید.
        </p>
        <Button
          className="mt-6"
          disabled={claiming}
          onClick={async () => {
            setClaiming(true);
            const res = await claim({});
            setClaiming(false);
            if (res.granted) {
              toast.success("دسترسی مدیر فعال شد.");
              refetch();
            } else {
              toast.error(res.reason ?? "امکان دریافت دسترسی نیست.");
            }
          }}
        >
          دریافت دسترسی مدیر
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          خروج از حساب
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
