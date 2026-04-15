"use client";

import * as React from "react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";

export default function StylingPage() {
  const { bootstrap, bodyProfiles, selectedProfile, selectedProfileId, setSelectedProfileId, saveBodyProfile, removeBodyProfile, refreshOutfits, token } =
    usePlatform();
  const [formState, setFormState] = React.useState({
    name: "",
    heightCm: "170",
    chestCm: "92",
    waistCm: "74",
    hipsCm: "99",
    inseamCm: "78",
    preferredFit: "regular" as "tailored" | "regular" | "relaxed",
    stylePreferences: "minimal, tailored"
  });

  React.useEffect(() => {
    if (selectedProfile) {
      setFormState({
        name: selectedProfile.name,
        heightCm: String(selectedProfile.heightCm),
        chestCm: String(selectedProfile.chestCm),
        waistCm: String(selectedProfile.waistCm),
        hipsCm: String(selectedProfile.hipsCm),
        inseamCm: String(selectedProfile.inseamCm),
        preferredFit: selectedProfile.preferredFit,
        stylePreferences: selectedProfile.stylePreferences.join(", ")
      });
    }
  }, [selectedProfile]);

  const fitMatches = React.useMemo(() => {
    if (!selectedProfile || !bootstrap?.products) {
      return [];
    }

    return bootstrap.products
      .map((product) => {
        let score = 58;
        const lowerMaterials = product.materialsSummary.toLowerCase();
        const styleTags = product.styleTags.map((item) => item.toLowerCase());
        const profilePreferences = selectedProfile.stylePreferences.map((item) => item.toLowerCase());

        if (selectedProfile.preferredFit === "tailored" && ["shirt", "dress"].includes(product.garmentType.toLowerCase())) score += 12;
        if (selectedProfile.preferredFit === "relaxed" && ["outerwear", "knitwear"].includes(product.category.toLowerCase())) score += 12;
        if (selectedProfile.preferredFit === "regular") score += 8;
        if (lowerMaterials.includes("stretch") || lowerMaterials.includes("nylon") || lowerMaterials.includes("elastane")) score += 5;
        if (profilePreferences.some((preference) => styleTags.includes(preference))) score += 10;
        if (product.targetDemographic.toLowerCase() === "unisex") score += 4;
        if (selectedProfile.heightCm > 176 && product.category.toLowerCase() === "outerwear") score += 4;
        if (selectedProfile.waistCm < 76 && ["dress", "shirt"].includes(product.category.toLowerCase())) score += 3;

        score = Math.max(51, Math.min(score, 98));
        return { product, score };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
  }, [bootstrap?.products, selectedProfile]);

  const saveProfile = React.useCallback(() => {
    saveBodyProfile({
      id: selectedProfileId || undefined,
      name: formState.name,
      heightCm: Number(formState.heightCm),
      chestCm: Number(formState.chestCm),
      waistCm: Number(formState.waistCm),
      hipsCm: Number(formState.hipsCm),
      inseamCm: Number(formState.inseamCm),
      preferredFit: formState.preferredFit,
      stylePreferences: formState.stylePreferences
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    });
  }, [formState, saveBodyProfile, selectedProfileId]);

  return (
    <FeaturePage
      eyebrow="AI Virtual Styling"
      title="Fit Match scoring built from saved body profiles"
      description="Save body profiles, set style preferences, and compute live Fit Match scores against the verified garment catalog. If you are signed in, this tab also refreshes AI outfit suggestions from your wardrobe history."
      highlights={["Body profiles", "Fit Match %", "Style preferences"]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-900">Body profiles</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">Saved locally for now, and ready to migrate into a live user profile table later.</p>
              </div>
              {bodyProfiles.length ? (
                <select
                  value={selectedProfileId}
                  onChange={(event) => setSelectedProfileId(event.target.value)}
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3 text-sm"
                >
                  {bodyProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Profile name
                <input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Preferred fit
                <select
                  value={formState.preferredFit}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, preferredFit: event.target.value as "tailored" | "regular" | "relaxed" }))
                  }
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                >
                  {["tailored", "regular", "relaxed"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              {[
                ["heightCm", "Height (cm)"],
                ["chestCm", "Chest (cm)"],
                ["waistCm", "Waist (cm)"],
                ["hipsCm", "Hips (cm)"],
                ["inseamCm", "Inseam (cm)"]
              ].map(([key, label]) => (
                <label key={key} className="grid gap-2 text-sm font-medium text-stone-700">
                  {label}
                  <input
                    value={formState[key as keyof typeof formState] as string}
                    onChange={(event) => setFormState((current) => ({ ...current, [key]: event.target.value }))}
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
              ))}
              <label className="sm:col-span-2 grid gap-2 text-sm font-medium text-stone-700">
                Style preferences
                <input
                  value={formState.stylePreferences}
                  onChange={(event) => setFormState((current) => ({ ...current, stylePreferences: event.target.value }))}
                  placeholder="minimal, utility, tailored"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={saveProfile} className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm">
                Save profile
              </button>
              {selectedProfileId ? (
                <button
                  type="button"
                  onClick={() => removeBodyProfile(selectedProfileId)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                >
                  Remove selected
                </button>
              ) : null}
              {token ? (
                <button
                  type="button"
                  onClick={() => void refreshOutfits()}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                >
                  Refresh live outfits
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Live outfit suggestions</h2>
            <div className="mt-4 grid gap-3">
              {(bootstrap?.user?.outfits ?? []).length ? (
                bootstrap?.user?.outfits.map((outfit) => (
                  <article key={outfit.title} className="rounded-[1.5rem] bg-sand-50 p-4">
                    <h3 className="text-lg font-semibold tracking-tight text-stone-900">{outfit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{outfit.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {outfit.items.map((item) => (
                        <span key={`${outfit.title}-${item.id}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                          {item.product.name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                  Sign in and build a live wardrobe to unlock AI outfit combinations from the backend styling endpoint.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">Fit Match results</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Live product cards ranked against the currently selected body profile and style preferences.</p>
          <div className="mt-5 grid gap-4">
            {fitMatches.length ? (
              fitMatches.map(({ product, score }) => (
                <article key={product.id} className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
                  <img src={product.imageUrl} alt={product.name} className="aspect-square w-full rounded-[1.25rem] object-cover" />
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">{product.brand.name}</p>
                        <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{product.name}</h3>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Fit Match</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-forest-900">{score}%</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-stone-600">{product.materialsSummary}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.styleTags.slice(0, 4).map((tag) => (
                        <span key={`${product.id}-${tag}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                Save a body profile to generate Fit Match results from the live product catalog.
              </div>
            )}
          </div>
        </div>
      </div>
    </FeaturePage>
  );
}
