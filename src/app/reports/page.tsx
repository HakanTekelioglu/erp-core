import { AlertTriangle, Banknote, BarChart3, FileWarning, Package, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ReportsTable } from "@/components/tables/erp-tables";
import { demoInvoices, demoProducts, dashboardMetrics } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export default function ReportsPage() {
  const reports = [
    { id: "r1", name: "Aylik satis raporu", owner: "Satis", status: "Hazir" },
    { id: "r2", name: "Urun bazli satis raporu", owner: "Satis", status: "Hazir" },
    { id: "r3", name: "Kritik stok raporu", owner: "Depo", status: "Hazir" },
    { id: "r4", name: "Gelir gider raporu", owner: "Muhasebe", status: "Hazir" },
    { id: "r5", name: "Odenmemis faturalar raporu", owner: "Muhasebe", status: "Hazir" }
  ];

  return (
    <AppShell>
      <PageHeader title="Raporlama" description="Kucuk-orta olcekli isletme icin temel operasyon ve finans raporlari." />
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aylik satis" value={formatMoney(dashboardMetrics.monthlySales)} icon={BarChart3} tone="green" />
        <StatCard label="Gider" value={formatMoney(dashboardMetrics.monthlyExpense)} icon={Banknote} tone="orange" />
        <StatCard label="Kritik stok" value={String(demoProducts.filter((item) => item.status === "Kritik").length)} icon={AlertTriangle} tone="amber" />
        <StatCard label="Odenmemis fatura" value={String(demoInvoices.filter((item) => item.status !== "PAID").length)} icon={FileWarning} tone="orange" />
      </div>
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-2">
        <ReportsTable rows={reports} />
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Musteri sayisi" value={String(dashboardMetrics.customerCount)} icon={Users} tone="slate" />
          <StatCard label="Urun sayisi" value={String(dashboardMetrics.productCount)} icon={Package} tone="slate" />
        </div>
      </div>
    </AppShell>
  );
}
