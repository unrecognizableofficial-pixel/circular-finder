"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { platformNavigation } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformNavigation({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:gap-6 lg:border-r lg:border-stone-200 lg:bg-stone-50/90 lg:px-5 lg:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-sm font-semibold tracking-[0.26em] text-white">
            CF
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-forest-700">Sustainable Fashion Platform</p>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">Circular Finder</h1>
          </div>
        </div>

        <nav aria-label="Primary" className="space-y-2">
          {platformNavigation.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active ? "bg-forest-900 text-white shadow-soft" : "text-stone-600 hover:bg-white hover:text-stone-900"
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                    active ? "border-white/20 bg-white/10" : "border-stone-200 bg-white text-forest-800"
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.75rem] border border-forest-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-forest-700">Production Session</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{userLabel}</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Live wardrobe analytics, verified supplier changes, real-time marketplace listings, and digital passport activity.
          </p>
        </div>
      </aside>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-stone-50/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-6 gap-1">
          {platformNavigation.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition",
                    active ? "bg-forest-900 text-white" : "text-stone-500 hover:bg-white hover:text-stone-900"
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium leading-tight">{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
