"use client";

import * as React from "react";
import Link from "next/link";
import {
  BellRing,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  FileLock2,
  FileText,
  KeyRound,
  LockKeyhole,
  Mail,
  Scale,
  UserRoundCheck
} from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";
import { fetchMySettings, fetchTrustCenter, saveMySetting, type TrustCenterPayload, type UserSettingRecord } from "@/lib/api";

type PreferenceState = {
  marketingConsent: boolean;
  aiExplanations: boolean;
  cameraProcessing: boolean;
  securityAlerts: boolean;
};

const trustSections = [
  { id: "privacy-center", label: "Privacy Center" },
  { id: "legal-hub", label: "Legal Hub" },
  { id: "terms-policies", label: "Terms & Policies" },
  { id: "billing-subscriptions", label: "Billing & Subscription" },
  { id: "permissions", label: "Permissions" },
  { id: "data-controls", label: "Data Controls" },
  { id: "ai-transparency", label: "AI Transparency" },
  { id: "security", label: "Security" },
  { id: "account-management", label: "Account Management" }
] as const;

const defaultPreferences: PreferenceState = {
  marketingConsent: false,
  aiExplanations: true,
  cameraProcessing: true,
  securityAlerts: true
};

export default function TrustCenterPage() {
  const { bootstrap, token, selectedRole, logout } = usePlatform();
  const [status, setStatus] = React.useState("Trust, privacy, and policy tools are now visible across the Circular Finder demo.");
  const [trustCenter, setTrustCenter] = React.useState<TrustCenterPayload | null>(null);
  const [liveSettings, setLiveSettings] = React.useState<UserSettingRecord[]>([]);
  const [preferences, setPreferences] = React.useState<PreferenceState>(defaultPreferences);
  const [isSavingPreference, setIsSavingPreference] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    void fetchTrustCenter()
      .then((payload) => {
        if (!cancelled) {
          setTrustCenter(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("The trust center is showing demo policy copy because the live trust endpoint is unavailable.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!token) {
      setLiveSettings([]);
      return;
    }

    let cancelled = false;
    void fetchMySettings(token)
      .then((settings) => {
        if (!cancelled) {
          setLiveSettings(settings);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("Signed-in settings could not be loaded, so privacy controls are using local demo state.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  React.useEffect(() => {
    if (!liveSettings.length) {
      return;
    }

    setPreferences((current) => ({
      marketingConsent: readBooleanSetting(liveSettings, "privacy.marketing", current.marketingConsent),
      aiExplanations: readBooleanSetting(liveSettings, "ai.explanations", current.aiExplanations),
      cameraProcessing: readBooleanSetting(liveSettings, "scanner.camera_processing", current.cameraProcessing),
      securityAlerts: readBooleanSetting(liveSettings, "security.alerts", current.securityAlerts)
    }));
  }, [liveSettings]);

  const handlePreferenceChange = React.useCallback(
    async (key: keyof PreferenceState, nextValue: boolean) => {
      const mapping: Record<keyof PreferenceState, { storageKey: string; label: string }> = {
        marketingConsent: { storageKey: "privacy.marketing", label: "marketing updates" },
        aiExplanations: { storageKey: "ai.explanations", label: "AI explanations" },
        cameraProcessing: { storageKey: "scanner.camera_processing", label: "camera processing consent" },
        securityAlerts: { storageKey: "security.alerts", label: "security alerts" }
      };

      setPreferences((current) => ({ ...current, [key]: nextValue }));
      setStatus(`${capitalize(mapping[key].label)} ${nextValue ? "enabled" : "disabled"} for this session.`);

      if (!token) {
        return;
      }

      try {
        setIsSavingPreference(mapping[key].storageKey);
        const saved = await saveMySetting(token, mapping[key].storageKey, {
          enabled: nextValue,
          updatedAt: new Date().toISOString()
        });
        setLiveSettings((current) => {
          const next = current.filter((entry) => entry.key !== saved.key);
          next.push(saved);
          return next;
        });
        setStatus(`${capitalize(mapping[key].label)} synced to your live account settings.`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not save this setting to your live account.");
      } finally {
        setIsSavingPreference(null);
      }
    },
    [token]
  );

  const downloadTrustSnapshot = React.useCallback(() => {
    if (typeof window === "undefined" || !trustCenter) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      role: selectedRole?.label ?? "No role selected",
      session: bootstrap?.user?.profile ?? null,
      trustCenter,
      preferences
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = "circular-finder-trust-summary.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
    setStatus("Trust summary downloaded.");
  }, [bootstrap?.user?.profile, preferences, selectedRole?.label, trustCenter]);

  const policyHierarchy = trustCenter?.legalHub.hierarchy ?? [];
  const policyActions = trustCenter?.legalHub.governance.actions ?? [];
  const activePermissions = selectedRole?.permissionsPreview ?? [];
  const oauthProviders = trustCenter?.accountManagement.oauthProviders ?? [];

  return (
    <FeaturePage
      eyebrow="Trust Center"
      title="Trust, privacy, and policy tools"
      description="This page brings the full legal, privacy, billing, permissions, AI, security, and account trust stack into one place so users never have to hunt for it."
      highlights={["Privacy Center", "Legal Hub", "Billing", "AI Transparency"]}
      steps={[
        "Read the trust overview first.",
        "Use one section or toggle at a time so changes are easy to follow.",
        "Download or review summaries only after your preferences look right."
      ]}
      actions={[
        { href: "/settings", label: "Back to Settings" },
        { href: "/profile", label: "Open Account" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="grid gap-4">
          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Overview</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Trust, privacy, and policy tools are now visible across the Circular Finder demo.</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              This dedicated page keeps the full trust stack together, while Settings stays focused on personalization and presentation controls.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {trustSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-full border border-stone-200 bg-sand-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
                >
                  {section.label}
                </a>
              ))}
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Live readiness</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Platform trust snapshot</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SnapshotMetric label="Legal readiness" value={String(trustCenter?.legalHub.legalReadinessScore ?? "…")} />
              <SnapshotMetric label="Compliance readiness" value={String(trustCenter?.legalHub.complianceReadinessScore ?? "…")} />
              <SnapshotMetric label="GDPR controls" value={`${trustCenter?.privacyCenter.gdpr.readinessScore ?? "…"} / 100`} />
              <SnapshotMetric label="CCPA controls" value={`${trustCenter?.privacyCenter.ccpa.readinessScore ?? "…"} / 100`} />
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-stone-950 p-4 text-white">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Billing integration</p>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Stripe configured: {trustCenter?.billing.stripe.integration.configured ? "Yes" : "Not yet"} · Publishable key:{" "}
                {trustCenter?.billing.stripe.integration.publishableConfigured ? "Ready" : "Missing"}
              </p>
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Status</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">What changed</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">{status}</p>
          </article>
        </section>

        <section className="grid gap-4">
          <TrustSection
            id="privacy-center"
            eyebrow="Privacy Center"
            title="Control consent, visibility, and how your session is used"
            icon={<FileLock2 className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3">
              <PreferenceToggle
                title="Marketing updates"
                description="Allow Circular Finder to send launch news, rewards, and marketplace updates."
                active={preferences.marketingConsent}
                busy={isSavingPreference === "privacy.marketing"}
                onToggle={() => void handlePreferenceChange("marketingConsent", !preferences.marketingConsent)}
              />
              <PreferenceToggle
                title="AI explanations"
                description="Show why a scan, fit suggestion, or trust alert was recommended."
                active={preferences.aiExplanations}
                busy={isSavingPreference === "ai.explanations"}
                onToggle={() => void handlePreferenceChange("aiExplanations", !preferences.aiExplanations)}
              />
              <PreferenceToggle
                title="Camera and image processing"
                description="Allow scanner images to be processed for live passport matching and trust signals."
                active={preferences.cameraProcessing}
                busy={isSavingPreference === "scanner.camera_processing"}
                onToggle={() => void handlePreferenceChange("cameraProcessing", !preferences.cameraProcessing)}
              />
              <PreferenceToggle
                title="Security alerts"
                description="Receive trust, policy, and account safety notices in-app."
                active={preferences.securityAlerts}
                busy={isSavingPreference === "security.alerts"}
                onToggle={() => void handlePreferenceChange("securityAlerts", !preferences.securityAlerts)}
              />
            </div>

            <div className="mt-5 grid gap-3">
              {trustCenter?.privacyCenter.dataRights.map((item) => (
                <TrustBullet key={item} icon={<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />} text={item} />
              ))}
            </div>
          </TrustSection>

          <TrustSection
            id="legal-hub"
            eyebrow="Legal Hub"
            title="See the rules, escalation layers, and brand protections"
            icon={<Scale className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3">
              {policyHierarchy.map((policy) => (
                <article key={policy.key} className="rounded-[1.4rem] border border-stone-200 bg-sand-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Level {policy.level}</p>
                  <h3 className="mt-2 text-base font-semibold tracking-tight text-stone-950">{policy.key.replaceAll("_", " ")}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{policy.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {policyActions.map((action) => (
                <span key={action} className="rounded-full bg-stone-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {action}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950">
              {trustCenter?.app.trademark} is protected as the product identity mark for streaks, policy surfaces, and platform trust signals.{" "}
              {trustCenter?.app.copyright}
            </div>
          </TrustSection>

          <TrustSection
            id="terms-policies"
            eyebrow="Terms & Policies"
            title="Put the most important disclosures where people actually look"
            icon={<FileText className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <PolicyCard
                title="Terms of use"
                summary="Access rules, marketplace behavior, and account responsibilities stay visible before checkout, posting, and account changes."
              />
              <PolicyCard
                title="Privacy notice"
                summary="Explains camera use, scanner uploads, profile data, notifications, and consent-driven communication choices."
              />
              <PolicyCard
                title="Scanner image use"
                summary={trustCenter?.scanner.imageUsageNotice ?? "Scanner uploads are used to match known products and attach Digital Product Passports."}
              />
              <PolicyCard
                title="Passport methodology"
                summary={trustCenter?.passport.transparencyDisclaimer ?? "Passport guidance explains how sustainability and trust signals are derived."}
              />
            </div>
          </TrustSection>

          <TrustSection
            id="billing-subscriptions"
            eyebrow="Billing & Subscription"
            title="Make plan terms, renewals, and refunds easy to review"
            icon={<CreditCard className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3">
              <TrustBullet icon={<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />} text={trustCenter?.billing.autoRenewDisclosure ?? "Auto-renew disclosures are visible in billing surfaces."} />
              <TrustBullet icon={<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />} text={trustCenter?.billing.cancellationTerms ?? "Cancellation terms are shown before plan changes."} />
              <TrustBullet icon={<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />} text={trustCenter?.billing.refundPolicy ?? "Refund policy links are shown before payment is captured."} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SnapshotMetric label="Stripe secret" value={trustCenter?.billing.stripe.integration.configured ? "Configured" : "Missing"} />
              <SnapshotMetric
                label="Publishable key"
                value={trustCenter?.billing.stripe.integration.publishableConfigured ? "Configured" : "Missing"}
              />
            </div>
          </TrustSection>

          <TrustSection
            id="permissions"
            eyebrow="Permissions"
            title="Show what this role can do without making people guess"
            icon={<KeyRound className="h-5 w-5 text-forest-700" />}
          >
            <div className="rounded-[1.5rem] bg-stone-950 p-4 text-white">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Active role</p>
              <p className="mt-2 text-lg font-semibold">{selectedRole?.label ?? "No role selected"}</p>
              <p className="mt-2 text-sm leading-6 text-white/75">{selectedRole?.summary}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {activePermissions.map((permission) => (
                <div key={permission} className="rounded-[1.35rem] border border-stone-200 bg-sand-50 p-4 text-sm font-medium text-stone-800">
                  {permission}
                </div>
              ))}
            </div>
          </TrustSection>

          <TrustSection
            id="data-controls"
            eyebrow="Data Controls"
            title="Give users clear actions for export, review, and support"
            icon={<Download className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <ActionCard
                title="Download trust summary"
                description="Export the current trust, policy, and session snapshot as a JSON file."
                actionLabel="Download"
                onClick={downloadTrustSnapshot}
                icon={<Download className="h-4 w-4" />}
              />
              <ActionCard
                title="Request data export"
                description="Use the trust inbox when you need a formal review or export that is not exposed in self-service yet."
                actionLabel="Email trust team"
                href={`mailto:${trustCenter?.app.contactEmail ?? "trust@circularfinder.demo"}?subject=Request%20data%20export`}
                icon={<Mail className="h-4 w-4" />}
              />
              <ActionCard
                title="Request deletion review"
                description="Deletion-ready compliance controls exist in the platform, and this route makes the request path visible right now."
                actionLabel="Start request"
                href={`mailto:${trustCenter?.app.contactEmail ?? "trust@circularfinder.demo"}?subject=Request%20deletion%20review`}
                icon={<Mail className="h-4 w-4" />}
              />
              <ActionCard
                title="Open account controls"
                description="Review sign-in, password, live session, and fitting profile details in the account page."
                actionLabel="Open Account"
                href="/profile"
                icon={<UserRoundCheck className="h-4 w-4" />}
              />
            </div>
          </TrustSection>

          <TrustSection
            id="ai-transparency"
            eyebrow="AI Transparency"
            title="Explain what the models do, and where the limits are"
            icon={<BrainCircuit className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <SnapshotMetric label="Vision provider" value={trustCenter?.aiTransparency.scannerVision.provider ?? "local"} />
              <SnapshotMetric label="Vision model" value={trustCenter?.aiTransparency.scannerVision.model ?? "demo"} />
              <SnapshotMetric
                label="Min confidence"
                value={typeof trustCenter?.aiTransparency.scannerVision.minScore === "number" ? trustCenter.aiTransparency.scannerVision.minScore.toFixed(2) : "n/a"}
              />
            </div>

            <div className="mt-5 grid gap-3">
              {trustCenter?.aiTransparency.disclaimers.map((item) => (
                <TrustBullet key={item} icon={<BrainCircuit className="mt-0.5 h-4 w-4 text-forest-700" />} text={item} />
              ))}
            </div>
          </TrustSection>

          <TrustSection
            id="security"
            eyebrow="Security"
            title="Surface the protections already working in the platform"
            icon={<LockKeyhole className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <SecurityBadge label="JWT authentication" active={Boolean(trustCenter?.security.jwtAuth)} />
              <SecurityBadge label="Role-based access control" active={Boolean(trustCenter?.security.roleBasedAccess)} />
              <SecurityBadge label="Rate limiting" active={Boolean(trustCenter?.security.rateLimiting)} />
              <SecurityBadge label="Encrypted sensitive fields" active={Boolean(trustCenter?.security.encryptedSensitiveFields)} />
              <SecurityBadge label="Audit logging" active={Boolean(trustCenter?.security.auditLogging)} />
              <SecurityBadge label="Webhook verification" active={Boolean(trustCenter?.security.webhookVerification)} />
            </div>
          </TrustSection>

          <TrustSection
            id="account-management"
            eyebrow="Account Management"
            title="Make sign-in, verification, and support flows easier to find"
            icon={<UserRoundCheck className="h-5 w-5 text-forest-700" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <ActionCard
                title="Open account page"
                description="Manage live sign-in, registration, fitting profiles, and wardrobe-linked account details."
                actionLabel="Go to Account"
                href="/profile"
                icon={<ExternalLink className="h-4 w-4" />}
              />
              <ActionCard
                title="Password reset"
                description={trustCenter?.accountManagement.passwordReset ? "A live password reset flow is already scaffolded in the backend." : "Password reset is not ready yet."}
                actionLabel="View sign-in details"
                href="/profile"
                icon={<KeyRound className="h-4 w-4" />}
              />
              <ActionCard
                title="Email verification"
                description={
                  trustCenter?.accountManagement.emailVerification
                    ? "Email verification is scaffolded and now visible in the account journey."
                    : "Email verification is not visible yet."
                }
                actionLabel="Review account"
                href="/profile"
                icon={<Mail className="h-4 w-4" />}
              />
              {bootstrap?.user?.profile ? (
                <ActionCard
                  title="End live session"
                  description="Sign out of the connected live backend session without losing the local demo role."
                  actionLabel="Sign out"
                  onClick={logout}
                  icon={<BellRing className="h-4 w-4" />}
                />
              ) : (
                <ActionCard
                  title="Start a live session"
                  description="Sign in to persist trust and privacy preferences into your live account settings."
                  actionLabel="Open sign-in"
                  href="/profile"
                  icon={<UserRoundCheck className="h-4 w-4" />}
                />
              )}
            </div>

            {oauthProviders.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {oauthProviders.map((provider) => (
                  <span key={provider.provider} className="rounded-full border border-stone-200 bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                    {provider.provider} OAuth scaffolded
                  </span>
                ))}
              </div>
            ) : null}
          </TrustSection>
        </section>
      </div>
    </FeaturePage>
  );
}

function readBooleanSetting(settings: UserSettingRecord[], key: string, fallback: boolean) {
  const entry = settings.find((item) => item.key === key);
  if (!entry) {
    return fallback;
  }
  const value = entry.value?.enabled;
  return typeof value === "boolean" ? value : fallback;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function SnapshotMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-stone-200 bg-sand-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}

function TrustSection({
  id,
  eyebrow,
  title,
  icon,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl scroll-mt-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
        </div>
        {icon}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PreferenceToggle({
  title,
  description,
  active,
  busy,
  onToggle
}: {
  title: string;
  description: string;
  active: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex items-start justify-between gap-4 rounded-[1.35rem] border p-4 text-left transition",
        active ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-sand-50 hover:bg-white"
      ].join(" ")}
    >
      <div>
        <p className="text-base font-semibold tracking-tight text-stone-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <span className={["rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]", active ? "bg-emerald-900 text-white" : "bg-white text-stone-600"].join(" ")}>
        {busy ? "Saving" : active ? "On" : "Off"}
      </span>
    </button>
  );
}

function TrustBullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] bg-sand-50 px-4 py-3 text-sm leading-6 text-stone-700">
      {icon}
      <p>{text}</p>
    </div>
  );
}

function PolicyCard({ title, summary }: { title: string; summary: string }) {
  return (
    <article className="rounded-[1.4rem] border border-stone-200 bg-sand-50 p-4">
      <h3 className="text-base font-semibold tracking-tight text-stone-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{summary}</p>
    </article>
  );
}

function ActionCard({
  title,
  description,
  actionLabel,
  icon,
  href,
  onClick
}: {
  title: string;
  description: string;
  actionLabel: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const classes =
    "rounded-[1.4rem] border border-stone-200 bg-sand-50 p-4 transition hover:bg-white";

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-forest-800 shadow-sm">{icon}</span>
        <h3 className="text-base font-semibold tracking-tight text-stone-950">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white">
        {actionLabel}
        <ExternalLink className="h-3.5 w-3.5" />
      </span>
    </>
  );

  if (href?.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={[classes, "text-left"].join(" ")}>
      {content}
    </button>
  );
}

function SecurityBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={["rounded-[1.35rem] border p-4", active ? "border-emerald-200 bg-emerald-50/80" : "border-stone-200 bg-sand-50"].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <span className={["rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", active ? "bg-emerald-900 text-white" : "bg-white text-stone-600"].join(" ")}>
          {active ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
