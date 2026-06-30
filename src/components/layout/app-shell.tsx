import type { Role } from "@prisma/client";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  const role = session?.user.role ?? ("ADMIN" as Role);
  const userName = session?.user.name ?? "Demo Admin";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <div className="md:pl-72">
        <Topbar userName={userName} role={role} />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
