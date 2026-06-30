import { PurchaseStatus, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    include: { supplier: true, items: { include: { product: true } }, invoice: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function receivePurchaseOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!order) throw new Error("Satin alma siparisi bulunamadi");
    if (order.stockReceived) return order;

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } }
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: StockMovementType.PURCHASE_IN,
          quantity: item.quantity,
          reference: order.orderNumber,
          note: "Satin alma teslim alindi"
        }
      });
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseStatus.RECEIVED,
        stockReceived: true,
        receivedAt: new Date()
      }
    });
  });
}
