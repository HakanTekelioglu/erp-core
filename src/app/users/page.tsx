import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { UsersTable } from "@/components/tables/admin-tables";
import { PageHeader } from "@/components/ui/page-header";
import { roleLabels } from "@/lib/permissions";
import { listUsers } from "@/services/user-service";

export default async function UsersPage() {
  const users = await listUsers();
  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleLabels[user.role],
    status: user.isActive ? "Aktif" : "Pasif"
  }));

  return (
    <AppShell>
      <PageHeader title="Kullanici ve Yetki Yonetimi" description="Kullanici hesaplari, roller ve aktif/pasif durumlarini yonetin." action={{ label: "Yeni kullanici", href: "/users/new", icon: Plus }} />
      <div className="p-4">
        <UsersTable rows={rows} />
      </div>
    </AppShell>
  );
}
