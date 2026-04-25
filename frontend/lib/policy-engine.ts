import { getRoleById, roleHasCapability, type DemoRole, type DemoRoleId } from "@/lib/roles";

export type PolicyLevel = "master" | "platform" | "sub-brand" | "permissions";

export type EnforcementActionType = "warning" | "suppress" | "freeze" | "training" | "suspend" | "remove";

export type EnforcementAction = {
  type: EnforcementActionType;
  message: string;
  policyRef: string;
  suggestedFix: string;
  allowAppeal: boolean;
  severity: "safe" | "warning" | "risk" | "critical";
};

export type PolicyContext = {
  actorRoleId: DemoRoleId;
  content?: string;
  containsUnauthorizedColor?: boolean;
  containsWrongLogo?: boolean;
  usesUnapprovedTemplate?: boolean;
  lockedFieldEdit?: boolean;
  repeatedViolations?: number;
};

export type PolicyRule = {
  id: string;
  level: PolicyLevel;
  description: string;
  reference: string;
  detect: (context: PolicyContext, role: DemoRole) => boolean;
  action: EnforcementAction;
};

export type PolicyAuditEntry = {
  id: string;
  actor: string;
  action: string;
  reason: string;
  policyRef: string;
  timestamp: string;
  outcome: string;
};

const policyRules: PolicyRule[] = [
  {
    id: "master-brand-off-brand-content",
    level: "master",
    description: "Master brand policy overrides off-brand content and unauthorized visual identity usage.",
    reference: "MBP-101",
    detect: (context) =>
      Boolean(
        context.content?.toLowerCase().includes("off-brand") ||
          context.containsUnauthorizedColor ||
          context.containsWrongLogo ||
          context.usesUnapprovedTemplate
      ),
    action: {
      type: "freeze",
      message: "Content was flagged for off-brand identity use and access should move to read-only review.",
      policyRef: "MBP-101",
      suggestedFix: "Replace the asset with approved logo, palette, and template combinations.",
      allowAppeal: true,
      severity: "critical"
    }
  },
  {
    id: "platform-marketplace-accuracy",
    level: "platform",
    description: "System-wide marketplace policy protects locked data and product accuracy.",
    reference: "PLT-220",
    detect: (context) => Boolean(context.lockedFieldEdit),
    action: {
      type: "suppress",
      message: "A locked marketplace field was targeted for editing and the update was blocked.",
      policyRef: "PLT-220",
      suggestedFix: "Request a governance override before changing protected product metadata.",
      allowAppeal: true,
      severity: "risk"
    }
  },
  {
    id: "sub-brand-repeat-violations",
    level: "sub-brand",
    description: "Repeated sub-brand incidents trigger mandatory training before posting resumes.",
    reference: "SBP-118",
    detect: (context) => (context.repeatedViolations ?? 0) >= 2,
    action: {
      type: "training",
      message: "Mandatory training has been unlocked because repeated violations were detected.",
      policyRef: "SBP-118",
      suggestedFix: "Complete the assigned training module and acknowledge the current guidelines.",
      allowAppeal: false,
      severity: "warning"
    }
  },
  {
    id: "permissions-role-limit",
    level: "permissions",
    description: "Role permissions limit restricted actions for non-admin users.",
    reference: "UP-042",
    detect: (_context, role) => !roleHasCapability(role, "compliance.freeze"),
    action: {
      type: "warning",
      message: "This role can review the policy event, but only compliance-enabled roles can freeze access.",
      policyRef: "UP-042",
      suggestedFix: "Escalate the incident to a Master Brand Admin or Compliance Admin.",
      allowAppeal: false,
      severity: "safe"
    }
  }
];

export function evaluatePolicies(context: PolicyContext) {
  const role = getRoleById(context.actorRoleId);
  if (!role) {
    return [];
  }

  return policyRules.filter((rule) => rule.detect(context, role)).map((rule) => rule.action);
}

export function complianceTone(score: number) {
  if (score >= 85) return "safe";
  if (score >= 70) return "warning";
  if (score >= 50) return "risk";
  return "critical";
}

export function complianceToneLabel(score: number) {
  const tone = complianceTone(score);
  switch (tone) {
    case "safe":
      return "Green = Safe";
    case "warning":
      return "Yellow = Warning";
    case "risk":
      return "Orange = Risk";
    default:
      return "Red = Critical";
  }
}

export function buildAuditEntry(input: {
  actor: string;
  action: string;
  reason: string;
  policyRef: string;
  outcome: string;
}): PolicyAuditEntry {
  return {
    id: `${input.policyRef}-${Math.random().toString(36).slice(2, 8)}`,
    actor: input.actor,
    action: input.action,
    reason: input.reason,
    policyRef: input.policyRef,
    timestamp: new Date().toLocaleString(),
    outcome: input.outcome
  };
}
