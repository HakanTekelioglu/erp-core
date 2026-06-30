"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { expenseSchema, type ExpenseActionInput } from "@/lib/validations/expense";
import { createExpense } from "@/services/expense-service";

export async function createExpenseAction(input: ExpenseActionInput) {
  const data = expenseSchema.parse(input);
  const session = await getCurrentUser();
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
