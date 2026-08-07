"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { expenseSchema, type ExpenseActionInput } from "@/lib/validations/expense";
import { createExpense } from "@/services/expense-service";

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

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { id: expense.id };
}
