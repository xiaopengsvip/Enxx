"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AdminContentContainer } from "@/components/admin/admin-content-container";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar, type AdminTopbarUser } from "@/components/admin/admin-topbar";

export type AdminShellUser = AdminTopbarUser;

export function AdminShell({ user, children }: { user: AdminShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="admin-layout-shell min-h-screen text-slate-950 dark:text-white lg:h-screen lg:overflow-hidden lg:pl-[322px]">
      <AdminSidebar pathname={pathname} className="hidden lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:z-40 lg:flex lg:w-[290px]" />
      <div className="admin-main flex min-h-screen min-w-0 flex-col lg:h-screen lg:overflow-x-hidden lg:overflow-y-auto">
        <AdminTopbar user={user} pathname={pathname} onLogout={logout} onOpenMenu={() => setDrawerOpen(true)} />
        <AdminContentContainer>{children}</AdminContentContainer>
      </div>
      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] bg-slate-950/38 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="h-full" onClick={(event) => event.stopPropagation()}>
            <AdminSidebar pathname={pathname} onNavigate={() => setDrawerOpen(false)} className="h-full w-[86vw] max-w-sm rounded-none border-l-0 border-y-0 bg-white/92 shadow-2xl dark:bg-slate-950/94" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
