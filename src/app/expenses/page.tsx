import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ExpensesTable } from "@/components/tables/erp-tables";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { demoExpenses } from "@/lib/demo-data";

export default function ExpensesPage() {
  return (
    <AppShell>
      <PageHeader title="Gider Yonetimi" description="Operasyon, lojistik ve diger isletme giderlerini takip edin." />
      <div className="grid gap-4 p-4 xl:grid-cols-[380px_1fr]">
        <form className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
          <Input label="Gider basligi" name="title" />
          <Input label="Kategori" name="category" />
          <Input label="Tutar" type="number" step="0.01" name="amount" />
          <Select label="Odeme yontemi" name="method">
            <option value="CASH">Nakit</option>
            <option value="BANK_TRANSFER">Banka transferi</option>
            <option value="CREDIT_CARD">Kredi karti</option>
          </Select>
          <Button type="button"><Plus className="size-4" aria-hidden />Gider ekle</Button>
        </form>
        <ExpensesTable rows={demoExpenses} />
      </div>
    </AppShell>
  );
}
