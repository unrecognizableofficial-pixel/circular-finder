import type { LucideIcon } from "lucide-react";
import { BarChart3, MapPinned, ScanLine, Shirt, ShoppingBag, UserRound } from "lucide-react";

export type PlatformNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  shortLabel: string;
};

export const platformNavigation: PlatformNavigationItem[] = [
  { label: "Scanner", shortLabel: "Scan", href: "/scanner", icon: ScanLine },
  { label: "Styling", shortLabel: "Style", href: "/styling", icon: Shirt },
  { label: "Suppliers", shortLabel: "Map", href: "/suppliers", icon: MapPinned },
  { label: "Dashboard", shortLabel: "Impact", href: "/dashboard", icon: BarChart3 },
  { label: "Marketplace", shortLabel: "Resale", href: "/marketplace", icon: ShoppingBag },
  { label: "Profile", shortLabel: "Profile", href: "/profile", icon: UserRound }
];
