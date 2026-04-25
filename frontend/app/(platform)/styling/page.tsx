"use client";

import * as React from "react";
import { Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlatform } from "@/components/platform-state";
import { formatCurrency } from "@/lib/format";
import type { BodyProfile } from "@/types/platform";

const defaultFormState = {
  name: "",
  heightCm: "170",
  chestCm: "92",
  waistCm: "74",
  hipsCm: "99",
  inseamCm: "78",
  preferredFit: "regular" as "tailored" | "regular" | "relaxed",
  stylePreferences: "minimal, tailored"
};
const CORE_PROFILE_IDS = new Set(["demo-profile-core", "demo-profile-weekend"]);

export default function StylingPage() {
  const router = useRouter();
  const { bootstrap, bodyProfiles, selectedProfile, selectedProfileId, setSelectedProfileId, saveBodyProfile, removeBodyProfile, refreshOutfits, token } =
    usePlatform();
  const [selectedMatchProductId, setSelectedMatchProductId] = React.useState<number | null>(null);
  const [creatingNewProfile, setCreatingNewProfile] = React.useState(false);
  const [formState, setFormState] = React.useState(defaultFormState);

  React.useEffect(() => {
    if (creatingNewProfile) {
      return;
    }

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
  }, [creatingNewProfile, selectedProfile]);

  const activeFitProfile = React.useMemo<BodyProfile | null>(() => {
    if (!creatingNewProfile) {
      return selectedProfile;
    }

    return {
      id: "draft-fitting-profile",
      name: formState.name.trim() || "New fitting profile",
      heightCm: Number(formState.heightCm) || 0,
      chestCm: Number(formState.chestCm) || 0,
      waistCm: Number(formState.waistCm) || 0,
      hipsCm: Number(formState.hipsCm) || 0,
      inseamCm: Number(formState.inseamCm) || 0,
      preferredFit: formState.preferredFit,
      stylePreferences: formState.stylePreferences
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };
  }, [creatingNewProfile, formState, selectedProfile]);

  const fitMatches = React.useMemo(() => {
    if (!activeFitProfile || !bootstrap?.products) {
      return [];
    }

    return bootstrap.products
      .map((product) => {
        let score = 58;
        const lowerMaterials = product.materialsSummary.toLowerCase();
        const styleTags = product.styleTags.map((item) => item.toLowerCase());
        const profilePreferences = activeFitProfile.stylePreferences.map((item) => item.toLowerCase());

        if (activeFitProfile.preferredFit === "tailored" && ["shirt", "dress"].includes(product.garmentType.toLowerCase())) score += 12;
        if (activeFitProfile.preferredFit === "relaxed" && ["outerwear", "knitwear"].includes(product.category.toLowerCase())) score += 12;
        if (activeFitProfile.preferredFit === "regular") score += 8;
        if (lowerMaterials.includes("stretch") || lowerMaterials.includes("nylon") || lowerMaterials.includes("elastane")) score += 5;
        if (profilePreferences.some((preference) => styleTags.includes(preference))) score += 10;
        if (product.targetDemographic.toLowerCase() === "unisex") score += 4;
        if (activeFitProfile.heightCm > 176 && product.category.toLowerCase() === "outerwear") score += 4;
        if (activeFitProfile.waistCm < 76 && ["dress", "shirt"].includes(product.category.toLowerCase())) score += 3;

        score = Math.max(51, Math.min(score, 98));
        return { product, score };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
  }, [activeFitProfile, bootstrap?.products]);

  React.useEffect(() => {
    if (!fitMatches.length) {
      setSelectedMatchProductId(null);
      return;
    }

    if (!fitMatches.some(({ product }) => product.id === selectedMatchProductId)) {
      setSelectedMatchProductId(fitMatches[0]?.product.id ?? null);
    }
  }, [fitMatches, selectedMatchProductId]);

  const selectedFitMatch = React.useMemo(
    () => fitMatches.find(({ product }) => product.id === selectedMatchProductId) ?? fitMatches[0] ?? null,
    [fitMatches, selectedMatchProductId]
  );

  const selectedMarketplaceListing = React.useMemo(
    () => bootstrap?.marketplace.find((listing) => listing.product.id === selectedFitMatch?.product.id) ?? null,
    [bootstrap?.marketplace, selectedFitMatch?.product.id]
  );
  const normalizedProfileName = formState.name.trim();
  const savingAsNewProfile = React.useMemo(() => {
    if (creatingNewProfile) {
      return true;
    }

    if (!selectedProfile) {
      return true;
    }

    return normalizedProfileName.length > 0 && normalizedProfileName !== selectedProfile.name.trim();
  }, [creatingNewProfile, normalizedProfileName, selectedProfile]);
  const selectedProfileIsCore = React.useMemo(() => {
    if (creatingNewProfile || !selectedProfile) {
      return false;
    }

    return CORE_PROFILE_IDS.has(selectedProfile.id);
  }, [creatingNewProfile, selectedProfile]);

  const openMarketplaceForProduct = React.useCallback(
    (productId: number) => {
      const matchingListing = bootstrap?.marketplace.find((listing) => listing.product.id === productId) ?? null;
      router.push(matchingListing ? `/marketplace?listing=${matchingListing.id}` : `/marketplace?product=${productId}`);
    },
    [bootstrap?.marketplace, router]
  );

  const saveProfile = React.useCallback(() => {
    saveBodyProfile({
      id: savingAsNewProfile ? undefined : selectedProfileId || undefined,
      name: normalizedProfileName || selectedProfile?.name || "New fitting profile",
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
    setCreatingNewProfile(false);
  }, [formState, normalizedProfileName, saveBodyProfile, savingAsNewProfile, selectedProfile, selectedProfileId]);
  const outfitSuggestions = React.useMemo(() => {
    const liveOutfits = bootstrap?.user?.outfits ?? [];

    if (liveOutfits.length) {
      return liveOutfits.map((outfit, outfitIndex) => ({
        id: `live-${outfitIndex}-${outfit.title}`,
        title: outfit.title,
        summary: outfit.summary,
        signalLabel: "Live wardrobe sync",
        source: "live" as const,
        items: outfit.items.map((item) => ({
          id: item.id,
          fitScore: null,
          imageUrl: item.product.imageUrl,
          name: item.product.name,
          price: item.purchasePrice ?? item.product.msrp,
          productId: item.product.id
        }))
      }));
    }

    if (!fitMatches.length || !activeFitProfile) {
      return [];
    }

    const topMatches = fitMatches.slice(0, 4);
    const primaryPreference = activeFitProfile.stylePreferences[0] ?? "everyday";
    const profilePrefix = activeFitProfile.name.split(" ")[0] ?? "Profile";
    const fitLabel = toTitleCase(activeFitProfile.preferredFit);
    const buildItems = (items: typeof topMatches) =>
      items.map(({ product, score }) => ({
        id: product.id,
        fitScore: score,
        imageUrl: product.imageUrl,
        name: product.name,
        price: product.msrp,
        productId: product.id
      }));

    const firstLook = topMatches.slice(0, Math.min(2, topMatches.length));
    const secondLook = topMatches.slice(Math.min(1, topMatches.length - 1), Math.min(3, topMatches.length));
    const thirdLook = topMatches.slice(Math.max(0, topMatches.length - 2));

    return [
      {
        id: "demo-primary-edit",
        title: `${fitLabel} Signature Edit`,
        summary: `Built from ${profilePrefix}'s ${activeFitProfile.preferredFit} fit settings and your strongest match signals for an immediate styling direction.`,
        signalLabel: "Demo generated from Fit Match",
        source: "demo" as const,
        items: buildItems(firstLook)
      },
      {
        id: "demo-preference-edit",
        title: `${toTitleCase(primaryPreference)} Focus Look`,
        summary: `Pairs your best ${toTitleCase(primaryPreference)}-leaning products into a wearable outfit suggestion that mirrors your saved preferences.`,
        signalLabel: "Preference-led pairing",
        source: "demo" as const,
        items: buildItems(secondLook)
      },
      {
        id: "demo-marketplace-edit",
        title: "Marketplace Ready Rotation",
        summary: "Highlights a polished set of high-match products that are ready to preview in marketplace and brand storytelling flows.",
        signalLabel: "Conversion-ready demo",
        source: "demo" as const,
        items: buildItems(thirdLook)
      }
    ].filter((suggestion) => suggestion.items.length > 0);
  }, [activeFitProfile, bootstrap?.user?.outfits, fitMatches]);

  return (
    <section className="grid gap-4 xl:min-h-[calc(100vh-8rem)]">
      <div className="rounded-shell border border-white/70 bg-gradient-to-br from-sage-100/90 via-white to-sand-100/90 p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-forest-700">AI Virtual Styling</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Fit Match scoring built from your saved fitting profile</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
              Save a fitting profile, set style preferences, and compute live Fit Match scores against the verified garment catalog.
              If you are signed in, this tab also refreshes AI outfit suggestions from your wardrobe history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Fitting Profile", "Fit Match %", "Style preferences"].map((item) => (
              <span key={item} className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800 shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-start">
        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-900">Fitting Profile</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Built to stay fully visible in fullscreen so profile creation, editing, and Fit Match tuning happen in one view.
                </p>
              </div>
              {bodyProfiles.length ? (
                <div className="flex items-center gap-2">
                  <select
                    value={creatingNewProfile ? "__new__" : selectedProfileId}
                    onChange={(event) => {
                      if (event.target.value === "__new__") {
                        setCreatingNewProfile(true);
                        setFormState(defaultFormState);
                        return;
                      }

                      setCreatingNewProfile(false);
                      setSelectedProfileId(event.target.value);
                    }}
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3 text-sm"
                  >
                    <option value="__new__">New fitting profile</option>
                    {bodyProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                  {creatingNewProfile ? null : selectedProfileId ? (
                    <button
                      type="button"
                      onClick={() => removeBodyProfile(selectedProfileId)}
                      disabled={selectedProfileIsCore}
                      aria-label={`Remove ${selectedProfile?.name ?? "selected"} profile`}
                      title={selectedProfileIsCore ? `${selectedProfile?.name ?? "Core profile"} is protected` : `Remove ${selectedProfile?.name ?? "selected"} profile`}
                      className={[
                        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-white transition",
                        selectedProfileIsCore
                          ? "cursor-not-allowed border-stone-200 text-stone-300"
                          : "border-stone-200 text-stone-600 hover:border-rose-200 hover:text-rose-600"
                      ].join(" ")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Profile name
                <input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3" />
                <span className="text-xs font-medium leading-5 text-stone-500">
                  {savingAsNewProfile ? "Changing the profile name will save this as a new fitting profile." : "Keep the same name to update the selected fitting profile."}
                </span>
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
              <label className="sm:col-span-2 xl:col-span-3 grid gap-2 text-sm font-medium text-stone-700">
                Style preferences
                <input
                  value={formState.stylePreferences}
                  onChange={(event) => setFormState((current) => ({ ...current, stylePreferences: event.target.value }))}
                  placeholder="minimal, utility, tailored"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
            </div>

            {selectedProfileIsCore ? (
              <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-stone-200 bg-sand-50 px-4 py-3">
                <Lock className="mt-0.5 h-4 w-4 text-stone-500" />
                <p className="text-sm leading-6 text-stone-600">
                  Core fitting profiles are protected and stay available for the demo. Rename the profile to fork a new version instead.
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={saveProfile} className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm">
                {savingAsNewProfile ? "Save as new profile" : "Save fitting profile"}
              </button>
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
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Fit Match results</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Live product cards ranked against the currently selected fitting profile and style preferences. Click any product to inspect the full fit detail.</p>
            <div className="mt-5 grid gap-4">
              {fitMatches.length ? (
                <>
                  {selectedFitMatch ? (
                    <article className="grid gap-4 rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sand-50 p-4 shadow-soft sm:grid-cols-[9rem_minmax(0,1fr)]">
                      <img src={selectedFitMatch.product.imageUrl} alt={selectedFitMatch.product.name} className="aspect-square w-full rounded-[1.35rem] object-cover" />
                      <div className="grid gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">{selectedFitMatch.product.brand.name}</p>
                            <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">{selectedFitMatch.product.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{selectedFitMatch.product.productStory}</p>
                          </div>
                          <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Fit Match</p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-forest-900">{selectedFitMatch.score}%</p>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <DetailChip label="Fit guidance" value={`${activeFitProfile?.preferredFit ?? "regular"} profile ready`} />
                          <DetailChip label="Materials" value={selectedFitMatch.product.materialsSummary} />
                          <DetailChip
                            label="Price"
                            value={formatCurrency(selectedMarketplaceListing?.price ?? selectedFitMatch.product.msrp)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedFitMatch.product.styleTags.slice(0, 5).map((tag) => (
                            <span key={`${selectedFitMatch.product.id}-${tag}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openMarketplaceForProduct(selectedFitMatch.product.id)}
                            className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                          >
                            See in marketplace
                          </button>
                        </div>
                      </div>
                    </article>
                  ) : null}

                  {fitMatches.map(({ product, score }) => {
                    const isSelected = selectedFitMatch?.product.id === product.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedMatchProductId(product.id);
                          openMarketplaceForProduct(product.id);
                        }}
                        className={[
                          "grid gap-4 rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft sm:grid-cols-[7rem_minmax(0,1fr)]",
                          isSelected ? "border-emerald-300 bg-emerald-50/70 shadow-soft" : "border-stone-200 bg-sand-50"
                        ].join(" ")}
                      >
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
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                  Save a fitting profile to generate Fit Match results from the live product catalog.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Live outfit suggestions</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {bootstrap?.user?.outfits?.length
                ? "Live outfits from your connected wardrobe are shown first."
                : "Demo looks are generated from the active fitting profile and your highest Fit Match products."}
            </p>
            <div className="mt-4 grid gap-3">
              {outfitSuggestions.length ? (
                outfitSuggestions.map((outfit) => (
                  <article key={outfit.id} className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">{outfit.signalLabel}</p>
                        <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{outfit.title}</h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                        {outfit.source === "live" ? "Live" : "Demo"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{outfit.summary}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {outfit.items.map((item) => (
                        <button
                          key={`${outfit.id}-${item.id}`}
                          type="button"
                          onClick={() => openMarketplaceForProduct(item.productId)}
                          className="flex items-center gap-3 rounded-[1.25rem] border border-white bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
                        >
                          <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-[1rem] object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
                            <p className="mt-1 text-sm text-stone-600">{formatCurrency(item.price)}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
                              {typeof item.fitScore === "number" ? `${item.fitScore}% fit match` : "Live wardrobe item"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {outfit.items.map((item) => (
                        <span key={`${outfit.id}-chip-${item.id}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">
                  Save a fitting profile to generate demo outfit suggestions from the live product catalog.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-stone-800">{value}</p>
    </div>
  );
}

function toTitleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
