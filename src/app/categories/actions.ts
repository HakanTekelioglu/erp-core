"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { activateCategory, createCategory, deactivateCategory, deleteCategory } from "@/services/category-service";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export async function createCategoryAction(input: CategoryInput) {
  await requirePathAccess("/categories", id);
  const data = categorySchema.parse(input);

  await createCategory({
    ...data,
    name: data.name.trim(),
    description: data.description?.trim() || undefined
  });

  revalidatePath("/categories");
  revalidatePath("/products/new");
}

export async function deactivateCategoryAction(id: string) {
  await requirePathAccess("/categories", id);
  await deactivateCategory(id);

  revalidatePath("/categories");
  revalidatePath("/products/new");
}

export async function activateCategoryAction(id: string) {
  await requirePathAccess("/categories", id);
  await activateCategory(id);

  revalidatePath("/categories");
  revalidatePath("/products/new");
}

export async function deleteCategoryAction(id: string) {
  await requirePathAccess("/categories");
  await deleteCategory(id);

  revalidatePath("/categories");
  revalidatePath("/products/new");
}
