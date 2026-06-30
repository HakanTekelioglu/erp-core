import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerInvoicesTable, CustomerSalesTable } from "@/components/tables/erp-tables";
import { PageHeader } from "@/components/ui/page-header";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCustomer } from "@/services/customer-service";

function formatCustomerType(type: string) {
  return type === "CORPORATE" ? "Kurumsal" : "Bireysel";
}

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("tr-TR").format(date);
}

function formatInvoiceStatus(type: string, status: string) {
  if (type === "SALES") return status === "CANCELLED" ? "Iptal" : "Satis faturasi";
  if (status === "PAID") return "Odendi";
  if (status === "PARTIALLY_PAID") return "Kismi odendi";
  if (status === "UNPAID") return "Odenmedi";
  if (status === "CANCELLED") return "Iptal";
  return status;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const salesRows = customer.salesOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    date: formatDate(order.createdAt),
    status: order.status,
    total: Number(order.grandTotal)
  }));

  const invoiceRows = customer.invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: formatInvoiceStatus(invoice.type, invoice.status),
    total: Number(invoice.grandTotal),
    paid: invoice.type === "SALES" ? "-" : Number(invoice.paidTotal)
  }));

  return (
    <AppShell>
      <PageHeader title={customer.name} description="Musteri bakiyesi, satis gecmisi ve fatura durumu." />
      <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tip</dt><dd className="font-semibold">{formatCustomerType(customer.type)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Telefon</dt><dd className="font-semibold">{customer.phone ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">E-posta</dt><dd className="font-semibold">{customer.email ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Vergi no</dt><dd className="font-semibold">{customer.taxNumber ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Bakiye</dt><dd className="font-semibold">{formatMoney(Number(customer.balance))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={customer.isActive ? "Aktif" : "Pasif"} /></dd></div>
          </dl>
        </section>
        <div className="grid gap-4">
          <CustomerSalesTable rows={salesRows} />
          <CustomerInvoicesTable rows={invoiceRows} />
        </div>
      </div>
    </AppShell>
  );
}
