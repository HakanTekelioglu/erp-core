import { AlertTriangle, Banknote, FileWarning, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardRecentSalesTable, DashboardTopProductsTable } from "@/components/tables/erp-tables";
import { dashboardMetrics, demoProducts, demoSalesOrders } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export default function DashboardPage() {
  const topProducts = demoProducts.slice(0, 4).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    sales: Math.max(12, product.stock * 2)
  }));

  return (
    <AppShell>
      <PageHeader title="Dashboard" description="Isletmenin satis, gider, stok ve tahsilat durumunu tek ekranda izleyin." />
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aylik satis" value={formatMoney(dashboardMetrics.monthlySales)} helper="Haziran 2026" icon={TrendingUp} tone="green" />
        <StatCard label="Aylik gider" value={formatMoney(dashboardMetrics.monthlyExpense)} helper="Kayitli giderler" icon={Banknote} tone="orange" />
        <StatCard label="Tahmini kar" value={formatMoney(dashboardMetrics.estimatedProfit)} helper="Satis eksi gider" icon={TrendingUp} tone="blue" />
        <StatCard label="Kritik stok" value={String(dashboardMetrics.criticalStockCount)} helper="Minimum seviyenin altinda" icon={AlertTriangle} tone="amber" />
        <StatCard label="Musteri" value={String(dashboardMetrics.customerCount)} icon={Users} tone="slate" />
        <StatCard label="Urun" value={String(dashboardMetrics.productCount)} icon={Package} tone="slate" />
        <StatCard label="Bekleyen satis" value={String(dashboardMetrics.pendingSales)} icon={ShoppingCart} tone="amber" />
        <StatCard label="Odenmemis fatura" value={String(dashboardMetrics.unpaidInvoices)} icon={FileWarning} tone="orange" />
      </div>
      <div className="grid gap-4 px-4 pb-4">
        <DashboardCharts />
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardRecentSalesTable rows={demoSalesOrders} />
          <DashboardTopProductsTable rows={topProducts} />
        </div>
      </div>
    </AppShell>
  );
}
