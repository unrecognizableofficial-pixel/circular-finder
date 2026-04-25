"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Recycle, ShieldCheck, Wrench } from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";

export default function SustainabilityDashboard() {
  const { sustainabilityMetrics, impactMetrics, impactPoints, scannerActivity, bootstrap } = usePlatform();

  const progressLanes = [
    {
      label: "Reuse",
      value: Math.min(100, 42 + sustainabilityMetrics.itemsReused * 4),
      summary: "Recommerce listings, social saves, and fit-matched demand keep products in use longer.",
      icon: Recycle
    },
    {
      label: "Repair",
      value: Math.min(100, 36 + scannerActivity.lookups * 8),
      summary: "Scanner guidance and passport repair steps lower friction for care and repair actions.",
      icon: Wrench
    },
    {
      label: "Reimagine",
      value: sustainabilityMetrics.communityImpact,
      summary: "Brand-safe storytelling and role-based education turn sustainability into visible community value.",
      icon: Leaf
    }
  ];

  const actionTiles = [
    {
      label: "Scanner flow",
      value: `${scannerActivity.lookups} scans`,
      copy: "Passport previews, authenticity checks, and lifecycle details stay visible with every lookup.",
      href: "/scanner"
    },
    {
      label: "Marketplace trust",
      value: `${bootstrap?.marketplace.length ?? 0} listings`,
      copy: "Repairability, reuse value, and material origin flow straight into the commerce story.",
      href: "/marketplace"
    },
    {
      label: "Supplier transparency",
      value: "Map demo",
      copy: "Transparent sourcing and governed sustainability claims stay connected to each product twin.",
      href: "/suppliers"
    }
  ];

  return (
    <FeaturePage
      eyebrow="Sustainability"
      title="Measure the circular outcomes behind every discovery, sale, and scan"
      description="Circular Finder turns reuse, repair, and reimagine moments into visible sustainability signals for shoppers, creators, brands, and enterprise operators."
      highlights={["Carbon saved", "Water saved", "Community impact"]}
      steps={[
        "Start with the top impact cards to see the big picture.",
        "Review one outcome driver at a time.",
        "Use the action tiles to jump into the linked demos."
      ]}
      actions={[
        { href: "/scanner", label: "Open Scanner" },
        { href: "/marketplace", label: "Open Shop" }
      ]}
    >
      <div className="grid gap-4">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Sustainability dashboard</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">REUSE • REPAIR • REIMAGINE</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                Impact Points™ {impactPoints.toLocaleString()}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <SustainabilityCard label="Carbon saved" value={`${sustainabilityMetrics.carbonSavedKg} kg`} />
              <SustainabilityCard label="Water saved" value={`${sustainabilityMetrics.waterSavedLiters.toLocaleString()} L`} />
              <SustainabilityCard label="Items reused" value={String(sustainabilityMetrics.itemsReused)} />
              <SustainabilityCard label="Waste diverted" value={`${sustainabilityMetrics.wasteDivertedKg} kg`} />
              <SustainabilityCard label="Community impact" value={`${sustainabilityMetrics.communityImpact}/100`} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {progressLanes.map((lane) => {
                const Icon = lane.icon;
                return (
                  <article key={lane.label} className="rounded-[1.75rem] border border-stone-200 bg-sand-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold tracking-tight text-stone-950">{lane.label}</p>
                      <Icon className="h-5 w-5 text-forest-700" />
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white">
                      <div className="h-2 rounded-full bg-forest-800 transition-all" style={{ width: `${lane.value}%` }} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-stone-600">{lane.summary}</p>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Outcome drivers</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">What is improving this score</h2>

            <div className="mt-5 grid gap-3">
              {[
                { label: "Audience reach", value: `${impactMetrics.reach}/100`, hint: "Role-based content and discovery increase sustainable action visibility." },
                { label: "Sustainability score", value: `${impactMetrics.sustainability}/100`, hint: "Scanner use, challenges, and governed data improve the trust layer." },
                { label: "Conversions", value: `+${impactMetrics.conversions}`, hint: "Commerce activity with verified passports keeps reuse value high." },
                { label: "Trust protected", value: "Policy active", hint: "Brand-safe governance keeps sustainability claims clear and credible." }
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-950">{item.label}</p>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                      {item.value}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.75rem] bg-stone-950 p-5 text-stone-50">
              <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">Community story</p>
              <p className="mt-3 text-sm leading-7 text-stone-200">
                Circular Finder shows how sustainability scales globally by connecting marketplace data, brand governance,
                and social proof into one visible measurement system instead of hiding it behind backend dashboards.
              </p>
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Visible sustainability demos</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Every sustainability signal stays clickable</h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-forest-700" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {actionTiles.map((tile) => (
                <Link
                  key={tile.label}
                  href={tile.href}
                  className="rounded-[1.75rem] border border-stone-200 bg-sand-50 p-5 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-forest-700">{tile.label}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">{tile.value}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{tile.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-900">
                    Open demo
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </article>

          <aside className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Circular promise</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">Designed for global scale</h2>
            <div className="mt-4 grid gap-3">
              {[
                "Visible carbon and water counters",
                "Product-level repair and reuse signals",
                "Community impact tied to commerce",
                "Role-aware dashboards and education loops"
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </FeaturePage>
  );
}

function SustainabilityCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}
