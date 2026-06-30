import { InvoiceType, PurchaseStatus, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PurchaseOrderInput } from "@/lib/validations/purchase";

function calculateLineTotal(quantity: number, unitPrice: number, vatRate: number) {
  const subtotal = quantity * unitPrice;
  return subtotal + subtotal * (vatRate / 100);
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
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatTotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0);
  const grandTotal = subtotal + vatTotal;

  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.create({
      data: {
        orderNumber: `PO-${Date.now()}`,
        supplierId: input.supplierId,
        userId,
        status: input.status,
        subtotal,
        vatTotal,
        grandTotal,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            lineTotal: calculateLineTotal(item.quantity, item.unitPrice, item.vatRate)
          }))
        }
      }
    });

    const year = new Date().getFullYear();
    const invoiceCount = await tx.invoice.count({
      where: { invoiceNumber: { startsWith: `PUR-${year}-` } }
    });

    await tx.invoice.create({
      data: {
        invoiceNumber: `PUR-${year}-${String(invoiceCount + 1).padStart(4, "0")}`,
        type: InvoiceType.PURCHASE,
        supplierId: order.supplierId,
        purchaseOrderId: order.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subtotal: order.subtotal,
        vatTotal: order.vatTotal,
        discount: order.discount,
        grandTotal: order.grandTotal
      }
    });

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

export async function cancelPurchaseOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });
    if (!order) throw new Error("Satin alma siparisi bulunamadi");
    if (order.status === PurchaseStatus.CANCELLED) return order;

    if (order.stockReceived) {
      for (const item of order.items) {
        if (item.product.stockQuantity.lt(item.quantity)) {
          throw new Error(`${item.product.name} icin stok iadesi yapilamiyor`);
        }
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.RETURN_OUT,
            quantity: item.quantity,
            reference: order.orderNumber,
            note: "Iptal edilen satin alma icin stok cikisi"
          }
        });
      }
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

    const year = new Date().getFullYear();
    const invoiceCount = await tx.invoice.count({
      where: { invoiceNumber: { startsWith: `PUR-${year}-` } }
    });

    return tx.invoice.create({
      data: {
        invoiceNumber: `PUR-${year}-${String(invoiceCount + 1).padStart(4, "0")}`,
        type: InvoiceType.PURCHASE,
        supplierId: order.supplierId,
        purchaseOrderId: order.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subtotal: order.subtotal,
        vatTotal: order.vatTotal,
        discount: order.discount,
        grandTotal: order.grandTotal
      }
    });
  });
}
