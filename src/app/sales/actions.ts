"use server";

import { cacheAreas, revalidatePaths } from "@/app/_shared/revalidation";
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

  revalidatePaths("/sales", cacheAreas.billing, cacheAreas.overview, cacheAreas.inventory);

  return { id: order.id };
}

export async function approveSalesOrderAction(id: string) {
  await requirePathAccess("/sales");
  await approveSalesOrder(id);

  revalidatePaths("/sales", `/sales/${id}`, cacheAreas.billing, cacheAreas.overview, cacheAreas.inventory);
}

export async function cancelSalesOrderAction(id: string) {
  await requirePathAccess("/sales");
  await cancelSalesOrder(id);

  revalidatePaths("/sales", `/sales/${id}`, cacheAreas.billing, cacheAreas.overview, cacheAreas.inventory);
}

export async function createSalesInvoiceAction(id: string) {
  await requirePathAccess("/sales");
  const invoice = await createSalesInvoice(id);

  revalidatePaths("/sales", `/sales/${id}`, cacheAreas.billing, cacheAreas.overview);

  return { id: invoice.id };
}
