import { AppShell } from "@/components/layout/app-shell";
import { CustomerForm } from "@/components/forms/customer-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCustomerPage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Musteri" description="Musteri bilgilerini, vergi bilgilerini ve aktiflik durumunu kaydedin." />
      <div className="p-4">
        <CustomerForm />
      </div>
    </AppShell>
  );
}
