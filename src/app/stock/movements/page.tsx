import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { demoStockMovements } from "@/lib/demo-data";

export default function StockMovementsPage() {
  return (
    <AppShell>
      <PageHeader title="Stok Hareketleri" description="Satis, satin alma, iade ve manuel duzeltme hareketlerini izleyin." />
      <div className="p-4">
        <DataTable
          rows={demoStockMovements}
          columns={[
            { key: "date", header: "Tarih" },
            { key: "product", header: "Urun" },
            { key: "type", header: "Hareket turu" },
            { key: "quantity", header: "Miktar" },
            { key: "reference", header: "Referans" }
          ]}
          searchPlaceholder="Hareket ara"
        />
      </div>
    </AppShell>
  );
}
