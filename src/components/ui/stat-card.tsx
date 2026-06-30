import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "orange" | "slate";
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-md",
            tone === "blue" && "bg-blue-50 text-blue-700",
            tone === "green" && "bg-emerald-50 text-success",
            tone === "amber" && "bg-amber-50 text-warning",
            tone === "orange" && "bg-orange-50 text-danger",
            tone === "slate" && "bg-slate-100 text-muted"
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      {helper ? <p className="mt-3 text-xs font-medium text-muted">{helper}</p> : null}
    </div>
  );
}
