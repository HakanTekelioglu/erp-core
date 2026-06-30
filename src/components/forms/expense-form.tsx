"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createExpenseAction } from "@/app/expenses/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { expenseSchema, type ExpenseActionInput } from "@/lib/validations/expense";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

const defaultValues = {
  title: "",
  category: "",
  method: "BANK_TRANSFER",
  expenseDate: todayInputValue(),
  note: ""
} satisfies Partial<ExpenseActionInput>;

export function ExpenseForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseActionInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues
  });

  async function onSubmit(data: ExpenseActionInput) {
    try {
      await createExpenseAction(data);
      toast.success("Gider kaydedildi");
      reset({ ...defaultValues, expenseDate: todayInputValue() });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gider kaydedilemedi. Alanlari kontrol edin.";
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <Input label="Gider basligi" {...register("title")} error={errors.title?.message} />
      <Input label="Kategori" {...register("category")} error={errors.category?.message} />
      <Input label="Tutar" type="number" step="0.01" min="0.01" {...register("amount")} error={errors.amount?.message} />
      <Input label="Gider tarihi" type="date" {...register("expenseDate")} error={errors.expenseDate?.message} />
      <Select label="Odeme yontemi" {...register("method")} error={errors.method?.message}>
        <option value="CASH">Nakit</option>
        <option value="BANK_TRANSFER">Banka transferi</option>
        <option value="CREDIT_CARD">Kredi karti</option>
      </Select>
      <Textarea label="Not" {...register("note")} error={errors.note?.message} />
      <Button type="submit" disabled={isSubmitting}>
        <Plus className="size-4" aria-hidden />
        Gider ekle
      </Button>
    </form>
  );
}
