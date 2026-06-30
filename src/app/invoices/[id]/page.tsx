import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { InvoicePdfButton } from "@/components/invoices/invoice-pdf-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { MoneyTable } from "@/components/tables/erp-tables";
import { getInvoice } from "@/services/invoice-service";

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("tr-TR").format(date);
}

function formatInvoiceType(type: string) {
  return type === "SALES" ? "Satis" : "Satin Alma";
}

function formatPaymentMethod(method: string) {
  if (method === "CASH") return "Nakit";
  if (method === "BANK_TRANSFER") return "Banka transferi";
  return "Kredi karti";
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const party = invoice.customer?.name ?? invoice.supplier?.companyName ?? "-";
  const payments = invoice.payments.map((payment) => ({
    id: payment.id,
    date: formatDate(payment.paidAt),
    method: formatPaymentMethod(payment.method),
    amount: Number(payment.amount)
  }));

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
            <div className="flex justify-between"><dt className="text-muted">Tip</dt><dd className="font-semibold">{formatInvoiceType(invoice.type)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Cari</dt><dd className="font-semibold">{party}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Fatura tarihi</dt><dd className="font-semibold">{formatDate(invoice.invoiceDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Vade</dt><dd className="font-semibold">{formatDate(invoice.dueDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Ara toplam</dt><dd className="font-semibold">{formatMoney(Number(invoice.subtotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Indirim</dt><dd className="font-semibold">{formatMoney(Number(invoice.discount))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">KDV</dt><dd className="font-semibold">{formatMoney(Number(invoice.vatTotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Toplam</dt><dd className="font-semibold">{formatMoney(Number(invoice.grandTotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Odenen</dt><dd className="font-semibold">{formatMoney(Number(invoice.paidTotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={invoice.status} /></dd></div>
          </dl>
          <InvoicePdfButton />
        </section>
        <MoneyTable rows={payments} searchPlaceholder="Odeme ara" />
      </div>
    </AppShell>
  );
}
