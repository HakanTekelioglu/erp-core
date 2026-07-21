import assert from "node:assert/strict";
import test from "node:test";
import { calculateLineTotal, calculateOrderTotals } from "./order-totals";

test("calculates a discounted sales line after applying the discount", () => {
  const total = calculateLineTotal({
    quantity: 2,
    unitPrice: 100,
    vatRate: 20,
    discount: 10
  });

  assert.equal(total, 228);
});

test("aggregates sales and purchase items through the same totals rule", () => {
  const totals = calculateOrderTotals([
    { quantity: 2, unitPrice: 100, vatRate: 20, discount: 10 },
    { quantity: 1, unitPrice: 50, vatRate: 10 }
  ]);

  assert.deepEqual(totals, {
    subtotal: 250,
    discount: 10,
    vatTotal: 43,
    grandTotal: 283
  });
});
