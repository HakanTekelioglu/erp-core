import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserInput } from "@/lib/validations/user";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createUser(input: UserInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: input.isActive
    }
  });
}

export async function deactivateUser(id: string) {
  return prisma.user.update({ where: { id }, data: { isActive: false } });
}

export async function activateUser(id: string) {
  return prisma.user.update({ where: { id }, data: { isActive: true } });
}
