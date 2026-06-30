import type { Role } from "@prisma/client";
import { navigationItems } from "@/constants/navigation";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Yonetici",
  SALES: "Satis",
  WAREHOUSE: "Depo",
  ACCOUNTING: "Muhasebe"
};

export function canAccessPath(role: Role, pathname: string) {
  const item = navigationItems
    .filter((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (!item) return true;
  return item.roles.includes(role);
}

export function getMenuForRole(role: Role) {
  return navigationItems.filter((item) => item.roles.includes(role));
}
