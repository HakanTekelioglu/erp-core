"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { paymentSchema, type PaymentActionInput } from "@/lib/validations/payment";
import { createPayment } from "@/services/payment-service";

export async function createPaymentAction(input: PaymentActionInput) {
  const session = await requirePathAccess("/payments");
  const data = paymentSchema.parse(input);
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
