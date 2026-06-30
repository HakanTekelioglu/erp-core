import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/utils";
import { listStockMovements } from "@/services/stock-service";

const outboundTypes = ["SALE_OUT", "RETURN_OUT"];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

export default async function StockMovementsPage() {
  const movements = await listStockMovements();
  const rows = movements.map((movement) => ({
    id: movement.id,
    product: movement.product.name,
    type: movement.type,
    quantity: `${outboundTypes.includes(movement.type) ? "-" : "+"}${formatNumber(Number(movement.quantity))} ${movement.product.unit}`,
    reference: movement.reference ?? "-",
    note: movement.note ?? "-",
    date: formatDate(movement.movementAt)
  }));

  return (
    <AppShell>
      <PageHeader title="Stok Hareketleri" description="Satis, satin alma, iade ve manuel duzeltme hareketlerini izleyin." />
      <div className="p-4">
        <DataTable
          rows={rows}
          columns={[
            { key: "date", header: "Tarih" },
            { key: "product", header: "Urun" },
            { key: "type", header: "Hareket turu" },
            { key: "quantity", header: "Miktar" },
            { key: "reference", header: "Referans" },
            { key: "note", header: "Not" }
          ]}
          searchPlaceholder="Hareket ara"
        />
      </div>
    </AppShell>
  );
}
