import { z } from "zod";

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Fatura secin"),
  amount: z.coerce.number().positive("Odeme tutari pozitif olmali"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD"]),
  paidAt: z.coerce.date().optional(),
  note: z.string().optional()
});

export type PaymentInput = z.infer<typeof paymentSchema>;
