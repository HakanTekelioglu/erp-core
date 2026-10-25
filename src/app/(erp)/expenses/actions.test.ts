import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mock, test } from "node:test";
import type { PrismaClient, Role } from "@prisma/client";
import { canDeleteExpense } from "@/lib/permissions";

// Mock the writable CommonJS export behind next-auth's read-only re-export.
const require = createRequire(`${process.cwd()}/package.json`);
const nextAuth = require("next-auth/next") as typeof import("next-auth/next");
const nextCache = require("next/cache") as typeof import("next/cache");

test("expense deletion enforces the current user's role before changing data", async (t) => {
  let signedIn = true;
  let active = true;
  let currentRole: Role = "ADMIN";
  const deleted: string[] = [];
  const paths: string[] = [];
  const tags: string[] = [];

  mock.method(nextAuth, "getServerSession", async () => signedIn ? {
    user: { id: "user-1", role: "ADMIN" }
  } : null);
  const findUser = mock.fn(async () => ({
    id: "user-1", name: "Test", email: "test@example.invalid", role: currentRole, isActive: active
  }));
  const deleteRecord = mock.fn(async ({ where }: { where: { id: string } }) => {
    if (where.id !== "expense-1") throw new Error("Record not found");
    deleted.push(where.id);
    return { id: where.id };
  });
  mock.method(nextCache, "revalidatePath", (path: string) => { paths.push(path); });
  mock.method(nextCache, "revalidateTag", (tag: string) => { tags.push(tag); });
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  const previousPrisma = globalForPrisma.prisma;
  globalForPrisma.prisma = {
    user: { findUnique: findUser },
    expense: { delete: deleteRecord }
  } as unknown as PrismaClient;
  t.after(() => {
    mock.restoreAll();
    globalForPrisma.prisma = previousPrisma;
  });
  const { deleteExpenseAction } = await import("./actions");
  const { REPORT_CACHE_TAG } = await import("@/services/report-cache");

  for (const role of ["ADMIN", "MANAGER"] as const) {
    await t.test(`${role} can delete a manually entered expense and refresh reports`, async () => {
      currentRole = role;
      deleted.length = paths.length = tags.length = 0;
      assert.equal(canDeleteExpense(role), true);
      await deleteExpenseAction("expense-1");
      assert.deepEqual(deleted, ["expense-1"]);
      assert.deepEqual(paths, ["/expenses", "/dashboard", "/reports"]);
      assert.deepEqual(tags, [REPORT_CACHE_TAG]);
    });
  }

  for (const role of ["ACCOUNTING", "SALES", "WAREHOUSE"] as const) {
    await t.test(`${role} is rejected even when the session token still says ADMIN`, async () => {
      currentRole = role;
      deleted.length = paths.length = tags.length = 0;
      assert.equal(canDeleteExpense(role), false);
      await assert.rejects(deleteExpenseAction("expense-1"), /yetki/);
      assert.deepEqual(deleted, []);
      assert.deepEqual(paths, []);
      assert.deepEqual(tags, []);
    });
  }

  await t.test("signed-out and deactivated users cannot delete", async () => {
    currentRole = "ADMIN";
    signedIn = false;
    await assert.rejects(deleteExpenseAction("expense-1"), /Oturum gerekli/);
    signedIn = true;
    active = false;
    await assert.rejects(deleteExpenseAction("expense-1"), /Oturum gerekli/);
    active = true;
    assert.deepEqual(deleted, []);
  });

  await t.test("invalid IDs never reach the delete query", async () => {
    deleteRecord.mock.resetCalls();
    for (const id of ["", "  ", "x".repeat(65), undefined, null, {}]) {
      await assert.rejects(deleteExpenseAction(id as string));
    }
    assert.equal(deleteRecord.mock.callCount(), 0);
  });

  await t.test("invoice IDs and missing expenses fail without refreshing totals", async () => {
    for (const id of ["purchase-invoice-1", "missing-expense"]) {
      await assert.rejects(deleteExpenseAction(id), /Record not found/);
    }
    assert.deepEqual(deleted, []);
    assert.deepEqual(paths, []);
    assert.deepEqual(tags, []);
  });
});
