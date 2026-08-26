import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
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
          این حساب دسترسی مدیریت فروشگاه ندارد. دسترسی مدیر فقط توسط مالک فروشگاه و از طریق
          راه‌اندازی امن سمت سرور فعال می‌شود.
        </p>
        <Button
          variant="ghost"
          className="mt-6 w-full"
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
