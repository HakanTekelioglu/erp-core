import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Kategori adi gerekli"),
  description: z.string().optional(),
  isActive: z.coerce.boolean()
});

export type CategoryInput = z.infer<typeof categorySchema>;
