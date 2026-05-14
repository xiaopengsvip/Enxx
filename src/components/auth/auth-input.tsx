"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function AuthInput({ id, name, label, value, onChange, error, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold text-slate-950 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-200/70 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-400/15",
          error && "border-rose-300 focus:border-rose-300 focus:ring-rose-100 dark:border-rose-300/40",
          className,
        )}
        {...props}
      />
      {error ? <p id={`${id}-error`} className="text-sm font-bold text-rose-600 dark:text-rose-200">{error}</p> : null}
    </div>
  );
}
