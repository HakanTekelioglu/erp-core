import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProductsTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoProducts } from "@/lib/demo-data";

export default function ProductsPage() {
  return (
    <AppShell>
      <PageHeader title="Urun Yonetimi" description="Urun, fiyat, KDV, birim ve minimum stok seviyelerini yonetin." action={{ label: "Yeni urun", href: "/products/new", icon: Plus }} />
      <div className="p-4">
        <ProductsTable rows={demoProducts} />
      </div>
    </AppShell>
  );
}
