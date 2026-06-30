"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations/purchase";
import { cancelPurchaseOrder, createPurchaseInvoice, createPurchaseOrder, receivePurchaseOrder } from "@/services/purchase-service";

export async function createPurchaseOrderAction(input: PurchaseOrderInput) {
  const data = purchaseOrderSchema.parse(input);
  const session = await getCurrentUser();
  const order = await createPurchaseOrder(data, session?.user?.id);

  revalidatePath("/purchases");
  revalidatePath("/invoices");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { id: order.id };
}

export async function receivePurchaseOrderAction(id: string) {
  await receivePurchaseOrder(id);

  revalidatePath("/purchases");
  revalidatePath(`/purchases/${id}`);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/stock");
  revalidatePath("/stock/movements");
}

export async function cancelPurchaseOrderAction(id: string) {
  await cancelPurchaseOrder(id);

  revalidatePath("/purchases");
  revalidatePath(`/purchases/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/stock");
  revalidatePath("/stock/movements");
}

export async function createPurchaseInvoiceAction(id: string) {
  const invoice = await createPurchaseInvoice(id);

  revalidatePath("/purchases");
  revalidatePath(`/purchases/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { id: invoice.id };
}
