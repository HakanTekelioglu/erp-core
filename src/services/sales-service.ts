import { Prisma, OrderStatus, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SalesOrderInput } from "@/lib/validations/sales";

function calculateLineTotal(quantity: number, unitPrice: number, vatRate: number, discount = 0) {
  const subtotal = quantity * unitPrice;
  const afterDiscount = subtotal - discount;
  return afterDiscount + afterDiscount * (vatRate / 100);
}

export async function listSalesOrders() {
  return prisma.salesOrder.findMany({
    include: { customer: true, items: { include: { product: true } }, invoice: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getSalesOrder(id: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } }, invoice: true }
  });
}

export async function createSalesOrder(input: SalesOrderInput, userId?: string) {
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = input.items.reduce((sum, item) => sum + item.discount, 0);
  const vatTotal = input.items.reduce((sum, item) => {
    const net = item.quantity * item.unitPrice - item.discount;
    return sum + net * (item.vatRate / 100);
  }, 0);

  return prisma.salesOrder.create({
    data: {
      orderNumber: `SO-${Date.now()}`,
      customerId: input.customerId,
      userId,
      status: input.status,
      subtotal,
      vatTotal,
      discount,
      grandTotal: subtotal - discount + vatTotal,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discount: item.discount,
          lineTotal: calculateLineTotal(item.quantity, item.unitPrice, item.vatRate, item.discount)
        }))
      }
    }
  });
}

export async function approveSalesOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });
    if (!order) throw new Error("Satis siparisi bulunamadi");
    if (order.stockPosted) return order;

    for (const item of order.items) {
      if (item.product.stockQuantity.lt(item.quantity)) {
        throw new Error(`${item.product.name} icin stok yetersiz`);
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
          type: StockMovementType.SALE_OUT,
          quantity: item.quantity,
          reference: order.orderNumber,
          note: "Satis onayi ile otomatik stok cikisi"
        }
      });
    }

    return tx.salesOrder.update({
      where: { id },
      data: {
        status: OrderStatus.APPROVED,
        stockPosted: true,
        approvedAt: new Date()
      }
    });
  });
}

export async function cancelSalesOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!order) throw new Error("Satis siparisi bulunamadi");

    if (order.stockPosted) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.RETURN_IN,
            quantity: item.quantity,
            reference: order.orderNumber,
            note: "Iptal edilen satis icin stok iadesi"
          }
        });
      }
    }

    return tx.salesOrder.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED, stockPosted: false }
    });
  });
}

export function createEmptySalesItem() {
  return {
    productId: "",
    quantity: new Prisma.Decimal(1),
    unitPrice: new Prisma.Decimal(0),
    vatRate: new Prisma.Decimal(20),
    discount: new Prisma.Decimal(0)
  };
}
