import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminContentContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("admin-content min-h-[calc(100vh-72px)] px-4 pb-12 pt-5 sm:px-6 lg:px-8", className)}><div className="admin-content-container mx-auto flex w-full max-w-[1360px] flex-col gap-6">{children}</div></main>;
}
