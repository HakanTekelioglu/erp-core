import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Ad soyad gerekli"),
  email: z.string().email("Gecerli e-posta girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
  role: z.enum(["ADMIN", "MANAGER", "SALES", "WAREHOUSE", "ACCOUNTING"]),
  isActive: z.coerce.boolean()
});

export type UserInput = z.infer<typeof userSchema>;
