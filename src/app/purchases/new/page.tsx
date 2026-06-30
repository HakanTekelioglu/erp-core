import { Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { demoProducts, demoSuppliers } from "@/lib/demo-data";

export default function NewPurchasePage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Satin Alma" description="Tedarikci ve urun kalemleriyle satin alma siparisi olusturun." />
      <div className="p-4">
        <form className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <Select label="Tedarikci" name="supplierId">
              {demoSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.companyName}</option>)}
            </Select>
            <Select label="Durum" name="status">
              <option value="DRAFT">Taslak</option>
              <option value="ORDERED">Siparis verildi</option>
            </Select>
            <Select label="Urun" name="productId">
              {demoProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </Select>
            <Input label="Miktar" type="number" defaultValue={1} />
            <Input label="Birim fiyat" type="number" defaultValue={0} />
            <Input label="KDV orani" type="number" defaultValue={20} />
          </div>
          <div className="flex justify-end">
            <Button type="button"><Save className="size-4" aria-hidden />Kaydet</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
