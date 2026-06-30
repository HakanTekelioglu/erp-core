import { AppShell } from "@/components/layout/app-shell";
import { SalesOrderForm } from "@/components/forms/sales-order-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewSalePage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Satis Siparisi" description="Musteri ve urun kalemleriyle satis siparisi olusturun; onayda stok kontrolu servis katmaninda yapilir." />
      <div className="p-4">
        <SalesOrderForm />
      </div>
    </AppShell>
  );
}
