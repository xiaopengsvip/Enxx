import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminFilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}
