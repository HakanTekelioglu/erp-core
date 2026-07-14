-- Preserve the sale-time unit cost so historical profit does not change later.
ALTER TABLE "SalesOrderItem" ADD COLUMN "unitCost" DECIMAL(65,30);

UPDATE "SalesOrderItem" AS item
SET "unitCost" = product."purchasePrice"
FROM "Product" AS product
WHERE product."id" = item."productId";

ALTER TABLE "SalesOrderItem" ALTER COLUMN "unitCost" SET NOT NULL;
