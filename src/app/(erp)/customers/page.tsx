import { Plus } from "lucide-react";
import { CustomersTable } from "@/components/tables/partner-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getCustomersPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getCustomersPage(parsePagination(await searchParams));
  return (
    <>
      <PageHeader title="Musteri Yonetimi" description="Bireysel ve kurumsal musterileri, bakiyeleri ve satis gecmisini takip edin." action={{ label: "Yeni musteri", href: "/customers/new", icon: Plus }} />
      <div className="p-4">
        <CustomersTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
