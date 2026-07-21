"use client";

import { activateUserAction, deactivateUserAction } from "@/app/users/actions";
import { ActiveToggleRowButton } from "@/components/tables/active-toggle-row-button";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

type Row = Record<string, unknown>;

export function UsersTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", header: "Ad soyad" },
        { key: "email", header: "E-posta" },
        { key: "role", header: "Rol" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> },
        {
          key: "actions",
          header: "Islem",
          render: (row) => (
            <ActiveToggleRowButton
              id={String(row.id)}
              isActive={String(row.status) === "Aktif"}
              entityName="Kullanici"
              activateAction={activateUserAction}
              deactivateAction={deactivateUserAction}
            />
          )
        }
      ]}
      searchPlaceholder="Kullanici ara"
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
        { key: "value", header: "Ozet" },
        { key: "updatedAt", header: "Guncelleme" },
        { key: "status", header: "Durum", render: (row) => <StatusBadge status={String(row.status)} /> }
      ]}
      searchPlaceholder="Rapor ara"
    />
  );
}
