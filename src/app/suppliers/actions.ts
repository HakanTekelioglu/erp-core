"use server";

import { revalidatePath } from "next/cache";
import { activateSupplier, createSupplier, deactivateSupplier, deleteSupplier } from "@/services/supplier-service";
import { supplierSchema, type SupplierInput } from "@/lib/validations/supplier";

export async function createSupplierAction(input: SupplierInput) {
  const data = supplierSchema.parse(input);

  await createSupplier({
    ...data,
    companyName: data.companyName.trim(),
    contactPerson: data.contactPerson?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    taxNumber: data.taxNumber?.trim() || undefined
  });

  revalidatePath("/suppliers");
}

export async function deactivateSupplierAction(id: string) {
  await deactivateSupplier(id);

  revalidatePath("/suppliers");
}

export async function activateSupplierAction(id: string) {
  await activateSupplier(id);

  revalidatePath("/suppliers");
}

export async function deleteSupplierAction(id: string) {
  await deleteSupplier(id);

  revalidatePath("/suppliers");
}
