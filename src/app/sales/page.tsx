import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SalesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listSalesOrders } from "@/services/sales-service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

export default async function SalesPage() {
  const salesOrders = await listSalesOrders();
  const rows = salesOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.customer.name,
    date: formatDate(order.createdAt),
    status: order.status,
    total: Number(order.grandTotal)
  }));

  return (
    <AppShell>
      <PageHeader title="Satis Yonetimi" description="Musteri siparisleri, onay akisi, stok dusumu ve faturaya donusum surecini yonetin." action={{ label: "Yeni satis", href: "/sales/new", icon: Plus }} />
      <div className="p-4">
        <SalesTable rows={rows} />
      </div>
    </AppShell>
  );
}
