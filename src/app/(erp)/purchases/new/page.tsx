import { PurchaseOrderForm } from "@/components/forms/purchase-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { listProductOptions } from "@/services/product-service";
import { listSupplierOptions } from "@/services/supplier-service";

export default async function NewPurchasePage() {
  const [suppliers, products] = await Promise.all([listSupplierOptions(), listProductOptions()]);
  const supplierOptions = suppliers
    .map((supplier) => ({ id: supplier.id, companyName: supplier.companyName }));
  const productOptions = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      purchasePrice: Number(product.purchasePrice),
      vatRate: Number(product.vatRate),
      unit: product.unit,
      stockQuantity: Number(product.stockQuantity)
    }));

  return (
    <>
      <PageHeader title="Yeni Satin Alma" description="Tedarikci ve urun kalemleriyle satin alma siparisi olusturun; teslim alindiginda stok girisi otomatik islenir." />
      <div className="p-4">
        <PurchaseOrderForm suppliers={supplierOptions} products={productOptions} />
      </div>
    </>
  );
}
