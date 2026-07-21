"use client";

import { Boxes } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

type Row = Record<string, unknown>;

export function DashboardRecentSalesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "orderNumber", header: "Siparis" },
        { key: "customer", header: "Musteri" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        { key: "total", header: "Tutar", render: (row) => formatMoney(Number(row.total)) }
      ]}
      searchPlaceholder="Son satislarda ara"
      pageSize={5}
    />
  );
}

export function DashboardTopProductsTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", header: "Urun" },
        { key: "category", header: "Kategori" },
        { key: "sales", header: "Satis adedi" },
        { key: "stock", header: "Stok", render: (row) => <span className="inline-flex items-center gap-2"><Boxes className="size-4 text-muted" />{String(row.stock)}</span> }
      ]}
      searchPlaceholder="Cok satanlarda ara"
      pageSize={5}
    />
  );
}

export function DashboardExpectedProfitTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "code", header: "Kod" },
        { key: "name", header: "Urun" },
        { key: "stock", header: "Stok", render: (row) => `${row.stock} ${row.unit}` },
        { key: "purchasePrice", header: "Alis", render: (row) => formatMoney(Number(row.purchasePrice)) },
        { key: "salePrice", header: "Satis", render: (row) => formatMoney(Number(row.salePrice)) },
        { key: "stockProfit", header: "Stok kar potansiyeli", render: (row) => formatMoney(Number(row.stockProfit)) },
        { key: "realizedProfit", header: "Gerceklesen kar", render: (row) => formatMoney(Number(row.realizedProfit)) },
        { key: "totalProfit", header: "Toplam beklenti", render: (row) => <span className="font-semibold text-brand">{formatMoney(Number(row.totalProfit))}</span> }
      ]}
      searchPlaceholder="Beklenen karda urun ara"
      pageSize={8}
    />
  );
}
