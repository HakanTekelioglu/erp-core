import { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type StockAdjustmentInput = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
  reference?: string;
};

export type StockChange = {
  productId: string;
  type: StockMovementType;
  quantity: Prisma.Decimal;
  note?: string;
  reference?: string;
};

const inboundTypes = new Set<StockMovementType>([
  StockMovementType.PURCHASE_IN,
  StockMovementType.RETURN_IN,
  StockMovementType.ADJUSTMENT
]);

function getSignedQuantity(change: StockChange) {
  return inboundTypes.has(change.type) ? change.quantity : change.quantity.mul(-1);
}

export async function applyStockChanges(tx: Prisma.TransactionClient, changes: readonly StockChange[]) {
  const changesByProduct = new Map<string, Prisma.Decimal>();

  for (const change of changes) {
    if (!change.quantity.greaterThan(0)) {
      throw new Error("Stok hareketi miktari sifirdan buyuk olmali");
    }

    const currentChange = changesByProduct.get(change.productId) ?? new Prisma.Decimal(0);
    changesByProduct.set(change.productId, currentChange.add(getSignedQuantity(change)));
  }

  const products = await tx.product.findMany({
    where: { id: { in: [...changesByProduct.keys()] } },
    select: { id: true, name: true }
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const [productId, quantityChange] of changesByProduct) {
    const product = productsById.get(productId);
    if (!product) throw new Error("Urun bulunamadi");

    if (quantityChange.isNegative()) {
      const requiredStock = quantityChange.abs();
      const result = await tx.product.updateMany({
        where: { id: productId, stockQuantity: { gte: requiredStock } },
        data: { stockQuantity: { decrement: requiredStock } }
      });

      if (result.count === 0) {
        throw new Error(`${product.name} icin stok yetersiz`);
      }
    } else if (!quantityChange.isZero()) {
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: { increment: quantityChange } }
      });
    }
  }

  const movements = [];

  for (const change of changes) {
    movements.push(
      await tx.stockMovement.create({
        data: {
          productId: change.productId,
          type: change.type,
          quantity: change.quantity,
          note: change.note,
          reference: change.reference
        }
      })
    );
  }

  return movements;
}

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

  return prisma.$transaction(async (tx) => {
    const [movement] = await applyStockChanges(tx, [{ ...input, quantity }]);

    return movement;
  });
}
