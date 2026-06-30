"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

type Row = Record<string, unknown>;

export function ProductsTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "code", header: "Kod", render: (row) => <Link className="font-semibold text-brand" href={`/products/${row.id}`}>{String(row.code)}</Link> },
        { key: "name", header: "Urun" },
        { key: "category", header: "Kategori" },
        { key: "stock", header: "Stok", render: (row) => `${row.stock} ${row.unit}` },
        { key: "salePrice", header: "Satis", render: (row) => formatMoney(Number(row.salePrice)) },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> }
      ]}
      searchPlaceholder="Urun kodu, ad veya kategori ara"
    />
  );
}

export function CategoriesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", header: "Kategori" },
        { key: "description", header: "Aciklama" },
        { key: "productCount", header: "Urun sayisi" },
        { key: "isActive", header: "Durum", render: (row) => <StatusBadge status={String(row.isActive)} /> }
      ]}
      searchPlaceholder="Kategori ara"
    />
  );
}

export function StockTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "code", header: "Kod" },
        { key: "name", header: "Urun" },
        { key: "category", header: "Kategori" },
        { key: "stock", header: "Mevcut stok", render: (row) => `${row.stock} ${row.unit}` },
        { key: "minStock", header: "Min. stok" },
        { key: "status", header: "Uyari", render: (row) => <StatusBadge status={String(row.status)} /> }
      ]}
      searchPlaceholder="Stokta urun ara"
    />
  );
}

export function CustomersTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", header: "Musteri", render: (row) => <Link className="font-semibold text-brand" href={`/customers/${row.id}`}>{String(row.name)}</Link> },
        { key: "type", header: "Tip" },
        { key: "phone", header: "Telefon" },
        { key: "email", header: "E-posta" },
        { key: "balance", header: "Bakiye", render: (row) => formatMoney(Number(row.balance)) },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> }
      ]}
      searchPlaceholder="Musteri ara"
    />
  );
}

export function SuppliersTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "companyName", header: "Firma" },
        { key: "contactPerson", header: "Yetkili" },
        { key: "phone", header: "Telefon" },
        { key: "email", header: "E-posta" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> }
      ]}
      searchPlaceholder="Tedarikci ara"
    />
  );
}

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
        { key: "paid", header: "Odenen", render: (row) => formatMoney(Number(row.paid)) }
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

export function UsersTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", header: "Ad soyad" },
        { key: "email", header: "E-posta" },
        { key: "role", header: "Rol" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> }
      ]}
      searchPlaceholder="Kullanici ara"
    />
  );
}

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
        { key: "stock", header: "Stok", render: (row) => <span className="inline-flex items-center gap-2"><Boxes className="size-4 text-muted" />{String(row.sales)}</span> }
      ]}
      searchPlaceholder="Cok satanlarda ara"
      pageSize={5}
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

export function CustomerSalesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "orderNumber", header: "Siparis" },
        { key: "date", header: "Tarih" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        { key: "total", header: "Tutar", render: (row) => formatMoney(Number(row.total)) }
      ]}
    />
  );
}

export function CustomerInvoicesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "invoiceNumber", header: "Fatura" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        { key: "total", header: "Tutar", render: (row) => formatMoney(Number(row.total)) },
        { key: "paid", header: "Odenen", render: (row) => formatMoney(Number(row.paid)) }
      ]}
    />
  );
}

export function ReportsTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", header: "Rapor" },
        { key: "owner", header: "Modul" },
        { key: "status", header: "Durum", render: () => <StatusBadge status="Aktif" /> }
      ]}
      searchPlaceholder="Rapor ara"
    />
  );
}
