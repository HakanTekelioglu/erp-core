import type { Role } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth";
import { canAccessPath, REQUEST_PATH_HEADER } from "@/lib/permissions";
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

  const settings = await getCompanySettings();
  const userName = session.user.name ?? "Kullanici";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} companyName={settings.companyName} />
      <div className="md:pl-72">
        <Topbar userName={userName} role={role} />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
