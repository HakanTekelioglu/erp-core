import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  error?: string;
};

const labelClass = "grid min-w-0 gap-1.5 text-sm font-medium text-ink";

const controlClass =
  "w-full min-w-0 rounded-md border border-border bg-white text-sm text-ink shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted/80 hover:border-slate-300 focus:border-brand/60 focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:border-zinc-700";

const errorClass = "border-danger/70 hover:border-danger/70 focus:border-danger focus:ring-danger/10";

function FieldError({ error }: { error?: string }) {
  return error ? <span className="text-xs font-medium text-danger">{error}</span> : null;
}

export function Input({ label, error, className, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={labelClass}>
      {label}
      <input
        className={cn(controlClass, "h-10 px-3", error && errorClass, className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      <FieldError error={error} />
    </label>
  );
}

export function Select({ label, error, className, children, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={labelClass}>
      {label}
      <select
        className={cn(controlClass, "h-10 px-3", error && errorClass, className)}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      <FieldError error={error} />
    </label>
  );
}

export function Textarea({ label, error, className, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={labelClass}>
      {label}
      <textarea
        className={cn(controlClass, "min-h-24 px-3 py-2", error && errorClass, className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      <FieldError error={error} />
    </label>
  );
}
