import { AppShell } from "@/components/layout/app-shell";
import { SupplierForm } from "@/components/forms/supplier-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewSupplierPage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Tedarikci" description="Tedarikci karti icin temel iletisim ve vergi bilgilerini girin." />
      <div className="p-4">
        <SupplierForm />
      </div>
    </AppShell>
  );
}
