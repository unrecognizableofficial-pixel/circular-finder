"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Leaf, Settings2, ShoppingBag, UserRound, Users } from "lucide-react";

const tabs = [
  { label: "Profiles", href: "/profiles", icon: UserRound },
  { label: "Rewards", href: "/impact", icon: Award },
  { label: "Community", href: "/feed", icon: Users },
  { label: "Shop", href: "/marketplace", icon: ShoppingBag },
  { label: "Sustainability", href: "/sustainability", icon: Leaf },
  { label: "Settings", href: "/settings", icon: Settings2 }
];

export default function GlobalNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Global sections">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition duration-300",
              active
                ? "bg-forest-900 text-white shadow-soft"
                : "border border-white/60 bg-white/70 text-stone-700 backdrop-blur hover:-translate-y-0.5 hover:bg-white"
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            <span className="relative z-10">{tab.label}</span>
            {!active ? (
              <span className="absolute inset-0 bg-gradient-to-r from-sage-100/0 via-sage-100/70 to-sand-100/0 opacity-0 transition group-hover:opacity-100" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
