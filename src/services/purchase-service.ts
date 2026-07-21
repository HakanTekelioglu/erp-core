import { InvoiceType, Prisma, PurchaseStatus, StockMovementType } from "@prisma/client";
import { calculateLineTotal, calculateOrderTotals } from "@/domain/orders/order-totals";
import { prisma } from "@/lib/prisma";
import type { PurchaseOrderInput } from "@/lib/validations/purchase";
import { createOrderInvoice } from "@/services/invoice-service";
import { applyStockChanges } from "@/services/stock-service";

type PurchaseOrderForInvoice = {
  id: string;
  supplierId: string;
  subtotal: Prisma.Decimal;
  vatTotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
};

function createInvoiceForPurchaseOrder(tx: Prisma.TransactionClient, order: PurchaseOrderForInvoice) {
  return createOrderInvoice(tx, {
    type: InvoiceType.PURCHASE,
    order
  });
}

export async function listPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    include: { supplier: true, items: { include: { product: true } }, invoice: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPurchaseOrder(id: string) {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { product: true } }, invoice: true }
  });
}

export async function createPurchaseOrder(input: PurchaseOrderInput, userId?: string) {
  const totals = calculateOrderTotals(input.items);

  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.create({
      data: {
        orderNumber: `PO-${Date.now()}`,
        supplierId: input.supplierId,
        userId,
        status: input.status,
        ...totals,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            lineTotal: calculateLineTotal(item)
          }))
        }
      }
    });

    await createInvoiceForPurchaseOrder(tx, order);

    return order;
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

    await applyStockChanges(
      tx,
      order.items.map((item) => ({
        productId: item.productId,
        type: StockMovementType.PURCHASE_IN,
        quantity: item.quantity,
        reference: order.orderNumber,
        note: "Satin alma teslim alindi"
      }))
    );

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

export async function cancelPurchaseOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!order) throw new Error("Satin alma siparisi bulunamadi");
    if (order.status === PurchaseStatus.CANCELLED) return order;

    if (order.stockReceived) {
      await applyStockChanges(
        tx,
        order.items.map((item) => ({
          productId: item.productId,
          type: StockMovementType.RETURN_OUT,
          quantity: item.quantity,
          reference: order.orderNumber,
          note: "Iptal edilen satin alma icin stok cikisi"
        }))
      );
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseStatus.CANCELLED,
        stockReceived: false
      }
    });
  });
}

export async function createPurchaseInvoice(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { invoice: true }
    });
    if (!order) throw new Error("Satin alma siparisi bulunamadi");
    if (order.invoice) return order.invoice;
    if (order.status === PurchaseStatus.CANCELLED) throw new Error("Iptal edilen satin alma faturalanamaz");
    if (!order.stockReceived) throw new Error("Fatura olusturmadan once satin almayi teslim alin");

    return createInvoiceForPurchaseOrder(tx, order);
  });
}
