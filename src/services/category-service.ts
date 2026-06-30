import { prisma } from "@/lib/prisma";
import type { CategoryInput } from "@/lib/validations/category";

export async function listCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  });
}

export async function createCategory(data: CategoryInput) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: CategoryInput) {
  return prisma.category.update({ where: { id }, data });
}

export async function deactivateCategory(id: string) {
  return prisma.category.update({ where: { id }, data: { isActive: false } });
}
