"use server";

import { revalidatePaths, cacheAreas } from "@/app/_shared/revalidation";
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

  revalidatePaths("/payments", cacheAreas.overview, "/invoices", `/invoices/${data.invoiceId}`);

  return { id: payment.id };
}
