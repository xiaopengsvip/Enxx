"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PasswordInput({ id, name, label, value, onChange, error, className, placeholder, autoComplete, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 pr-14 text-sm font-semibold text-slate-950 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-200/70 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-400/15",
            error && "border-rose-300 focus:border-rose-300 focus:ring-rose-100 dark:border-rose-300/40",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={visible ? "隐藏密码" : "显示密码"}
        >
          {visible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18"/><path d="M10.58 10.58a2 2 0 002.83 2.83"/><path d="M16.68 16.68A10.8 10.8 0 0112 18c-5 0-9-6-9-6a17.4 17.4 0 014.15-4.57"/><path d="M9.9 4.24A10.3 10.3 0 0112 4c5 0 9 6 9 6a17.6 17.6 0 01-2.2 2.88"/></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      {error ? <p id={`${id}-error`} className="text-sm font-bold text-rose-600 dark:text-rose-200">{error}</p> : null}
    </div>
  );
}
