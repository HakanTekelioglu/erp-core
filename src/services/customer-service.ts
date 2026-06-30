import { prisma } from "@/lib/prisma";
import type { CustomerInput } from "@/lib/validations/customer";

export async function listCustomers() {
  return prisma.customer.findMany({
    include: { _count: { select: { salesOrders: true, invoices: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      salesOrders: { orderBy: { createdAt: "desc" }, take: 20 },
      invoices: { orderBy: { invoiceDate: "desc" }, take: 20 }
    }
  });
}

export async function createCustomer(data: CustomerInput) {
  return prisma.customer.create({ data });
}

export async function deactivateCustomer(id: string) {
  return prisma.customer.update({ where: { id }, data: { isActive: false } });
}
