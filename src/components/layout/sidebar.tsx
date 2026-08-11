"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { Factory, LayoutGrid, X } from "lucide-react";
import { getMenuForRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  companyName,
  isCollapsed,
  isMobileOpen,
  onToggleCollapsed,
  onCloseMobile
}: {
  role: Role;
  companyName: string;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const items = getMenuForRole(role);
  const displayName = companyName.replace(/\s*ERP Sistemi\s*$/i, "") || companyName;

  return (
    <aside
      id="primary-navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-white shadow-2xl transition-[width,transform] duration-300 ease-out md:z-30 md:translate-x-0 md:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "md:w-20" : "md:w-72"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-border px-5",
          isCollapsed && "md:justify-center md:px-2"
        )}
      >
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-brand text-white",
            isCollapsed && "md:hidden"
          )}
        >
          <Factory className="size-5" aria-hidden />
        </span>
        <div className={cn("min-w-0 flex-1", isCollapsed && "md:hidden")}>
          <p className="truncate text-sm font-semibold text-ink" title={companyName}>
            {displayName}
          </p>
          <p className="text-xs font-medium text-muted">ERP Sistemi</p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden size-10 shrink-0 items-center justify-center rounded-md border border-border bg-white text-muted transition hover:border-brand/30 hover:bg-blue-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:inline-flex"
          aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
          <LayoutGrid className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border text-muted transition hover:bg-slate-100 hover:text-ink md:hidden"
          aria-label="Menüyü kapat"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <nav
        aria-label="Ana menü"
        className={cn("flex-1 overflow-y-auto px-3 py-4", isCollapsed && "md:px-2")}
      >
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              aria-current={isActive ? "page" : undefined}
              aria-label={isCollapsed ? item.label : undefined}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "mb-1 flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                isCollapsed && "md:justify-center md:px-0",
                isActive ? "bg-blue-50 text-brand" : "text-slate-700 hover:bg-slate-100 hover:text-ink"
              )}
            >
              <Icon className={cn("size-4 shrink-0", isCollapsed && "md:size-5")} aria-hidden />
              <span className={cn(isCollapsed && "md:hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
