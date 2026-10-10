"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { Factory, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { navigationGroups } from "@/constants/navigation";
import { getMenuForRole, roleLabels } from "@/lib/permissions";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toLocaleUpperCase("tr-TR");
}

export function Sidebar({
  role,
  companyName,
  userName,
  isCollapsed,
  isMobileOpen,
  onToggleCollapsed,
  onCloseMobile
}: {
  role: Role;
  companyName: string;
  userName: string;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const items = getMenuForRole(role);
  const displayName = companyName.replace(/\s*ERP Sistemi\s*$/i, "") || companyName;
  const groups = navigationGroups
    .map((group) => ({ group, items: items.filter((item) => item.group === group) }))
    .filter((entry) => entry.items.length > 0);

  return (
    <aside
      id="primary-navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-white shadow-2xl transition-[width,transform] duration-300 ease-out md:z-30 md:translate-x-0 md:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "md:w-[76px]" : "md:w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 px-4",
          isCollapsed && "md:flex-col md:justify-center md:gap-0 md:px-2"
        )}
      >
        <span
          className={cn(
            "brand-gradient inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-inset ring-white/20",
            isCollapsed && "md:hidden"
          )}
        >
          <Factory className="size-[18px]" aria-hidden />
        </span>
        <div className={cn("min-w-0 flex-1", isCollapsed && "md:hidden")}>
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-ink" title={companyName}>
              {displayName}
            </p>
            <span className="shrink-0 rounded bg-blue-50 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-brand">
              ERP
            </span>
          </div>
          <p className="text-xs text-muted">Yonetim paneli</p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden size-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:inline-flex"
          aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
          {isCollapsed ? <PanelLeftOpen className="size-[18px]" aria-hidden /> : <PanelLeftClose className="size-[18px]" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-slate-100 hover:text-ink md:hidden"
          aria-label="Menüyü kapat"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <nav
        aria-label="Ana menü"
        className={cn("flex-1 overflow-y-auto px-3 pb-4 pt-2", isCollapsed && "md:px-3")}
      >
        {groups.map(({ group, items: groupItems }, index) => (
          <div key={group} className={cn(index > 0 && "mt-5")}>
            <p
              className={cn(
                "mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted/80",
                isCollapsed && "md:hidden"
              )}
            >
              {group}
            </p>
            {isCollapsed && index > 0 ? <div className="mx-3 mb-3 hidden border-t border-border md:block" aria-hidden /> : null}
            <ul className="grid gap-0.5">
              {groupItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={isCollapsed ? item.label : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                        isCollapsed && "md:justify-center md:px-0",
                        isActive
                          ? "bg-blue-50 text-brand"
                          : "text-slate-700 hover:bg-slate-100 hover:text-ink"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive ? "text-brand" : "text-muted group-hover:text-ink",
                          isCollapsed && "md:size-[18px]"
                        )}
                        aria-hidden
                      />
                      <span className={cn("truncate", isCollapsed && "md:hidden")}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("shrink-0 border-t border-border p-3", isCollapsed && "md:px-2")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-1.5",
            isCollapsed && "md:justify-center md:px-0"
          )}
          title={isCollapsed ? `${userName} · ${roleLabels[role]}` : undefined}
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-brand ring-1 ring-inset ring-brand/15">
            {getInitials(userName)}
          </span>
          <div className={cn("min-w-0 flex-1", isCollapsed && "md:hidden")}>
            <p className="truncate text-sm font-medium text-ink">{userName}</p>
            <p className="truncate text-xs text-muted">{roleLabels[role]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
