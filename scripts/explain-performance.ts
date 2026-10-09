import { loadEnvConfig } from '@next/env';
import { Prisma, PrismaClient } from '@prisma/client';
import { mkdirSync, writeFileSync } from 'node:fs';
loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
async function main() {
  const plans = [];
  const queries = {
    recentSales: Prisma.sql`SELECT id, "orderNumber", "customerId", status, "grandTotal" FROM "SalesOrder" ORDER BY "createdAt" DESC, id DESC LIMIT 8`,
    monthlyInvoices: Prisma.sql`SELECT type, sum("grandTotal") FROM "Invoice" WHERE "invoiceDate" >= date_trunc('month', CURRENT_TIMESTAMP) AND status <> 'CANCELLED' GROUP BY type`,
    criticalStock: Prisma.sql`SELECT count(*) FROM "Product" WHERE "isActive" AND "stockQuantity" <= "minimumStockLevel"`
  };
  for (const [name, query] of Object.entries(queries)) {
    const result = await prisma.$queryRaw<Array<{ 'QUERY PLAN': unknown }>>(Prisma.sql`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`);
    plans.push({ name, plan: result[0]['QUERY PLAN'] });
  }
  mkdirSync('docs/performance', { recursive: true });
  writeFileSync('docs/performance/query-plans.json', JSON.stringify(plans, null, 2));
  for (const plan of plans) console.log(JSON.stringify(plan));
}
main().catch(error => { console.error(error.code ?? error.name); process.exitCode = 1; }).finally(() => prisma.$disconnect());
