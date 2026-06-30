import { z } from "zod";

export const supplierSchema = z.object({
  companyName: z.string().min(2, "Firma adi gerekli"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Gecerli e-posta girin").optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  isActive: z.coerce.boolean()
});

export type SupplierInput = z.infer<typeof supplierSchema>;
