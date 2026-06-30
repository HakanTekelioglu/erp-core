"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { updateCompanySettings } from "@/services/settings-service";

export async function updateSettingsAction(input: SettingsInput) {
  const data = settingsSchema.parse(input);

  await updateCompanySettings(data);

  revalidatePath("/settings");
  revalidatePath("/invoices");
  revalidatePath("/sales");
  revalidatePath("/purchases");
}
