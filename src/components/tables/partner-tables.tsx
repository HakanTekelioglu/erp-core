"use client";

import Link from "next/link";
import { activateCustomerAction, deactivateCustomerAction, deleteCustomerAction } from "@/app/customers/actions";
import { activateSupplierAction, deactivateSupplierAction, deleteSupplierAction } from "@/app/suppliers/actions";
import { ActiveToggleRowButton } from "@/components/tables/active-toggle-row-button";
import { DeleteRowButton } from "@/components/tables/delete-row-button";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

type Row = Record<string, unknown>;

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
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        {
          key: "actions",
          header: "Islem",
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              <ActiveToggleRowButton
                id={String(row.id)}
                isActive={String(row.status) === "Aktif"}
                entityName="Musteri"
                activateAction={activateCustomerAction}
                deactivateAction={deactivateCustomerAction}
              />
              <DeleteRowButton
                id={String(row.id)}
                disabled={Number(row.usageCount) > 0}
                confirmMessage="Bu musteriyi kalici olarak silmek istiyor musunuz? Bu islem geri alinamaz."
                successMessage="Musteri silindi"
                errorMessage="Musteri silinemedi. Satis veya fatura kaydinda kullaniliyor olabilir."
                action={deleteCustomerAction}
              />
            </div>
          )
        }
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
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        {
          key: "actions",
          header: "Islem",
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              <ActiveToggleRowButton
                id={String(row.id)}
                isActive={String(row.status) === "Aktif"}
                entityName="Tedarikci"
                activateAction={activateSupplierAction}
                deactivateAction={deactivateSupplierAction}
              />
              <DeleteRowButton
                id={String(row.id)}
                disabled={Number(row.usageCount) > 0}
                confirmMessage="Bu tedarikciyi kalici olarak silmek istiyor musunuz? Bu islem geri alinamaz."
                successMessage="Tedarikci silindi"
                errorMessage="Tedarikci silinemedi. Satin alma veya fatura kaydinda kullaniliyor olabilir."
                action={deleteSupplierAction}
              />
            </div>
          )
        }
      ]}
      searchPlaceholder="Tedarikci ara"
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
        { key: "paid", header: "Odenen", render: (row) => (typeof row.paid === "number" ? formatMoney(row.paid) : String(row.paid)) }
      ]}
    />
  );
}
