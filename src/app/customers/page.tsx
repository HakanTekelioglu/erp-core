import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CustomersTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoCustomers } from "@/lib/demo-data";

export default function CustomersPage() {
  return (
    <AppShell>
      <PageHeader title="Musteri Yonetimi" description="Bireysel ve kurumsal musterileri, bakiyeleri ve satis gecmisini takip edin." action={{ label: "Yeni musteri", href: "/customers/new", icon: Plus }} />
      <div className="p-4">
        <CustomersTable rows={demoCustomers} />
      </div>
    </AppShell>
  );
}
