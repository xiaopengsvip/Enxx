import type { ReactNode } from "react";
import { AuthCardMotion } from "@/components/auth/auth-card-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  badge: string;
  title: string;
  subtitle: string;
  description?: string;
  benefits?: string[];
  note?: string;
  children: ReactNode;
  className?: string;
};

export function AuthShell({ badge, title, subtitle, description, benefits = [], note, children, className }: AuthShellProps) {
  return (
    <section className={cn("mx-auto grid w-full max-w-[1180px] items-center gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10", className)}>
      <div className="space-y-5 lg:pr-4">
        <Badge>{badge}</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="max-w-xl text-lg font-black leading-8 text-slate-700 dark:text-slate-200">{subtitle}</p>
          {description ? <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p> : null}
        </div>
        {benefits.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {benefits.map((item) => <div key={item} className="liquid-chip rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">✓ {item}</div>)}
          </div>
        ) : null}
        {note ? <p className="rounded-[1.25rem] border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-xs font-bold leading-6 text-amber-800 backdrop-blur-xl dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-100">{note}</p> : null}
      </div>

      <div className="mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end">
        <AuthCardMotion>
          <div className="liquid-panel relative overflow-hidden rounded-[2rem] p-5 shadow-[0_28px_90px_rgba(15,23,42,.18)] dark:shadow-[0_28px_90px_rgba(0,0,0,.36)] sm:p-7">
            <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-sky-300/24 blur-3xl dark:bg-sky-500/14" />
            <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/12" />
            <div className="relative space-y-5">{children}</div>
          </div>
        </AuthCardMotion>
      </div>
    </section>
  );
}
