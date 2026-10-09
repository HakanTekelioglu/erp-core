const assert = require('node:assert/strict');
const { loadEnvConfig } = require('@next/env');
const { PrismaClient } = require('@prisma/client');
const { encode } = require('next-auth/jwt');
loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const origin = new URL(process.argv[2] ?? 'http://localhost:3111');
if (!['localhost', '127.0.0.1'].includes(origin.hostname) || origin.protocol !== 'http:') throw new Error('Only local HTTP is supported');
async function cookieFor(user) {
  return `next-auth.session-token=${await encode({ token: { id: user.id, sub: user.id, role: user.role }, secret: process.env.NEXTAUTH_SECRET, maxAge: 600 })}`;
}
async function get(route, cookie) {
  const response = await fetch(new URL(route, origin), { headers: cookie ? { cookie } : {}, redirect: 'manual' });
  const body = await response.text();
  return { status: response.status, location: response.headers.get('location'), body };
}
async function main() {
  const user = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN', isActive: true }, select: { id: true, role: true } });
  const cookie = await cookieFor(user);
  for (const route of ['/dashboard', '/products', '/sales', '/purchases', '/invoices', '/customers', '/suppliers', '/stock', '/stock/movements', '/payments', '/expenses', '/reports', '/sales/new', '/purchases/new']) {
    const page = await get(route, cookie);
    assert.equal(page.status, 200, route);
    assert.equal(page.body.includes(':E{'), false, `${route}: streamed error`);
  }
  const count = await prisma.salesOrder.count();
  const last = await get('/sales?page=999999', cookie);
  const text = last.body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, '');
  assert.ok(text.includes(`Sayfa ${Math.max(1, Math.ceil(count / 8))} / ${Math.max(1, Math.ceil(count / 8))}`));
  const empty = await get('/sales?q=%27%20OR%201%3D1%20--', cookie);
  assert.ok(empty.body.includes('0 kayit'));
  const anonymous = await get('/products');
  assert.equal(anonymous.status, 307);
  assert.ok(anonymous.location.includes('/login'));
  const salesUser = await prisma.user.findFirst({ where: { isActive: true, role: 'SALES' }, select: { id: true, role: true } });
  if (salesUser) {
    const restricted = await get('/users', await cookieFor(salesUser));
    assert.equal(restricted.status, 307);
    assert.ok(restricted.location.endsWith('/dashboard'));
  }
  console.log('14 authenticated pages, page bounds, empty search and authorization checks passed.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
