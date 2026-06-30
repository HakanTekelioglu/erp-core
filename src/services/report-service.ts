import { prisma } from "@/lib/prisma";

export async function getDashboardReport() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesInvoices, expenses, customerCount, productCount, products, pendingSales, unpaidInvoices, recentSales] =
    await Promise.all([
      prisma.invoice.findMany({ where: { type: "SALES", invoiceDate: { gte: monthStart }, status: { not: "CANCELLED" } } }),
      prisma.expense.findMany({ where: { expenseDate: { gte: monthStart } } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true }, select: { stockQuantity: true, minimumStockLevel: true } }),
      prisma.salesOrder.count({ where: { status: "PENDING" } }),
      prisma.invoice.count({ where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } } }),
      prisma.salesOrder.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 5 })
    ]);

  const monthlySales = salesInvoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0);
  const monthlyExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return {
    monthlySales,
    monthlyExpense,
    estimatedProfit: monthlySales - monthlyExpense,
    customerCount,
    productCount,
    criticalStockCount: products.filter((product) => product.stockQuantity.lte(product.minimumStockLevel)).length,
    pendingSales,
    unpaidInvoices,
    recentSales
  };
}
