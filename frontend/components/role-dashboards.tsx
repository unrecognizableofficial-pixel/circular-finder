"use client";

import { CheckCircle2, Clock3, Lock, RefreshCcw, ShieldAlert, Sparkles, WandSparkles } from "lucide-react";
import { LogoFreezeState, LogoMilestoneAnimation } from "@/components/streak-logo";
import { onboardingSteps } from "@/lib/mock-data";
import { complianceTone, complianceToneLabel } from "@/lib/policy-engine";
import { usePlatform } from "@/components/platform-state";

export function RoleDashboards() {
  const {
    selectedRole,
    onboardingStepIds,
    completeOnboardingStep,
    onboardingComplete,
    streak,
    styleCardApproved,
    approveStyleCard,
    presets,
    duplicatePreset,
    revertSubBrandTheme,
    masterResetTheme,
    complianceScore,
    incidentTriggered,
    accountFrozen,
    accessRestored,
    triggerOffBrandIncident,
    freezeAccount,
    continueRecovery,
    fieldLocks,
    toggleFieldLock,
    scannerActivity,
    watermarkOpacity,
    batchFolders,
    auditTrail,
    trainingModules,
    openTrainingModal,
    canAccess
  } = usePlatform();

  if (!selectedRole) {
    return null;
  }

  const complianceState = complianceTone(complianceScore);
  const nextDemoAction = !incidentTriggered
    ? { label: "1. Trigger off-brand post", action: triggerOffBrandIncident }
    : !accountFrozen
      ? { label: "2. Freeze access", action: freezeAccount }
      : !accessRestored
        ? { label: "3. Complete training and certify", action: openTrainingModal }
        : { label: "4. Continue reputation recovery", action: continueRecovery };

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Guided Demo Walkthrough</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">5-step onboarding</h2>
            </div>
            {onboardingComplete ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" />
                Getting Started badge
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3">
            {onboardingSteps.map((step, index) => {
              const complete = onboardingStepIds.includes(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => completeOnboardingStep(step.id)}
                  className={[
                    "flex items-start justify-between gap-4 rounded-[1.5rem] border p-4 text-left transition",
                    complete ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-sand-50 hover:bg-white"
                  ].join(" ")}
                >
                  <div className="flex gap-4">
                    <div
                      className={[
                        "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold",
                        complete ? "bg-emerald-500 text-white" : "bg-white text-stone-700"
                      ].join(" ")}
                    >
                      {complete ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-950">{step.title}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{step.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">{step.cta}</span>
                </button>
              );
            })}
          </div>

          <LogoMilestoneAnimation
            days={streak.days}
            state={streak.visualState}
            className="mt-5"
            title={onboardingComplete ? "Getting Started badge and logo milestone" : undefined}
            body={
              onboardingComplete
                ? "The walkthrough completed, the Getting Started badge unlocked, and the Circular Finder logo now carries a stronger streak state."
                : undefined
            }
          />
        </article>

        <article className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Critical Demo Flow</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Smart Brand Enforcement Engine</h2>
            </div>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                complianceState === "safe"
                  ? "bg-emerald-50 text-emerald-800"
                  : complianceState === "warning"
                    ? "bg-yellow-50 text-yellow-800"
                    : complianceState === "risk"
                      ? "bg-orange-50 text-orange-800"
                      : "bg-rose-50 text-rose-800"
              ].join(" ")}
            >
              {complianceToneLabel(complianceScore)}
            </span>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-stone-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Compliance score</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{complianceScore}</p>
              </div>
              <button
                type="button"
                onClick={nextDemoAction.action}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-950"
              >
                {nextDemoAction.label}
              </button>
            </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatusCard label="Incident triggered" value={incidentTriggered ? "Yes" : "Ready"} />
            <StatusCard label="Access mode" value={accountFrozen ? "Read-only" : accessRestored ? "Restored" : "Active"} />
            <StatusCard label="Training status" value={trainingModules.every((module) => module.progress === 100) ? "Complete" : "Pending"} />
            <StatusCard label="Recovery badge" value={accessRestored ? "Unlocked" : "Locked"} />
          </div>
          </div>

          <LogoFreezeState days={streak.days} state={streak.visualState} className="mt-5" />

          <div className="mt-5 grid gap-3">
            {[
              "Sub-brand posts off-brand content",
              "Compliance score drops and alert pulses",
              "Admin freezes the account",
              "Training is assigned and completed",
              "Access is restored and score recovers"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                <Clock3 className="h-4 w-4 text-forest-700" />
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Brand Governance System</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Style card approval and preset library</h2>
            </div>
            <button
              type="button"
              onClick={approveStyleCard}
              className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              {styleCardApproved ? "Style card approved" : "Approve style card"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">Light mode preview</p>
                <WandSparkles className="h-4 w-4 text-forest-700" />
              </div>
              <div className="mt-4 rounded-[1.25rem] border border-white/70 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-forest-700" />
                  <span className="h-3 w-3 rounded-full bg-sand-400" />
                  <span className="h-3 w-3 rounded-full bg-sage-400" />
                </div>
                <div className="mt-4 rounded-2xl bg-sand-50 p-3 text-sm text-stone-700">Typography system • Editorial Sans</div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-forest-900 px-3 py-2 text-xs font-semibold text-white">Primary button</span>
                  <span className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700">Secondary</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Dark mode preview</p>
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-300" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-white/75">Marketplace card preview • AI style card</div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-stone-950">Primary button</span>
                  <span className="rounded-full border border-white/20 bg-transparent px-3 py-2 text-xs font-semibold text-white">Secondary</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {presets.map((preset) => (
              <div key={preset.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-950">{preset.name}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {preset.subBrand} • {preset.colorFamily} • {preset.typography}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                    {preset.updatedAt}
                  </span>
                  <button type="button" onClick={() => duplicatePreset(preset.id)} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-forest-900">
                    Duplicate
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={revertSubBrandTheme} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">
              Revert sub-brand theme
            </button>
            <button type="button" onClick={masterResetTheme} className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white">
              Master reset
            </button>
          </div>
        </article>

        <article className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Marketplace Governance</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Field locks, scanner sync, and retention</h2>
            </div>
            <span className="rounded-full bg-sand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
              Policy layer
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {fieldLocks.map((field) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-950">{field.field}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {field.scope} • {field.owner}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                    {field.reason}
                  </span>
                  {canAccess("marketplace.manage") ? (
                    <button
                      type="button"
                      onClick={() => toggleFieldLock(field.id)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-forest-900"
                    >
                      {field.locked ? "Unlock" : "Lock"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-4 text-white">
              <p className="text-sm font-semibold">Scanner & IP protection</p>
              <div className="mt-4 grid gap-3">
                <StatusCard label="Scanner lookups" value={String(scannerActivity.lookups)} dark />
                <StatusCard label="Image uploads" value={String(scannerActivity.uploads)} dark />
                <StatusCard label="Watermark opacity" value={`${watermarkOpacity}%`} dark />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
              <p className="text-sm font-semibold text-stone-950">Batch management</p>
              <div className="mt-4 grid gap-3">
                {batchFolders.map((folder) => (
                  <div key={folder.id} className="rounded-2xl bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-stone-900">{folder.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {folder.status} • deleting in {folder.retentionDays} days • {folder.itemCount} assets
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
            <p className="text-sm font-semibold text-stone-950">Audit trail</p>
            <div className="mt-4 grid gap-3">
              {(auditTrail.length ? auditTrail : [{ id: "audit-empty", actor: "System", action: "Watching", reason: "Awaiting the first policy event.", policyRef: "SYS-000", timestamp: "Now", outcome: "No enforcement actions yet." }]).map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-900">{entry.action}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{entry.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{entry.reason}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                    {entry.actor} • {entry.policyRef} • {entry.outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-sand-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}

function StatusCard({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-2xl bg-white/10 p-3" : "rounded-2xl bg-white p-3 shadow-sm"}>
      <p className={dark ? "text-[11px] uppercase tracking-[0.18em] text-white/55" : "text-[11px] uppercase tracking-[0.18em] text-stone-500"}>{label}</p>
      <p className={dark ? "mt-2 text-lg font-semibold text-white" : "mt-2 text-lg font-semibold text-stone-950"}>{value}</p>
    </div>
  );
}
