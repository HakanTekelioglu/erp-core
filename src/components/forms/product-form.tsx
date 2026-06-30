"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { demoCategories } from "@/lib/demo-data";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      vatRate: 20,
      unit: "ADET",
      minimumStockLevel: 0,
      isActive: true
    }
  });

  function onSubmit(data: ProductInput) {
    console.log("product form", data);
    toast.success("Urun kaydi demo olarak dogrulandi");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="Urun kodu" {...register("code")} error={errors.code?.message} />
        <Input label="Barkod" {...register("barcode")} error={errors.barcode?.message} />
        <Input label="Urun adi" {...register("name")} error={errors.name?.message} />
        <Select label="Kategori" {...register("categoryId")} error={errors.categoryId?.message}>
          <option value="">Kategori secin</option>
          {demoCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Input label="Alis fiyati" type="number" step="0.01" {...register("purchasePrice")} error={errors.purchasePrice?.message} />
        <Input label="Satis fiyati" type="number" step="0.01" {...register("salePrice")} error={errors.salePrice?.message} />
        <Input label="KDV orani" type="number" step="0.01" {...register("vatRate")} error={errors.vatRate?.message} />
        <Select label="Birim" {...register("unit")} error={errors.unit?.message}>
          <option value="ADET">Adet</option>
          <option value="KG">Kg</option>
          <option value="LITRE">Litre</option>
          <option value="PAKET">Paket</option>
        </Select>
        <Input label="Minimum stok seviyesi" type="number" step="0.01" {...register("minimumStockLevel")} error={errors.minimumStockLevel?.message} />
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
