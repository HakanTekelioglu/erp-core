import { Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewSupplierPage() {
  return (
    <AppShell>
      <PageHeader title="Yeni Tedarikci" description="Tedarikci karti icin temel iletisim ve vergi bilgilerini girin." />
      <div className="p-4">
        <form className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Firma adi" name="companyName" />
            <Input label="Yetkili kisi" name="contactPerson" />
            <Input label="Telefon" name="phone" />
            <Input label="E-posta" name="email" />
            <Input label="Vergi numarasi" name="taxNumber" />
          </div>
          <Textarea label="Adres" name="address" />
          <div className="flex justify-end">
            <Button type="button">
              <Save className="size-4" aria-hidden />
              Kaydet
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
