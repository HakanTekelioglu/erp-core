import { AppShell } from "@/components/layout/app-shell";
import { InvoicesTable } from "@/components/tables/transaction-tables";
import { PageHeader } from "@/components/ui/page-header";
import { listInvoices } from "@/services/invoice-service";

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("tr-TR").format(date);
}

function formatInvoiceType(type: string) {
  return type === "SALES" ? "Satis" : "Satin Alma";
}

function formatInvoiceStatus(type: string, status: string) {
  if (type === "SALES") return status === "CANCELLED" ? "Iptal" : "Satis faturasi";
  if (status === "PAID") return "Odendi";
  if (status === "PARTIALLY_PAID") return "Kismi odendi";
  if (status === "UNPAID") return "Odenmedi";
  if (status === "CANCELLED") return "Iptal";
  return status;
}

export default async function InvoicesPage() {
  const invoices = await listInvoices();
  const rows = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    type: formatInvoiceType(invoice.type),
    party: invoice.customer?.name ?? invoice.supplier?.companyName ?? "-",
    dueDate: formatDate(invoice.dueDate),
    status: formatInvoiceStatus(invoice.type, invoice.status),
    total: Number(invoice.grandTotal),
    paid: invoice.type === "SALES" ? "-" : Number(invoice.paidTotal)
  }));

  return (
    <AppShell>
      <PageHeader title="Fatura Yonetimi" description="Satis ve satin alma faturalarini, vade ve odeme durumlarini takip edin." />
      <div className="p-4">
        <InvoicesTable rows={rows} />
      </div>
    </AppShell>
  );
}
