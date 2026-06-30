"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCustomerAction } from "@/app/customers/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";

export function CustomerForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { type: "CORPORATE", isActive: true }
  });

  async function onSubmit(data: CustomerInput) {
    try {
      await createCustomerAction(data);
      toast.success("Musteri kaydedildi");
      router.push("/customers");
    } catch {
      toast.error("Musteri kaydedilemedi. Alanlari kontrol edin.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <Select label="Musteri tipi" {...register("type")} error={errors.type?.message}>
          <option value="INDIVIDUAL">Bireysel</option>
          <option value="CORPORATE">Kurumsal</option>
        </Select>
        <Input label="Ad soyad / Sirket adi" {...register("name")} error={errors.name?.message} />
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
