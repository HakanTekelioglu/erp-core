"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { activateSupplier, createSupplier, deactivateSupplier, deleteSupplier } from "@/services/supplier-service";
import { supplierSchema, type SupplierInput } from "@/lib/validations/supplier";

export async function createSupplierAction(input: SupplierInput) {
  await requirePathAccess("/suppliers", id);
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
  await requirePathAccess("/suppliers", id);
  await deactivateSupplier(id);

  revalidatePath("/suppliers");
}

export async function activateSupplierAction(id: string) {
  await requirePathAccess("/suppliers", id);
  await activateSupplier(id);

  revalidatePath("/suppliers");
}

export async function deleteSupplierAction(id: string) {
  await requirePathAccess("/suppliers");
  await deleteSupplier(id);

  revalidatePath("/suppliers");
}
