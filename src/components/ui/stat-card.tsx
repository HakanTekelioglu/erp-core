import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatTone = "blue" | "green" | "amber" | "orange" | "slate";

const toneClasses: Record<StatTone, string> = {
  blue: "bg-blue-50 text-brand ring-brand/15",
  green: "bg-emerald-50 text-success ring-success/15",
  amber: "bg-amber-50 text-warning ring-warning/20",
  orange: "bg-rose-50 text-danger ring-danger/15",
  slate: "bg-slate-100 text-muted ring-border"
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue",
  variant = "default"
}: {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: StatTone;
  variant?: "default" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="surface-card flex items-center gap-3 p-3.5 transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", toneClasses[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted">{label}</p>
          <p className="text-lg font-semibold tabular-nums tracking-tight text-ink">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card relative overflow-hidden p-5 transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
      <div className="flex items-center gap-3">
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", toneClasses[tone])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <p className="min-w-0 truncate text-sm font-medium text-muted">{label}</p>
      </div>
      <p className="mt-4 text-[28px] font-semibold leading-none tabular-nums tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-2.5 truncate text-xs text-muted">{helper}</p> : null}
    </div>
  );
}
