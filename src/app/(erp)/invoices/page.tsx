import { InvoicesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getInvoicesPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getInvoicesPage(parsePagination(await searchParams));
  return (
    <>
      <PageHeader title="Fatura Yonetimi" description="Satis ve satin alma faturalarini, vade ve odeme durumlarini takip edin." />
      <div className="p-4">
        <InvoicesTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
