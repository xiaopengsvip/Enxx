import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminStatsRow({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</section>;
}
