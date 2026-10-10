import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tone === "default" && "bg-blue-50 text-brand ring-brand/20",
        tone === "success" && "bg-emerald-50 text-success ring-success/20",
        tone === "warning" && "bg-amber-50 text-warning ring-warning/25",
        tone === "danger" && "bg-rose-50 text-danger ring-danger/20",
        tone === "muted" && "bg-slate-100 text-muted ring-border"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "default" && "bg-brand",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "danger" && "bg-danger",
          tone === "muted" && "bg-muted"
        )}
        aria-hidden
      />
      {children}
    </span>
  );
}
