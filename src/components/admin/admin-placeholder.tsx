import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function AdminPlaceholder({ title, description, primaryHref = "/admin" }: { title: string; description: string; primaryHref?: string }) {
  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-500">Admin Module</p>
        <h1 className="text-4xl font-black tracking-[-0.05em]">{title}</h1>
        <p className="max-w-3xl text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">{description}</p>
        <Link href={primaryHref} className="inline-flex rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_18px_46px_rgba(37,99,235,.28)]">返回后台概览</Link>
      </Card>
    </div>
  );
}
