import { z } from "zod";

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Fatura secin"),
  amount: z.coerce.number().positive("Odeme tutari pozitif olmali"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD"]),
  paidAt: z.preprocess((value) => (value === "" || value == null ? undefined : value), z.coerce.date().optional()),
  note: z.string().optional()
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type PaymentActionInput = z.input<typeof paymentSchema>;
