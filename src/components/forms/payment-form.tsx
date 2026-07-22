"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPaymentAction } from "@/app/payments/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { paymentSchema, type PaymentActionInput } from "@/lib/validations/payment";
import { formatMoney } from "@/lib/utils";

type PaymentFormInvoice = {
  id: string;
  invoiceNumber: string;
  party: string;
  remaining: number;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentForm({ invoices }: { invoices: PaymentFormInvoice[] }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PaymentActionInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: invoices[0]?.id ?? "",
      method: "BANK_TRANSFER",
      paidAt: todayInputValue(),
      note: ""
    }
  });

  async function onSubmit(data: PaymentActionInput) {
    try {
      await createPaymentAction(data);
      toast.success("Odeme kaydedildi");
      reset({
        invoiceId: invoices[0]?.id ?? "",
        method: "BANK_TRANSFER",
        paidAt: todayInputValue(),
        note: ""
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Odeme kaydedilemedi. Alanlari kontrol edin.";
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <Select className="min-w-0 w-full" label="Fatura" {...register("invoiceId")} error={errors.invoiceId?.message} disabled={invoices.length === 0}>
        {invoices.length === 0 ? <option value="">Odenecek fatura yok</option> : null}
        {invoices.map((invoice) => (
          <option key={invoice.id} value={invoice.id}>
            {invoice.invoiceNumber} - {invoice.party} - Kalan {formatMoney(invoice.remaining)}
          </option>
        ))}
      </Select>
      <Input className="min-w-0 w-full" label="Tutar" type="number" step="0.01" min="0.01" {...register("amount")} error={errors.amount?.message} disabled={invoices.length === 0} />
      <Input className="min-w-0 w-full" label="Odeme tarihi" type="date" {...register("paidAt")} error={errors.paidAt?.message} disabled={invoices.length === 0} />
      <Select className="min-w-0 w-full" label="Odeme yontemi" {...register("method")} error={errors.method?.message} disabled={invoices.length === 0}>
        <option value="CASH">Nakit</option>
        <option value="BANK_TRANSFER">Banka transferi</option>
        <option value="CREDIT_CARD">Kredi karti</option>
      </Select>
      <Textarea className="min-w-0 w-full" label="Not" {...register("note")} error={errors.note?.message} disabled={invoices.length === 0} />
      <Button type="submit" disabled={isSubmitting || invoices.length === 0}>
        <CreditCard className="size-4" aria-hidden />
        Odeme kaydet
      </Button>
    </form>
  );
}
