import { Plus } from "lucide-react";
import { PurchasesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getPurchasesPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getPurchasesPage(parsePagination(await searchParams));
  return (
    <>
      <PageHeader title="Satin Alma Yonetimi" description="Tedarikci siparislerini, teslim alma ve stok girisi surecini yonetin." action={{ label: "Yeni satin alma", href: "/purchases/new", icon: Plus }} />
      <div className="p-4">
        <PurchasesTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
