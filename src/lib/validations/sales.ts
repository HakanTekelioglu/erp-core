import { z } from "zod";

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0)
});

export const salesOrderSchema = z.object({
  customerId: z.string().min(1, "Musteri secin"),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"]),
  items: z.array(salesOrderItemSchema).min(1, "En az bir urun ekleyin")
});

export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
