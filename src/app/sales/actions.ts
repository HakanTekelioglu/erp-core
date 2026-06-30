"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { salesOrderSchema, type SalesOrderInput } from "@/lib/validations/sales";
import { approveSalesOrder, cancelSalesOrder, createSalesInvoice, createSalesOrder } from "@/services/sales-service";

export async function createSalesOrderAction(input: SalesOrderInput) {
  const data = salesOrderSchema.parse(input);
  const session = await getCurrentUser();
  const order = await createSalesOrder(data, session?.user?.id);

  if (data.status === "APPROVED") {
    await approveSalesOrder(order.id);
  }

  revalidatePath("/sales");
  revalidatePath("/stock");
  revalidatePath("/stock/movements");

  return { id: order.id };
}

export async function approveSalesOrderAction(id: string) {
  await approveSalesOrder(id);

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  revalidatePath("/stock");
  revalidatePath("/stock/movements");
}

export async function cancelSalesOrderAction(id: string) {
  await cancelSalesOrder(id);

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  revalidatePath("/stock");
  revalidatePath("/stock/movements");
}

export async function createSalesInvoiceAction(id: string) {
  const invoice = await createSalesInvoice(id);

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  revalidatePath("/invoices");

  return { id: invoice.id };
}
