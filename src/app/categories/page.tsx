import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CategoriesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoCategories } from "@/lib/demo-data";

export default function CategoriesPage() {
  return (
    <AppShell>
      <PageHeader title="Kategori Yonetimi" description="Urunleri operasyonel raporlama ve stok takibi icin kategorilere ayirin." action={{ label: "Yeni kategori", href: "/categories", icon: Plus }} />
      <div className="p-4">
        <CategoriesTable rows={demoCategories} />
      </div>
    </AppShell>
  );
}
