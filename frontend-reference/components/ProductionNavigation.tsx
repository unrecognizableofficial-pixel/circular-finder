import * as React from "react";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

type ProductionNavigationProps = {
  currentPath: string;
  userName?: string;
  items?: NavigationItem[];
};

const defaultItems: NavigationItem[] = [
  { label: "Scanner", href: "/scanner", icon: <PassportIcon /> },
  { label: "Styling", href: "/styling", icon: <StylingIcon /> },
  { label: "Suppliers", href: "/suppliers", icon: <MapIcon /> },
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Marketplace", href: "/marketplace", icon: <MarketplaceIcon /> },
  { label: "Profile", href: "/profile", icon: <ProfileIcon /> },
];

export function ProductionNavigation({
  currentPath,
  userName = "Account",
  items = defaultItems,
}: ProductionNavigationProps) {
  return (
    <>
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-stone-200 lg:bg-stone-50/95 lg:px-5 lg:py-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-sm font-semibold tracking-[0.24em] text-white">
            CF
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-700">
              Sustainable Fashion Platform
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">Circular Finder</h1>
          </div>
        </div>

        <nav aria-label="Primary" className="space-y-2">
          {items.map((item) => {
            const active = isActive(currentPath, item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex items-center justify-between rounded-2xl px-4 py-3 transition",
                  active
                    ? "bg-emerald-900 text-white shadow-lg shadow-emerald-950/10"
                    : "text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-sm",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                      active
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-stone-200 bg-white text-emerald-800 group-hover:border-emerald-100",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </span>
                {item.badge ? (
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      active ? "bg-white/15 text-white" : "bg-emerald-100 text-emerald-900",
                    ].join(" ")}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700">Signed in</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{userName}</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Track wardrobe impact, manage verified listings, and review passport history from one place.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-700">
              Sustainable Fashion Platform
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-stone-900">Circular Finder</h1>
          </div>
          <a
            href="/profile"
            className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 shadow-sm"
          >
            {initials(userName)}
          </a>
        </div>
      </header>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-stone-50/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-6 gap-1">
          {items.map((item) => {
            const active = isActive(currentPath, item.href);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition",
                    active ? "bg-emerald-900 text-white" : "text-stone-500 hover:bg-white hover:text-stone-900",
                  ].join(" ")}
                >
                  <span className="flex h-8 w-8 items-center justify-center">{item.icon}</span>
                  <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function isActive(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function iconProps() {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function PassportIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v10A2.5 2.5 0 0 1 17 19.5H7A2.5 2.5 0 0 1 4.5 17V7A2.5 2.5 0 0 1 7 4.5Z" />
      <path d="M8 8h8M8 12h5M8 16h8" />
    </svg>
  );
}

function StylingIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 3.5 14 8l4.5 1.6-3.3 3 .9 4.8L12 15l-4.1 2.4.9-4.8-3.3-3L10 8l2-4.5Z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg {...iconProps()}>
      <path d="m4.5 6 5-2 5 2 5-2v14l-5 2-5-2-5 2V6Z" />
      <path d="M9.5 4v14M14.5 6v14" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 19V9m7 10V5m7 14v-7" />
    </svg>
  );
}

function MarketplaceIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
      <path d="M9 8.5v-1a3 3 0 1 1 6 0v1" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}
