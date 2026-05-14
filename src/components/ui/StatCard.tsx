import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="group p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(37,99,235,0.2)]">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 bg-clip-text text-3xl font-black text-transparent">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{hint}</p>
    </Card>
  );
}
