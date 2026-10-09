import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getStockMovementsPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function StockMovementsPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getStockMovementsPage(parsePagination(await searchParams));

  return (
    <>
      <PageHeader title="Stok Hareketleri" description="Satis, satin alma, iade ve manuel duzeltme hareketlerini izleyin." />
      <div className="p-4">
        <DataTable
          rows={rows}
          pagination={pagination}
          columns={[
            { key: "date", header: "Tarih" },
            { key: "product", header: "Urun" },
            { key: "type", header: "Hareket turu" },
            { key: "quantity", header: "Miktar" },
            { key: "reference", header: "Referans" },
            { key: "note", header: "Not" }
          ]}
          searchPlaceholder="Hareket ara"
        />
      </div>
    </>
  );
}
