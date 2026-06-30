import { prisma } from "@/lib/prisma";

export async function listSuppliers() {
  return prisma.supplier.findMany({
    include: { _count: { select: { purchaseOrders: true, invoices: true } } },
    orderBy: { createdAt: "desc" }
  });
}
