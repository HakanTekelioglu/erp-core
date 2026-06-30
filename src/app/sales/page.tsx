import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SalesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoSalesOrders } from "@/lib/demo-data";

export default function SalesPage() {
  return (
    <AppShell>
      <PageHeader title="Satis Yonetimi" description="Musteri siparisleri, onay akisi, stok dusumu ve faturaya donusum surecini yonetin." action={{ label: "Yeni satis", href: "/sales/new", icon: Plus }} />
      <div className="p-4">
        <SalesTable rows={demoSalesOrders} />
      </div>
    </AppShell>
  );
}
