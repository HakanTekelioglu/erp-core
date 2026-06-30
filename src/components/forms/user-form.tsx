"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createUserAction } from "@/app/users/actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { userSchema, type UserInput } from "@/lib/validations/user";

export function UserForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "SALES", isActive: true }
  });

  async function onSubmit(data: UserInput) {
    try {
      await createUserAction(data);
      toast.success("Kullanici kaydedildi");
      router.push("/users");
      router.refresh();
    } catch {
      toast.error("Kullanici kaydedilemedi. E-posta daha once kullanilmis olabilir.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="Ad soyad" {...register("name")} error={errors.name?.message} />
        <Input label="E-posta" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Sifre" type="password" {...register("password")} error={errors.password?.message} />
        <Select label="Rol" {...register("role")} error={errors.role?.message}>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Yonetici</option>
          <option value="SALES">Satis</option>
          <option value="WAREHOUSE">Depo</option>
          <option value="ACCOUNTING">Muhasebe</option>
        </Select>
        <Select label="Durum" {...register("isActive")}>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden />
          Kaydet
        </Button>
      </div>
    </form>
  );
}
