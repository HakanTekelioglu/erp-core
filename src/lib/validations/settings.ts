import { z } from "zod";

export const settingsSchema = z.object({
  companyName: z.string().trim().min(2, "Sirket adi gerekli"),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Gecerli bir e-posta girin").optional().or(z.literal("")),
  taxNumber: z.string().trim().optional(),
  defaultCurrency: z.enum(["TRY", "USD", "EUR"]),
  defaultVatRate: z.coerce.number().min(0, "KDV 0'dan kucuk olamaz").max(100, "KDV 100'u gecemez"),
  invoicePrefix: z.string().trim().min(1, "Fatura prefix gerekli").max(12, "En fazla 12 karakter"),
  nextInvoiceCounter: z.coerce.number().int("Sira numarasi tam sayi olmali").min(1, "Sira numarasi 1 veya daha buyuk olmali"),
  address: z.string().trim().optional()
});

export type SettingsInput = z.infer<typeof settingsSchema>;
