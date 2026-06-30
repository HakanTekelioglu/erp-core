"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCategoryAction } from "@/app/categories/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export function CategoryForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true }
  });

  async function onSubmit(data: CategoryInput) {
    try {
      await createCategoryAction(data);
      toast.success("Kategori kaydedildi");
      router.push("/categories");
      router.refresh();
    } catch {
      toast.error("Kategori kaydedilemedi. Alanlari kontrol edin.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="Kategori adi" {...register("name")} error={errors.name?.message} />
        <Select label="Durum" {...register("isActive")}>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </Select>
      </div>
      <Textarea label="Aciklama" {...register("description")} error={errors.description?.message} />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden />
          Kaydet
        </Button>
      </div>
    </form>
  );
}
