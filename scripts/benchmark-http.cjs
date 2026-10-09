// Local-only read benchmark. Tokens stay in memory; existing users/data are not changed.
const { loadEnvConfig } = require('@next/env');
const { PrismaClient } = require('@prisma/client');
const { encode } = require('next-auth/jwt');
const fs = require('node:fs');
const path = require('node:path');
loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const origin = new URL(process.argv[2] ?? 'http://localhost:3111');
if (!['localhost', '127.0.0.1'].includes(origin.hostname) || origin.protocol !== 'http:') throw new Error('Only local HTTP is supported');
const output = path.resolve(process.argv[3] ?? 'docs/performance/http.json');
const repeats = Number(process.argv[4] ?? 20);
const routes = ['/dashboard', '/products', '/sales', '/purchases', '/invoices', '/reports', '/sales/new', '/payments'];
function percentile(values, percentile) {
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.ceil(sorted.length * percentile) - 1] * 10) / 10;
}
async function main() {
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN', isActive: true }, select: { id: true, name: true, email: true, role: true } });
  if (!user || !process.env.NEXTAUTH_SECRET) throw new Error('An existing active admin and auth secret are required');
  const token = await encode({ token: { id: user.id, sub: user.id, name: user.name, email: user.email, role: user.role }, secret: process.env.NEXTAUTH_SECRET, maxAge: 3600 });
  const cookie = `next-auth.session-token=${token}`;
  const measurements = [];
  for (const route of routes) {
    const samples = [];
    for (let index = 0; index <= repeats; index++) {
      const startedAt = Date.now();
      const started = performance.now();
      const response = await fetch(new URL(route, origin), { headers: { cookie }, redirect: 'manual' });
      const headersMs = performance.now() - started;
      const body = await response.text();
      const totalMs = performance.now() - started;
      if (response.status !== 200 || body.includes('NEXT_REDIRECT') || body.includes(':E{') || !body.includes('<!DOCTYPE html>')) throw new Error(`${route}: invalid page response (${response.status})`);
      samples.push({ startedAt, endedAt: Date.now(), headersMs, totalMs, bytes: Buffer.byteLength(body) });
    }
    const warm = samples.slice(1);
    const summary = { route, firstMs: Math.round(samples[0].totalMs), p50Ms: percentile(warm.map(s => s.totalMs), .5), p95Ms: percentile(warm.map(s => s.totalMs), .95), medianBytes: percentile(warm.map(s => s.bytes), .5), samples };
    measurements.push(summary);
    console.log(JSON.stringify({ ...summary, samples: undefined }));
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ measuredAt: new Date().toISOString(), origin: origin.origin, repeats, node: process.version, method: 'Authenticated local admin HTML GET; full response read, sequential, first request excluded from warm percentiles. No browser rendering or navigation measurement.', measurements }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
