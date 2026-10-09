import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { escapeLike, type PaginationRequest } from "@/lib/pagination";

type Row = Record<string, unknown>;

// Projections and order clauses are trusted SQL fragments, never request text.
// Search mirrors DataTable's Turkish substring search across projected row values.
export async function queryPage<T extends Row>(projection: Prisma.Sql, order: Prisma.Sql, request: PaginationRequest) {
  const where = request.query
    ? Prisma.sql`WHERE lower(replace(replace((SELECT string_agg(value, ' ' ORDER BY position) FROM json_each_text(row_to_json(r)) WITH ORDINALITY AS field(key, value, position) WHERE key <> '_sortDate'), 'I', 'ı'), 'İ', 'i')) LIKE ${`%${escapeLike(request.query)}%`}`
    : Prisma.empty;
  const [count] = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    WITH rows AS (${projection}) SELECT count(*)::int AS count FROM rows r ${where}
  `);
  const page = Math.min(request.page, Math.max(1, Math.ceil(count.count / request.pageSize)));
  const records = await prisma.$queryRaw<T[]>(Prisma.sql`
    WITH rows AS (${projection}) SELECT r.* FROM rows r ${where}
    ORDER BY ${order} LIMIT ${request.pageSize} OFFSET ${(page - 1) * request.pageSize}
  `);
  const rows = records.map(record => Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== '_sortDate').map(([key, value]) => [key, value instanceof Prisma.Decimal ? value.toNumber() : value])
  ) as T);
  return { rows, pagination: { ...request, page, totalCount: count.count } };
}
