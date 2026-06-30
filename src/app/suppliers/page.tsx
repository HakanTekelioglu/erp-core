import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SuppliersTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoSuppliers } from "@/lib/demo-data";

export default function SuppliersPage() {
  return (
    <AppShell>
      <PageHeader title="Tedarikci Yonetimi" description="Tedarikci firma, yetkili kisi ve satin alma gecmisini yonetin." action={{ label: "Yeni tedarikci", href: "/suppliers/new", icon: Plus }} />
      <div className="p-4">
        <SuppliersTable rows={demoSuppliers} />
      </div>
    </AppShell>
  );
}
