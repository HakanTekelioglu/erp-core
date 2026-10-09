"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Role } from "@prisma/client";
import { MessageCircle } from "lucide-react";

const ChatDockPanel = dynamic(() => import("./chat-dock-panel").then(module => module.ChatDockPanel), {
  ssr: false,
  loading: () => <aside aria-label="Mesajlar yükleniyor" className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full border-l border-border bg-panel p-4 md:sticky md:w-[390px] xl:w-[430px]">Mesajlar yükleniyor...</aside>
});
const ChatDockContext = createContext<{ isOpen: boolean; unreadCount: number; toggle: () => void } | null>(null);

export function useChatDock() {
  const context = useContext(ChatDockContext);
  if (!context) throw new Error("useChatDock, ChatDockShell içinde kullanılmalı");
  return context;
}

export function ChatDockShell({ currentUser, initialUnreadCount, topbar, children }: {
  currentUser: { id: string; name: string; role: Role };
  initialUnreadCount: number;
  topbar: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const setDockOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) setHasOpened(true);
    try { window.localStorage.setItem("mini-erp-chat-open", String(open)); } catch {}
  }, []);
  const close = useCallback(() => setDockOpen(false), [setDockOpen]);
  useEffect(() => {
    try { if (window.localStorage.getItem("mini-erp-chat-open") === "true") setDockOpen(true); } catch {}
  }, [setDockOpen]);

  return (
    <ChatDockContext.Provider value={{ isOpen, unreadCount, toggle: () => setDockOpen(!isOpen) }}>
      {topbar}
      <div className="flex min-h-[calc(100vh-4rem)] items-stretch">
        <main className="app-content-container min-w-0 flex-1">{children}</main>
        {hasOpened && <ChatDockPanel currentUser={currentUser} isOpen={isOpen} onClose={close} onUnreadChange={setUnreadCount} />}
      </div>
      {!isOpen && (
        <button type="button" onClick={() => setDockOpen(true)}
          className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-xl border border-r-0 border-border/70 bg-panel/95 px-2.5 py-3.5 text-muted shadow-[0_10px_30px_rgba(15,23,42,0.1)] backdrop-blur transition hover:bg-brand/10 hover:text-brand"
          aria-label="Mesaj panelini aç">
          <MessageCircle className="size-4" />
          <span className="rotate-180 text-[11px] font-semibold tracking-wide [writing-mode:vertical-rl]">Mesajlar</span>
          {unreadCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-5 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </button>
      )}
    </ChatDockContext.Provider>
  );
}
