import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PurchaseOrderActions } from "@/components/purchases/purchase-order-actions";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatNumber } from "@/lib/utils";
import { getPurchaseOrder } from "@/services/purchase-service";

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("tr-TR").format(date);
}

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await getPurchaseOrder(id);
  if (!purchase) notFound();

  return (
    <AppShell>
      <PageHeader title={purchase.orderNumber} description="Satin alma siparisi detaylari ve teslim alma sureci." />
      <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tedarikci</dt><dd className="font-semibold">{purchase.supplier.companyName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tarih</dt><dd className="font-semibold">{formatDate(purchase.createdAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Teslim tarihi</dt><dd className="font-semibold">{formatDate(purchase.receivedAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Ara toplam</dt><dd className="font-semibold">{formatMoney(Number(purchase.subtotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">KDV</dt><dd className="font-semibold">{formatMoney(Number(purchase.vatTotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Toplam</dt><dd className="font-semibold">{formatMoney(Number(purchase.grandTotal))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={purchase.status} /></dd></div>
            <div className="flex justify-between"><dt className="text-muted">Fatura</dt><dd className="font-semibold">{purchase.invoice?.invoiceNumber ?? "-"}</dd></div>
          </dl>
          <PurchaseOrderActions id={purchase.id} status={purchase.status} hasInvoice={Boolean(purchase.invoice)} stockReceived={purchase.stockReceived} />
        </section>
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Siparis kalemleri</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-normal text-muted">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-semibold">Urun</th>
                  <th className="border-b border-border px-4 py-3 font-semibold">Miktar</th>
                  <th className="border-b border-border px-4 py-3 font-semibold">Birim fiyat</th>
                  <th className="border-b border-border px-4 py-3 font-semibold">KDV</th>
                  <th className="border-b border-border px-4 py-3 font-semibold">Satir toplam</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{item.product.name}</td>
                    <td className="px-4 py-3 text-ink">{formatNumber(Number(item.quantity))} {item.product.unit}</td>
                    <td className="px-4 py-3 text-ink">{formatMoney(Number(item.unitPrice))}</td>
                    <td className="px-4 py-3 text-ink">%{formatNumber(Number(item.vatRate))}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{formatMoney(Number(item.lineTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
