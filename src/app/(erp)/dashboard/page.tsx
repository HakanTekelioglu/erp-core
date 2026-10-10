import { AlertTriangle, Banknote, FileWarning, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { DashboardChartsLazy } from "@/components/charts/dashboard-charts-lazy";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardExpectedProfitTable, DashboardRecentSalesTable, DashboardTopProductsTable } from "@/components/tables/dashboard-tables";
import { formatMoney } from "@/lib/utils";
import { getCachedDashboardReport } from "@/services/report-cache";
import { parsePagination, type ListSearchParams } from "@/lib/pagination";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const report = await getCachedDashboardReport(parsePagination(await searchParams, "profit"));

  return (
    <>
      <PageHeader title="Dashboard" description="Isletmenin satis, gider, stok ve tahsilat durumunu tek ekranda izleyin." />
      <div className="dashboard-stat-grid grid gap-4 px-4 pt-4">
        <StatCard label="Aylik satis" value={formatMoney(report.monthlySales)} helper={report.monthLabel} icon={TrendingUp} tone="green" />
        <StatCard label="Aylik gider" value={formatMoney(report.monthlyExpense)} helper="Kayitli giderler" icon={Banknote} tone="orange" />
        <StatCard label="Tahmini kar" value={formatMoney(report.estimatedProfit)} helper="Satis eksi gider" icon={TrendingUp} tone="blue" />
        <StatCard label="Kritik stok" value={String(report.criticalStockCount)} helper="Minimum seviyenin altinda" icon={AlertTriangle} tone="amber" />
      </div>
      <div className="dashboard-stat-grid grid gap-4 px-4 pt-4">
        <StatCard variant="compact" label="Musteri" value={String(report.customerCount)} icon={Users} tone="slate" />
        <StatCard variant="compact" label="Urun" value={String(report.productCount)} icon={Package} tone="slate" />
        <StatCard variant="compact" label="Bekleyen satis" value={String(report.pendingSales)} icon={ShoppingCart} tone="amber" />
        <StatCard variant="compact" label="Odenmemis fatura" value={String(report.unpaidInvoices)} icon={FileWarning} tone="orange" />
      </div>
      <div className="grid gap-4 p-4">
        <DashboardChartsLazy data={report.chartData} />
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Beklenen tahmini kar</h2>
              <p className="mt-0.5 text-sm text-muted">Gerceklesen satis kari ile mevcut stok kar potansiyelinin toplami.</p>
            </div>
            <div className="inline-flex items-center gap-3 self-start rounded-lg border border-brand/20 bg-blue-50 px-3.5 py-2 sm:self-auto">
              <p className="text-xs font-medium text-muted">Toplam beklenti</p>
              <p className="text-lg font-semibold tabular-nums tracking-tight text-brand">{formatMoney(report.expectedProfitTotal)}</p>
            </div>
          </div>
          <DashboardExpectedProfitTable rows={report.expectedProfitRows} pagination={report.expectedProfitPagination} />
        </section>
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardRecentSalesTable rows={report.recentSales} />
          <DashboardTopProductsTable rows={report.topProducts} />
        </div>
      </div>
    </>
  );
}
