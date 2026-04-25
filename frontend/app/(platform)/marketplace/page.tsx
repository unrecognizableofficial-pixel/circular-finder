"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { FeaturePage } from "@/components/feature-page";
import { LivePassportReport } from "@/components/live-passport-report";
import { usePlatform } from "@/components/platform-state";
import { createListing, createOrder, fetchMarketplace, fetchPassport } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { MarketplaceListing, Passport } from "@/types/platform";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const { bootstrap, token, refreshBootstrap, refreshWardrobe, selectedRole, selectedProfile, completeChallenge, canAccess } = usePlatform();
  const [filters, setFilters] = React.useState({ search: "", brand: "" });
  const [demoFilters, setDemoFilters] = React.useState({
    size: "",
    category: "",
    condition: "",
    ecoImpact: "",
    nearbyPickup: false
  });
  const [listings, setListings] = React.useState<MarketplaceListing[]>(bootstrap?.marketplace ?? []);
  const [status, setStatus] = React.useState("Demo resale listings are connected to the Circular Finder marketplace feed.");
  const [selectedPassport, setSelectedPassport] = React.useState<Passport | null>(null);
  const [purchaseListingId, setPurchaseListingId] = React.useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = React.useState("");
  const highlightedListingRef = React.useRef<HTMLDivElement | null>(null);
  const [listingForm, setListingForm] = React.useState({
    passport_id: "",
    wardrobe_item_id: "",
    title: "",
    description: "",
    size_label: "",
    condition: "excellent",
    price: ""
  });

  React.useEffect(() => {
    setListings(bootstrap?.marketplace ?? []);
  }, [bootstrap?.marketplace]);

  const highlightedListingId = React.useMemo(() => {
    const listingParam = Number(searchParams.get("listing") ?? "");
    if (Number.isFinite(listingParam) && listingParam > 0 && listings.some((listing) => listing.id === listingParam)) {
      return listingParam;
    }

    const productParam = Number(searchParams.get("product") ?? "");
    if (Number.isFinite(productParam) && productParam > 0) {
      return listings.find((listing) => listing.product.id === productParam)?.id ?? null;
    }

    return null;
  }, [listings, searchParams]);

  React.useEffect(() => {
    if (!highlightedListingId) {
      return;
    }

    const highlighted = listings.find((listing) => listing.id === highlightedListingId);
    if (!highlighted) {
      return;
    }

    setSelectedPassport(highlighted.passport);
    setStatus(`Marketplace handoff ready for ${highlighted.title}.`);
    requestAnimationFrame(() => {
      highlightedListingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [highlightedListingId, listings]);

  const selectedListing = listings.find((listing) => listing.id === purchaseListingId) ?? null;

  const impactLabel = React.useCallback((listing: MarketplaceListing) => {
    if (listing.passport.circularityScore >= 80) return "High impact";
    if (listing.passport.circularityScore >= 65) return "Strong impact";
    return "Emerging impact";
  }, []);

  const fitGuidance = React.useCallback(
    (listing: MarketplaceListing) => {
      if (!selectedProfile) {
        return `Best in ${listing.sizeLabel} once a tailored profile is selected`;
      }
      if (selectedProfile.preferredFit === "tailored") {
        return `Best in ${listing.sizeLabel} for a sharper tailored silhouette`;
      }
      if (selectedProfile.preferredFit === "relaxed") {
        return `Best in ${listing.sizeLabel} with extra ease through the body`;
      }
      return `Best in ${listing.sizeLabel} for a balanced regular fit`;
    },
    [selectedProfile]
  );

  const filteredListings = React.useMemo(
    () =>
      listings.filter((listing) => {
        if (demoFilters.size && !listing.sizeLabel.toLowerCase().includes(demoFilters.size.toLowerCase())) {
          return false;
        }
        if (demoFilters.category && listing.product.category !== demoFilters.category) {
          return false;
        }
        if (demoFilters.condition && listing.condition !== demoFilters.condition) {
          return false;
        }
        if (demoFilters.ecoImpact === "80+" && listing.passport.circularityScore < 80) {
          return false;
        }
        if (demoFilters.ecoImpact === "65+" && listing.passport.circularityScore < 65) {
          return false;
        }
        if (demoFilters.nearbyPickup && listing.id % 2 !== 0) {
          return false;
        }
        return true;
      }),
    [demoFilters, listings]
  );

  const applyFilters = React.useCallback(async () => {
    try {
      const response = await fetchMarketplace(filters, token || undefined);
      setListings(response.items);
      setStatus(`${response.items.length} live listings match the current search.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load marketplace listings.");
    }
  }, [filters, token]);

  const openPassport = React.useCallback(async (passportId: string) => {
    try {
      const passport = await fetchPassport(passportId, token || undefined);
      setSelectedPassport(passport);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load passport.");
    }
  }, [token]);

  const submitListing = React.useCallback(async () => {
    if (!token) {
      setStatus("Sign in from the Profile tab to create live marketplace listings.");
      return;
    }
    if (!canAccess("marketplace.manage")) {
      setStatus(`${selectedRole?.label ?? "This role"} currently has browse-only marketplace access.`);
      return;
    }

    try {
      const response = await createListing(token, {
        passport_id: listingForm.passport_id,
        wardrobe_item_id: listingForm.wardrobe_item_id ? Number(listingForm.wardrobe_item_id) : undefined,
        title: listingForm.title,
        description: listingForm.description,
        size_label: listingForm.size_label,
        condition: listingForm.condition,
        price: Number(listingForm.price)
      });
      setStatus(response.message);
      setListingForm({
        passport_id: "",
        wardrobe_item_id: "",
        title: "",
        description: "",
        size_label: "",
        condition: "excellent",
        price: ""
      });
      completeChallenge("challenge-product");
      await refreshBootstrap();
      await refreshWardrobe();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create listing.");
    }
  }, [canAccess, listingForm, refreshBootstrap, refreshWardrobe, selectedRole?.label, token]);

  const completePurchase = React.useCallback(async () => {
    if (!selectedListing) {
      return;
    }
    if (!token) {
      setStatus("Sign in from the Profile tab to purchase marketplace listings.");
      return;
    }
    if (!shippingAddress.trim()) {
      setStatus("Enter a shipping address to complete the order.");
      return;
    }

    try {
      const response = await createOrder(token, selectedListing.id, shippingAddress.trim());
      setStatus(`${response.message} Tracking reference: ${response.order.trackingReference}`);
      setPurchaseListingId(null);
      setShippingAddress("");
      completeChallenge("challenge-purchase");
      await refreshBootstrap();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not complete the order.");
    }
  }, [refreshBootstrap, selectedListing, shippingAddress, token]);

  return (
    <FeaturePage
      eyebrow="Circular Marketplace"
      title="Live resale listings with impact and condition tags"
      description="Browse demo-ready verified listings, filter by fit and sustainability signals, inspect the attached passport data, and step through purchase or listing flows directly in the marketplace."
      highlights={["Impact tags", "Fit guidance", "Reuse value"]}
      steps={[
        "Start with one filter at a time so the results stay easy to follow.",
        "Open a passport before choosing a listing.",
        "Use purchase or listing actions only after the item details look right."
      ]}
      actions={[
        { href: "/scanner", label: "Back to Scanner" },
        { href: "/impact", label: "See rewards and impact" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-4">
          <div className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-5">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Size
                <input
                  value={demoFilters.size}
                  onChange={(event) => setDemoFilters((current) => ({ ...current, size: event.target.value }))}
                  placeholder="S, M, L"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Category
                <select
                  value={demoFilters.category}
                  onChange={(event) => setDemoFilters((current) => ({ ...current, category: event.target.value }))}
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                >
                  <option value="">All categories</option>
                  {Array.from(new Set((bootstrap?.marketplace ?? []).map((listing) => listing.product.category))).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Condition
                <select
                  value={demoFilters.condition}
                  onChange={(event) => setDemoFilters((current) => ({ ...current, condition: event.target.value }))}
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                >
                  <option value="">All conditions</option>
                  {["new", "excellent", "good", "fair", "repairable"].map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Eco impact
                <select
                  value={demoFilters.ecoImpact}
                  onChange={(event) => setDemoFilters((current) => ({ ...current, ecoImpact: event.target.value }))}
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                >
                  <option value="">All scores</option>
                  <option value="80+">80+ score</option>
                  <option value="65+">65+ score</option>
                </select>
              </label>
              <label className="mt-auto inline-flex items-center gap-3 rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={demoFilters.nearbyPickup}
                  onChange={(event) => setDemoFilters((current) => ({ ...current, nearbyPickup: event.target.checked }))}
                  className="rounded border-stone-300"
                />
                Nearby pickup
              </label>
            </div>
          </div>

          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem_auto]">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Search listings
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="trench, denim, tote"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Brand
                <select
                  value={filters.brand}
                  onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                >
                  <option value="">All brands</option>
                  {bootstrap?.brands.map((brand) => (
                    <option key={brand.id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void applyFilters()}
                className="mt-auto rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
              >
                Filter marketplace
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{status}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredListings.map((listing) => (
              <article
                key={listing.id}
                ref={listing.id === highlightedListingId ? highlightedListingRef : null}
                className={[
                  "overflow-hidden rounded-shell border bg-white shadow-soft transition",
                  listing.id === highlightedListingId ? "border-emerald-300 ring-2 ring-emerald-200" : "border-stone-200"
                ].join(" ")}
              >
                <img src={listing.imageUrl} alt={listing.title} className="aspect-[4/4.6] w-full object-cover" />
                <div className="grid gap-3 p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                      {listing.condition}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                      {impactLabel(listing)}
                    </span>
                    {listing.id === highlightedListingId ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                        From Fit Match
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">{listing.product.brand.name}</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">{listing.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{listing.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                      {listing.sizeLabel}
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                      {listing.passport.circularityScore}/100 circularity
                    </span>
                    {listing.id % 2 === 0 ? (
                      <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                        Nearby pickup
                      </span>
                    ) : null}
                  </div>
                  <div className="grid gap-3 rounded-[1.5rem] bg-sand-50 p-4">
                    <Detail label="Fit guidance" value={fitGuidance(listing)} />
                    <Detail label="Material origin" value={listing.passport.countryOfOrigin} />
                    <Detail label="Repairability" value={`${listing.passport.durabilityRating}/100 durability`} />
                    <Detail label="Reuse value" value={formatCurrency(listing.passport.resaleValueEstimate)} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-stone-500">Seller</p>
                      <p className="font-medium text-stone-900">{listing.seller.name}</p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-stone-900">{formatCurrency(listing.price)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPurchaseListingId(listing.id)}
                      className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                    >
                      Buy now
                    </button>
                    <button
                      type="button"
                      onClick={() => void openPassport(listing.passport.passportId)}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                    >
                      Open passport
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Create verified listing</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              List a garment with its passport id and optional wardrobe item id to push it directly into the live marketplace.
              {!canAccess("marketplace.manage") ? ` ${selectedRole?.label ?? "This role"} can browse listings here but cannot publish new ones.` : ""}
            </p>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Passport id
                <input
                  value={listingForm.passport_id}
                  onChange={(event) => setListingForm((current) => ({ ...current, passport_id: event.target.value }))}
                  placeholder="DPP-EL-TRN-001"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Wardrobe item
                <select
                  value={listingForm.wardrobe_item_id}
                  onChange={(event) => setListingForm((current) => ({ ...current, wardrobe_item_id: event.target.value }))}
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                >
                  <option value="">Optional live wardrobe item</option>
                  {bootstrap?.user?.wardrobe.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nickname || item.product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Title
                <input
                  value={listingForm.title}
                  onChange={(event) => setListingForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Sage trench with verified passport"
                  className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Size
                  <input
                    value={listingForm.size_label}
                    onChange={(event) => setListingForm((current) => ({ ...current, size_label: event.target.value }))}
                    placeholder="M"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Condition
                  <select
                    value={listingForm.condition}
                    onChange={(event) => setListingForm((current) => ({ ...current, condition: event.target.value }))}
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  >
                    {["new", "excellent", "good", "fair", "repairable"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Price
                  <input
                    value={listingForm.price}
                    onChange={(event) => setListingForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="180"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Description
                <textarea
                  value={listingForm.description}
                  onChange={(event) => setListingForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Condition notes, wear history, and styling context"
                  className="min-h-28 rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                />
              </label>
              <button
                type="button"
                onClick={() => void submitListing()}
                disabled={!canAccess("marketplace.manage")}
                className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
              >
                Create live listing
              </button>
            </div>
          </div>

          <LivePassportReport passport={selectedPassport} />
        </div>
      </div>

      {selectedListing ? (
        <div className="fixed inset-0 z-50 flex items-end bg-stone-950/40 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-xl rounded-shell border border-stone-200 bg-white p-5 shadow-shell">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Complete purchase</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{selectedListing.title}</h2>
              </div>
              <button type="button" onClick={() => setPurchaseListingId(null)} className="text-sm font-medium text-stone-500">
                Close
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Enter the shipping address for this live order. The backend will convert the listing to `sold` and return a tracking reference.
            </p>
            <label className="mt-5 grid gap-2 text-sm font-medium text-stone-700">
              Shipping address
              <textarea
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                className="min-h-28 rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                placeholder="Street, city, state, postal code"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void completePurchase()}
                className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
              >
                Confirm order for {formatCurrency(selectedListing.price)}
              </button>
              <button
                type="button"
                onClick={() => setPurchaseListingId(null)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FeaturePage>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-stone-800">{value}</p>
    </div>
  );
}
