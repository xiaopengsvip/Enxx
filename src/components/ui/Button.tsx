import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-sky-300/70 bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 text-white shadow-[0_18px_46px_rgba(37,99,235,0.32)] hover:brightness-110",
  secondary:
    "liquid-chip text-slate-900 hover:bg-white/75 dark:text-white dark:hover:bg-white/14",
  ghost:
    "bg-transparent text-slate-700 hover:bg-white/45 dark:text-slate-200 dark:hover:bg-white/10",
  danger:
    "border border-rose-300/60 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-[0_18px_42px_rgba(244,63,94,0.28)] hover:brightness-110",
  success:
    "border border-teal-300/60 bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-[0_18px_42px_rgba(20,184,166,0.24)] hover:brightness-110",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-black tracking-tight transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-300/70 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
