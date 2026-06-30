import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PurchasesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listPurchaseOrders } from "@/services/purchase-service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

export default async function PurchasesPage() {
  const purchases = await listPurchaseOrders();
  const rows = purchases.map((purchase) => ({
    id: purchase.id,
    orderNumber: purchase.orderNumber,
    supplier: purchase.supplier.companyName,
    date: formatDate(purchase.createdAt),
    status: purchase.status,
    total: Number(purchase.grandTotal)
  }));

  return (
    <AppShell>
      <PageHeader title="Satin Alma Yonetimi" description="Tedarikci siparislerini, teslim alma ve stok girisi surecini yonetin." action={{ label: "Yeni satin alma", href: "/purchases/new", icon: Plus }} />
      <div className="p-4">
        <PurchasesTable rows={rows} />
      </div>
    </AppShell>
  );
}
