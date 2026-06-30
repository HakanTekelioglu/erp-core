"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { demoCustomers, demoProducts } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";
import { salesOrderSchema, type SalesOrderInput } from "@/lib/validations/sales";

export function SalesOrderForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SalesOrderInput>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customerId: "",
      status: "DRAFT",
      items: [{ productId: "", quantity: 1, unitPrice: 0, vatRate: 20, discount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const discount = items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const vatTotal = items.reduce((sum, item) => {
    const net = Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0);
    return sum + net * (Number(item.vatRate || 0) / 100);
  }, 0);
  const grandTotal = subtotal - discount + vatTotal;

  function onSubmit(data: SalesOrderInput) {
    console.log("sales order form", data);
    toast.success("Satis siparisi demo olarak dogrulandi");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <section className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm lg:grid-cols-2">
        <Select label="Musteri" {...register("customerId")} error={errors.customerId?.message}>
          <option value="">Musteri secin</option>
          {demoCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>
        <Select label="Durum" {...register("status")}>
          <option value="DRAFT">Taslak</option>
          <option value="PENDING">Beklemede</option>
          <option value="APPROVED">Onaylandi</option>
        </Select>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Siparis kalemleri</h2>
          <Button type="button" variant="secondary" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, vatRate: 20, discount: 0 })}>
            <Plus className="size-4" aria-hidden />
            Kalem ekle
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-md border border-border p-3 lg:grid-cols-[1.5fr_0.7fr_0.8fr_0.7fr_0.7fr_auto]">
              <Select label="Urun" {...register(`items.${index}.productId`)}>
                <option value="">Urun secin</option>
                {demoProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
              <Input label="Miktar" type="number" step="0.01" {...register(`items.${index}.quantity`)} />
              <Input label="Birim fiyat" type="number" step="0.01" {...register(`items.${index}.unitPrice`)} />
              <Input label="KDV" type="number" step="0.01" {...register(`items.${index}.vatRate`)} />
              <Input label="Indirim" type="number" step="0.01" {...register(`items.${index}.discount`)} />
              <div className="flex items-end">
                <Button type="button" variant="secondary" className="size-10 p-0" onClick={() => remove(index)} aria-label="Kalemi sil">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errors.items?.message ? <p className="mt-2 text-sm font-medium text-danger">{errors.items.message}</p> : null}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5 text-sm shadow-sm md:ml-auto md:w-96">
        <div className="flex justify-between"><span className="text-muted">Ara toplam</span><strong>{formatMoney(subtotal)}</strong></div>
        <div className="flex justify-between"><span className="text-muted">Indirim</span><strong>{formatMoney(discount)}</strong></div>
        <div className="flex justify-between"><span className="text-muted">KDV toplam</span><strong>{formatMoney(vatTotal)}</strong></div>
        <div className="flex justify-between border-t border-border pt-3 text-base"><span>Genel toplam</span><strong>{formatMoney(grandTotal)}</strong></div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden />
          Siparisi kaydet
        </Button>
      </section>
    </form>
  );
}
