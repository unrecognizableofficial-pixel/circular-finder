"use client";

import * as React from "react";
import { ArrowRight, Crown, Layers3, Shield, Sparkles, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import DemoPreviewPlayer from "@/components/demo-preview-remotion-player";
import { usePlatform } from "@/components/platform-state";
import { roles, type DemoRole, type DemoRoleId } from "@/lib/roles";

const iconMap = {
  Crown,
  Shield,
  Layers3,
  Sparkles,
  Store,
  UserRound
};

const roleCardCopy: Record<
  DemoRoleId,
  {
    summary: string;
    toolHighlights: string[];
  }
> = {
  "master-admin": {
    summary: "Best for the team overseeing the whole brand, its rules, and the overall business view.",
    toolHighlights: ["Brand approvals", "Policy tools"]
  },
  "compliance-admin": {
    summary: "Best for the team that reviews policy problems and helps accounts get back to a safe status.",
    toolHighlights: ["Alerts", "Training"]
  },
  "sub-brand-manager": {
    summary: "Best for the team running one brand or sub-brand day to day.",
    toolHighlights: ["Campaigns", "Listings"]
  },
  creator: {
    summary: "Best for creators sharing products, stories, and community content.",
    toolHighlights: ["Posts", "Growth"]
  },
  vendor: {
    summary: "Best for marketplace sellers managing products and customer orders.",
    toolHighlights: ["Inventory", "Orders"]
  },
  user: {
    summary: "Best for everyday shoppers and community members exploring the app.",
    toolHighlights: ["Fit check", "Discovery"]
  }
};

export default function RoleSelection() {
  const router = useRouter();
  const { selectRole, selectedRoleId, themeMode } = usePlatform();
  const [selected, setSelected] = React.useState<DemoRole | null>(null);
  const [entered, setEntered] = React.useState(false);
  const roleSectionRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const handleSelect = React.useCallback(
    (role: DemoRole) => {
      setSelected(role);
      selectRole(role.id);
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 280);
    },
    [router, selectRole]
  );

  const handleEnterDemo = React.useCallback(() => {
    setEntered(true);
    window.setTimeout(() => {
      roleSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const isDarkTheme = themeMode === "dark";

  return (
    <div
      className={
        isDarkTheme
          ? "min-h-screen bg-[linear-gradient(180deg,_#1c2225_0%,_#252c2f_30%,_#d9dfdb_30.1%,_#eef2ef_100%)]"
          : "min-h-screen bg-[linear-gradient(180deg,_#f5fbf6_0%,_#eaf3eb_30%,_#ede7dc_30.1%,_#f5f0e7_100%)]"
      }
    >
      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-[1560px] space-y-6">
          <div
            className={[
              "theme-shell rounded-[2.75rem] p-6 shadow-shell backdrop-blur-xl sm:p-8 lg:p-10",
              isDarkTheme
                ? "border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.12),_transparent_28%),linear-gradient(180deg,_rgba(31,38,42,0.96),_rgba(23,29,32,0.94))]"
                : "border border-forest-200/80 bg-[radial-gradient(circle_at_top,_rgba(143,194,151,0.16),_transparent_28%),linear-gradient(180deg,_rgba(252,254,252,0.96),_rgba(237,244,237,0.94))]"
            ].join(" ")}
          >
            <div className="max-w-5xl">
              <div className="flex flex-wrap gap-2">
                {["Play preview", "Choose a role"].map((pill) => (
                  <span
                    key={pill}
                    className={[
                      "rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
                      isDarkTheme ? "border border-white/12 bg-white/6 text-white/78" : "border border-forest-200/75 bg-forest-50 text-forest-900"
                    ].join(" ")}
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <h1 className={["mt-6 max-w-5xl font-semibold tracking-tight", isDarkTheme ? "text-white" : "text-forest-950"].join(" ")}>
                <span className="block text-6xl leading-[0.9] sm:text-7xl xl:text-[7.8rem]">Circular Finder</span>
                <span className={["mt-5 block text-3xl leading-tight sm:text-4xl xl:text-5xl", isDarkTheme ? "text-slate-100" : "text-forest-800"].join(" ")}>
                  Know how it&apos;s made. Know how it fits. Know your impact.
                </span>
              </h1>

              <p className={["mt-6 max-w-3xl text-base leading-8 sm:text-lg", isDarkTheme ? "text-slate-300" : "text-stone-700"].join(" ")}>
                Start with the preview, then choose the role you want to test.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleEnterDemo}
                  className={[
                    "pulse-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] shadow-soft transition",
                    isDarkTheme ? "bg-emerald-300 text-stone-950 hover:bg-emerald-200" : "bg-forest-700 text-white hover:bg-forest-600"
                  ].join(" ")}
                >
                  1. Play Preview
                  <ArrowRight className="h-4 w-4" />
                </button>
                {selectedRoleId ? (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-white/10"
                  >
                    Open Last Role
                  </button>
                ) : null}
              </div>

              <div
                className={[
                  "mt-6 rounded-[1.5rem] border px-4 py-4 text-sm leading-7 shadow-sm",
                  isDarkTheme ? "border-white/10 bg-white/6 text-slate-200" : "border-forest-200/75 bg-white/80 text-stone-700"
                ].join(" ")}
              >
                Start here: watch the preview first. When it looks clear, scroll down and choose a role.
              </div>
            </div>

            <div className="mt-8">
              <DemoPreviewPlayer onOpenRoles={handleEnterDemo} />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={roleSectionRef}
        className="px-4 py-10 sm:px-6 lg:px-10"
        aria-label="Choose your role"
      >
        <div className="mx-auto max-w-[1560px]">
          <div className="theme-shell rounded-[2.5rem] border border-white/70 bg-white/75 p-8 shadow-soft backdrop-blur-xl sm:p-10">
            <p className="text-[11px] uppercase tracking-[0.28em] text-forest-700">Choose Your Role</p>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <h2 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">2. Choose a role.</h2>
                <p className="mt-4 text-base leading-8 text-stone-600">Pick one role and the app will open with that view first.</p>
              </div>
              <span className="rounded-full bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                {entered ? "Demo unlocked" : "Enter Demo above to continue"}
              </span>
            </div>

            <div
              className={[
                "mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 transition duration-500",
                entered ? "opacity-100" : "pointer-events-none translate-y-4 opacity-55"
              ].join(" ")}
            >
              {roles.map((role) => {
                const Icon = iconMap[role.icon as keyof typeof iconMap];
                const active = selected?.id === role.id;
                const friendlyCopy = roleCardCopy[role.id];

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelect(role)}
                    className={[
                      "group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 text-left shadow-soft backdrop-blur-xl transition duration-300",
                      active ? "scale-[1.02] ring-2 ring-forest-700" : "hover:-translate-y-1 hover:shadow-shell"
                    ].join(" ")}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${role.accent}`} />
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${role.accent} text-white shadow-soft`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-sand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                        {role.accessLevel}
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-stone-950">{role.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{friendlyCopy.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {friendlyCopy.toolHighlights.map((item) => (
                        <span key={item} className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-forest-900">
                        Open demo
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1560px]">
          <div className="theme-shell flex flex-col gap-3 rounded-[2rem] border border-white/70 bg-white/75 px-6 py-5 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium tracking-[0.16em] text-forest-800">REUSE • REPAIR • REIMAGINE</p>
            <p className="text-sm text-stone-600">© 2026 Circular Finder, LLC All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
