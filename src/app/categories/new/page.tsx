import { AppShell } from "@/components/layout/app-shell";
import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCategoryPage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Kategori" description="Urunleri raporlama ve stok takibi icin yeni bir kategori altinda gruplayin." />
      <div className="p-4">
        <CategoryForm />
      </div>
    </AppShell>
  );
}
