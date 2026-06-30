import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PurchasesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoPurchaseOrders } from "@/lib/demo-data";

export default function PurchasesPage() {
  return (
    <AppShell>
      <PageHeader title="Satin Alma Yonetimi" description="Tedarikci siparislerini, teslim alma ve stok girisi surecini yonetin." action={{ label: "Yeni satin alma", href: "/purchases/new", icon: Plus }} />
      <div className="p-4">
        <PurchasesTable rows={demoPurchaseOrders} />
      </div>
    </AppShell>
  );
}
