import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-9 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md px-3.5 text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-brand text-brand-foreground shadow-sm shadow-brand/20 ring-1 ring-inset ring-white/10 hover:bg-brand/90",
        variant === "secondary" && "border border-border bg-white text-ink shadow-sm hover:bg-slate-50",
        variant === "ghost" && "text-muted hover:bg-slate-100 hover:text-ink",
        variant === "danger" && "bg-danger text-white shadow-sm shadow-danger/20 hover:bg-danger/90",
        className
      )}
      {...props}
    />
  );
}
