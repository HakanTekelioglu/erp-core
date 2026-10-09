"use server";

import { revalidatePaths, cacheAreas } from "@/app/_shared/revalidation";
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

  revalidatePaths("/products", cacheAreas.overview, "/stock");
}

export async function deactivateProductAction(id: string) {
  await requirePathAccess("/products", id);
  await deactivateProduct(id);

  revalidatePaths("/products", cacheAreas.overview, "/stock");
}

export async function activateProductAction(id: string) {
  await requirePathAccess("/products", id);
  await activateProduct(id);

  revalidatePaths("/products", cacheAreas.overview, "/stock");
}

export async function deleteProductAction(id: string) {
  await requirePathAccess("/products", id);
  await deleteProduct(id);

  revalidatePaths("/products", cacheAreas.overview, "/stock");
}
