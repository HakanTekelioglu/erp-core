"use server";

import { revalidatePath } from "next/cache";
import { activateCategory, createCategory, deactivateCategory, deleteCategory } from "@/services/category-service";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export async function createCategoryAction(input: CategoryInput) {
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
  await deactivateCategory(id);

  revalidatePath("/categories");
  revalidatePath("/products/new");
}

export async function activateCategoryAction(id: string) {
  await activateCategory(id);

  revalidatePath("/categories");
  revalidatePath("/products/new");
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);

  revalidatePath("/categories");
  revalidatePath("/products/new");
}
