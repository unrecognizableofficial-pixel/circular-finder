"use client";

import * as React from "react";
import { Bell, Search } from "lucide-react";
import { PlatformNavigation } from "@/components/platform-navigation";
import { usePlatform } from "@/components/platform-state";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { userLabel } = usePlatform();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <PlatformNavigation userLabel={userLabel} />

      <div className="pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-sand-50/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-forest-700">Live Operations</p>
              <h2 className="truncate text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
                Sustainable Fashion Platform
              </h2>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <label className="glass-surface flex min-w-[20rem] items-center gap-2 rounded-2xl border border-white/60 px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-stone-400" />
                <input
                  type="search"
                  placeholder="Search garments, suppliers, certifications"
                  className="w-full border-0 bg-transparent p-0 text-sm text-stone-700 placeholder:text-stone-400 focus:ring-0"
                />
              </label>

              <div className="glass-surface inline-flex items-center gap-2 rounded-2xl border border-white/60 px-4 py-3 text-sm text-stone-600 shadow-sm">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Supplier sync live
              </div>

              <button
                type="button"
                className="glass-surface inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 text-stone-700 shadow-sm"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
