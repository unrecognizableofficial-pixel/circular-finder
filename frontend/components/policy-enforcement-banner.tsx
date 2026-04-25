"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { usePlatform } from "@/components/platform-state";

export default function PolicyEnforcementBanner() {
  const { policyActions } = usePlatform();

  if (!policyActions.length) {
    return null;
  }

  const primary = policyActions[0];

  return (
    <div className="rounded-shell border border-rose-200 bg-rose-50/90 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-rose-700">Platform Governance Policy</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-rose-950">{primary.message}</h2>
            <p className="mt-2 text-sm leading-6 text-rose-900/80">
              Policy reference {primary.policyRef}. Suggested fix: {primary.suggestedFix}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-700">
          <AlertTriangle className="h-4 w-4" />
          {policyActions.length} active enforcement event{policyActions.length > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
