"use server";

import { revalidatePath } from "next/cache";
import { activateUser, createUser, deactivateUser } from "@/services/user-service";
import { userSchema, type UserInput } from "@/lib/validations/user";

export async function createUserAction(input: UserInput) {
  const data = userSchema.parse(input);

  await createUser({
    ...data,
    name: data.name.trim(),
    email: data.email.trim().toLocaleLowerCase("tr-TR")
  });

  revalidatePath("/users");
}

export async function deactivateUserAction(id: string) {
  await deactivateUser(id);

  revalidatePath("/users");
}

export async function activateUserAction(id: string) {
  await activateUser(id);

  revalidatePath("/users");
}
