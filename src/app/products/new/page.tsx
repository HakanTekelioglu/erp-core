import { AppShell } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/ui/page-header";
import { listCategories } from "@/services/category-service";

export default async function NewProductPage() {
  const categories = await listCategories();
  const categoryOptions = categories
    .filter((category) => category.isActive)
    .map((category) => ({ id: category.id, name: category.name }));

  return (
    <AppShell>
      <PageHeader title="Yeni Urun" description="Fiyat, KDV, kategori ve kritik stok ayarlariyla yeni urun kaydi olusturun." />
      <div className="p-4">
        <ProductForm categories={categoryOptions} />
      </div>
    </AppShell>
  );
}
