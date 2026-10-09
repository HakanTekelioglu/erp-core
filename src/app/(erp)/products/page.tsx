import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/tables/product-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getProductsPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getProductsPage(parsePagination(await searchParams));
  return (
    <>
      <PageHeader title="Urun Yonetimi" description="Urun, fiyat, KDV, birim ve minimum stok seviyelerini yonetin." action={{ label: "Yeni urun", href: "/products/new", icon: Plus }} />
      <div className="p-4">
        <ProductsTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
