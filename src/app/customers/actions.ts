"use server";

import { revalidatePath } from "next/cache";
import { activateCustomer, createCustomer, deactivateCustomer, deleteCustomer } from "@/services/customer-service";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";

export async function createCustomerAction(input: CustomerInput) {
  const data = customerSchema.parse(input);

  await createCustomer({
    ...data,
    name: data.name.trim(),
    phone: data.phone?.trim() || undefined,
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    taxNumber: data.taxNumber?.trim() || undefined
  });

  revalidatePath("/customers");
}

export async function deactivateCustomerAction(id: string) {
  await deactivateCustomer(id);

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

export async function activateCustomerAction(id: string) {
  await activateCustomer(id);

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomerAction(id: string) {
  await deleteCustomer(id);

  revalidatePath("/customers");
}
