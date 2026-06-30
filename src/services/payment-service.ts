import { prisma } from "@/lib/prisma";
import type { PaymentInput } from "@/lib/validations/payment";
import { InvoiceStatus } from "@prisma/client";

export async function listPayments() {
  return prisma.payment.findMany({
    include: { invoice: { include: { customer: true, supplier: true } }, user: true },
    orderBy: { paidAt: "desc" }
  });
}

export async function createPayment(input: PaymentInput, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: input.invoiceId } });
    if (!invoice) throw new Error("Fatura bulunamadi");

    const payment = await tx.payment.create({
      data: {
        invoiceId: input.invoiceId,
        userId,
        amount: input.amount,
        method: input.method,
        paidAt: input.paidAt,
        note: input.note
      }
    });

    const payments = await tx.payment.findMany({ where: { invoiceId: input.invoiceId } });
    const paidTotal = payments.reduce((sum, item) => sum.add(item.amount), invoice.grandTotal.mul(0));
    const status = paidTotal.greaterThanOrEqualTo(invoice.grandTotal)
      ? InvoiceStatus.PAID
      : paidTotal.greaterThan(0)
        ? InvoiceStatus.PARTIALLY_PAID
        : InvoiceStatus.UNPAID;

    await tx.invoice.update({
      where: { id: input.invoiceId },
      data: { paidTotal, status }
    });

    return payment;
  });
}
