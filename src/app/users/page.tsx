import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { UsersTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoUsers } from "@/lib/demo-data";

export default function UsersPage() {
  return (
    <AppShell>
      <PageHeader title="Kullanici ve Yetki Yonetimi" description="Kullanici hesaplari, roller ve aktif/pasif durumlarini yonetin." action={{ label: "Yeni kullanici", href: "/users", icon: Plus }} />
      <div className="p-4">
        <UsersTable rows={demoUsers} />
      </div>
    </AppShell>
  );
}
