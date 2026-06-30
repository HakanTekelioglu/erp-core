import { prisma } from "@/lib/prisma";
import type { ExpenseInput } from "@/lib/validations/expense";
import { Prisma } from "@prisma/client";

export async function listExpenses() {
  return prisma.expense.findMany({
    include: { user: true },
    orderBy: { expenseDate: "desc" }
  });
}

export async function createExpense(input: ExpenseInput, userId?: string) {
  return prisma.expense.create({
    data: {
      userId,
      title: input.title,
      category: input.category,
      amount: new Prisma.Decimal(input.amount),
      method: input.method,
      expenseDate: input.expenseDate,
      note: input.note
    }
  });
}
