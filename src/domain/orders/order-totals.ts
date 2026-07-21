export type OrderLine = {
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount?: number;
};

export type OrderTotals = {
  subtotal: number;
  discount: number;
  vatTotal: number;
  grandTotal: number;
};

export function calculateLineTotal({
  quantity,
  unitPrice,
  vatRate,
  discount = 0
}: OrderLine) {
  const netTotal = quantity * unitPrice - discount;

  return netTotal + netTotal * (vatRate / 100);
}

export function calculateOrderTotals(items: readonly OrderLine[]): OrderTotals {
  return items.reduce<OrderTotals>(
    (totals, item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineDiscount = item.discount ?? 0;
      const lineNetTotal = lineSubtotal - lineDiscount;

      totals.subtotal += lineSubtotal;
      totals.discount += lineDiscount;
      totals.vatTotal += lineNetTotal * (item.vatRate / 100);
      totals.grandTotal += calculateLineTotal(item);

      return totals;
    },
    { subtotal: 0, discount: 0, vatTotal: 0, grandTotal: 0 }
  );
}
