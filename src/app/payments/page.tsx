import { CreditCard } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PaymentsTable } from "@/components/tables/erp-tables";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { demoInvoices, demoPayments } from "@/lib/demo-data";

export default function PaymentsPage() {
  return (
    <AppShell>
      <PageHeader title="Odeme Yonetimi" description="Faturalara tam veya parcali odeme kaydi girin; fatura durumu odemelere gore guncellenir." />
      <div className="grid gap-4 p-4 xl:grid-cols-[380px_1fr]">
        <form className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
          <Select label="Fatura" name="invoiceId">
            {demoInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} - {invoice.party}</option>)}
          </Select>
          <Input label="Tutar" type="number" step="0.01" name="amount" />
          <Select label="Odeme yontemi" name="method">
            <option value="CASH">Nakit</option>
            <option value="BANK_TRANSFER">Banka transferi</option>
            <option value="CREDIT_CARD">Kredi karti</option>
          </Select>
          <Button type="button"><CreditCard className="size-4" aria-hidden />Odeme kaydet</Button>
        </form>
        <PaymentsTable rows={demoPayments} />
      </div>
    </AppShell>
  );
}
