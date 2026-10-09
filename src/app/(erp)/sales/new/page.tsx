import { SalesOrderForm } from "@/components/forms/sales-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { listCustomerOptions } from "@/services/customer-service";
import { listProductOptions } from "@/services/product-service";

export default async function NewSalePage() {
  const [customers, products] = await Promise.all([listCustomerOptions(), listProductOptions()]);
  const customerOptions = customers
    .map((customer) => ({ id: customer.id, name: customer.name }));
  const productOptions = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      salePrice: Number(product.salePrice),
      vatRate: Number(product.vatRate),
      unit: product.unit,
      stockQuantity: Number(product.stockQuantity)
    }));

  return (
    <>
      <PageHeader title="Yeni Satis Siparisi" description="Musteri ve urun kalemleriyle satis siparisi olusturun; onayda stok kontrolu servis katmaninda yapilir." />
      <div className="p-4">
        <SalesOrderForm customers={customerOptions} products={productOptions} />
      </div>
    </>
  );
}
