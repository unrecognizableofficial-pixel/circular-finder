"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, MapPinned, ScanLine, Settings2, ShieldCheck, Shirt, ShoppingBag } from "lucide-react";
import { usePlatform } from "@/components/platform-state";
import { StreakLogo } from "@/components/streak-logo";
import type { DemoCapability } from "@/lib/roles";

type NavItem = {
  label: string;
  href: string;
  capability: DemoCapability;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", capability: "analytics.role", icon: BarChart3 },
  { label: "Scan", href: "/scanner", capability: "scanner.use", icon: ScanLine },
  { label: "Style", href: "/styling", capability: "style.use", icon: Shirt },
  { label: "Shop", href: "/marketplace", capability: "marketplace.browse", icon: ShoppingBag },
  { label: "Suppliers", href: "/suppliers", capability: "supplier.view", icon: MapPinned },
  { label: "Settings", href: "/settings", capability: "settings.access", icon: Settings2 }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformNavigation() {
  const pathname = usePathname();
  const { selectedRole, canAccess, notifications, complianceScore, streak } = usePlatform();

  return (
    <>
      <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:gap-4 lg:border-r lg:border-white/60 lg:bg-white/50 lg:px-6 lg:py-6 lg:backdrop-blur-xl">
        <div className="theme-shell rounded-shell border border-white/70 bg-gradient-to-br from-stone-950 via-forest-900 to-sage-700 p-5 text-white shadow-shell">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Circular Finder</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Scan. Fit. Impact.</h1>
        </div>

        <nav aria-label="Primary tools" className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const allowed = canAccess(item.capability);
            const Icon = item.icon;
            const className = [
              "theme-shell group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition",
              active ? "bg-forest-900 text-white shadow-soft" : "border border-white/70 bg-white/75 text-stone-700 backdrop-blur-xl",
              !allowed ? "opacity-45" : "hover:-translate-y-0.5 hover:bg-white"
            ].join(" ");

            if (!allowed) {
              return (
                <div key={item.href} className={className} aria-disabled="true">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-sand-50 text-forest-900">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-stone-500">Other role</p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl border",
                      active ? "border-white/15 bg-white/10" : "border-stone-200 bg-sand-50 text-forest-900"
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <span className={active ? "text-white/70" : "text-stone-400"}>↗</span>
              </Link>
            );
          })}
        </nav>

        <div className="theme-shell rounded-shell border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Role</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{selectedRole?.label ?? "Choose a role"}</h2>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Score
              </span>
              <span className="font-semibold text-stone-900">{complianceScore}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-stone-950 px-4 py-3 text-sm text-white">
              <span>{notifications.length} alerts</span>
              <StreakLogo days={streak.days} state={streak.visualState} size="xs" showDayBadge />
            </div>
          </div>
        </div>
      </aside>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const allowed = canAccess(item.capability);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                {allowed ? (
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition",
                      active ? "bg-forest-900 text-white" : "text-stone-500 hover:bg-sand-50 hover:text-stone-900"
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </Link>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-stone-300">
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
