"use server";

import { revalidatePaths, cacheAreas } from "@/app/_shared/revalidation";
import { requirePathAccess } from "@/lib/action-auth";
import { activateCategory, createCategory, deactivateCategory, deleteCategory } from "@/services/category-service";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export async function createCategoryAction(input: CategoryInput) {
  await requirePathAccess("/categories");
  const data = categorySchema.parse(input);

  await createCategory({
    ...data,
    name: data.name.trim(),
    description: data.description?.trim() || undefined
  });

  revalidatePaths("/categories", cacheAreas.overview, "/products/new");
}

export async function deactivateCategoryAction(id: string) {
  await requirePathAccess("/categories", id);
  await deactivateCategory(id);

  revalidatePaths("/categories", cacheAreas.overview, "/products/new");
}

export async function activateCategoryAction(id: string) {
  await requirePathAccess("/categories", id);
  await activateCategory(id);

  revalidatePaths("/categories", cacheAreas.overview, "/products/new");
}

export async function deleteCategoryAction(id: string) {
  await requirePathAccess("/categories", id);
  await deleteCategory(id);

  revalidatePaths("/categories", cacheAreas.overview, "/products/new");
}
