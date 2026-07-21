"use client";

import Link from "next/link";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

type Row = Record<string, unknown>;

export function SalesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "orderNumber", header: "Siparis", render: (row) => <Link className="font-semibold text-brand" href={`/sales/${row.id}`}>{String(row.orderNumber)}</Link> },
        { key: "customer", header: "Musteri" },
        { key: "date", header: "Tarih" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        { key: "total", header: "Toplam", render: (row) => formatMoney(Number(row.total)) }
      ]}
      searchPlaceholder="Satis siparisi ara"
    />
  );
}

export function PurchasesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "orderNumber", header: "Siparis", render: (row) => <Link className="font-semibold text-brand" href={`/purchases/${row.id}`}>{String(row.orderNumber)}</Link> },
        { key: "supplier", header: "Tedarikci" },
        { key: "date", header: "Tarih" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        { key: "total", header: "Toplam", render: (row) => formatMoney(Number(row.total)) }
      ]}
      searchPlaceholder="Satin alma ara"
    />
  );
}

export function InvoicesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "invoiceNumber", header: "Fatura", render: (row) => <Link className="font-semibold text-brand" href={`/invoices/${row.id}`}>{String(row.invoiceNumber)}</Link> },
        { key: "type", header: "Tip" },
        { key: "party", header: "Cari" },
        { key: "dueDate", header: "Vade" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        { key: "total", header: "Toplam", render: (row) => formatMoney(Number(row.total)) },
        { key: "paid", header: "Odenen", render: (row) => (typeof row.paid === "number" ? formatMoney(row.paid) : String(row.paid)) }
      ]}
      searchPlaceholder="Fatura ara"
    />
  );
}

export function PaymentsTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "invoiceNumber", header: "Fatura" },
        { key: "party", header: "Cari" },
        { key: "date", header: "Tarih" },
        { key: "method", header: "Yontem" },
        { key: "amount", header: "Tutar", render: (row) => formatMoney(Number(row.amount)) }
      ]}
      searchPlaceholder="Odeme ara"
    />
  );
}

export function ExpensesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "title", header: "Gider" },
        { key: "category", header: "Kategori" },
        { key: "date", header: "Tarih" },
        { key: "method", header: "Yontem" },
        { key: "amount", header: "Tutar", render: (row) => formatMoney(Number(row.amount)) }
      ]}
      searchPlaceholder="Gider ara"
    />
  );
}

export function MoneyTable({ rows, searchPlaceholder = "Ara" }: { rows: Row[]; searchPlaceholder?: string }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "date", header: "Tarih" },
        { key: "method", header: "Yontem" },
        { key: "amount", header: "Tutar", render: (row) => formatMoney(Number(row.amount)) }
      ]}
      searchPlaceholder={searchPlaceholder}
    />
  );
}
