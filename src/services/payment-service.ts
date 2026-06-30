import { prisma } from "@/lib/prisma";
import type { PaymentInput } from "@/lib/validations/payment";
import { InvoiceStatus, InvoiceType, Prisma } from "@prisma/client";

export async function listPayments() {
  return prisma.payment.findMany({
    where: { invoice: { type: InvoiceType.PURCHASE } },
    include: { invoice: { include: { customer: true, supplier: true } }, user: true },
    orderBy: { paidAt: "desc" }
  });
}

export async function createPayment(input: PaymentInput, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { payments: true }
    });
    if (!invoice) throw new Error("Fatura bulunamadi");
    if (invoice.type === InvoiceType.SALES) throw new Error("Satis faturalarina odeme girilemez");
    if (invoice.status === InvoiceStatus.CANCELLED) throw new Error("Iptal edilen faturaya odeme girilemez");

    const amount = new Prisma.Decimal(input.amount);
    const paidBefore = invoice.payments.reduce((sum, item) => sum.add(item.amount), invoice.grandTotal.mul(0));
    const nextPaidTotal = paidBefore.add(amount);

    if (nextPaidTotal.greaterThan(invoice.grandTotal)) {
      throw new Error("Odeme tutari fatura kalan tutarini asamaz");
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId: input.invoiceId,
        userId,
        amount,
        method: input.method,
        paidAt: input.paidAt,
        note: input.note
      }
    });

    const status = nextPaidTotal.greaterThanOrEqualTo(invoice.grandTotal)
      ? InvoiceStatus.PAID
      : nextPaidTotal.greaterThan(0)
        ? InvoiceStatus.PARTIALLY_PAID
        : InvoiceStatus.UNPAID;

    await tx.invoice.update({
      where: { id: input.invoiceId },
      data: { paidTotal: nextPaidTotal, status }
    });

    return payment;
  });
}
