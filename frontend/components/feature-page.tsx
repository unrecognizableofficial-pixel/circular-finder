"use client";

import type { ReactNode } from "react";

export function FeaturePage({
  eyebrow,
  title,
  description,
  highlights,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  children?: ReactNode;
}) {
  return (
    <section className="grid gap-6">
      <div className="rounded-shell border border-white/70 bg-gradient-to-br from-sage-100/90 via-white to-sand-100/90 p-6 shadow-soft sm:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-forest-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">{description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span key={item} className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800 shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {children}
    </section>
  );
}
