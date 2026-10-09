import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());
const prisma = new PrismaClient({ log: [{ level: 'query', emit: 'event' }] });
(globalThis as unknown as { prisma: PrismaClient }).prisma = prisma;
let queryCount = 0;
let sqlMs = 0;
prisma.$on('query', event => { queryCount++; sqlMs += event.duration; });

async function main() {
  const reports = await import('../src/services/report-service');
  const chat = await import('../src/services/chat-service');
  const pages = await import('../src/services/list-page-service');
  const { parsePagination } = await import('../src/lib/pagination');
  const user = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN', isActive: true }, select: { id: true, role: true } });
  const output = resolve(process.argv[2] ?? 'docs/performance/services.json');
  const operations = {
    dashboard: reports.getDashboardReport,
    reports: reports.getReportsOverview,
    products: () => pages.getProductsPage(parsePagination()),
    sales: () => pages.getSalesPage(parsePagination()),
    chat: () => chat.getChatWorkspace(user),
    chatSummary: () => chat.getChatUnreadCount(user)
  };
  const measurements = [];
  const snapshots: Record<string, unknown> = {};
  for (const [name, operation] of Object.entries(operations)) {
    const samples = [];
    for (let index = 0; index < 21; index++) {
      queryCount = 0;
      sqlMs = 0;
      const start = performance.now();
      const value = await operation();
      samples.push({ ms: performance.now() - start, queries: queryCount, sqlMs, bytes: Buffer.byteLength(JSON.stringify(value)) });
      snapshots[name] = value;
    }
    const warm = samples.slice(1);
    const sorted = warm.map(s => s.ms).sort((a, b) => a - b);
    const summary = { name, p50Ms: Number(sorted[9].toFixed(2)), p95Ms: Number(sorted[18].toFixed(2)), queries: warm[0].queries, bytes: warm[0].bytes, samples };
    measurements.push(summary);
    console.log(JSON.stringify({ ...summary, samples: undefined }));
  }
  mkdirSync(resolve('.performance'), { recursive: true });
  writeFileSync(resolve('.performance', `${process.argv[3] ?? 'snapshot'}.json`), JSON.stringify(snapshots, null, 2));
  mkdirSync(resolve(output, '..'), { recursive: true });
  writeFileSync(output, JSON.stringify({ measuredAt: new Date().toISOString(), method: 'Direct service calls against the existing database; first call excluded; 20 sequential warm samples; query duration sum can include parallel queries.', measurements }, null, 2));
}
main().catch(error => { console.error(error.code ?? error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
