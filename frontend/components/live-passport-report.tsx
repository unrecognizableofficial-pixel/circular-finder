"use client";

import Link from "next/link";
import type { Passport } from "@/types/platform";
import { formatCurrency } from "@/lib/format";

export function LivePassportReport({
  passport,
  actions
}: {
  passport: Passport | null;
  actions?: React.ReactNode;
}) {
  if (!passport?.product) {
    return (
      <div className="rounded-shell border border-dashed border-stone-200 bg-stone-50 p-6 text-sm leading-6 text-stone-500">
        Start a live scan, open a marketplace passport, or upload a garment image to see the complete product journey.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 rounded-shell border border-stone-200 bg-white p-5 shadow-soft lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <img
          src={passport.product.imageUrl}
          alt={passport.product.name}
          className="aspect-[4/4.5] w-full rounded-[1.5rem] object-cover"
        />
        <div className="grid gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">{passport.brand?.name ?? passport.product.brand.name}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{passport.product.name}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">{passport.product.productStory}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
              {passport.circularityScore}/100 circularity
            </span>
            <span className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
              {passport.durabilityRating}/100 durability
            </span>
            <span className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
              {formatCurrency(passport.resaleValueEstimate)} resale estimate
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <Metric label="Authenticity" value={passport.passportStatus.replaceAll("_", " ")} />
            <Metric label="Carbon footprint" value={`${passport.carbonFootprintKg}kg`} />
            <Metric label="Water usage" value={`${Math.round(passport.waterUsageLiters)}L`} />
            <Metric label="Factory" value={passport.factoryLocation} />
            <Metric label="Origin" value={passport.countryOfOrigin} />
          </dl>

          <div className="rounded-[1.5rem] bg-sand-50 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Materials</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {passport.materialComposition.map((material) => (
                <span
                  key={material}
                  className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-stone-900 p-4 text-stone-50">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">Care, repair, and recovery</p>
            <p className="mt-3 text-sm leading-6 text-stone-200">
              <strong className="text-stone-50">Care:</strong> {passport.careInstructions}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-200">
              <strong className="text-stone-50">Repair:</strong> {passport.repairInstructions}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-200">
              <strong className="text-stone-50">Recycle:</strong> {passport.recyclingInstructions}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-200">
              <strong className="text-stone-50">Take-back:</strong> {passport.takeBackProgram}
            </p>
          </div>

          {actions}
        </div>
      </div>

      <div className="rounded-shell border border-emerald-200 bg-emerald-50/80 p-5 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Methodology and transparency</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">How Circular Finder explains impact</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-700">
              Sustainability and circularity guidance is based on materials, emissions estimates, transport distance, recyclability, and durability.
              These signals help decision-making, but they should be reviewed alongside supplier disclosures, repair guidance, and authenticity details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/trust#terms-policies" className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900 shadow-sm">
              Terms & Policies
            </Link>
            <Link href="/trust#legal-hub" className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900 shadow-sm">
              Legal Hub
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {passport.sustainabilityCertifications.map((certification) => (
            <span key={certification} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
              {certification}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-3">
          {passport.journey.map((step) => (
            <article key={step.id} className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{step.stepType}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{step.name}</h3>
              <p className="mt-1 text-sm text-stone-500">{step.country}</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">{step.details}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-sand-50 p-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className="mt-2 text-base font-semibold tracking-tight text-stone-900">{value}</dd>
    </div>
  );
}
