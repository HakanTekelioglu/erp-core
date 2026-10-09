import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parsePagination, type PaginationRequest } from "@/lib/pagination";
import { queryPage } from "@/services/paged-query";

function getMonthRange(date: Date) {
  return { start: new Date(date.getFullYear(), date.getMonth(), 1), end: new Date(date.getFullYear(), date.getMonth() + 1, 1) };
}

async function getReportDate(now = new Date()) {
  const month = getMonthRange(now);
  const [invoice, expense] = await Promise.all([
    prisma.invoice.findFirst({ where: { invoiceDate: { gte: month.start, lt: month.end }, status: { not: "CANCELLED" } }, select: { id: true } }),
    prisma.expense.findFirst({ where: { expenseDate: { gte: month.start, lt: month.end } }, select: { id: true } })
  ]);
  if (invoice || expense) return now;
  const [latestInvoice, latestExpense] = await Promise.all([
    prisma.invoice.findFirst({ where: { status: { not: "CANCELLED" } }, orderBy: { invoiceDate: "desc" }, select: { invoiceDate: true } }),
    prisma.expense.findFirst({ orderBy: { expenseDate: "desc" }, select: { expenseDate: true } })
  ]);
  const dates = [latestInvoice?.invoiceDate, latestExpense?.expenseDate].filter((date): date is Date => !!date);
  return dates.sort((a, b) => b.getTime() - a.getTime())[0] ?? now;
}

type MonthTotal = { month: string; sales: Prisma.Decimal; expense: Prisma.Decimal };
type Statistics = { customerCount: number; productCount: number; criticalStockCount: number; pendingSales: number; unpaidInvoices: number; unpaidInvoiceTotal: Prisma.Decimal };

function getStatistics() {
  return prisma.$queryRaw<Statistics[]>(Prisma.sql`
    SELECT (SELECT count(*)::int FROM "Customer" WHERE "isActive") AS "customerCount",
      count(*)::int AS "productCount",
      count(*) FILTER (WHERE "stockQuantity" <= "minimumStockLevel")::int AS "criticalStockCount",
      (SELECT count(*)::int FROM "SalesOrder" WHERE status = 'PENDING') AS "pendingSales",
      (SELECT count(*)::int FROM "Invoice" WHERE type = 'PURCHASE' AND status IN ('UNPAID', 'PARTIALLY_PAID')) AS "unpaidInvoices",
      (SELECT coalesce(sum("grandTotal" - "paidTotal"), 0) FROM "Invoice" WHERE type = 'PURCHASE' AND status IN ('UNPAID', 'PARTIALLY_PAID')) AS "unpaidInvoiceTotal"
    FROM "Product" WHERE "isActive"
  `).then(rows => rows[0]);
}

function getMonthTotals(start: Date, end: Date) {
  // Prisma timestamps are stored in UTC; match the existing server Date/Intl month boundaries.
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return prisma.$queryRaw<MonthTotal[]>(Prisma.sql`
    SELECT month, coalesce(sum(sales), 0) AS sales, coalesce(sum(expense), 0) AS expense FROM (
      SELECT to_char("invoiceDate" AT TIME ZONE 'UTC' AT TIME ZONE ${zone}, 'YYYY-MM') AS month,
        CASE WHEN type = 'SALES' THEN "grandTotal" ELSE 0 END AS sales,
        CASE WHEN type = 'PURCHASE' THEN "grandTotal" ELSE 0 END AS expense
      FROM "Invoice" WHERE "invoiceDate" >= ${start} AND "invoiceDate" < ${end} AND status <> 'CANCELLED'
      UNION ALL
      SELECT to_char("expenseDate" AT TIME ZONE 'UTC' AT TIME ZONE ${zone}, 'YYYY-MM'), 0, amount
      FROM "Expense" WHERE "expenseDate" >= ${start} AND "expenseDate" < ${end}
    ) activity GROUP BY month
  `);
}

const profitProjection = Prisma.sql`
  WITH realized AS (
    SELECT item."productId", sum(item.quantity * (item."unitPrice" - item."unitCost") - item.discount) AS profit
    FROM "SalesOrderItem" item JOIN "SalesOrder" sale ON sale.id = item."salesOrderId"
    WHERE sale."stockPosted" AND sale.status <> 'CANCELLED' GROUP BY item."productId"
  )
  SELECT p.id, p.code, p.name, p.unit, trim_scale(p."stockQuantity") AS stock,
    trim_scale(p."purchasePrice") AS "purchasePrice", trim_scale(p."salePrice") AS "salePrice",
    trim_scale((p."salePrice" - p."purchasePrice") * p."stockQuantity") AS "stockProfit",
    trim_scale(coalesce(r.profit, 0)) AS "realizedProfit",
    trim_scale((p."salePrice" - p."purchasePrice") * p."stockQuantity" + coalesce(r.profit, 0)) AS "totalProfit"
  FROM "Product" p LEFT JOIN realized r ON r."productId" = p.id WHERE p."isActive"
`;

type ProfitRow = Record<string, unknown> & { id: string; code: string; name: string; unit: string; stock: number; purchasePrice: number; salePrice: number; stockProfit: number; realizedProfit: number; totalProfit: number };

export async function getDashboardReport(request: PaginationRequest = parsePagination({}, "profit")) {
  const reportDate = await getReportDate();
  const reportMonth = getMonthRange(reportDate);
  const chartStart = new Date(reportDate.getFullYear(), reportDate.getMonth() - 5, 1);
  const [totals, statistics, recentSales, topProducts, profit, profitTotal] = await Promise.all([
    getMonthTotals(chartStart, reportMonth.end),
    getStatistics(),
    prisma.salesOrder.findMany({
      select: { id: true, orderNumber: true, status: true, grandTotal: true, customer: { select: { name: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 5
    }),
    prisma.$queryRaw<Array<{ id: string; name: string; category: string; sales: Prisma.Decimal; stock: Prisma.Decimal }>>(Prisma.sql`
      SELECT p.id, p.name, c.name AS category, sum(item.quantity) AS sales, p."stockQuantity" AS stock
      FROM "SalesOrderItem" item JOIN "SalesOrder" sale ON sale.id = item."salesOrderId"
      JOIN "Product" p ON p.id = item."productId" JOIN "Category" c ON c.id = p."categoryId"
      WHERE sale."createdAt" >= ${reportMonth.start} AND sale."createdAt" < ${reportMonth.end} AND sale.status <> 'CANCELLED'
      GROUP BY p.id, c.name ORDER BY sales DESC, p.id ASC LIMIT 5
    `),
    queryPage<ProfitRow>(profitProjection, Prisma.sql`r."totalProfit" DESC, r.name ASC, r.id ASC`, request),
    prisma.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`WITH profits AS (${profitProjection}) SELECT coalesce(sum("totalProfit"), 0) AS total FROM profits`)
  ]);
  const totalsByMonth = new Map(totals.map(total => [total.month, total]));
  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(reportDate.getFullYear(), reportDate.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const sales = Number(totalsByMonth.get(key)?.sales ?? 0);
    return { month: new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date), sales, income: sales, expense: Number(totalsByMonth.get(key)?.expense ?? 0) };
  });
  const current = chartData[5];
  return {
    monthLabel: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(reportDate),
    monthlySales: current.sales, monthlyExpense: current.expense, estimatedProfit: current.sales - current.expense,
    customerCount: statistics.customerCount, productCount: statistics.productCount, criticalStockCount: statistics.criticalStockCount,
    pendingSales: statistics.pendingSales, unpaidInvoices: statistics.unpaidInvoices,
    expectedProfitTotal: Number(profitTotal[0].total), expectedProfitRows: profit.rows, expectedProfitPagination: profit.pagination,
    recentSales: recentSales.map(sale => ({ id: sale.id, orderNumber: sale.orderNumber, customer: sale.customer.name, status: sale.status, total: Number(sale.grandTotal) })),
    topProducts: topProducts.map(product => ({ ...product, sales: Number(product.sales), stock: Number(product.stock) })),
    chartData
  };
}

export async function getReportsOverview() {
  const reportDate = await getReportDate();
  const reportMonth = getMonthRange(reportDate);
  const [totals, statistics, topRows] = await Promise.all([
    getMonthTotals(reportMonth.start, reportMonth.end),
    getStatistics(),
    prisma.$queryRaw<Array<{ id: string; name: string; quantity: Prisma.Decimal; total: Prisma.Decimal }>>(Prisma.sql`
      SELECT p.id, p.name, sum(item.quantity) AS quantity, sum(item."lineTotal") AS total
      FROM "SalesOrderItem" item JOIN "SalesOrder" sale ON sale.id = item."salesOrderId" JOIN "Product" p ON p.id = item."productId"
      WHERE sale."createdAt" >= ${reportMonth.start} AND sale."createdAt" < ${reportMonth.end} AND sale.status <> 'CANCELLED'
      GROUP BY p.id ORDER BY total DESC, p.id ASC LIMIT 1
    `)
  ]);
  const monthlySales = Number(totals[0]?.sales ?? 0);
  const monthlyExpense = Number(totals[0]?.expense ?? 0);
  const top = topRows[0];
  return {
    monthLabel: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(reportDate),
    monthlySales, monthlyExpense, estimatedProfit: monthlySales - monthlyExpense,
    criticalStockCount: statistics.criticalStockCount, unpaidInvoiceCount: statistics.unpaidInvoices,
    unpaidInvoiceTotal: Number(statistics.unpaidInvoiceTotal), customerCount: statistics.customerCount,
    productCount: statistics.productCount, pendingSales: statistics.pendingSales,
    topProduct: top ? { ...top, quantity: Number(top.quantity), total: Number(top.total) } : undefined
  };
}
