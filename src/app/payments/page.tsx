import { AppShell } from "@/components/layout/app-shell";
import { PaymentForm } from "@/components/forms/payment-form";
import { PaymentsTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listInvoices } from "@/services/invoice-service";
import { listPayments } from "@/services/payment-service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

function formatPaymentMethod(method: string) {
  if (method === "CASH") return "Nakit";
  if (method === "CREDIT_CARD") return "Kredi karti";
  return "Banka transferi";
}

export default async function PaymentsPage() {
  const [invoices, payments] = await Promise.all([listInvoices(), listPayments()]);
  const payableInvoices = invoices
    .filter((invoice) => invoice.status !== "PAID" && invoice.status !== "CANCELLED")
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      party: invoice.customer?.name ?? invoice.supplier?.companyName ?? "-",
      remaining: Number(invoice.grandTotal.sub(invoice.paidTotal))
    }))
    .filter((invoice) => invoice.remaining > 0);
  const paymentRows = payments.map((payment) => ({
    id: payment.id,
    invoiceNumber: payment.invoice.invoiceNumber,
    party: payment.invoice.customer?.name ?? payment.invoice.supplier?.companyName ?? "-",
    date: formatDate(payment.paidAt),
    method: formatPaymentMethod(payment.method),
    amount: Number(payment.amount)
  }));

  return (
    <AppShell>
      <PageHeader title="Odeme Yonetimi" description="Faturalara tam veya parcali odeme kaydi girin; fatura durumu odemelere gore guncellenir." />
      <div className="grid gap-4 p-4 xl:grid-cols-[380px_1fr]">
        <PaymentForm invoices={payableInvoices} />
        <PaymentsTable rows={paymentRows} />
      </div>
    </AppShell>
  );
}
