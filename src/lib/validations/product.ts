import { z } from "zod";

export const productSchema = z.object({
  code: z.string().min(2, "Urun kodu gerekli"),
  barcode: z.string().optional(),
  name: z.string().min(2, "Urun adi gerekli"),
  categoryId: z.string().min(1, "Kategori secin"),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100),
  unit: z.enum(["ADET", "KG", "LITRE", "PAKET"]),
  minimumStockLevel: z.coerce.number().min(0),
  isActive: z.coerce.boolean()
});

export type ProductInput = z.infer<typeof productSchema>;
