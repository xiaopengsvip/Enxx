import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminContentContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("admin-content flex-1 px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-6", className)}>
      <div className="admin-content-container mx-auto flex w-full max-w-[1440px] flex-col gap-6">{children}</div>
    </main>
  );
}
