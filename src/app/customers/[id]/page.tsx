import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerInvoicesTable, CustomerSalesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { demoCustomers, demoInvoices, demoSalesOrders } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = demoCustomers.find((item) => item.id === id);
  if (!customer) notFound();

  return (
    <AppShell>
      <PageHeader title={customer.name} description="Musteri bakiyesi, satis gecmisi ve fatura durumu." />
      <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tip</dt><dd className="font-semibold">{customer.type}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Telefon</dt><dd className="font-semibold">{customer.phone}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">E-posta</dt><dd className="font-semibold">{customer.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Bakiye</dt><dd className="font-semibold">{formatMoney(customer.balance)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={customer.status} /></dd></div>
          </dl>
        </section>
        <div className="grid gap-4">
          <CustomerSalesTable rows={demoSalesOrders.filter((order) => order.customer === customer.name)} />
          <CustomerInvoicesTable rows={demoInvoices.filter((invoice) => invoice.party === customer.name)} />
        </div>
      </div>
    </AppShell>
  );
}
