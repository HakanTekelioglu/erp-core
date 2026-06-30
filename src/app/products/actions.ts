"use server";

import { revalidatePath } from "next/cache";
import { activateProduct, createProduct, deactivateProduct, deleteProduct } from "@/services/product-service";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export async function createProductAction(input: ProductInput) {
  const data = productSchema.parse(input);

  await createProduct({
    ...data,
    barcode: data.barcode?.trim() || undefined
  });

  revalidatePath("/products");
  revalidatePath("/stock");
}

export async function deactivateProductAction(id: string) {
  await deactivateProduct(id);

  revalidatePath("/products");
  revalidatePath("/stock");
}

export async function activateProductAction(id: string) {
  await activateProduct(id);

  revalidatePath("/products");
  revalidatePath("/stock");
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);

  revalidatePath("/products");
  revalidatePath("/stock");
}
