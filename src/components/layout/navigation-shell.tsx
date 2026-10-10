"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Role } from "@prisma/client";
import { ChatDockShell } from "@/components/chat/chat-dock-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "mini-erp-sidebar-collapsed";

export function NavigationShell({
  role,
  companyName,
  userId,
  userName,
  initialUnreadCount,
  children
}: {
  role: Role;
  companyName: string;
  userId: string;
  userName: string;
  initialUnreadCount: number;
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setIsCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    } catch {}
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-zinc-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Menüyü kapat"
        />
      ) : null}

      <Sidebar
        role={role}
        companyName={companyName}
        userName={userName}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapsed={toggleCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={cn(
          "transition-[padding] duration-300 ease-out",
          isCollapsed ? "md:pl-[76px]" : "md:pl-64"
        )}
      >
        <ChatDockShell
          currentUser={{ id: userId, name: userName, role }}
          initialUnreadCount={initialUnreadCount}
          topbar={
            <Topbar
              userName={userName}
              role={role}
              isNavigationOpen={isMobileOpen}
              onOpenNavigation={() => setIsMobileOpen(true)}
            />
          }
        >
          {children}
        </ChatDockShell>
      </div>
    </div>
  );
}
