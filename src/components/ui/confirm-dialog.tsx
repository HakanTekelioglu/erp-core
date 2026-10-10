"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "primary";
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgec",
  onConfirm,
  onCancel,
  variant = "primary"
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={onCancel}>
      <section
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="w-full max-w-md animate-fade-in rounded-xl border border-border bg-white p-6 shadow-soft"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={
              variant === "danger"
                ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-danger ring-1 ring-inset ring-danger/15"
                : "flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand ring-1 ring-inset ring-brand/15"
            }
          >
            <AlertTriangle className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-dialog-title" className="pt-1.5 text-base font-semibold text-ink">
                {title}
              </h2>
              <button className="-mr-2 -mt-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-slate-100 hover:text-ink" type="button" onClick={onCancel} aria-label="Kapat">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-muted">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
