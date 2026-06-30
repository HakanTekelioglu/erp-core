import { AppShell } from "@/components/layout/app-shell";
import { SalesOrderForm } from "@/components/forms/sales-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { listCustomers } from "@/services/customer-service";
import { listProducts } from "@/services/product-service";

export default async function NewSalePage() {
  const [customers, products] = await Promise.all([listCustomers(), listProducts()]);
  const customerOptions = customers
    .filter((customer) => customer.isActive)
    .map((customer) => ({ id: customer.id, name: customer.name }));
  const productOptions = products
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      salePrice: Number(product.salePrice),
      vatRate: Number(product.vatRate),
      unit: product.unit,
      stockQuantity: Number(product.stockQuantity)
    }));

  return (
    <AppShell>
      <PageHeader title="Yeni Satis Siparisi" description="Musteri ve urun kalemleriyle satis siparisi olusturun; onayda stok kontrolu servis katmaninda yapilir." />
      <div className="p-4">
        <SalesOrderForm customers={customerOptions} products={productOptions} />
      </div>
    </AppShell>
  );
}
