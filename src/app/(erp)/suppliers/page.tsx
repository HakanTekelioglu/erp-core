import { Plus } from "lucide-react";
import { SuppliersTable } from "@/components/tables/partner-tables";
import { PageHeader } from "@/components/ui/page-header";
import { getSuppliersPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { rows, pagination } = await getSuppliersPage(parsePagination(await searchParams));
  return (
    <>
      <PageHeader title="Tedarikci Yonetimi" description="Tedarikci firma, yetkili kisi ve satin alma gecmisini yonetin." action={{ label: "Yeni tedarikci", href: "/suppliers/new", icon: Plus }} />
      <div className="p-4">
        <SuppliersTable rows={rows} pagination={pagination} />
      </div>
    </>
  );
}
