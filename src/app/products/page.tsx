import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProductsTable } from "@/components/tables/product-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listProducts } from "@/services/product-service";

export default async function ProductsPage() {
  const products = await listProducts();
  const rows = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    category: product.category.name,
    stock: Number(product.stockQuantity),
    unit: product.unit,
    salePrice: Number(product.salePrice),
    status: product.isActive ? "Aktif" : "Pasif",
    usageCount: product._count.stockMovements + product._count.salesOrderItems + product._count.purchaseOrderItems
  }));

  return (
    <AppShell>
      <PageHeader title="Urun Yonetimi" description="Urun, fiyat, KDV, birim ve minimum stok seviyelerini yonetin." action={{ label: "Yeni urun", href: "/products/new", icon: Plus }} />
      <div className="p-4">
        <ProductsTable rows={rows} />
      </div>
    </AppShell>
  );
}
