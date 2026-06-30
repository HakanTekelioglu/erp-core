import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPurchaseOrders } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = demoPurchaseOrders.find((item) => item.id === id);
  if (!purchase) notFound();

  return (
    <AppShell>
      <PageHeader title={purchase.orderNumber} description="Satin alma siparisi detaylari ve teslim alma sureci." />
      <div className="p-4">
        <section className="max-w-xl rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tedarikci</dt><dd className="font-semibold">{purchase.supplier}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tarih</dt><dd className="font-semibold">{purchase.date}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Toplam</dt><dd className="font-semibold">{formatMoney(purchase.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={purchase.status} /></dd></div>
          </dl>
          <Button type="button" className="mt-5">Teslim al ve stogu artir</Button>
        </section>
      </div>
    </AppShell>
  );
}
