import { prisma } from "@/lib/prisma";
import type { ExpenseInput } from "@/lib/validations/expense";
import { Prisma } from "@prisma/client";

export async function listExpenses() {
  return prisma.expense.findMany({
    include: { user: true },
    orderBy: { expenseDate: "desc" }
  });
}

export async function listExpenseRows() {
  const [expenses, purchaseInvoices] = await Promise.all([
    prisma.expense.findMany({
      include: { user: true },
      orderBy: { expenseDate: "desc" }
    }),
    prisma.invoice.findMany({
      where: { type: "PURCHASE", status: { not: "CANCELLED" } },
      include: { supplier: true },
      orderBy: { invoiceDate: "desc" }
    })
  ]);

  return [
    ...expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      category: expense.category,
      expenseDate: expense.expenseDate,
      method: expense.method,
      amount: expense.amount
    })),
    ...purchaseInvoices.map((invoice) => ({
      id: invoice.id,
      title: `${invoice.invoiceNumber} - ${invoice.supplier?.companyName ?? "Satin alma faturasi"}`,
      category: "Satin Alma",
      expenseDate: invoice.invoiceDate,
      method: "INVOICE",
      amount: invoice.grandTotal
    }))
  ].sort((first, second) => second.expenseDate.getTime() - first.expenseDate.getTime());
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
