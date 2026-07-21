"use client";

import Link from "next/link";
import { activateCategoryAction, deactivateCategoryAction, deleteCategoryAction } from "@/app/categories/actions";
import { activateProductAction, deactivateProductAction, deleteProductAction } from "@/app/products/actions";
import { ActiveToggleRowButton } from "@/components/tables/active-toggle-row-button";
import { DeleteRowButton } from "@/components/tables/delete-row-button";
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
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        {
          key: "actions",
          header: "Islem",
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              <ActiveToggleRowButton
                id={String(row.id)}
                isActive={String(row.status) === "Aktif"}
                entityName="Urun"
                activateAction={activateProductAction}
                deactivateAction={deactivateProductAction}
              />
              <DeleteRowButton
                id={String(row.id)}
                disabled={Number(row.usageCount) > 0}
                confirmMessage="Bu urunu kalici olarak silmek istiyor musunuz? Bu islem geri alinamaz."
                successMessage="Urun silindi"
                errorMessage="Urun silinemedi. Stok hareketi, satis veya satin alma kaydinda kullaniliyor olabilir."
                action={deleteProductAction}
              />
            </div>
          )
        }
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
        { key: "isActive", header: "Durum", render: (row) => <StatusBadge status={String(row.isActive)} /> },
        {
          key: "actions",
          header: "Islem",
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              <ActiveToggleRowButton
                id={String(row.id)}
                isActive={String(row.isActive) === "Aktif"}
                entityName="Kategori"
                activateAction={activateCategoryAction}
                deactivateAction={deactivateCategoryAction}
              />
              <DeleteRowButton
                id={String(row.id)}
                disabled={Number(row.productCount) > 0}
                confirmMessage="Bu kategoriyi kalici olarak silmek istiyor musunuz? Bu islem geri alinamaz."
                successMessage="Kategori silindi"
                errorMessage="Kategori silinemedi. Bu kategoriye bagli urun olabilir."
                action={deleteCategoryAction}
              />
            </div>
          )
        }
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
