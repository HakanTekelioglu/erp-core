import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      {label}
      <input
        className={cn(
          "min-h-10 rounded-md border border-border bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15",
          error && "border-danger focus:border-danger focus:ring-danger/15",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, className, children, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      {label}
      <select
        className={cn(
          "min-h-10 rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15",
          error && "border-danger focus:border-danger focus:ring-danger/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      {label}
      <textarea
        className={cn(
          "min-h-24 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15",
          error && "border-danger focus:border-danger focus:ring-danger/15",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}
