"use client";

import Link from "next/link";
import { deleteExpenseAction } from "@/app/(erp)/expenses/actions";
import { DataTable, type DataTableColumn } from "@/components/tables/data-table";
import { DeleteRowButton } from "@/components/tables/delete-row-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

import type { TablePagination } from "@/lib/pagination";

type Row = Record<string, unknown>;

export function SalesTable({ rows, pagination }: { rows: Row[]; pagination?: TablePagination }) {
  return (
    <DataTable
      rows={rows}
      pagination={pagination}
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

export function PurchasesTable({ rows, pagination }: { rows: Row[]; pagination?: TablePagination }) {
  return (
    <DataTable
      rows={rows}
      pagination={pagination}
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

export function InvoicesTable({ rows, pagination }: { rows: Row[]; pagination?: TablePagination }) {
  return (
    <DataTable
      rows={rows}
      pagination={pagination}
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

export function PaymentsTable({ rows, pagination }: { rows: Row[]; pagination?: TablePagination }) {
  return (
    <DataTable
      rows={rows}
      pagination={pagination}
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

export function ExpensesTable({ rows, pagination, canDelete = false }: { rows: Row[]; pagination?: TablePagination; canDelete?: boolean }) {
  const columns: DataTableColumn<Row>[] = [
    { key: "title", header: "Gider" },
    { key: "category", header: "Kategori" },
    { key: "date", header: "Tarih" },
    { key: "method", header: "Yontem" },
    { key: "amount", header: "Tutar", render: (row) => formatMoney(Number(row.amount)) }
  ];

  if (canDelete) {
    columns.push({
      key: "actions",
      header: "İşlem",
      render: (row) => row._source === "EXPENSE" ? (
        <DeleteRowButton
          id={String(row.id)}
          confirmMessage={`“${String(row.title)}” başlıklı ${formatMoney(Number(row.amount))} tutarındaki gideri kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz.`}
          successMessage="Gider silindi"
          errorMessage="Gider silinemedi. Yetkinizi kontrol edip listeyi yenileyerek tekrar deneyin."
          action={deleteExpenseAction}
        />
      ) : row._source === "PURCHASE_INVOICE" ? (
        <Link className="whitespace-nowrap text-sm font-medium text-brand hover:underline" href={`/invoices/${row.id}`}>
          Faturaya git
        </Link>
      ) : null
    });
  }

  return (
    <DataTable
      rows={rows}
      pagination={pagination}
      columns={columns}
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
