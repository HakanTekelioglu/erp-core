"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { Factory } from "lucide-react";
import { getMenuForRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = getMenuForRole(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <span className="inline-flex size-10 items-center justify-center rounded-md bg-brand text-white">
          <Factory className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Kucuk Isletme</p>
          <p className="text-xs font-medium text-muted">ERP Sistemi</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                isActive ? "bg-blue-50 text-brand" : "text-slate-700 hover:bg-slate-100 hover:text-ink"
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
