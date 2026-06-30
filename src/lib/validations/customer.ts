import { z } from "zod";

export const customerSchema = z.object({
  type: z.enum(["INDIVIDUAL", "CORPORATE"]),
  name: z.string().min(2, "Musteri adi gerekli"),
  phone: z.string().optional(),
  email: z.string().email("Gecerli e-posta girin").optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  isActive: z.coerce.boolean()
});

export type CustomerInput = z.infer<typeof customerSchema>;
