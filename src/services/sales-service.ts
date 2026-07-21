import { InvoiceType, Prisma, OrderStatus, StockMovementType } from "@prisma/client";
import { calculateLineTotal, calculateOrderTotals } from "@/domain/orders/order-totals";
import { prisma } from "@/lib/prisma";
import type { SalesOrderInput } from "@/lib/validations/sales";
import { cancelInvoice, createOrderInvoice } from "@/services/invoice-service";
import { applyStockChanges } from "@/services/stock-service";

type SalesOrderForInvoice = {
  id: string;
  customerId: string;
  subtotal: Prisma.Decimal;
  vatTotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
};

function createInvoiceForSalesOrder(tx: Prisma.TransactionClient, order: SalesOrderForInvoice) {
  return createOrderInvoice(tx, {
    type: InvoiceType.SALES,
    order
  });
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
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) } },
    select: { id: true, purchasePrice: true }
  });
  const productCosts = new Map(products.map((product) => [product.id, product.purchasePrice]));

  if (productCosts.size !== new Set(input.items.map((item) => item.productId)).size) {
    throw new Error("Satis siparisindeki urunlerden biri bulunamadi");
  }

  const totals = calculateOrderTotals(input.items);

  return prisma.salesOrder.create({
    data: {
      orderNumber: `SO-${Date.now()}`,
      customerId: input.customerId,
      userId,
      status: input.status,
      ...totals,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitCost: productCosts.get(item.productId)!,
          vatRate: item.vatRate,
          discount: item.discount,
          lineTotal: calculateLineTotal(item)
        }))
      }
    }
  });
}

export async function approveSalesOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id },
      include: {
        invoice: true,
        items: { include: { product: { select: { purchasePrice: true } } } }
      }
    });
    if (!order) throw new Error("Satis siparisi bulunamadi");
    if (order.stockPosted) {
      if (!order.invoice && order.status !== OrderStatus.CANCELLED) {
        await createInvoiceForSalesOrder(tx, order);
      }

      return order;
    }

    for (const item of order.items) {
      await tx.salesOrderItem.update({
        where: { id: item.id },
        data: { unitCost: item.product.purchasePrice }
      });
    }

    await applyStockChanges(
      tx,
      order.items.map((item) => ({
        productId: item.productId,
        type: StockMovementType.SALE_OUT,
        quantity: item.quantity,
        reference: order.orderNumber,
        note: "Satis onayi ile otomatik stok cikisi"
      }))
    );

    const updatedOrder = await tx.salesOrder.update({
      where: { id },
      data: {
        status: OrderStatus.APPROVED,
        stockPosted: true,
        approvedAt: new Date()
      }
    });

    await createInvoiceForSalesOrder(tx, updatedOrder);

    return updatedOrder;
  });
}

export async function cancelSalesOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id },
      include: { invoice: true, items: true }
    });
    if (!order) throw new Error("Satis siparisi bulunamadi");

    if (order.stockPosted) {
      await applyStockChanges(
        tx,
        order.items.map((item) => ({
          productId: item.productId,
          type: StockMovementType.RETURN_IN,
          quantity: item.quantity,
          reference: order.orderNumber,
          note: "Iptal edilen satis icin stok iadesi"
        }))
      );
    }

    if (order.invoice && order.invoice.status !== "CANCELLED") {
      await cancelInvoice(tx, order.invoice.id);
    }

    return tx.salesOrder.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED, stockPosted: false }
    });
  });
}

export async function createSalesInvoice(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id },
      include: { invoice: true }
    });
    if (!order) throw new Error("Satis siparisi bulunamadi");
    if (order.invoice) return order.invoice;
    if (order.status === OrderStatus.CANCELLED) throw new Error("Iptal edilen satis faturalanamaz");
    if (!order.stockPosted) throw new Error("Fatura olusturmadan once satisi onaylayin");

    return createInvoiceForSalesOrder(tx, order);
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
