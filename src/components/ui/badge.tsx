import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-1 text-xs font-semibold",
        tone === "default" && "bg-blue-50 text-blue-700",
        tone === "success" && "bg-emerald-50 text-success",
        tone === "warning" && "bg-amber-50 text-warning",
        tone === "danger" && "bg-orange-50 text-danger",
        tone === "muted" && "bg-slate-100 text-muted"
      )}
    >
      {children}
    </span>
  );
}
