"use client";

import ComplianceTrainingModal from "@/components/compliance-training-modal";
import PolicyEnforcementBanner from "@/components/policy-enforcement-banner";
import { RoleDashboards } from "@/components/role-dashboards";

export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      <PolicyEnforcementBanner />
      <RoleDashboards />
      <ComplianceTrainingModal />
    </div>
  );
}
