"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { salesOrderSchema, type SalesOrderInput } from "@/lib/validations/sales";
import { approveSalesOrder, cancelSalesOrder, createSalesInvoice, createSalesOrder } from "@/services/sales-service";

export async function createSalesOrderAction(input: SalesOrderInput) {
  const session = await requirePathAccess("/sales");
  const data = salesOrderSchema.parse(input);
  const order = await createSalesOrder(data, session?.user?.id);

  if (data.status === "APPROVED") {
    await approveSalesOrder(order.id);
  }

  revalidatePath("/sales");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/stock");
  revalidatePath("/stock/movements");

  return { id: order.id };
}

export async function approveSalesOrderAction(id: string) {
  await requirePathAccess("/sales");
  await approveSalesOrder(id);

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/stock");
  revalidatePath("/stock/movements");
}

export async function cancelSalesOrderAction(id: string) {
  await requirePathAccess("/sales");
  await cancelSalesOrder(id);

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/stock");
  revalidatePath("/stock/movements");
}

export async function createSalesInvoiceAction(id: string) {
  await requirePathAccess("/sales");
  const invoice = await createSalesInvoice(id);

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { id: invoice.id };
}
