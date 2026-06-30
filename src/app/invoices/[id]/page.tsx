import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { InvoicePdfButton } from "@/components/invoices/invoice-pdf-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoInvoices, demoPayments } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";
import { MoneyTable } from "@/components/tables/erp-tables";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = demoInvoices.find((item) => item.id === id);
  if (!invoice) notFound();

  return (
    <AppShell>
      <PageHeader title={invoice.invoiceNumber} description="Fatura detaylari, odeme gecmisi ve PDF cikti alani." />
      <div className="print-area grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <div className="hidden print:block xl:col-span-2">
          <h1 className="text-2xl font-bold text-ink">{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-muted">Fatura cikti ozeti</p>
        </div>
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tip</dt><dd className="font-semibold">{invoice.type}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Cari</dt><dd className="font-semibold">{invoice.party}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Vade</dt><dd className="font-semibold">{invoice.dueDate}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Toplam</dt><dd className="font-semibold">{formatMoney(invoice.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Odenen</dt><dd className="font-semibold">{formatMoney(invoice.paid)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={invoice.status} /></dd></div>
          </dl>
          <InvoicePdfButton />
        </section>
        <MoneyTable rows={demoPayments.filter((payment) => payment.invoiceNumber === invoice.invoiceNumber)} searchPlaceholder="Odeme ara" />
      </div>
    </AppShell>
  );
}
