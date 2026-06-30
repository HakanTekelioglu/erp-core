import { prisma } from "@/lib/prisma";
import type { SettingsInput } from "@/lib/validations/settings";

export async function getCompanySettings() {
  const setting = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (setting) return setting;

  return prisma.companySetting.create({
    data: {
      companyName: "Kucuk Isletme ERP Sistemi",
      address: "Istanbul",
      phone: "+90 212 000 00 00",
      email: "info@minierp.local",
      taxNumber: "1234567890",
      defaultCurrency: "TRY",
      defaultVatRate: 20,
      invoicePrefix: "ERP",
      nextInvoiceCounter: 1
    }
  });
}

export async function updateCompanySettings(input: SettingsInput) {
  const existing = await getCompanySettings();

  return prisma.companySetting.update({
    where: { id: existing.id },
    data: {
      companyName: input.companyName,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
      taxNumber: input.taxNumber || null,
      defaultCurrency: input.defaultCurrency,
      defaultVatRate: input.defaultVatRate,
      invoicePrefix: input.invoicePrefix,
      nextInvoiceCounter: input.nextInvoiceCounter
    }
  });
}
