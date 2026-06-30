import { AppShell } from "@/components/layout/app-shell";
import { InvoicesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoInvoices } from "@/lib/demo-data";

export default function InvoicesPage() {
  return (
    <AppShell>
      <PageHeader title="Fatura Yonetimi" description="Satis ve satin alma faturalarini, vade ve odeme durumlarini takip edin." />
      <div className="p-4">
        <InvoicesTable rows={demoInvoices} />
      </div>
    </AppShell>
  );
}
