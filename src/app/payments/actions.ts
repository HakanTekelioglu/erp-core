"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { paymentSchema, type PaymentActionInput } from "@/lib/validations/payment";
import { createPayment } from "@/services/payment-service";

export async function createPaymentAction(input: PaymentActionInput) {
  const data = paymentSchema.parse(input);
  const session = await getCurrentUser();
  const payment = await createPayment(
    {
      ...data,
      note: data.note?.trim() || undefined
    },
    session?.user?.id
  );

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${data.invoiceId}`);

  return { id: payment.id };
}
