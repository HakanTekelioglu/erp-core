"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { updateCompanySettings } from "@/services/settings-service";

export async function updateSettingsAction(input: SettingsInput) {
  await requirePathAccess("/settings");
  const data = settingsSchema.parse(input);

  await updateCompanySettings(data);

  revalidatePath("/settings");
  revalidatePath("/invoices");
  revalidatePath("/sales");
  revalidatePath("/purchases");
}
