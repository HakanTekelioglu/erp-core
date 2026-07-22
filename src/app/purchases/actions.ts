"use server";

import { cacheAreas, revalidatePaths } from "@/app/_shared/revalidation";
import { requirePathAccess } from "@/lib/action-auth";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations/purchase";
import { cancelPurchaseOrder, createPurchaseInvoice, createPurchaseOrder, receivePurchaseOrder } from "@/services/purchase-service";

export async function createPurchaseOrderAction(input: PurchaseOrderInput) {
  const session = await requirePathAccess("/purchases");
  const data = purchaseOrderSchema.parse(input);
  const order = await createPurchaseOrder(data, session?.user?.id);

  revalidatePaths("/purchases", cacheAreas.billing, cacheAreas.purchasingCosts, cacheAreas.overview);

  return { id: order.id };
}

export async function receivePurchaseOrderAction(id: string) {
  await requirePathAccess("/purchases", id);
  await receivePurchaseOrder(id);

  revalidatePaths(
    "/purchases",
    `/purchases/${id}`,
    cacheAreas.purchasingCosts,
    cacheAreas.overview,
    cacheAreas.inventory
  );
}

export async function cancelPurchaseOrderAction(id: string) {
  await requirePathAccess("/purchases", id);
  await cancelPurchaseOrder(id);

  revalidatePaths(
    "/purchases",
    `/purchases/${id}`,
    cacheAreas.billing,
    cacheAreas.purchasingCosts,
    cacheAreas.overview,
    cacheAreas.inventory
  );
}

export async function createPurchaseInvoiceAction(id: string) {
  await requirePathAccess("/purchases", id);
  const invoice = await createPurchaseInvoice(id);

  revalidatePaths(
    "/purchases",
    `/purchases/${id}`,
    cacheAreas.billing,
    cacheAreas.purchasingCosts,
    cacheAreas.overview
  );

  return { id: invoice.id };
}
