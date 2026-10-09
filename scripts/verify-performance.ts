import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Prisma, PrismaClient } from '@prisma/client';
import { test, after } from 'node:test';
import { parsePagination } from '../src/lib/pagination';

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
(globalThis as unknown as { prisma: PrismaClient }).prisma = prisma;
after(() => prisma.$disconnect());

test('pagination bounds, Turkish substring search, literal wildcards, and stable order', async () => {
  const { queryPage } = await import('../src/services/paged-query');
  const fixture = Prisma.sql`SELECT * FROM (VALUES ('1', 'İSTANBUL', 'Kategori', 10), ('2', 'IŞIK', 'Kategori', 10), ('3', 'İndirim %_\\', 'Kategori', 10)) AS row(id, name, category, "_sortDate")`;
  const order = Prisma.sql`r."_sortDate" DESC, r.id ASC`;
  for (const [query, expected] of [['istanbul', ['1']], ['ışık', ['2']], ['IŞIK', ['2']], ['%_\\', ['3']], ['İSTANBUL Kategori', ['1']], ["' OR 1=1 --", []]] as const) {
    const result = await queryPage(fixture, order, parsePagination({ q: query }));
    assert.deepEqual(result.rows.map(row => row.id), expected);
    assert.equal(result.pagination.totalCount, expected.length);
  }
  const request = { ...parsePagination({ page: '999' }), pageSize: 1 };
  const last = await queryPage(fixture, order, request);
  assert.equal(last.pagination.page, 3);
  assert.deepEqual(last.rows.map(row => row.id), ['3']);
  assert.equal('_sortDate' in last.rows[0], false);
  assert.equal(parsePagination({ page: '-5' }).page, 1);
  assert.equal(parsePagination({ page: 'NaN' }).page, 1);
  assert.equal(parsePagination({ q: 'x'.repeat(300) }).query.length, 120);
});

test('all sales pages return every existing order once with the original displayed values', async () => {
  const { getSalesPage } = await import('../src/services/list-page-service');
  const orders = await prisma.salesOrder.findMany({ include: { customer: true }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  const expected = orders.map(order => ({ id: order.id, orderNumber: order.orderNumber, customer: order.customer.name, date: new Intl.DateTimeFormat('tr-TR').format(order.createdAt), status: order.status, total: Number(order.grandTotal) }));
  const rows = [];
  for (let page = 1; page <= Math.max(1, Math.ceil(orders.length / 8)); page++) rows.push(...(await getSalesPage(parsePagination({ page: String(page) }))).rows);
  assert.deepEqual(rows, expected);
  for (const query of ['SO-', 'COMPLETED', expected[0]?.customer ?? '', expected[0]?.date ?? '']) {
    const matches = expected.filter(row => Object.values(row).join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')));
    const found = await getSalesPage(parsePagination({ q: query }));
    assert.equal(found.pagination.totalCount, matches.length);
    assert.deepEqual(found.rows, matches.slice(0, 8));
  }
});

test('dashboard profit uses posted non-cancelled sales, historical cost, discounts, and all active products', async () => {
  const { getDashboardReport, getReportsOverview } = await import('../src/services/report-service');
  const products = await prisma.product.findMany({ where: { isActive: true }, include: { salesOrderItems: { where: { salesOrder: { stockPosted: true, status: { not: 'CANCELLED' } } } } }, orderBy: [{ name: 'asc' }, { id: 'asc' }] });
  const expected = products.map(product => {
    const realizedProfit = product.salesOrderItems.reduce((sum, item) => sum + Number(item.quantity) * (Number(item.unitPrice) - Number(item.unitCost)) - Number(item.discount), 0);
    const stockProfit = (Number(product.salePrice) - Number(product.purchasePrice)) * Number(product.stockQuantity);
    return { id: product.id, realizedProfit, stockProfit, totalProfit: realizedProfit + stockProfit };
  }).sort((a, b) => b.totalProfit - a.totalProfit);
  const report = await getDashboardReport();
  assert.ok(Math.abs(report.expectedProfitTotal - expected.reduce((sum, row) => sum + row.totalProfit, 0)) < 1e-7);
  assert.equal(report.expectedProfitPagination.totalCount, expected.length);
  for (const row of report.expectedProfitRows) {
    const source = expected.find(item => item.id === row.id)!;
    for (const key of ['realizedProfit', 'stockProfit', 'totalProfit'] as const) assert.ok(Math.abs(row[key] - source[key]) < 1e-7);
  }
  const critical = products.filter(product => product.stockQuantity.lte(product.minimumStockLevel)).length;
  assert.equal(report.criticalStockCount, critical);
  const overview = await getReportsOverview();
  assert.equal(overview.monthlySales, report.monthlySales);
  assert.equal(overview.monthlyExpense, report.monthlyExpense);
  assert.equal(overview.criticalStockCount, critical);
  const unpaid = await prisma.invoice.findMany({ where: { type: 'PURCHASE', status: { in: ['UNPAID', 'PARTIALLY_PAID'] } } });
  assert.equal(overview.unpaidInvoiceCount, unpaid.length);
  assert.ok(Math.abs(overview.unpaidInvoiceTotal - unpaid.reduce((sum, invoice) => sum + Number(invoice.grandTotal) - Number(invoice.paidTotal), 0)) < 1e-7);
});

test('form options exclude inactive records and carry only required fields', async () => {
  const { listProductOptions } = await import('../src/services/product-service');
  const { listCustomerOptions } = await import('../src/services/customer-service');
  const { listPayableInvoiceOptions } = await import('../src/services/invoice-service');
  const products = await listProductOptions();
  assert.equal(products.length, await prisma.product.count({ where: { isActive: true } }));
  assert.ok(products.every(product => !('_count' in product) && !('category' in product)));
  const customers = await listCustomerOptions();
  assert.equal(customers.length, await prisma.customer.count({ where: { isActive: true } }));
  const invoices = await listPayableInvoiceOptions();
  assert.ok(invoices.every(invoice => invoice.grandTotal.gt(invoice.paidTotal) && !('payments' in invoice)));
});

test('paged products, partners, invoices, payments, expenses and inventory preserve displayed values', async () => {
  const pages = await import('../src/services/list-page-service');
  const { formatNumber } = await import('../src/lib/utils');
  const date = (value: Date | null) => value ? new Intl.DateTimeFormat('tr-TR').format(value) : '-';
  const method = (value: string) => value === 'INVOICE' ? 'Fatura' : value === 'CASH' ? 'Nakit' : value === 'CREDIT_CARD' ? 'Kredi karti' : 'Banka transferi';
  const products = await prisma.product.findMany({ include: { category: true, _count: { select: { stockMovements: true, salesOrderItems: true, purchaseOrderItems: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  const customers = await prisma.customer.findMany({ include: { _count: { select: { salesOrders: true, invoices: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  const suppliers = await prisma.supplier.findMany({ include: { _count: { select: { purchaseOrders: true, invoices: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  const invoices = await prisma.invoice.findMany({ include: { customer: true, supplier: true }, orderBy: [{ invoiceDate: 'desc' }, { id: 'desc' }] });
  const payments = await prisma.payment.findMany({ where: { invoice: { type: 'PURCHASE' } }, include: { invoice: { include: { supplier: true } } }, orderBy: [{ paidAt: 'desc' }, { id: 'desc' }] });
  const expenses = await prisma.expense.findMany();
  const movements = await prisma.stockMovement.findMany({ include: { product: true }, orderBy: [{ movementAt: 'desc' }, { id: 'desc' }] });
  const cases = [
    { get: pages.getProductsPage, rows: products.map(p => ({ id: p.id, code: p.code, name: p.name, category: p.category.name, stock: Number(p.stockQuantity), unit: p.unit, salePrice: Number(p.salePrice), status: p.isActive ? 'Aktif' : 'Pasif', usageCount: p._count.stockMovements + p._count.salesOrderItems + p._count.purchaseOrderItems })) },
    { get: pages.getCustomersPage, rows: customers.map(c => ({ id: c.id, name: c.name, type: c.type === 'CORPORATE' ? 'Kurumsal' : 'Bireysel', phone: c.phone ?? '-', email: c.email ?? '-', balance: Number(c.balance), status: c.isActive ? 'Aktif' : 'Pasif', usageCount: c._count.salesOrders + c._count.invoices })) },
    { get: pages.getSuppliersPage, rows: suppliers.map(s => ({ id: s.id, companyName: s.companyName, contactPerson: s.contactPerson ?? '-', phone: s.phone ?? '-', email: s.email ?? '-', status: s.isActive ? 'Aktif' : 'Pasif', usageCount: s._count.purchaseOrders + s._count.invoices })) },
    { get: pages.getInvoicesPage, rows: invoices.map(i => ({ id: i.id, invoiceNumber: i.invoiceNumber, type: i.type === 'SALES' ? 'Satis' : 'Satin Alma', party: i.customer?.name ?? i.supplier?.companyName ?? '-', dueDate: date(i.dueDate), status: i.status === 'CANCELLED' ? 'Iptal' : i.type === 'SALES' ? 'Satis faturasi' : i.status === 'PAID' ? 'Odendi' : i.status === 'PARTIALLY_PAID' ? 'Kismi odendi' : 'Odenmedi', total: Number(i.grandTotal), paid: i.type === 'SALES' ? '-' : Number(i.paidTotal) })) },
    { get: pages.getPaymentsPage, rows: payments.map(p => ({ id: p.id, invoiceNumber: p.invoice.invoiceNumber, party: p.invoice.supplier?.companyName ?? '-', date: date(p.paidAt), method: method(p.method), amount: Number(p.amount) })) },
    { get: pages.getStockMovementsPage, rows: movements.map(m => ({ id: m.id, product: m.product.name, type: m.type, quantity: `${['SALE_OUT', 'RETURN_OUT'].includes(m.type) ? '-' : '+'}${formatNumber(Number(m.quantity))} ${m.product.unit}`, reference: m.reference ?? '-', note: m.note ?? '-', date: date(m.movementAt) })) },
    { get: pages.getExpensesPage, rows: [
      ...expenses.map(e => ({ id: e.id, title: e.title, category: e.category, date: date(e.expenseDate), method: method(e.method), amount: Number(e.amount), sortDate: e.expenseDate })),
      ...invoices.filter(i => i.type === 'PURCHASE' && i.status !== 'CANCELLED').map(i => ({ id: i.id, title: `${i.invoiceNumber} - ${i.supplier?.companyName ?? 'Satin alma faturasi'}`, category: 'Satin Alma', date: date(i.invoiceDate), method: 'Fatura', amount: Number(i.grandTotal), sortDate: i.invoiceDate }))
    ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime() || b.id.localeCompare(a.id)).map(row => ({ id: row.id, title: row.title, category: row.category, date: row.date, method: row.method, amount: row.amount })) }
  ];
  for (const item of cases) {
    const rows = [];
    for (let page = 1; page <= Math.max(1, Math.ceil(item.rows.length / 8)); page++) {
      const result = await item.get(parsePagination({ page: String(page) }));
      assert.equal(result.pagination.totalCount, item.rows.length);
      rows.push(...result.rows);
    }
    assert.deepEqual(rows, item.rows);
  }
  const stock = await pages.getStockPage(parsePagination());
  assert.equal(stock.pagination.totalCount, products.length);
  for (const row of stock.rows) {
    const product = products.find(p => p.id === row.id)!;
    assert.equal(row.stock, formatNumber(Number(product.stockQuantity)));
    assert.equal(row.minStock, formatNumber(Number(product.minimumStockLevel)));
  }
});

test('chat summary reads no workspace; incremental refresh excludes already loaded messages', async () => {
  const { getChatWorkspace, getChatUnreadCount } = await import('../src/services/chat-service');
  const user = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN', isActive: true }, select: { id: true, role: true } });
  const workspace = await getChatWorkspace(user);
  assert.deepEqual(workspace.users, []);
  assert.equal(await getChatUnreadCount(user), workspace.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0));
  const id = workspace.conversations[0]?.id;
  if (id) {
    const full = await getChatWorkspace(user, id);
    const last = full.messages.at(-1);
    if (last) {
      const delta = await getChatWorkspace(user, id, last.id);
      assert.equal(delta.messagesMode, 'append');
      assert.deepEqual(delta.messages, []);
      const missing = await getChatWorkspace(user, id, 'missing-cursor');
      assert.equal(missing.messagesMode, 'replace');
      assert.deepEqual(missing.messages, full.messages);
    }
    const other = await getChatWorkspace(user, 'missing-conversation');
    assert.equal(other.selectedConversation, null);
    assert.deepEqual(other.messages, []);
  }
});
