import { Boxes } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StockTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoProducts } from "@/lib/demo-data";

export default function StockPage() {
  return (
    <AppShell>
      <PageHeader title="Stok Yonetimi" description="Tek depo mantigiyla urun stok seviyelerini ve kritik stoklari izleyin." action={{ label: "Hareketler", href: "/stock/movements", icon: Boxes }} />
      <div className="p-4">
        <StockTable rows={demoProducts} />
      </div>
    </AppShell>
  );
}
