import * as React from "react";
import Map, { Marker, NavigationControl, Popup, type MapLayerMouseEvent, type ViewState } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";

export type SupplierPin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  country: string;
  sustainabilitySummary: string;
  certifications: string[];
  materialFocus?: string[];
};

type SupplierTransparencyMapProps = {
  suppliers: SupplierPin[];
  selectedSupplierId?: string;
  onSelectSupplier?: (supplier: SupplierPin) => void;
  initialViewState?: Partial<ViewState>;
  mapStyles?: {
    vector: string;
    satellite: string;
  };
};

const defaultMapStyles = {
  vector: "https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_MAPTILER_KEY",
  satellite: "https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_MAPTILER_KEY",
};

export function SupplierTransparencyMap({
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
  initialViewState,
  mapStyles = defaultMapStyles,
}: SupplierTransparencyMapProps) {
  const [activeStyle, setActiveStyle] = React.useState<"vector" | "satellite">("satellite");
  const [hoveredSupplierId, setHoveredSupplierId] = React.useState<string | null>(null);

  const selectedSupplier =
    suppliers.find((supplier) => supplier.id === selectedSupplierId) ??
    suppliers.find((supplier) => supplier.id === hoveredSupplierId) ??
    suppliers[0];

  const handlePointerLeave = React.useCallback(() => {
    setHoveredSupplierId(null);
  }, []);

  const handleMapMove = React.useCallback((_event: MapLayerMouseEvent) => {
    // Reserved for future clustered hover interactions and analytics.
  }, []);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(27,31,24,0.08)]">
        <div className="flex flex-col gap-4 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-700">Supplier Transparency Map</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Global ethical sourcing, with real production context</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Explore certified suppliers through a realistic map layer, inspect ethical credentials, and compare sustainability narratives by region.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-50 p-1">
            <button
              type="button"
              onClick={() => setActiveStyle("vector")}
              className={[
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                activeStyle === "vector" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900",
              ].join(" ")}
            >
              Detailed
            </button>
            <button
              type="button"
              onClick={() => setActiveStyle("satellite")}
              className={[
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                activeStyle === "satellite" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900",
              ].join(" ")}
            >
              Satellite
            </button>
          </div>
        </div>

        <div className="relative h-[420px] sm:h-[520px]">
          <Map
            mapLib={maplibregl}
            initialViewState={{
              latitude: 18,
              longitude: 8,
              zoom: 1.55,
              ...initialViewState,
            }}
            reuseMaps
            attributionControl={false}
            mapStyle={mapStyles[activeStyle]}
            onMouseLeave={handlePointerLeave}
            onMouseMove={handleMapMove}
            className="h-full w-full"
          >
            <NavigationControl position="top-right" />

            {suppliers.map((supplier) => {
              const selected = supplier.id === selectedSupplier?.id;
              const hovered = supplier.id === hoveredSupplierId;

              return (
                <Marker key={supplier.id} latitude={supplier.latitude} longitude={supplier.longitude} anchor="bottom">
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${supplier.name}, ${supplier.country}`}
                    onMouseEnter={() => setHoveredSupplierId(supplier.id)}
                    onFocus={() => setHoveredSupplierId(supplier.id)}
                    onClick={() => onSelectSupplier?.(supplier)}
                    className={[
                      "group relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-[0_10px_30px_rgba(17,24,39,0.28)] transition",
                      selected || hovered ? "scale-110 bg-emerald-900 text-white" : "bg-white text-emerald-900 hover:scale-105",
                    ].join(" ")}
                  >
                    <span className="absolute -inset-2 rounded-full border border-white/40 bg-white/10 blur-md" />
                    <span className="relative h-3.5 w-3.5 rounded-full bg-current" />
                  </button>
                </Marker>
              );
            })}

            {hoveredSupplierId ? (
              <HoverSupplierPopup
                supplier={suppliers.find((supplier) => supplier.id === hoveredSupplierId) ?? null}
                onClose={() => setHoveredSupplierId(null)}
              />
            ) : null}
          </Map>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 via-black/5 to-transparent" />
        </div>
      </div>

      <aside className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_18px_50px_rgba(27,31,24,0.08)]">
        {selectedSupplier ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-700">Selected Supplier</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{selectedSupplier.name}</h3>
            <p className="mt-1 text-sm font-medium text-stone-500">
              {selectedSupplier.region} · {selectedSupplier.country}
            </p>

            <p className="mt-5 text-sm leading-6 text-stone-600">{selectedSupplier.sustainabilitySummary}</p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-stone-900">Ethical Certifications</p>
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

            {selectedSupplier.materialFocus?.length ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-stone-900">Material Focus</p>
                <ul className="mt-3 grid gap-2 text-sm text-stone-600">
                  {selectedSupplier.materialFocus.map((material) => (
                    <li key={material} className="rounded-2xl bg-stone-50 px-3 py-2">
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 rounded-3xl bg-stone-900 p-4 text-stone-50">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-300">Sustainability Summary</p>
              <p className="mt-2 text-sm leading-6 text-stone-200">
                Designed for quick sourcing review, this card remains visible after a pin click so production, sustainability, and marketplace teams can share the same context.
              </p>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50 px-6 text-center text-sm leading-6 text-stone-500">
            Add supplier coordinates to render interactive pins and supplier detail cards.
          </div>
        )}
      </aside>
    </section>
  );
}

function HoverSupplierPopup({
  supplier,
  onClose,
}: {
  supplier: SupplierPin | null;
  onClose: () => void;
}) {
  if (!supplier) {
    return null;
  }

  return (
    <Popup
      latitude={supplier.latitude}
      longitude={supplier.longitude}
      closeButton={false}
      closeOnClick={false}
      onClose={onClose}
      offset={24}
      className="[&_.maplibregl-popup-content]:rounded-3xl [&_.maplibregl-popup-content]:border [&_.maplibregl-popup-content]:border-stone-200 [&_.maplibregl-popup-content]:bg-white [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-content]:shadow-[0_18px_50px_rgba(27,31,24,0.18)] [&_.maplibregl-popup-tip]:hidden"
    >
      <div className="w-72 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700">{supplier.country}</p>
        <h4 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{supplier.name}</h4>
        <p className="mt-2 text-sm leading-6 text-stone-600">{supplier.sustainabilitySummary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {supplier.certifications.map((certification) => (
            <span key={certification} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
              {certification}
            </span>
          ))}
        </div>
      </div>
    </Popup>
  );
}
