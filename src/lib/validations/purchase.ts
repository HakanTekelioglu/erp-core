import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100)
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Tedarikci secin"),
  status: z.enum(["DRAFT", "ORDERED"]),
  items: z.array(purchaseOrderItemSchema).min(1, "En az bir urun ekleyin")
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
