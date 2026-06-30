import { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type StockAdjustmentInput = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
  reference?: string;
};

const inboundTypes: StockMovementType[] = ["PURCHASE_IN", "RETURN_IN", "ADJUSTMENT"];

export async function listStockSummary() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" }
  });
}

export async function listStockMovements() {
  return prisma.stockMovement.findMany({
    include: { product: true },
    orderBy: { movementAt: "desc" },
    take: 100
  });
}

export async function getCriticalStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { stockQuantity: "asc" }
  });

  return products.filter((product) => product.stockQuantity.lte(product.minimumStockLevel));
}

export async function createStockMovement(input: StockAdjustmentInput) {
  const quantity = new Prisma.Decimal(input.quantity);
  const signedQuantity = inboundTypes.includes(input.type) ? quantity : quantity.mul(-1);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new Error("Urun bulunamadi");

    const nextStock = product.stockQuantity.add(signedQuantity);
    if (nextStock.lt(0)) throw new Error("Stok miktari negatif olamaz");

    await tx.product.update({
      where: { id: input.productId },
      data: { stockQuantity: nextStock }
    });

    return tx.stockMovement.create({
      data: {
        productId: input.productId,
        type: input.type,
        quantity,
        note: input.note,
        reference: input.reference
      }
    });
  });
}
