"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateSettingsAction } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

export function SettingsForm({ defaultValues }: { defaultValues: SettingsInput }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues
  });

  async function onSubmit(data: SettingsInput) {
    try {
      await updateSettingsAction(data);
      toast.success("Ayarlar kaydedildi");
      router.refresh();
    } catch {
      toast.error("Ayarlar kaydedilemedi. Alanlari kontrol edin.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-4xl gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="Sirket adi" {...register("companyName")} error={errors.companyName?.message} />
        <Input label="Telefon" {...register("phone")} error={errors.phone?.message} />
        <Input label="E-posta" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Vergi numarasi" {...register("taxNumber")} error={errors.taxNumber?.message} />
        <Select label="Varsayilan para birimi" {...register("defaultCurrency")} error={errors.defaultCurrency?.message}>
          <option value="TRY">TRY</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </Select>
        <Input label="Varsayilan KDV orani" type="number" step="0.01" {...register("defaultVatRate")} error={errors.defaultVatRate?.message} />
        <Input label="Fatura prefix" {...register("invoicePrefix")} error={errors.invoicePrefix?.message} />
        <Input label="Sonraki fatura sira no" type="number" min={1} {...register("nextInvoiceCounter")} error={errors.nextInvoiceCounter?.message} />
      </div>
      <Textarea label="Adres" {...register("address")} error={errors.address?.message} />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden />
          {isSubmitting ? "Kaydediliyor" : "Ayarlari kaydet"}
        </Button>
      </div>
    </form>
  );
}
