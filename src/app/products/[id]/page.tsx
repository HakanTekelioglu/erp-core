import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatNumber } from "@/lib/utils";
import { DataTable } from "@/components/tables/data-table";
import { getProduct } from "@/services/product-service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR").format(date);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const rows = product.stockMovements.map((movement) => ({
    id: movement.id,
    date: formatDate(movement.movementAt),
    type: movement.type,
    quantity: formatNumber(Number(movement.quantity)),
    reference: movement.reference ?? "-"
  }));

  return (
    <AppShell>
      <PageHeader title={product.name} description={`${product.code} kodlu urun detaylari, fiyatlari ve stok gecmisi.`} />
      <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Kategori</dt><dd className="font-semibold">{product.category.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Alis</dt><dd className="font-semibold">{formatMoney(Number(product.purchasePrice))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Satis</dt><dd className="font-semibold">{formatMoney(Number(product.salePrice))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Stok</dt><dd className="font-semibold">{formatNumber(Number(product.stockQuantity))} {product.unit}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Minimum</dt><dd className="font-semibold">{formatNumber(Number(product.minimumStockLevel))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Durum</dt><dd><StatusBadge status={product.isActive ? "Aktif" : "Pasif"} /></dd></div>
          </dl>
        </section>
        <DataTable
          rows={rows}
          columns={[
            { key: "date", header: "Tarih" },
            { key: "type", header: "Tur" },
            { key: "quantity", header: "Miktar" },
            { key: "reference", header: "Referans" }
          ]}
          searchPlaceholder="Stok hareketi ara"
        />
      </div>
    </AppShell>
  );
}
