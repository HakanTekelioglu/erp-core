import { AppShell } from "@/components/layout/app-shell";
import { PurchaseOrderForm } from "@/components/forms/purchase-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { listProducts } from "@/services/product-service";
import { listSuppliers } from "@/services/supplier-service";

export default async function NewPurchasePage() {
  const [suppliers, products] = await Promise.all([listSuppliers(), listProducts()]);
  const supplierOptions = suppliers
    .filter((supplier) => supplier.isActive)
    .map((supplier) => ({ id: supplier.id, companyName: supplier.companyName }));
  const productOptions = products
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      purchasePrice: Number(product.purchasePrice),
      vatRate: Number(product.vatRate),
      unit: product.unit,
      stockQuantity: Number(product.stockQuantity)
    }));

  return (
    <AppShell>
      <PageHeader title="Yeni Satin Alma" description="Tedarikci ve urun kalemleriyle satin alma siparisi olusturun; teslim alindiginda stok girisi otomatik islenir." />
      <div className="p-4">
        <PurchaseOrderForm suppliers={supplierOptions} products={productOptions} />
      </div>
    </AppShell>
  );
}
