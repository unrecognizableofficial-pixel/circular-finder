"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import GlobalNavigation from "@/components/global-navigation";
import { PlatformNavigation } from "@/components/platform-navigation";
import { usePlatform } from "@/components/platform-state";
import { LogoGlowCounter, StreakLogo } from "@/components/streak-logo";

const pageTitles: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Home", title: "Dashboard" },
  "/profiles": { eyebrow: "Profiles", title: "People, brands, and vendors to follow" },
  "/impact": { eyebrow: "Rewards", title: "Points, streaks, and progress" },
  "/feed": { eyebrow: "Community", title: "Posts, creators, and shared products" },
  "/scanner": { eyebrow: "Scanner", title: "Scan an item and open its passport" },
  "/styling": { eyebrow: "Fit & Style", title: "Save fit profiles and compare looks" },
  "/suppliers": { eyebrow: "Suppliers", title: "See sourcing, factories, and certifications" },
  "/marketplace": { eyebrow: "Shop & Resale", title: "Browse trusted listings and resale flows" },
  "/sustainability": { eyebrow: "Sustainability", title: "See the circular impact behind every action" },
  "/settings": { eyebrow: "Settings", title: "Make the app easier to use for you" },
  "/trust": { eyebrow: "Trust Center", title: "Privacy, permissions, and policy in one place" },
  "/profile": { eyebrow: "Account", title: "Your sign-in, saved fits, and session details" }
};

const pageGuides: Record<string, { summary: string; steps: string[]; nextHref: string; nextLabel: string }> = {
  "/dashboard": {
    summary: "See the main tasks and tools here.",
    steps: ["Start with the cards.", "Open the next task.", "Move page by page."],
    nextHref: "/scanner",
    nextLabel: "Open Scanner"
  },
  "/profiles": {
    summary: "This page helps you find people, brands, and vendors that match your interests or role.",
    steps: ["Pick one profile card first.", "Use Follow, Message, or Open profile one at a time.", "Check the spotlight panel to understand why that profile appears."],
    nextHref: "/feed",
    nextLabel: "Next: Open Community"
  },
  "/impact": {
    summary: "See how points, streaks, challenges, and badges grow as you use the platform.",
    steps: ["Start with the points and streak summary.", "Complete one challenge to watch progress update.", "Check the rewards area to see what unlocks next."],
    nextHref: "/sustainability",
    nextLabel: "Next: Open Sustainability"
  },
  "/feed": {
    summary: "Browse posts, creators, and trusted product stories in a simpler social view.",
    steps: ["Choose one feed tab first.", "Open one post and use one action at a time.", "Use Save or Follow to test the flow without losing your place."],
    nextHref: "/marketplace",
    nextLabel: "Next: Open Shop"
  },
  "/scanner": {
    summary: "Use QR, barcode, NFC, camera, or image upload to open a Digital Product Passport.",
    steps: ["Pick just one scan method first.", "Run the lookup or scan and wait for the passport result.", "Open the passport card before moving to shopping or rewards."],
    nextHref: "/marketplace",
    nextLabel: "Next: See the item in Shop"
  },
  "/styling": {
    summary: "Save fitting profiles, compare match signals, and preview outfit suggestions more easily.",
    steps: ["Choose or create one fitting profile first.", "Adjust the measurements and fit settings you care about most.", "Use the suggestions area after the fit profile feels right."],
    nextHref: "/profile",
    nextLabel: "Next: Review your saved profile"
  },
  "/suppliers": {
    summary: "Search the supplier network and inspect sourcing details without digging through dense data.",
    steps: ["Start with one filter or search term.", "Pick one supplier from the map or list.", "Review certifications, materials, and brand links in the detail panel."],
    nextHref: "/trust",
    nextLabel: "Next: Open Trust Center"
  },
  "/marketplace": {
    summary: "Browse resale listings, open the passport behind them, and follow the buyer or seller flow step by step.",
    steps: ["Use one filter at a time.", "Open a passport before deciding on a listing.", "Only use the listing form if your role can publish items."],
    nextHref: "/impact",
    nextLabel: "Next: See rewards and impact"
  },
  "/sustainability": {
    summary: "See how scans, resale, supplier transparency, and community actions add up to visible impact.",
    steps: ["Start with the top impact cards.", "Open one outcome driver at a time.", "Use the action tiles to jump into the linked demo flows."],
    nextHref: "/scanner",
    nextLabel: "Next: Open Scanner"
  },
  "/settings": {
    summary: "Use this page to make the app easier to read, hear, and navigate before you keep exploring.",
    steps: ["Choose the theme you prefer.", "Turn on accessibility mode if you want larger, easier-to-scan UI.", "Switch roles here if the current experience is not the one you want to test."],
    nextHref: "/dashboard",
    nextLabel: "Next: Return to Home"
  },
  "/trust": {
    summary: "This is the easiest place to review privacy, permissions, and policy without hunting through settings.",
    steps: ["Start with the trust overview at the top.", "Use one toggle or section at a time.", "Download or review your trust summary only after the preferences look right."],
    nextHref: "/settings",
    nextLabel: "Next: Return to Settings"
  },
  "/profile": {
    summary: "Sign in, review your account, and check which saved fitting profiles are available in this session.",
    steps: ["Check whether you are signed in first.", "Review saved fitting profiles next.", "Use Trust Center for privacy questions instead of searching through forms."],
    nextHref: "/styling",
    nextLabel: "Next: Open Fit & Style"
  }
};

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, selectedRole, selectedRoleId, roles, selectRole, notifications, impactPoints, streak, userLabel, accessibilityMode, rewards, challenges } =
    usePlatform();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    if (hydrated && !selectedRoleId) {
      router.replace("/");
    }
  }, [hydrated, router, selectedRoleId]);

  React.useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  if (!hydrated || !selectedRoleId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="rounded-shell border border-white/70 bg-white/80 px-8 py-6 text-center shadow-soft backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Preparing demo</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
            {hydrated ? "Loading role selection" : "Syncing saved session"}
          </h1>
        </div>
      </div>
    );
  }

  const normalizedPathname = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const header = pageTitles[normalizedPathname] ?? pageTitles["/dashboard"];
  const guide = pageGuides[normalizedPathname] ?? pageGuides["/dashboard"];
  const unlockedBadges = rewards.filter((reward) => reward.unlocked).length;
  const completedAchievements = challenges.filter((challenge) => challenge.progress >= challenge.target).length;
  const isDashboardRoute = normalizedPathname === "/dashboard";

  const rewardsHubCard = (
    <div className="theme-shell rounded-[1.5rem] border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-700">Rewards Hub</p>
        <LogoGlowCounter
          days={streak.days}
          state={streak.visualState}
          impactPointsToNextLevel={streak.impactPointsToNextLevel}
          compact
          className="bg-white/88"
        />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-sand-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Points</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{impactPoints.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-sand-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Achievements</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{completedAchievements}</p>
        </div>
        <div className="rounded-2xl bg-sand-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Badges</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{unlockedBadges}</p>
        </div>
        <div className="rounded-2xl bg-sand-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Streak</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{streak.days} days</p>
        </div>
      </div>
    </div>
  );

  const dashboardOverviewCard = (
    <div className="flex h-full flex-col justify-between gap-5 rounded-[1.5rem] border border-white/70 bg-gradient-to-br from-stone-950 via-forest-900 to-sage-800 px-5 py-5 text-white shadow-shell">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Home</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{selectedRole?.label}</h3>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
          {selectedRole?.accessLevel}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
            Next
          </span>
          <p className="text-sm font-medium text-white/78">{guide.nextLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={guide.nextHref} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-sand-100">
            Open
          </Link>
          {!accessibilityMode ? (
            <Link href="/settings" className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16">
              Easy view
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {selectedRole?.dashboardWidgets.slice(0, 4).map((widget) => (
            <div key={widget} className="rounded-[1.2rem] border border-white/12 bg-white/8 px-3 py-3 backdrop-blur">
              <p className="text-sm font-semibold tracking-tight text-white">{widget}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap content-start gap-2">
          {selectedRole?.availableTools.slice(0, 4).map((tool) => (
            <span key={tool} className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-white/78">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const startHereCard = (
    <div className="flex h-full flex-col justify-between gap-4 rounded-[1.5rem] border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-700">Start Here</p>
        <p className="mt-2 text-base font-semibold tracking-tight text-stone-900">{guide.steps[0]}</p>
        <p className="mt-2 text-sm leading-6 text-stone-600">{guide.summary}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={guide.nextHref} className="rounded-full bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-800">
          {guide.nextLabel}
        </Link>
        {!accessibilityMode ? (
          <Link href="/settings" className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-sand-50">
            Easier view
          </Link>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className={["min-h-screen lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]", accessibilityMode ? "text-[15px] lg:text-[16px]" : ""].join(" ")}>
      <PlatformNavigation />

      <div className="pb-24 lg:pb-0">
        <header className="theme-shell sticky top-0 z-30 border-b border-white/60 bg-sand-50/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1720px] flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-stone-500">Circular Finder</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-forest-700">{header.eyebrow}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="truncate text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{header.title}</h2>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    {selectedRole?.label}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 xl:min-w-[40rem] xl:grid-cols-[minmax(0,1fr)_12rem_auto]">
                <label className="glass-surface flex items-center gap-2 rounded-2xl border border-white/70 px-4 py-3 shadow-sm">
                  <Search className="h-4 w-4 text-stone-400" />
                  <input
                    type="search"
                    placeholder="Search"
                    className="w-full border-0 bg-transparent p-0 text-sm text-stone-700 placeholder:text-stone-400 focus:ring-0"
                  />
                </label>

                <select
                  value={selectedRoleId}
                  onChange={(event) => selectRole(event.target.value as typeof selectedRoleId)}
                  className="rounded-2xl border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-xl"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((current) => !current)}
                    className="glass-surface inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/70 px-4 py-3 text-sm font-medium text-stone-700 shadow-sm"
                  >
                    <StreakLogo days={streak.days} state={streak.visualState} size="xs" showDayBadge />
                    <Bell className="h-4 w-4" />
                    {notifications.length}
                  </button>

                  {notificationsOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[22rem] rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-shell backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Notifications</p>
                          <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">Logo streak updates</h3>
                        </div>
                        <StreakLogo days={streak.days} state={streak.visualState} size="sm" showDayBadge />
                      </div>

                      <div className="mt-4 grid gap-3">
                        {notifications.slice(0, 4).map((notification) => (
                          <article key={notification.id} className="rounded-[1.35rem] border border-stone-200 bg-sand-50 p-3">
                            <div className="flex items-start gap-3">
                              <StreakLogo days={streak.days} state={streak.visualState} size="xs" />
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-stone-950">{notification.title}</p>
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{notification.createdAt}</span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-stone-600">{notification.body}</p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {isDashboardRoute ? (
              <div className="grid gap-3">
                <div className="min-w-0">
                  <GlobalNavigation />
                </div>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)] xl:items-stretch">
                  {dashboardOverviewCard}
                  {rewardsHubCard}
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)] xl:items-start">
                  <div className="min-w-0">
                    <GlobalNavigation />
                  </div>
                  {rewardsHubCard}
                </div>
                {startHereCard}
              </>
            )}
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-[1720px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-[1720px] px-4 pb-10 pt-2 text-sm text-stone-600 sm:px-6 xl:px-8">
          <div className="theme-shell flex flex-col gap-3 rounded-shell border border-white/70 bg-white/75 px-5 py-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="font-medium tracking-[0.14em] text-forest-800">REUSE • REPAIR • REIMAGINE</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-600">
                <Link href="/trust#terms-policies" className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white">
                  Terms
                </Link>
                <Link href="/trust#privacy-center" className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white">
                  Privacy
                </Link>
                <Link href="/trust#security" className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white">
                  Security
                </Link>
                <Link href="/trust#ai-transparency" className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white">
                  AI Transparency
                </Link>
                <a href="mailto:trust@circularfinder.demo" className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white">
                  Contact
                </a>
                <Link href="/trust#legal-hub" className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white">
                  Trademark
                </Link>
              </div>
            </div>
            <p>© 2026 Circular Finder, LLC All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
