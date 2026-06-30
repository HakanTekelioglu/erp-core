import { AlertTriangle, Banknote, FileWarning, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardRecentSalesTable, DashboardTopProductsTable } from "@/components/tables/erp-tables";
import { formatMoney } from "@/lib/utils";
import { getDashboardReport } from "@/services/report-service";

export default async function DashboardPage() {
  const report = await getDashboardReport();

  return (
    <AppShell>
      <PageHeader title="Dashboard" description="Isletmenin satis, gider, stok ve tahsilat durumunu tek ekranda izleyin." />
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aylik satis" value={formatMoney(report.monthlySales)} helper={report.monthLabel} icon={TrendingUp} tone="green" />
        <StatCard label="Aylik gider" value={formatMoney(report.monthlyExpense)} helper="Kayitli giderler" icon={Banknote} tone="orange" />
        <StatCard label="Tahmini kar" value={formatMoney(report.estimatedProfit)} helper="Satis eksi gider" icon={TrendingUp} tone="blue" />
        <StatCard label="Kritik stok" value={String(report.criticalStockCount)} helper="Minimum seviyenin altinda" icon={AlertTriangle} tone="amber" />
        <StatCard label="Musteri" value={String(report.customerCount)} icon={Users} tone="slate" />
        <StatCard label="Urun" value={String(report.productCount)} icon={Package} tone="slate" />
        <StatCard label="Bekleyen satis" value={String(report.pendingSales)} icon={ShoppingCart} tone="amber" />
        <StatCard label="Odenmemis fatura" value={String(report.unpaidInvoices)} icon={FileWarning} tone="orange" />
      </div>
      <div className="grid gap-4 px-4 pb-4">
        <DashboardCharts data={report.chartData} />
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardRecentSalesTable rows={report.recentSales} />
          <DashboardTopProductsTable rows={report.topProducts} />
        </div>
      </div>
    </AppShell>
  );
}
