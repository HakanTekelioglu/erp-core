import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-white px-6 py-10 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-muted ring-1 ring-inset ring-border">
        <Inbox className="size-5" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
    </div>
  );
}
