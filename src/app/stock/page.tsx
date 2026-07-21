import { Boxes } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StockTable } from "@/components/tables/product-tables";
import { PageHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/utils";
import { listStockSummary } from "@/services/stock-service";

export default async function StockPage() {
  const products = await listStockSummary();
  const rows = products.map((product) => {
    const stockQuantity = Number(product.stockQuantity);
    const minimumStockLevel = Number(product.minimumStockLevel);

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.category.name,
      stock: formatNumber(stockQuantity),
      minStock: formatNumber(minimumStockLevel),
      unit: product.unit,
      status: !product.isActive ? "Pasif" : stockQuantity <= minimumStockLevel ? "Kritik" : "Aktif"
    };
  });

  return (
    <AppShell>
      <PageHeader title="Stok Yonetimi" description="Tek depo mantigiyla urun stok seviyelerini ve kritik stoklari izleyin." action={{ label: "Hareketler", href: "/stock/movements", icon: Boxes }} />
      <div className="p-4">
        <StockTable rows={rows} />
      </div>
    </AppShell>
  );
}
