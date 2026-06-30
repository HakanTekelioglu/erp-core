import { InvoiceStatus, InvoiceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

export async function generateInvoiceNumber(type: InvoiceType) {
  const setting = await prisma.companySetting.findFirst();
  const prefix = setting?.invoicePrefix ?? (type === "SALES" ? "SLS" : "PUR");
  const counter = setting?.nextInvoiceCounter ?? 1;
  return `${prefix}-${new Date().getFullYear()}-${String(counter).padStart(4, "0")}`;
}

export async function refreshInvoicePaymentStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true }
  });
  if (!invoice) throw new Error("Fatura bulunamadi");

  const paidTotal = invoice.payments.reduce((sum, payment) => sum.add(payment.amount), invoice.paidTotal.mul(0));
  const status = paidTotal.greaterThanOrEqualTo(invoice.grandTotal)
    ? InvoiceStatus.PAID
    : paidTotal.greaterThan(0)
      ? InvoiceStatus.PARTIALLY_PAID
      : InvoiceStatus.UNPAID;

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { paidTotal, status }
  });
}
