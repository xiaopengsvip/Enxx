import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "liquid-chip inline-flex items-center rounded-full px-3 py-1 text-xs font-black tracking-[0.14em] text-sky-700 dark:text-sky-100",
        className,
      )}
      {...props}
    />
  );
}
