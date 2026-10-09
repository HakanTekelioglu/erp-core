import { Plus } from "lucide-react";
import { SalesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getSalesPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function SalesPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getSalesPage(parsePagination(await searchParams));
  return (
    <>
      <PageHeader title="Satis Yonetimi" description="Musteri siparisleri, onay akisi, stok dusumu ve faturaya donusum surecini yonetin." action={{ label: "Yeni satis", href: "/sales/new", icon: Plus }} />
      <div className="p-4">
        <SalesTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
