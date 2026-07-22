import { getCurrentUser } from "@/lib/auth";
import { canAccessPath } from "@/lib/permissions";
import { z } from "zod";

const entityIdSchema = z.string().trim().min(1).max(64);

export async function requirePathAccess(pathname: string, entityId?: string) {
  const session = await getCurrentUser();
  const role = session?.user?.role;

  if (!role) {
    throw new Error("Oturum gerekli");
  }

  if (!canAccessPath(role, pathname)) {
    throw new Error("Bu islem icin yetkiniz yok");
  }

  if (entityId !== undefined) entityIdSchema.parse(entityId);

  return session;
}
