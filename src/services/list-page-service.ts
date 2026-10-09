import { Prisma } from "@prisma/client";
import type { PaginationRequest } from "@/lib/pagination";
import { queryPage } from "@/services/paged-query";

function formattedDate(value: Prisma.Sql) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return Prisma.sql`to_char(${value} AT TIME ZONE 'UTC' AT TIME ZONE ${zone}, 'DD.MM.YYYY')`;
}

function formattedNumber(value: Prisma.Sql) {
  return Prisma.sql`regexp_replace(regexp_replace(translate(to_char(round(${value}, 2), 'FM999,999,999,999,999,990.00'), '.,', ',.'), '0+$', ''), ',$', '')`;
}

export function getStockPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT p.id, p.code, p.name, c.name AS category, ${formattedNumber(Prisma.sql`p."stockQuantity"`)} AS stock,
      ${formattedNumber(Prisma.sql`p."minimumStockLevel"`)} AS "minStock", p.unit,
      CASE WHEN NOT p."isActive" THEN 'Pasif' WHEN p."stockQuantity" <= p."minimumStockLevel" THEN 'Kritik' ELSE 'Aktif' END AS status
    FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"
  `, Prisma.sql`r.name ASC, r.id ASC`, request);
}

export function getStockMovementsPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT m.id, p.name AS product, m.type,
      (CASE WHEN m.type IN ('SALE_OUT', 'RETURN_OUT') THEN '-' ELSE '+' END) || ${formattedNumber(Prisma.sql`m.quantity`)} || ' ' || p.unit::text AS quantity,
      coalesce(m.reference, '-') AS reference, coalesce(m.note, '-') AS note, ${formattedDate(Prisma.sql`m."movementAt"`)} AS date,
      m."movementAt" AS "_sortDate"
    FROM "StockMovement" m JOIN "Product" p ON p.id = m."productId"
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getProductsPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT p.id, p.code, p.name, c.name AS category, trim_scale(p."stockQuantity") AS stock,
      p.unit, trim_scale(p."salePrice") AS "salePrice", CASE WHEN p."isActive" THEN 'Aktif' ELSE 'Pasif' END AS status,
      ((SELECT count(*) FROM "StockMovement" WHERE "productId" = p.id)
       + (SELECT count(*) FROM "SalesOrderItem" WHERE "productId" = p.id)
       + (SELECT count(*) FROM "PurchaseOrderItem" WHERE "productId" = p.id))::int AS "usageCount", p."createdAt" AS "_sortDate"
    FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getSalesPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT o.id, o."orderNumber", c.name AS customer, ${formattedDate(Prisma.sql`o."createdAt"`)} AS date,
      o.status, trim_scale(o."grandTotal") AS total, o."createdAt" AS "_sortDate"
    FROM "SalesOrder" o JOIN "Customer" c ON c.id = o."customerId"
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getPurchasesPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT o.id, o."orderNumber", s."companyName" AS supplier, ${formattedDate(Prisma.sql`o."createdAt"`)} AS date,
      o.status, trim_scale(o."grandTotal") AS total, o."createdAt" AS "_sortDate"
    FROM "PurchaseOrder" o JOIN "Supplier" s ON s.id = o."supplierId"
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getInvoicesPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT i.id, i."invoiceNumber", CASE WHEN i.type = 'SALES' THEN 'Satis' ELSE 'Satin Alma' END AS type,
      coalesce(c.name, s."companyName", '-') AS party, coalesce(${formattedDate(Prisma.sql`i."dueDate"`)}, '-') AS "dueDate",
      CASE WHEN i.status = 'CANCELLED' THEN 'Iptal' WHEN i.type = 'SALES' THEN 'Satis faturasi'
        WHEN i.status = 'PAID' THEN 'Odendi' WHEN i.status = 'PARTIALLY_PAID' THEN 'Kismi odendi' ELSE 'Odenmedi' END AS status,
      trim_scale(i."grandTotal") AS total, CASE WHEN i.type = 'SALES' THEN '-' ELSE trim_scale(i."paidTotal")::text END AS paid,
      i."invoiceDate" AS "_sortDate"
    FROM "Invoice" i LEFT JOIN "Customer" c ON c.id = i."customerId" LEFT JOIN "Supplier" s ON s.id = i."supplierId"
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request).then(result => ({ ...result, rows: result.rows.map(row => ({ ...row, paid: row.paid === '-' ? '-' : Number(row.paid) })) }));
}

export function getCustomersPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT c.id, c.name, CASE WHEN c.type = 'CORPORATE' THEN 'Kurumsal' ELSE 'Bireysel' END AS type,
      coalesce(c.phone, '-') AS phone, coalesce(c.email, '-') AS email, trim_scale(c.balance) AS balance,
      CASE WHEN c."isActive" THEN 'Aktif' ELSE 'Pasif' END AS status,
      ((SELECT count(*) FROM "SalesOrder" WHERE "customerId" = c.id) + (SELECT count(*) FROM "Invoice" WHERE "customerId" = c.id))::int AS "usageCount",
      c."createdAt" AS "_sortDate" FROM "Customer" c
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getSuppliersPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT s.id, s."companyName", coalesce(s."contactPerson", '-') AS "contactPerson", coalesce(s.phone, '-') AS phone,
      coalesce(s.email, '-') AS email, CASE WHEN s."isActive" THEN 'Aktif' ELSE 'Pasif' END AS status,
      ((SELECT count(*) FROM "PurchaseOrder" WHERE "supplierId" = s.id) + (SELECT count(*) FROM "Invoice" WHERE "supplierId" = s.id))::int AS "usageCount",
      s."createdAt" AS "_sortDate" FROM "Supplier" s
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getPaymentsPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT p.id, i."invoiceNumber", coalesce(s."companyName", '-') AS party, ${formattedDate(Prisma.sql`p."paidAt"`)} AS date,
      CASE p.method WHEN 'CASH' THEN 'Nakit' WHEN 'CREDIT_CARD' THEN 'Kredi karti' ELSE 'Banka transferi' END AS method,
      trim_scale(p.amount) AS amount, p."paidAt" AS "_sortDate"
    FROM "Payment" p JOIN "Invoice" i ON i.id = p."invoiceId" LEFT JOIN "Supplier" s ON s.id = i."supplierId" WHERE i.type = 'PURCHASE'
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}

export function getExpensesPage(request: PaginationRequest) {
  return queryPage(Prisma.sql`
    SELECT e.id, e.title, e.category, ${formattedDate(Prisma.sql`e."expenseDate"`)} AS date,
      CASE e.method WHEN 'CASH' THEN 'Nakit' WHEN 'CREDIT_CARD' THEN 'Kredi karti' ELSE 'Banka transferi' END AS method,
      trim_scale(e.amount) AS amount, e."expenseDate" AS "_sortDate" FROM "Expense" e
    UNION ALL
    SELECT i.id, i."invoiceNumber" || ' - ' || coalesce(s."companyName", 'Satin alma faturasi'), 'Satin Alma',
      ${formattedDate(Prisma.sql`i."invoiceDate"`)}, 'Fatura', trim_scale(i."grandTotal"), i."invoiceDate"
    FROM "Invoice" i LEFT JOIN "Supplier" s ON s.id = i."supplierId" WHERE i.type = 'PURCHASE' AND i.status <> 'CANCELLED'
  `, Prisma.sql`r."_sortDate" DESC, r.id DESC`, request);
}
