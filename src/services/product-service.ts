import { prisma } from "@/lib/prisma";
import type { ProductInput } from "@/lib/validations/product";

export async function listProducts() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      stockMovements: { orderBy: { movementAt: "desc" }, take: 20 }
    }
  });
}

export async function createProduct(data: ProductInput) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: ProductInput) {
  return prisma.product.update({ where: { id }, data });
}

export async function deactivateProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}
