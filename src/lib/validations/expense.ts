import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(2, "Gider basligi en az 2 karakter olmali"),
  category: z.string().min(2, "Kategori en az 2 karakter olmali"),
  amount: z.coerce.number().positive("Gider tutari pozitif olmali"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD"]),
  expenseDate: z.preprocess((value) => (value === "" || value == null ? undefined : value), z.coerce.date().optional()),
  note: z.string().optional()
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseActionInput = z.input<typeof expenseSchema>;
