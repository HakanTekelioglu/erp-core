"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createSupplierAction } from "@/app/suppliers/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { supplierSchema, type SupplierInput } from "@/lib/validations/supplier";

export function SupplierForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { isActive: true }
  });

  async function onSubmit(data: SupplierInput) {
    try {
      await createSupplierAction(data);
      toast.success("Tedarikci kaydedildi");
      router.push("/suppliers");
      router.refresh();
    } catch {
      toast.error("Tedarikci kaydedilemedi. Alanlari kontrol edin.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="Firma adi" {...register("companyName")} error={errors.companyName?.message} />
        <Input label="Yetkili kisi" {...register("contactPerson")} error={errors.contactPerson?.message} />
        <Input label="Telefon" {...register("phone")} error={errors.phone?.message} />
        <Input label="E-posta" {...register("email")} error={errors.email?.message} />
        <Input label="Vergi numarasi" {...register("taxNumber")} error={errors.taxNumber?.message} />
        <Select label="Durum" {...register("isActive")}>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </Select>
      </div>
      <Textarea label="Adres" {...register("address")} error={errors.address?.message} />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden />
          Kaydet
        </Button>
      </div>
    </form>
  );
}
