import { prisma } from "@/lib/prisma";
import type { SupplierInput } from "@/lib/validations/supplier";

export async function listSuppliers() {
  return prisma.supplier.findMany({
    include: { _count: { select: { purchaseOrders: true, invoices: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function createSupplier(data: SupplierInput) {
  return prisma.supplier.create({ data });
}

export async function updateSupplier(id: string, data: SupplierInput) {
  return prisma.supplier.update({ where: { id }, data });
}

export async function deactivateSupplier(id: string) {
  return prisma.supplier.update({ where: { id }, data: { isActive: false } });
}

export async function activateSupplier(id: string) {
  return prisma.supplier.update({ where: { id }, data: { isActive: true } });
}

export async function deleteSupplier(id: string) {
  return prisma.supplier.delete({ where: { id } });
}
