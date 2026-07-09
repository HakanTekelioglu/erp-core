import { getCurrentUser } from "@/lib/auth";
import { canAccessPath } from "@/lib/permissions";

export async function requirePathAccess(pathname: string) {
  const session = await getCurrentUser();
  const role = session?.user?.role;

  if (!role) {
    throw new Error("Oturum gerekli");
  }

  if (!canAccessPath(role, pathname)) {
    throw new Error("Bu islem icin yetkiniz yok");
  }

  return session;
}
