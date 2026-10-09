import { PaymentForm } from "@/components/forms/payment-form";
import { PaymentsTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listPayableInvoiceOptions } from "@/services/invoice-service";
import { getPaymentsPage } from "@/services/list-page-service";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const request = parsePagination(await searchParams);
  const [invoices, { rows: paymentRows, pagination }] = await Promise.all([listPayableInvoiceOptions(), getPaymentsPage(request)]);
  const payableInvoices = invoices.map(invoice => ({
    id: invoice.id, invoiceNumber: invoice.invoiceNumber, party: invoice.supplier?.companyName ?? "-",
    remaining: Number(invoice.grandTotal.sub(invoice.paidTotal))
  }));

  return (
    <>
      <PageHeader title="Odeme Yonetimi" description="Satin alma faturalarina tam veya parcali odeme kaydi girin; fatura durumu odemelere gore guncellenir." />
      <div className="grid gap-4 p-4 xl:grid-cols-[380px_minmax(0,1fr)] [&>*]:min-w-0">
        <PaymentForm invoices={payableInvoices} />
        <PaymentsTable rows={paymentRows} pagination={pagination} />
      </div>
    </>
  );
}
