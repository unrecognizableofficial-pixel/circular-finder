"use client";

import * as React from "react";
import Link from "next/link";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";
import { formatCurrency } from "@/lib/format";

export default function ProfilePage() {
  const { bootstrap, login, register, logout, error, loading, bodyProfiles } = usePlatform();
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = React.useState({ fullName: "", email: "", password: "" });
  const [registerConsent, setRegisterConsent] = React.useState({
    acceptedTerms: true,
    ageConfirmed: true,
    marketingConsent: false
  });
  const [status, setStatus] = React.useState("Use your live account to connect wardrobe analytics, resale actions, and personal styling data.");

  return (
    <FeaturePage
      eyebrow="Account Profile"
      title="Measurements, wardrobe settings, and marketplace preferences"
      description="Sign in or create an account against the live backend, review connected wardrobe impact data, and confirm which saved fitting profiles are available for styling."
      highlights={["Account settings", "Measurements", "Notification rules"]}
      steps={[
        "Check whether you already have a live session first.",
        "Review your saved fitting profiles next.",
        "Use sign in or create account only after the account summary is clear."
      ]}
      actions={[
        { href: "/styling", label: "Open Fit & Style" },
        { href: "/trust", label: "Open Trust Center" }
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-900">Live account session</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{status}</p>
              </div>
              {bootstrap?.user?.profile ? (
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                >
                  Sign out
                </button>
              ) : null}
            </div>

            {bootstrap?.user?.profile ? (
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <ProfileMetric label="Name" value={bootstrap.user.profile.fullName} />
                <ProfileMetric label="Email" value={bootstrap.user.profile.email} />
                <ProfileMetric label="Role" value={bootstrap.user.profile.role} />
                <ProfileMetric label="Saved fitting profiles" value={String(bodyProfiles.length)} />
                <ProfileMetric label="Wardrobe value" value={formatCurrency(bootstrap.user.insights.totalWardrobeValue)} />
                <ProfileMetric label="Unused resale" value={formatCurrency(bootstrap.user.insights.unusedClothingValue)} />
              </dl>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                No live session is active yet. Sign in below to connect your personal wardrobe and marketplace activity.
              </div>
            )}

            {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          </div>

          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Saved fitting profiles</h2>
            <div className="mt-4 grid gap-3">
              {bodyProfiles.length ? (
                bodyProfiles.map((profile) => (
                  <article key={profile.id} className="rounded-[1.5rem] bg-sand-50 p-4">
                    <h3 className="text-lg font-semibold tracking-tight text-stone-900">{profile.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {profile.heightCm}cm · {profile.preferredFit} fit · {profile.stylePreferences.join(", ")}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                  Save a fitting profile from the Styling tab to make Fit Match scoring persistent.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <form
            className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft"
            onSubmit={(event) => {
              event.preventDefault();
              void login(loginForm.email, loginForm.password)
                .then(() => setStatus("Signed in to the live platform."))
                .catch((nextError) => setStatus(nextError instanceof Error ? nextError.message : "Could not sign in."));
            }}
          >
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Sign in</h2>
            <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 text-sm leading-6 text-stone-600">
              By continuing, you agree to the{" "}
              <Link href="/trust#terms-policies" className="font-semibold text-forest-800 underline decoration-forest-200 underline-offset-4">
                Terms & Policies
              </Link>{" "}
              and can review privacy, security, and AI transparency controls anytime in{" "}
              <Link href="/trust#privacy-center" className="font-semibold text-forest-800 underline decoration-forest-200 underline-offset-4">
                Trust Center
              </Link>
              .
            </div>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Email
                <input
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="name@company.com"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter your password"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <button type="submit" className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm">
                {loading ? "Loading..." : "Sign in"}
              </button>
            </div>
          </form>

          <form
            className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft"
            onSubmit={(event) => {
              event.preventDefault();
              void register(registerForm.fullName, registerForm.email, registerForm.password)
                .then(() => setStatus("Account created and signed in."))
                .catch((nextError) => setStatus(nextError instanceof Error ? nextError.message : "Could not create account."));
            }}
          >
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Create account</h2>
            <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 text-sm leading-6 text-stone-600">
              New accounts can review privacy controls, camera permissions, AI transparency, and billing disclosures from the trust center in{" "}
              <Link href="/trust" className="font-semibold text-forest-800 underline decoration-forest-200 underline-offset-4">
                Trust Center
              </Link>
              .
            </div>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Full name
                <input
                  value={registerForm.fullName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Jamie Rivera"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Email
                <input
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="jamie@example.com"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="At least 8 characters"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="flex items-start gap-3 rounded-[1.25rem] border border-stone-200 bg-sand-50 px-4 py-3 text-sm leading-6 text-stone-700">
                <input
                  type="checkbox"
                  checked={registerConsent.acceptedTerms}
                  onChange={(event) => setRegisterConsent((current) => ({ ...current, acceptedTerms: event.target.checked }))}
                  className="mt-1"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/trust#terms-policies" className="font-semibold text-forest-800 underline decoration-forest-200 underline-offset-4">
                    Terms & Policies
                  </Link>{" "}
                  and understand how my account data is used.
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[1.25rem] border border-stone-200 bg-sand-50 px-4 py-3 text-sm leading-6 text-stone-700">
                <input
                  type="checkbox"
                  checked={registerConsent.ageConfirmed}
                  onChange={(event) => setRegisterConsent((current) => ({ ...current, ageConfirmed: event.target.checked }))}
                  className="mt-1"
                />
                <span>I confirm that I am at least 13 years old and can use Circular Finder under the platform age policy.</span>
              </label>
              <label className="flex items-start gap-3 rounded-[1.25rem] border border-stone-200 bg-sand-50 px-4 py-3 text-sm leading-6 text-stone-700">
                <input
                  type="checkbox"
                  checked={registerConsent.marketingConsent}
                  onChange={(event) => setRegisterConsent((current) => ({ ...current, marketingConsent: event.target.checked }))}
                  className="mt-1"
                />
                <span>
                  Send me product, marketplace, and Impact Points™ updates. I can change this later in{" "}
                  <Link href="/trust#privacy-center" className="font-semibold text-forest-800 underline decoration-forest-200 underline-offset-4">
                    Privacy Center
                  </Link>
                  .
                </span>
              </label>
              <button
                type="submit"
                disabled={!registerConsent.acceptedTerms || !registerConsent.ageConfirmed}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset ring-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </FeaturePage>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-sand-50 p-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className="mt-2 text-base font-semibold tracking-tight text-stone-900">{value}</dd>
    </div>
  );
}
