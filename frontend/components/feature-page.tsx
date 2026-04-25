"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlatform } from "@/components/platform-state";

export function FeaturePage({
  eyebrow,
  title,
  description,
  highlights,
  steps,
  actions,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  steps?: string[];
  actions?: Array<{ href: string; label: string }>;
  children?: ReactNode;
}) {
  const { accessibilityMode } = usePlatform();
  const helpSteps =
    steps && steps.length > 0
      ? steps
      : [
          "Start with the first large card or control on this page.",
          "Use one filter, tab, or button at a time so the result is easy to follow.",
          "Use the linked actions below to keep moving through the demo."
        ];

  return (
    <section className="grid gap-6">
      <div
        className={[
          "theme-shell rounded-shell border border-white/70 bg-gradient-to-br from-sage-100/90 via-white to-sand-100/90 shadow-soft",
          accessibilityMode ? "p-7 sm:p-9" : "p-6 sm:p-8"
        ].join(" ")}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-forest-700">{eyebrow}</p>
        <h1 className={["mt-3 font-semibold tracking-tight text-stone-900", accessibilityMode ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"].join(" ")}>{title}</h1>
        <p className={["mt-4 max-w-3xl text-stone-600", accessibilityMode ? "text-base leading-8 sm:text-lg" : "text-sm leading-7 sm:text-base"].join(" ")}>{description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span key={item} className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800 shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="theme-shell flex flex-col gap-4 rounded-shell border border-white/70 bg-white/82 p-5 shadow-soft backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-forest-700">Start Here</p>
          <p className="mt-2 text-base font-semibold tracking-tight text-stone-900">{helpSteps[0]}</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {accessibilityMode ? "Accessibility mode is on." : "Need a simpler reading view? Open Settings and turn on Accessibility mode."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(actions ?? []).slice(0, 2).map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className="rounded-full bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-800"
            >
              {action.label}
            </Link>
          ))}
          <Link
            href="/settings"
            className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-sand-50"
          >
            Settings
          </Link>
        </div>
      </div>

      {children}
    </section>
  );
}
