import type { Role } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NavigationShell } from "@/components/layout/navigation-shell";
import { getCurrentUser } from "@/lib/auth";
import { canAccessPath, REQUEST_PATH_HEADER } from "@/lib/permissions";
import { getChatWorkspace, serializeChatWorkspace } from "@/services/chat-service";
import { getCompanySettings } from "@/services/settings-service";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as Role;
  const pathname = (await headers()).get(REQUEST_PATH_HEADER);
  if (!pathname || !canAccessPath(role, pathname)) {
    redirect("/dashboard");
  }

  const [settings, chatWorkspace] = await Promise.all([
    getCompanySettings(),
    getChatWorkspace({ id: session.user.id, role })
  ]);
  const userName = session.user.name ?? "Kullanici";

  return (
    <NavigationShell
      role={role}
      companyName={settings.companyName}
      userId={session.user.id}
      userName={userName}
      initialChatData={serializeChatWorkspace(chatWorkspace)}
    >
      {children}
    </NavigationShell>
  );
}
