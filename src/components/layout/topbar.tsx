"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import { LogOut, Menu, MessageCircle, Search } from "lucide-react";
import { useChatDock } from "@/components/chat/chat-dock-shell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { roleLabels } from "@/lib/permissions";

export function Topbar({ userName, role }: { userName: string; role: Role }) {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const { isOpen: isChatOpen, toggle: toggleChat, unreadCount } = useChatDock();

  function handleSignOut() {
    void signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <button className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted md:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <label className="relative hidden w-80 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input className="min-h-10 w-full rounded-md border border-border bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15" placeholder="Siparis, fatura veya urun ara" />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">{userName}</p>
            <p className="text-xs font-medium text-muted">{roleLabels[role]}</p>
          </div>
          <button
            type="button"
            onClick={toggleChat}
            className="relative inline-flex size-10 items-center justify-center rounded-md border border-border bg-white text-muted transition hover:bg-slate-50 hover:text-brand"
            aria-label={isChatOpen ? "Mesaj panelini kapat" : "Mesaj panelini aç"}
            aria-expanded={isChatOpen}
          >
            <MessageCircle className="size-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-4 text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>
          <ThemeToggle />
          <Button variant="secondary" className="size-10 p-0" onClick={() => setIsSignOutDialogOpen(true)} aria-label="Cikis yap">
            <LogOut className="size-4" />
          </Button>
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
