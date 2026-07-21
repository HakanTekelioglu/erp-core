import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CategoriesTable } from "@/components/tables/product-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listCategories } from "@/services/category-service";

export default async function CategoriesPage() {
  const categories = await listCategories();
  const rows = categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description ?? "-",
    productCount: category._count.products,
    isActive: category.isActive ? "Aktif" : "Pasif"
  }));

  return (
    <AppShell>
      <PageHeader title="Kategori Yonetimi" description="Urunleri operasyonel raporlama ve stok takibi icin kategorilere ayirin." action={{ label: "Yeni kategori", href: "/categories/new", icon: Plus }} />
      <div className="p-4">
        <CategoriesTable rows={rows} />
      </div>
    </AppShell>
  );
}
