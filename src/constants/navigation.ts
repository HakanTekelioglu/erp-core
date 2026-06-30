import {
  BarChart3,
  Boxes,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  WalletCards
} from "lucide-react";
import type { Role } from "@prisma/client";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const allRoles: Role[] = ["ADMIN", "MANAGER", "SALES", "WAREHOUSE", "ACCOUNTING"];

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: allRoles },
  { label: "Urunler", href: "/products", icon: Package, roles: ["ADMIN", "MANAGER", "WAREHOUSE", "SALES"] },
  { label: "Kategoriler", href: "/categories", icon: Tags, roles: ["ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Stok", href: "/stock", icon: Boxes, roles: ["ADMIN", "MANAGER", "WAREHOUSE", "ACCOUNTING"] },
  { label: "Musteriler", href: "/customers", icon: Users, roles: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"] },
  { label: "Tedarikciler", href: "/suppliers", icon: Truck, roles: ["ADMIN", "MANAGER", "WAREHOUSE", "ACCOUNTING"] },
  { label: "Satis", href: "/sales", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "SALES"] },
  { label: "Satin Alma", href: "/purchases", icon: Building2, roles: ["ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Faturalar", href: "/invoices", icon: ReceiptText, roles: ["ADMIN", "MANAGER", "ACCOUNTING", "SALES"] },
  { label: "Odemeler", href: "/payments", icon: CreditCard, roles: ["ADMIN", "MANAGER", "ACCOUNTING"] },
  { label: "Giderler", href: "/expenses", icon: WalletCards, roles: ["ADMIN", "MANAGER", "ACCOUNTING"] },
  { label: "Raporlar", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER", "ACCOUNTING"] },
  { label: "Ayarlar", href: "/settings", icon: Settings, roles: ["ADMIN", "MANAGER"] },
  { label: "Kullanicilar", href: "/users", icon: FileText, roles: ["ADMIN"] }
];
