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

export type NavGroup = "Genel" | "Envanter" | "Ticaret" | "Finans" | "Yonetim";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  group: NavGroup;
};

export const navigationGroups: NavGroup[] = ["Genel", "Envanter", "Ticaret", "Finans", "Yonetim"];

const allRoles: Role[] = ["ADMIN", "MANAGER", "SALES", "WAREHOUSE", "ACCOUNTING"];

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: allRoles, group: "Genel" },
  { label: "Raporlar", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER", "ACCOUNTING"], group: "Genel" },
  { label: "Urunler", href: "/products", icon: Package, roles: ["ADMIN", "MANAGER", "WAREHOUSE", "SALES"], group: "Envanter" },
  { label: "Kategoriler", href: "/categories", icon: Tags, roles: ["ADMIN", "MANAGER", "WAREHOUSE"], group: "Envanter" },
  { label: "Stok", href: "/stock", icon: Boxes, roles: ["ADMIN", "MANAGER", "WAREHOUSE", "ACCOUNTING"], group: "Envanter" },
  { label: "Musteriler", href: "/customers", icon: Users, roles: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"], group: "Ticaret" },
  { label: "Tedarikciler", href: "/suppliers", icon: Truck, roles: ["ADMIN", "MANAGER", "WAREHOUSE", "ACCOUNTING"], group: "Ticaret" },
  { label: "Satis", href: "/sales", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "SALES"], group: "Ticaret" },
  { label: "Satin Alma", href: "/purchases", icon: Building2, roles: ["ADMIN", "MANAGER", "WAREHOUSE"], group: "Ticaret" },
  { label: "Faturalar", href: "/invoices", icon: ReceiptText, roles: ["ADMIN", "MANAGER", "ACCOUNTING", "SALES"], group: "Finans" },
  { label: "Odemeler", href: "/payments", icon: CreditCard, roles: ["ADMIN", "MANAGER", "ACCOUNTING"], group: "Finans" },
  { label: "Giderler", href: "/expenses", icon: WalletCards, roles: ["ADMIN", "MANAGER", "ACCOUNTING"], group: "Finans" },
  { label: "Ayarlar", href: "/settings", icon: Settings, roles: ["ADMIN", "MANAGER"], group: "Yonetim" },
  { label: "Kullanicilar", href: "/users", icon: FileText, roles: ["ADMIN"], group: "Yonetim" }
];
