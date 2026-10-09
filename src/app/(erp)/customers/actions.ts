"use server";

import { revalidatePaths, cacheAreas } from "@/app/_shared/revalidation";
import { requirePathAccess } from "@/lib/action-auth";
import { activateCustomer, createCustomer, deactivateCustomer, deleteCustomer } from "@/services/customer-service";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";

export async function createCustomerAction(input: CustomerInput) {
  await requirePathAccess("/customers");
  const data = customerSchema.parse(input);

  await createCustomer({
    ...data,
    name: data.name.trim(),
    phone: data.phone?.trim() || undefined,
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    taxNumber: data.taxNumber?.trim() || undefined
  });

  revalidatePaths("/customers", cacheAreas.overview);
}

export async function deactivateCustomerAction(id: string) {
  await requirePathAccess("/customers", id);
  await deactivateCustomer(id);

  revalidatePaths("/customers", cacheAreas.overview, `/customers/${id}`);
}

export async function activateCustomerAction(id: string) {
  await requirePathAccess("/customers", id);
  await activateCustomer(id);

  revalidatePaths("/customers", cacheAreas.overview, `/customers/${id}`);
}

export async function deleteCustomerAction(id: string) {
  await requirePathAccess("/customers", id);
  await deleteCustomer(id);

  revalidatePaths("/customers", cacheAreas.overview);
}
