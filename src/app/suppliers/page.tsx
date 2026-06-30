import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SuppliersTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listSuppliers } from "@/services/supplier-service";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();
  const rows = suppliers.map((supplier) => ({
    id: supplier.id,
    companyName: supplier.companyName,
    contactPerson: supplier.contactPerson ?? "-",
    phone: supplier.phone ?? "-",
    email: supplier.email ?? "-",
    status: supplier.isActive ? "Aktif" : "Pasif",
    usageCount: supplier._count.purchaseOrders + supplier._count.invoices
  }));

  return (
    <AppShell>
      <PageHeader title="Tedarikci Yonetimi" description="Tedarikci firma, yetkili kisi ve satin alma gecmisini yonetin." action={{ label: "Yeni tedarikci", href: "/suppliers/new", icon: Plus }} />
      <div className="p-4">
        <SuppliersTable rows={rows} />
      </div>
    </AppShell>
  );
}
