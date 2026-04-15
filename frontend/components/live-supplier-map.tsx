"use client";

import * as React from "react";
import { Building2, Factory, Globe2, Leaf, LocateFixed, MapPinned, Droplets, Wrench } from "lucide-react";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import type { Supplier } from "@/types/platform";

const dataStyle = "https://demotiles.maplibre.org/style.json";

const worldviewStyle: StyleSpecification = {
  version: 8,
  sources: {
    imagery: {
      type: "raster",
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri"
    },
    labels: {
      type: "raster",
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri"
    }
  },
  layers: [
    {
      id: "world-imagery",
      type: "raster",
      source: "imagery"
    },
    {
      id: "world-labels",
      type: "raster",
      source: "labels"
    }
  ]
};

const terrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    topo: {
      type: "raster",
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri"
    }
  },
  layers: [
    {
      id: "world-topo",
      type: "raster",
      source: "topo"
    }
  ]
};

type MapMode = "worldview" | "terrain" | "data";

function getSupplierTheme(supplierType: string) {
  const normalized = supplierType.toLowerCase();

  if (normalized.includes("farm")) {
    return {
      Icon: Leaf,
      markerClass: "bg-emerald-700 text-white",
      glowClass: "bg-emerald-300/50",
      chipClass: "border-emerald-200 bg-emerald-50 text-emerald-900"
    };
  }
  if (normalized.includes("dye")) {
    return {
      Icon: Droplets,
      markerClass: "bg-amber-700 text-white",
      glowClass: "bg-amber-300/50",
      chipClass: "border-amber-200 bg-amber-50 text-amber-900"
    };
  }
  if (normalized.includes("repair")) {
    return {
      Icon: Wrench,
      markerClass: "bg-rose-700 text-white",
      glowClass: "bg-rose-300/50",
      chipClass: "border-rose-200 bg-rose-50 text-rose-900"
    };
  }
  if (normalized.includes("headquarters")) {
    return {
      Icon: Building2,
      markerClass: "bg-stone-700 text-white",
      glowClass: "bg-stone-300/50",
      chipClass: "border-stone-200 bg-stone-50 text-stone-900"
    };
  }

  return {
    Icon: Factory,
    markerClass: "bg-forest-900 text-white",
    glowClass: "bg-emerald-200/60",
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-900"
  };
}

function getMapStyle(mode: MapMode) {
  if (mode === "worldview") return worldviewStyle;
  if (mode === "terrain") return terrainStyle;
  return dataStyle;
}

export function LiveSupplierMap({
  suppliers,
  selectedSupplierId,
  onSelectSupplier
}: {
  suppliers: Supplier[];
  selectedSupplierId: number | null;
  onSelectSupplier: (supplierId: number) => void;
}) {
  const mapRef = React.useRef<MapRef | null>(null);
  const [mapMode, setMapMode] = React.useState<MapMode>("worldview");
  const [hoveredSupplierId, setHoveredSupplierId] = React.useState<number | null>(null);
  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;
  const hoveredSupplier = suppliers.find((supplier) => supplier.id === hoveredSupplierId) ?? null;
  const popupSupplier = hoveredSupplier ?? selectedSupplier;

  const networkSummary = React.useMemo(() => {
    const countryCount = new Set(suppliers.map((supplier) => supplier.country)).size;
    const facilityCount = new Set(suppliers.map((supplier) => supplier.supplierType)).size;
    return { countryCount, facilityCount };
  }, [suppliers]);

  const fitToNetwork = React.useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || suppliers.length === 0) {
      return;
    }

    if (suppliers.length === 1) {
      const supplier = suppliers[0];
      map.flyTo({
        center: [supplier.longitude, supplier.latitude],
        zoom: 4.8,
        duration: 900,
        essential: true
      });
      return;
    }

    const bounds = suppliers.reduce(
      (accumulator, supplier) => {
        return {
          minLng: Math.min(accumulator.minLng, supplier.longitude),
          maxLng: Math.max(accumulator.maxLng, supplier.longitude),
          minLat: Math.min(accumulator.minLat, supplier.latitude),
          maxLat: Math.max(accumulator.maxLat, supplier.latitude)
        };
      },
      {
        minLng: suppliers[0].longitude,
        maxLng: suppliers[0].longitude,
        minLat: suppliers[0].latitude,
        maxLat: suppliers[0].latitude
      }
    );

    map.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat]
      ],
      {
        padding: 90,
        duration: 1000,
        essential: true
      }
    );
  }, [suppliers]);

  const focusSelectedSupplier = React.useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !selectedSupplier) {
      return;
    }

    map.flyTo({
      center: [selectedSupplier.longitude, selectedSupplier.latitude],
      zoom: 5.4,
      duration: 900,
      essential: true
    });
  }, [selectedSupplier]);

  React.useEffect(() => {
    fitToNetwork();
  }, [fitToNetwork]);

  React.useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return;
    }

    map.easeTo({
      pitch: mapMode === "worldview" ? 22 : mapMode === "terrain" ? 8 : 0,
      duration: 700,
      essential: true
    });
  }, [mapMode]);

  return (
    <div className="overflow-hidden rounded-shell border border-stone-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Live supplier map</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-900">Verified manufacturers and fabric sources</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-50 p-1">
            {[
              { key: "worldview", label: "Worldview" },
              { key: "terrain", label: "Terrain" },
              { key: "data", label: "Data" }
            ].map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setMapMode(mode.key as MapMode)}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  mapMode === mode.key ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
                ].join(" ")}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={fitToNetwork}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700"
          >
            <Globe2 className="h-4 w-4" />
            Fit network
          </button>
          {selectedSupplier ? (
            <button
              type="button"
              onClick={focusSelectedSupplier}
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700"
            >
              <LocateFixed className="h-4 w-4" />
              Focus selected
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative h-[440px] sm:h-[620px]">
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-sm rounded-[1.75rem] bg-stone-950/76 p-4 text-stone-50 shadow-soft backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">World supplier view</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">Live sourcing network</h3>
          <p className="mt-2 text-sm leading-6 text-stone-200">
            Worldview mode uses satellite imagery with place labels so the supplier network reads like a real sourcing map rather than a wireframe.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-stone-100">{suppliers.length} active pins</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-stone-100">{networkSummary.countryCount} countries</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-stone-100">{networkSummary.facilityCount} facility types</span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex max-w-[32rem] flex-wrap gap-2">
          {["Cotton Farm", "Textile Mill", "Dye Facility", "Garment Factory", "Repair Hub", "Brand Headquarters"].map((item) => {
            const theme = getSupplierTheme(item);
            return (
              <span
                key={item}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm backdrop-blur",
                  theme.chipClass
                ].join(" ")}
              >
                <theme.Icon className="h-3.5 w-3.5" />
                {item}
              </span>
            );
          })}
        </div>

        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{ latitude: 18, longitude: 8, zoom: 1.55, pitch: 18 }}
          reuseMaps
          renderWorldCopies
          attributionControl={false}
          mapStyle={getMapStyle(mapMode)}
          style={{ width: "100%", height: "100%" }}
          onLoad={fitToNetwork}
          onMouseLeave={() => setHoveredSupplierId(null)}
        >
          <NavigationControl position="top-right" />
          {suppliers.map((supplier) => {
            const active = supplier.id === selectedSupplierId;
            const theme = getSupplierTheme(supplier.supplierType);

            return (
              <Marker key={supplier.id} latitude={supplier.latitude} longitude={supplier.longitude} anchor="bottom">
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`${supplier.name}, ${supplier.country}`}
                  onMouseEnter={() => setHoveredSupplierId(supplier.id)}
                  onFocus={() => setHoveredSupplierId(supplier.id)}
                  onClick={() => onSelectSupplier(supplier.id)}
                  className="group relative flex flex-col items-center"
                >
                  <span className={["absolute h-10 w-10 rounded-full blur-md transition", theme.glowClass, active ? "scale-125" : ""].join(" ")} />
                  <span
                    className={[
                      "relative inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border-4 border-white shadow-[0_12px_30px_rgba(17,24,39,0.28)] transition",
                      theme.markerClass,
                      active ? "scale-110" : "group-hover:scale-105"
                    ].join(" ")}
                  >
                    <theme.Icon className="h-5 w-5" />
                  </span>
                  <span className={["-mt-2 h-4 w-4 rotate-45 rounded-[4px] border-b-4 border-r-4 border-white", theme.markerClass.split(" ")[0]].join(" ")} />
                </button>
              </Marker>
            );
          })}

          {popupSupplier ? (
            <Popup
              latitude={popupSupplier.latitude}
              longitude={popupSupplier.longitude}
              closeButton={false}
              closeOnClick={false}
              offset={24}
              className="[&_.maplibregl-popup-content]:rounded-3xl [&_.maplibregl-popup-content]:border [&_.maplibregl-popup-content]:border-stone-200 [&_.maplibregl-popup-content]:bg-white [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-content]:shadow-soft [&_.maplibregl-popup-tip]:hidden"
            >
              <div className="w-80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">{popupSupplier.country}</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{popupSupplier.name}</h3>
                  </div>
                  <span className="rounded-full bg-sand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-800">
                    {popupSupplier.supplierType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-500">
                  {popupSupplier.city}, {popupSupplier.region}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popupSupplier.certifications.slice(0, 3).map((certification) => (
                    <span
                      key={certification}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900"
                    >
                      {certification}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{popupSupplier.transparencyNotes}</p>
                <p className="mt-3 text-sm font-medium text-stone-700">Materials: {popupSupplier.materials.join(", ")}</p>
              </div>
            </Popup>
          ) : null}
        </Map>
      </div>
    </div>
  );
}
