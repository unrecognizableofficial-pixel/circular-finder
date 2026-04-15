import type { BootstrapPayload, MarketplaceListing, Passport, Supplier, UserProfile, WardrobeItem, WardrobeInsights, Outfit } from "@/types/platform";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const url = new URL(path, API_BASE_URL);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "detail" in payload ? String(payload.detail) : "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

export const apiBaseUrl = API_BASE_URL;

export async function fetchBootstrap(token?: string) {
  return request<BootstrapPayload>("/api/bootstrap", { token });
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: UserProfile }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function register(fullName: string, email: string, password: string) {
  return request<{ token: string; user: UserProfile }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, email, password })
  });
}

export async function fetchSuppliers(filters: {
  search?: string;
  brand?: string;
  country?: string;
  supplier_type?: string;
  region?: string;
  certification?: string;
  material?: string;
  labor_standard?: string;
  demographic?: string;
  verified_only?: boolean;
}) {
  return request<{ items: Supplier[] }>("/api/suppliers/map", { params: filters });
}

export async function fetchMarketplace(filters: { search?: string; brand?: string }) {
  return request<{ items: MarketplaceListing[] }>("/api/marketplace/listings", { params: filters });
}

export async function fetchPassport(passportId: string) {
  return request<Passport>(`/api/passports/${passportId}`);
}

export async function lookupPassport(scanType: string, scanValue: string, hints: string, token?: string) {
  return request<{ recognized: boolean; confidence: number; message?: string; passport?: Passport }>("/api/scan/lookup", {
    method: "POST",
    token,
    body: JSON.stringify({ scan_type: scanType, scan_value: scanValue, hints })
  });
}

export async function uploadScan(file: File | Blob, fileName: string, hints: string, brandHint: string, token?: string) {
  const form = new FormData();
  form.append("file", file, fileName);
  form.append("hints", hints);
  form.append("brand_hint", brandHint);

  return request<{ recognized: boolean; confidence: number; uploadedImageUrl?: string; message?: string; passport?: Passport }>(
    "/api/scan/upload",
    {
      method: "POST",
      token,
      body: form
    }
  );
}

export async function addWardrobeItem(passportId: string, token: string, nickname?: string, purchasePrice?: number) {
  return request<{ message: string; item: WardrobeItem }>("/api/wardrobe/items", {
    method: "POST",
    token,
    body: JSON.stringify({
      passport_id: passportId,
      nickname: nickname ?? "",
      condition: "excellent",
      purchase_price: purchasePrice
    })
  });
}

export async function fetchWardrobe(token: string) {
  return request<{ items: WardrobeItem[]; insights: WardrobeInsights; outfits: Outfit[] }>("/api/wardrobe", { token });
}

export async function logWardrobeEvent(itemId: number, eventType: string, token: string) {
  return request<{ message: string; item: WardrobeItem }>(`/api/wardrobe/items/${itemId}/events`, {
    method: "POST",
    token,
    body: JSON.stringify({ event_type: eventType, note: `${eventType} logged from the live dashboard.` })
  });
}

export async function fetchOutfits(token: string) {
  return request<{ items: Outfit[] }>("/api/styling/outfits", { token });
}

export async function createListing(
  token: string,
  payload: {
    passport_id: string;
    wardrobe_item_id?: number;
    title: string;
    description?: string;
    size_label: string;
    condition: string;
    price: number;
  }
) {
  return request<{ message: string; listing: MarketplaceListing }>("/api/marketplace/listings", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export async function createOrder(token: string, listingId: number, shippingAddress: string) {
  return request<{ message: string; order: { id: number; trackingReference: string; orderStatus: string; totalPrice: number } }>(
    "/api/marketplace/orders",
    {
      method: "POST",
      token,
      body: JSON.stringify({ listing_id: listingId, shipping_address: shippingAddress })
    }
  );
}
