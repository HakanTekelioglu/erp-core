"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { activateProduct, createProduct, deactivateProduct, deleteProduct } from "@/services/product-service";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export async function createProductAction(input: ProductInput) {
  await requirePathAccess("/products");
  const data = productSchema.parse(input);

  await createProduct({
    ...data,
    barcode: data.barcode?.trim() || undefined
  });

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function deactivateProductAction(id: string) {
  await requirePathAccess("/products");
  await deactivateProduct(id);

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function activateProductAction(id: string) {
  await requirePathAccess("/products");
  await activateProduct(id);

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function deleteProductAction(id: string) {
  await requirePathAccess("/products");
  await deleteProduct(id);

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}
