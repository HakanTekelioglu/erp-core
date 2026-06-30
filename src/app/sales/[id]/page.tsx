import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoSalesOrders } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = demoSalesOrders.find((item) => item.id === id);
  if (!sale) notFound();

  return (
    <AppShell>
      <PageHeader title={sale.orderNumber} description="Satis siparisi detaylari, durum akisi ve fatura olusturma islemleri." />
      <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Musteri</dt><dd className="font-semibold">{sale.customer}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tarih</dt><dd className="font-semibold">{sale.date}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Toplam</dt><dd className="font-semibold">{formatMoney(sale.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={sale.status} /></dd></div>
          </dl>
          <div className="mt-5 grid gap-2">
            <Button type="button">Onayla ve stogu dus</Button>
            <Button type="button" variant="secondary">Fatura olustur</Button>
            <Button type="button" variant="danger">Iptal et</Button>
          </div>
        </section>
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Is kurali notlari</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Satis onayinda stok yeterliligi kontrol edilir. Stok yetersizse onay engellenir. Onaylanmis satis iptal edilirse stok iadesi otomatik stok hareketiyle kaydedilir.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
