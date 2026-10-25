"use server";

import { revalidatePaths } from "@/app/_shared/revalidation";
import { requirePathAccess } from "@/lib/action-auth";
import { canDeleteExpense } from "@/lib/permissions";
import { expenseSchema, type ExpenseActionInput } from "@/lib/validations/expense";
import { createExpense, deleteExpense } from "@/services/expense-service";
import { z } from "zod";

export async function createExpenseAction(input: ExpenseActionInput) {
  const session = await requirePathAccess("/expenses");
  const data = expenseSchema.parse(input);
  const expense = await createExpense(
    {
      ...data,
      title: data.title.trim(),
      category: data.category.trim(),
      note: data.note?.trim() || undefined
    },
    session?.user?.id
  );

  revalidatePaths("/expenses", "/dashboard", "/reports");

  return { id: expense.id };
}

export async function deleteExpenseAction(id: string) {
  const session = await requirePathAccess("/expenses");
  if (!canDeleteExpense(session.user.role)) {
    throw new Error("Gider silmek için admin veya yönetici yetkisi gerekli");
  }

  const expenseId = z.string().trim().min(1).max(64).parse(id);
  await deleteExpense(expenseId);

  revalidatePaths("/expenses", "/dashboard", "/reports");
}
