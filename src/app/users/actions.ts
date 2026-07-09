"use server";

import { revalidatePath } from "next/cache";
import { requirePathAccess } from "@/lib/action-auth";
import { activateUser, createUser, deactivateUser } from "@/services/user-service";
import { userSchema, type UserInput } from "@/lib/validations/user";

export async function createUserAction(input: UserInput) {
  await requirePathAccess("/users");
  const data = userSchema.parse(input);

  await createUser({
    ...data,
    name: data.name.trim(),
    email: data.email.trim().toLocaleLowerCase("tr-TR")
  });

  revalidatePath("/users");
}

export async function deactivateUserAction(id: string) {
  await requirePathAccess("/users");
  await deactivateUser(id);

  revalidatePath("/users");
}

export async function activateUserAction(id: string) {
  await requirePathAccess("/users");
  await activateUser(id);

  revalidatePath("/users");
}
