"use client";

import * as React from "react";
import { FeaturePage } from "@/components/feature-page";
import { LiveSupplierMap } from "@/components/live-supplier-map";
import { usePlatform } from "@/components/platform-state";
import { fetchSuppliers } from "@/lib/api";
import type { Supplier } from "@/types/platform";

const emptyFilters = {
  search: "",
  brand: "",
  country: "",
  supplier_type: "",
  region: "",
  certification: "",
  material: "",
  labor_standard: "",
  demographic: "",
  verified_only: true
};

export default function SuppliersPage() {
  const { bootstrap } = usePlatform();
  const allSuppliers = bootstrap?.suppliers ?? [];
  const [filters, setFilters] = React.useState(emptyFilters);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(allSuppliers);
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<number | null>(allSuppliers[0]?.id ?? null);
  const [status, setStatus] = React.useState("Live suppliers are loaded from the verified platform database.");
  const [isApplying, setIsApplying] = React.useState(false);

  React.useEffect(() => {
    if (bootstrap?.suppliers) {
      setSuppliers(bootstrap.suppliers);
      setSelectedSupplierId((current) => current ?? bootstrap.suppliers[0]?.id ?? null);
    }
  }, [bootstrap?.suppliers]);

  React.useEffect(() => {
    if (selectedSupplierId && suppliers.some((supplier) => supplier.id === selectedSupplierId)) {
      return;
    }
    setSelectedSupplierId(suppliers[0]?.id ?? null);
  }, [selectedSupplierId, suppliers]);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;

  const estimatedRating = React.useMemo(() => {
    if (!selectedSupplier) {
      return 0;
    }
    const avgBrandTransparency =
      selectedSupplier.brands.reduce((sum, brand) => sum + brand.transparencyScore, 0) / Math.max(selectedSupplier.brands.length, 1);
    const rating = Math.min(5, 2.4 + avgBrandTransparency / 45 + selectedSupplier.certifications.length * 0.18);
    return Math.round(rating * 10) / 10;
  }, [selectedSupplier]);

  const countryOptions = React.useMemo(
    () => Array.from(new Set(allSuppliers.map((supplier) => supplier.country))).sort((left, right) => left.localeCompare(right)),
    [allSuppliers]
  );

  const supplierTypeOptions = React.useMemo(
    () => Array.from(new Set(allSuppliers.map((supplier) => supplier.supplierType))).sort((left, right) => left.localeCompare(right)),
    [allSuppliers]
  );

  const networkSummary = React.useMemo(() => {
    const countries = new Set(suppliers.map((supplier) => supplier.country));
    const materials = new Set(suppliers.flatMap((supplier) => supplier.materials));
    const verified = suppliers.filter((supplier) => supplier.isVerified).length;

    return {
      countryCount: countries.size,
      materialCount: materials.size,
      verifiedCount: verified
    };
  }, [suppliers]);

  const applyFilters = React.useCallback(async () => {
    setIsApplying(true);
    try {
      const response = await fetchSuppliers(filters);
      setSuppliers(response.items);
      setSelectedSupplierId(response.items[0]?.id ?? null);
      setStatus(`${response.items.length} live suppliers match the current worldview filters.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load suppliers.");
    } finally {
      setIsApplying(false);
    }
  }, [filters]);

  const resetFilters = React.useCallback(() => {
    setFilters(emptyFilters);
    setSuppliers(allSuppliers);
    setSelectedSupplierId(allSuppliers[0]?.id ?? null);
    setStatus("Filters reset to the full live supplier network.");
  }, [allSuppliers]);

  return (
    <FeaturePage
      eyebrow="Supplier Transparency"
      title="Realistic global sourcing map with live manufacturer pins"
      description="Explore a more realistic worldview map, search the live supplier network across countries and facility types, and inspect certification-backed sourcing details directly from the pin layer."
      highlights={["Worldview map", "Live pins", "Multi-filter search"]}
      steps={[
        "Start with one search term or filter first.",
        "Pick one supplier from the results or map.",
        "Use the detail panel to review certifications, materials, and brand links."
      ]}
      actions={[
        { href: "/marketplace", label: "Open Shop" },
        { href: "/trust", label: "Review Trust Center" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void applyFilters();
              }}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.8fr)_minmax(12rem,0.8fr)]">
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Global supplier search
                  <input
                    value={filters.search}
                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                    placeholder="Supplier, country, city, certification, brand, material"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Country
                  <select
                    value={filters.country}
                    onChange={(event) => setFilters((current) => ({ ...current, country: event.target.value }))}
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  >
                    <option value="">All countries</option>
                    {countryOptions.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Facility type
                  <select
                    value={filters.supplier_type}
                    onChange={(event) => setFilters((current) => ({ ...current, supplier_type: event.target.value }))}
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  >
                    <option value="">All facility types</option>
                    {supplierTypeOptions.map((supplierType) => (
                      <option key={supplierType} value={supplierType}>
                        {supplierType}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Region
                  <input
                    value={filters.region}
                    onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}
                    placeholder="Europe, Vietnam, North America"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Certification
                  <input
                    value={filters.certification}
                    onChange={(event) => setFilters((current) => ({ ...current, certification: event.target.value }))}
                    placeholder="GOTS, Fair Trade, WRAP"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Fabric
                  <input
                    value={filters.material}
                    onChange={(event) => setFilters((current) => ({ ...current, material: event.target.value }))}
                    placeholder="Organic Cotton, Merino, TENCEL"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Labor standard
                  <input
                    value={filters.labor_standard}
                    onChange={(event) => setFilters((current) => ({ ...current, labor_standard: event.target.value }))}
                    placeholder="Living wage, SA8000, artisan network"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Demographic
                  <input
                    value={filters.demographic}
                    onChange={(event) => setFilters((current) => ({ ...current, demographic: event.target.value }))}
                    placeholder="Women, Unisex, Outdoor"
                    className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={filters.verified_only}
                    onChange={(event) => setFilters((current) => ({ ...current, verified_only: event.target.checked }))}
                    className="rounded border-stone-300 text-forest-900 focus:ring-forest-700"
                  />
                  Verified suppliers only
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                  >
                    {isApplying ? "Filtering..." : "Apply live filters"}
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                {suppliers.length} live pins
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                {networkSummary.countryCount} countries
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                {networkSummary.materialCount} material groups
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                {networkSummary.verifiedCount} verified
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-stone-600">{status}</p>
          </div>

          <LiveSupplierMap suppliers={suppliers} selectedSupplierId={selectedSupplierId} onSelectSupplier={setSelectedSupplierId} />
        </div>

        <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
          {selectedSupplier ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Realistic pin detail</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{selectedSupplier.name}</h2>
              <p className="mt-1 text-sm text-stone-500">
                {selectedSupplier.city}, {selectedSupplier.country} · {selectedSupplier.supplierType}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-sand-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Region</p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-stone-900">{selectedSupplier.region}</p>
                </div>
                <div className="rounded-[1.5rem] bg-sand-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Brands</p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-stone-900">{selectedSupplier.brands.length}</p>
                </div>
                <div className="rounded-[1.5rem] bg-sand-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Materials</p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-stone-900">{selectedSupplier.materials.length}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-stone-900 p-4 text-stone-50">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Live sustainability rating</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{estimatedRating.toFixed(1)}/5</p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-stone-900">Verified certifications</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSupplier.certifications.map((certification) => (
                    <span
                      key={certification}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900"
                    >
                      {certification}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-stone-900">Fabrics produced</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSupplier.materials.map((material) => (
                    <span key={material} className="rounded-full bg-sand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-sand-50 p-4">
                <p className="text-sm font-semibold text-stone-900">Labor and verification</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{selectedSupplier.laborStandard}</p>
                <p className="mt-3 text-sm leading-7 text-stone-600">{selectedSupplier.transparencyNotes}</p>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-sand-50 p-4">
                <p className="text-sm font-semibold text-stone-900">Associated brands</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-stone-600">
                  {selectedSupplier.brands.map((brand) => (
                    <li key={`${brand.id}-${brand.relationshipType}`}>
                      {brand.name} · {brand.relationshipType} · Transparency {brand.transparencyScore}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 p-6 text-sm leading-6 text-stone-500">
              No suppliers match the current filter set.
            </div>
          )}
        </div>
      </div>
    </FeaturePage>
  );
}
