"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import { ChevronRight, LogOut, Menu, MessageCircle, Search } from "lucide-react";
import { useChatDock } from "@/components/chat/chat-dock-shell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { navigationItems } from "@/constants/navigation";
import { roleLabels } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const iconButtonClass =
  "relative inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

function useBreadcrumb() {
  const pathname = usePathname();
  const item = navigationItems
    .filter((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (!item) return null;

  const rest = pathname.slice(item.href.length).split("/").filter(Boolean);
  const leaf = rest.length === 0 ? null : rest[0] === "new" ? "Yeni" : rest[0] === "movements" ? "Hareketler" : "Detay";

  return { group: item.group, label: item.label, href: item.href, leaf };
}

export function Topbar({
  userName,
  role,
  isNavigationOpen,
  onOpenNavigation
}: {
  userName: string;
  role: Role;
  isNavigationOpen: boolean;
  onOpenNavigation: () => void;
}) {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const { isOpen: isChatOpen, toggle: toggleChat, unreadCount } = useChatDock();
  const breadcrumb = useBreadcrumb();

  function handleSignOut() {
    void signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenNavigation}
            className={cn(iconButtonClass, "-ml-1 md:hidden")}
            aria-label="Menüyü aç"
            aria-controls="primary-navigation"
            aria-expanded={isNavigationOpen}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          {breadcrumb ? (
            <nav aria-label="Konum" className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden text-muted sm:inline">{breadcrumb.group}</span>
              <ChevronRight className="hidden size-3.5 shrink-0 text-muted/60 sm:inline" aria-hidden />
              {breadcrumb.leaf ? (
                <>
                  <Link href={breadcrumb.href} className="truncate text-muted transition-colors hover:text-ink">
                    {breadcrumb.label}
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0 text-muted/60" aria-hidden />
                  <span className="truncate font-medium text-ink">{breadcrumb.leaf}</span>
                </>
              ) : (
                <span className="truncate font-medium text-ink">{breadcrumb.label}</span>
              )}
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <label className="relative mr-2 hidden w-64 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
              placeholder="Siparis, fatura veya urun ara"
            />
          </label>
          <button
            type="button"
            onClick={toggleChat}
            className={cn(iconButtonClass, isChatOpen && "bg-blue-50 text-brand hover:bg-blue-50 hover:text-brand")}
            aria-label={isChatOpen ? "Mesaj panelini kapat" : "Mesaj panelini aç"}
            aria-expanded={isChatOpen}
            title="Mesajlar"
          >
            <MessageCircle className="size-[18px]" />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-4 text-brand-foreground ring-2 ring-background">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>
          <ThemeToggle />
          <span className="mx-1.5 hidden h-5 w-px bg-border sm:block" aria-hidden />
          <div className="hidden pr-1 text-right leading-tight sm:block md:hidden">
            <p className="text-sm font-medium text-ink">{userName}</p>
            <p className="text-xs text-muted">{roleLabels[role]}</p>
          </div>
          <button
            type="button"
            className={cn(iconButtonClass, "hover:bg-rose-50 hover:text-danger")}
            onClick={() => setIsSignOutDialogOpen(true)}
            aria-label="Cikis yap"
            title="Cikis yap"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>
      <ConfirmDialog
        open={isSignOutDialogOpen}
        title="Cikis yapilsin mi?"
        description="Oturumunuzu kapatmak uzeresiniz. Devam ederseniz giris ekranina yonlendirileceksiniz."
        confirmLabel="Cikis yap"
        cancelLabel="Iptal"
        variant="danger"
        onConfirm={handleSignOut}
        onCancel={() => setIsSignOutDialogOpen(false)}
      />
    </>
  );
}
