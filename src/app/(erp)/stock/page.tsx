import { Boxes } from "lucide-react";
import { StockTable } from "@/components/tables/product-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getStockPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function StockPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getStockPage(parsePagination(await searchParams));

  return (
    <>
      <PageHeader title="Stok Yonetimi" description="Tek depo mantigiyla urun stok seviyelerini ve kritik stoklari izleyin." action={{ label: "Hareketler", href: "/stock/movements", icon: Boxes }} />
      <div className="p-4">
        <StockTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
