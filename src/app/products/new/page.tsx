import { AppShell } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewProductPage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Urun" description="Fiyat, KDV, kategori ve kritik stok ayarlariyla yeni urun kaydi olusturun." />
      <div className="p-4">
        <ProductForm />
      </div>
    </AppShell>
  );
}
