import { AlertTriangle, Banknote, BarChart3, FileWarning, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ReportsTable } from "@/components/tables/erp-tables";
import { formatMoney } from "@/lib/utils";
import { getReportsOverview } from "@/services/report-service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

export default async function ReportsPage() {
  const report = await getReportsOverview();
  const lastUpdated = formatDate(new Date());
  const reports = [
    { id: "monthly-sales", name: "Aylik satis raporu", owner: "Satis", value: formatMoney(report.monthlySales), updatedAt: lastUpdated, status: "Aktif" },
    { id: "top-product", name: "Urun bazli satis raporu", owner: "Satis", value: report.topProduct ? `${report.topProduct.name} / ${formatMoney(report.topProduct.total)}` : "Kayit yok", updatedAt: lastUpdated, status: "Aktif" },
    { id: "critical-stock", name: "Kritik stok raporu", owner: "Depo", value: `${report.criticalStockCount} urun`, updatedAt: lastUpdated, status: "Aktif" },
    { id: "income-expense", name: "Gelir gider raporu", owner: "Muhasebe", value: formatMoney(report.estimatedProfit), updatedAt: lastUpdated, status: "Aktif" },
    { id: "unpaid-invoices", name: "Odenmemis faturalar raporu", owner: "Muhasebe", value: `${report.unpaidInvoiceCount} fatura / ${formatMoney(report.unpaidInvoiceTotal)}`, updatedAt: lastUpdated, status: "Aktif" }
  ];

  return (
    <AppShell>
      <PageHeader title="Raporlama" description="Kucuk-orta olcekli isletme icin temel operasyon ve finans raporlari." />
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aylik satis" value={formatMoney(report.monthlySales)} helper={report.monthLabel} icon={BarChart3} tone="green" />
        <StatCard label="Aylik gider" value={formatMoney(report.monthlyExpense)} helper="Kayitli giderler" icon={Banknote} tone="orange" />
        <StatCard label="Tahmini kar" value={formatMoney(report.estimatedProfit)} helper="Satis eksi gider" icon={TrendingUp} tone="blue" />
        <StatCard label="Kritik stok" value={String(report.criticalStockCount)} helper="Minimum seviyenin altinda" icon={AlertTriangle} tone="amber" />
        <StatCard label="Odenmemis fatura" value={String(report.unpaidInvoiceCount)} helper={formatMoney(report.unpaidInvoiceTotal)} icon={FileWarning} tone="orange" />
        <StatCard label="Bekleyen satis" value={String(report.pendingSales)} helper="Onay bekleyen siparis" icon={ShoppingCart} tone="amber" />
        <StatCard label="Musteri sayisi" value={String(report.customerCount)} icon={Users} tone="slate" />
        <StatCard label="Urun sayisi" value={String(report.productCount)} icon={Package} tone="slate" />
      </div>
      <div className="px-4 pb-4">
        <ReportsTable rows={reports} />
      </div>
    </AppShell>
  );
}
