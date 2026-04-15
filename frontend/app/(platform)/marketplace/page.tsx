"use client";

import * as React from "react";
import { FeaturePage } from "@/components/feature-page";
import { LivePassportReport } from "@/components/live-passport-report";
import { usePlatform } from "@/components/platform-state";
import { createListing, createOrder, fetchMarketplace, fetchPassport } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { MarketplaceListing, Passport } from "@/types/platform";

export default function MarketplacePage() {
  const { bootstrap, token, refreshBootstrap, refreshWardrobe } = usePlatform();
  const [filters, setFilters] = React.useState({ search: "", brand: "" });
  const [listings, setListings] = React.useState<MarketplaceListing[]>(bootstrap?.marketplace ?? []);
  const [status, setStatus] = React.useState("Live resale listings are connected to the verified marketplace feed.");
  const [selectedPassport, setSelectedPassport] = React.useState<Passport | null>(null);
  const [purchaseListingId, setPurchaseListingId] = React.useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = React.useState("");
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

  const selectedListing = listings.find((listing) => listing.id === purchaseListingId) ?? null;

  const impactLabel = React.useCallback((listing: MarketplaceListing) => {
    if (listing.passport.circularityScore >= 80) return "High impact";
    if (listing.passport.circularityScore >= 65) return "Strong impact";
    return "Emerging impact";
  }, []);

  const applyFilters = React.useCallback(async () => {
    try {
      const response = await fetchMarketplace(filters);
      setListings(response.items);
      setStatus(`${response.items.length} live listings match the current search.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load marketplace listings.");
    }
  }, [filters]);

  const openPassport = React.useCallback(async (passportId: string) => {
    try {
      const passport = await fetchPassport(passportId);
      setSelectedPassport(passport);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load passport.");
    }
  }, []);

  const submitListing = React.useCallback(async () => {
    if (!token) {
      setStatus("Sign in from the Profile tab to create live marketplace listings.");
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
      await refreshBootstrap();
      await refreshWardrobe();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create listing.");
    }
  }, [listingForm, refreshBootstrap, refreshWardrobe, token]);

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
      await refreshBootstrap();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not complete the order.");
    }
  }, [refreshBootstrap, selectedListing, shippingAddress, token]);

  return (
    <FeaturePage
      eyebrow="Circular Marketplace"
      title="Live resale listings with impact and condition tags"
      description="Browse live verified listings, filter by brand or search term, inspect the attached passport data, and create or purchase listings directly from the live backend."
      highlights={["Live listings", "Condition tags", "Impact tags"]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-4">
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
                Filter live feed
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{status}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-shell border border-stone-200 bg-white shadow-soft">
                <img src={listing.imageUrl} alt={listing.title} className="aspect-[4/4.6] w-full object-cover" />
                <div className="grid gap-3 p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                      {listing.condition}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                      {impactLabel(listing)}
                    </span>
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
            <p className="mt-2 text-sm leading-6 text-stone-600">List a garment with its passport id and optional wardrobe item id to push it directly into the live marketplace.</p>
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
                className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
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
