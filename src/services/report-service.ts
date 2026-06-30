import { prisma } from "@/lib/prisma";

function getLastSixMonthBuckets(now = new Date()) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date)
    };
  });
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export async function getDashboardReport() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    salesInvoices,
    expenses,
    customerCount,
    productCount,
    products,
    pendingSales,
    unpaidInvoices,
    recentSales,
    chartSalesInvoices,
    chartExpenses,
    salesItems
  ] = await Promise.all([
    prisma.invoice.findMany({ where: { type: "SALES", invoiceDate: { gte: monthStart }, status: { not: "CANCELLED" } } }),
    prisma.expense.findMany({ where: { expenseDate: { gte: monthStart } } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ where: { isActive: true }, select: { stockQuantity: true, minimumStockLevel: true } }),
    prisma.salesOrder.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } } }),
    prisma.salesOrder.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.invoice.findMany({
      where: { type: "SALES", invoiceDate: { gte: chartStart }, status: { not: "CANCELLED" } },
      select: { invoiceDate: true, grandTotal: true }
    }),
    prisma.expense.findMany({
      where: { expenseDate: { gte: chartStart } },
      select: { expenseDate: true, amount: true }
    }),
    prisma.salesOrderItem.findMany({
      where: { salesOrder: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } } },
      include: { product: { include: { category: true } } }
    })
  ]);

  const monthlySales = salesInvoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0);
  const monthlyExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthBuckets = getLastSixMonthBuckets(now);
  const chartData = monthBuckets.map((bucket) => ({
    month: bucket.label,
    sales: chartSalesInvoices
      .filter((invoice) => getMonthKey(invoice.invoiceDate) === bucket.key)
      .reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0),
    income: chartSalesInvoices
      .filter((invoice) => getMonthKey(invoice.invoiceDate) === bucket.key)
      .reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0),
    expense: chartExpenses
      .filter((expense) => getMonthKey(expense.expenseDate) === bucket.key)
      .reduce((sum, expense) => sum + Number(expense.amount), 0)
  }));
  const productSales = salesItems.reduce<
    Record<string, { id: string; name: string; category: string; sales: number; stock: number }>
  >((items, item) => {
    const existing = items[item.productId] ?? {
      id: item.productId,
      name: item.product.name,
      category: item.product.category.name,
      sales: 0,
      stock: Number(item.product.stockQuantity)
    };

    existing.sales += Number(item.quantity);
    items[item.productId] = existing;

    return items;
  }, {});

  return {
    monthLabel: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(now),
    monthlySales,
    monthlyExpense,
    estimatedProfit: monthlySales - monthlyExpense,
    customerCount,
    productCount,
    criticalStockCount: products.filter((product) => product.stockQuantity.lte(product.minimumStockLevel)).length,
    pendingSales,
    unpaidInvoices,
    recentSales: recentSales.map((sale) => ({
      id: sale.id,
      orderNumber: sale.orderNumber,
      customer: sale.customer.name,
      status: sale.status,
      total: Number(sale.grandTotal)
    })),
    topProducts: Object.values(productSales)
      .sort((first, second) => second.sales - first.sales)
      .slice(0, 5),
    chartData
  };
}

export async function getReportsOverview() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    salesInvoices,
    expenses,
    customerCount,
    productCount,
    products,
    pendingSales,
    unpaidInvoices,
    salesItems
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: { type: "SALES", invoiceDate: { gte: monthStart }, status: { not: "CANCELLED" } }
    }),
    prisma.expense.findMany({ where: { expenseDate: { gte: monthStart } } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, stockQuantity: true, minimumStockLevel: true }
    }),
    prisma.salesOrder.count({ where: { status: "PENDING" } }),
    prisma.invoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
      select: { grandTotal: true, paidTotal: true }
    }),
    prisma.salesOrderItem.findMany({
      where: { salesOrder: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } } },
      include: { product: true }
    })
  ]);

  const monthlySales = salesInvoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0);
  const monthlyExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const unpaidInvoiceTotal = unpaidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal) - Number(invoice.paidTotal),
    0
  );
  const criticalStockCount = products.filter((product) => product.stockQuantity.lte(product.minimumStockLevel)).length;

  const productSales = salesItems.reduce<Record<string, { id: string; name: string; quantity: number; total: number }>>(
    (items, item) => {
      const existing = items[item.productId] ?? {
        id: item.productId,
        name: item.product.name,
        quantity: 0,
        total: 0
      };

      existing.quantity += Number(item.quantity);
      existing.total += Number(item.lineTotal);
      items[item.productId] = existing;

      return items;
    },
    {}
  );
  const topProduct = Object.values(productSales).sort((first, second) => second.total - first.total)[0];

  return {
    monthLabel: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(now),
    monthlySales,
    monthlyExpense,
    estimatedProfit: monthlySales - monthlyExpense,
    criticalStockCount,
    unpaidInvoiceCount: unpaidInvoices.length,
    unpaidInvoiceTotal,
    customerCount,
    productCount,
    pendingSales,
    topProduct
  };
}
