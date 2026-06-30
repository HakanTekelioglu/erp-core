import { Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Ayarlar" description="Sirket bilgileri, varsayilan para birimi, KDV ve fatura numarasi ayarlarini yonetin." />
      <div className="p-4">
        <form className="grid max-w-4xl gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Sirket adi" defaultValue="Kucuk Isletme ERP Sistemi" />
            <Input label="Telefon" defaultValue="+90 212 000 00 00" />
            <Input label="E-posta" defaultValue="info@minierp.local" />
            <Input label="Vergi numarasi" defaultValue="1234567890" />
            <Select label="Varsayilan para birimi" defaultValue="TRY">
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
            <Input label="Varsayilan KDV orani" type="number" defaultValue={20} />
            <Input label="Fatura prefix" defaultValue="ERP" />
          </div>
          <Textarea label="Adres" defaultValue="Istanbul" />
          <div className="flex justify-end">
            <Button type="button"><Save className="size-4" aria-hidden />Ayarlari kaydet</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
