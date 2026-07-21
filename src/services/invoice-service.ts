import { InvoiceStatus, InvoiceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type OrderFinancials = {
  id: string;
  subtotal: Prisma.Decimal;
  vatTotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
};

type OrderInvoiceInput =
  | {
      type: typeof InvoiceType.SALES;
      order: OrderFinancials & { customerId: string };
    }
  | {
      type: typeof InvoiceType.PURCHASE;
      order: OrderFinancials & { supplierId: string };
    };

const DEFAULT_PAYMENT_TERM_DAYS = 14;

async function reserveInvoiceNumber(tx: Prisma.TransactionClient, type: InvoiceType) {
  const setting = await tx.companySetting.findFirst({
    select: { id: true, invoicePrefix: true }
  });
  const year = new Date().getFullYear();

  if (setting) {
    for (;;) {
      const updatedSetting = await tx.companySetting.update({
        where: { id: setting.id },
        data: { nextInvoiceCounter: { increment: 1 } },
        select: { nextInvoiceCounter: true }
      });
      const reservedCounter = updatedSetting.nextInvoiceCounter - 1;
      const invoiceNumber = `${setting.invoicePrefix}-${year}-${String(reservedCounter).padStart(4, "0")}`;
      const invoiceExists = await tx.invoice.findUnique({
        where: { invoiceNumber },
        select: { id: true }
      });

      if (!invoiceExists) return invoiceNumber;
    }
  }

  const prefix = type === InvoiceType.SALES ? "SLS" : "PUR";
  const invoiceCount = await tx.invoice.count({
    where: { invoiceNumber: { startsWith: `${prefix}-${year}-` } }
  });

  return `${prefix}-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;
}

export async function createOrderInvoice(tx: Prisma.TransactionClient, input: OrderInvoiceInput) {
  const invoiceNumber = await reserveInvoiceNumber(tx, input.type);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + DEFAULT_PAYMENT_TERM_DAYS);
  const commonData = {
    invoiceNumber,
    type: input.type,
    dueDate,
    subtotal: input.order.subtotal,
    vatTotal: input.order.vatTotal,
    discount: input.order.discount,
    grandTotal: input.order.grandTotal
  };

  if (input.type === InvoiceType.SALES) {
    return tx.invoice.create({
      data: {
        ...commonData,
        customerId: input.order.customerId,
        salesOrderId: input.order.id
      }
    });
  }

  return tx.invoice.create({
    data: {
      ...commonData,
      supplierId: input.order.supplierId,
      purchaseOrderId: input.order.id
    }
  });
}

export async function cancelInvoice(tx: Prisma.TransactionClient, invoiceId: string) {
  return tx.invoice.update({
    where: { id: invoiceId },
    data: { status: InvoiceStatus.CANCELLED }
  });
}

export function getInvoicePaymentStatus(paidTotal: Prisma.Decimal, grandTotal: Prisma.Decimal) {
  if (paidTotal.greaterThanOrEqualTo(grandTotal)) return InvoiceStatus.PAID;
  if (paidTotal.greaterThan(0)) return InvoiceStatus.PARTIALLY_PAID;

  return InvoiceStatus.UNPAID;
}

export async function listInvoices() {
  return prisma.invoice.findMany({
    include: { customer: true, supplier: true, payments: true },
    orderBy: { invoiceDate: "desc" }
  });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, supplier: true, salesOrder: true, purchaseOrder: true, payments: true }
  });
}

export async function refreshInvoicePaymentStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true }
  });
  if (!invoice) throw new Error("Fatura bulunamadi");

  const paidTotal = invoice.payments.reduce((sum, payment) => sum.add(payment.amount), invoice.paidTotal.mul(0));
  const status = getInvoicePaymentStatus(paidTotal, invoice.grandTotal);

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { paidTotal, status }
  });
}
