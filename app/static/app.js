const state = {
  token: localStorage.getItem("circularFinderToken") || "",
  bootstrap: null,
  activePassport: null,
  selectedSupplierId: null,
  cameraStream: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  authStatus: $("#auth-status"),
  toast: $("#toast"),
  logoutButton: $("#logout-button"),
  adminNavLink: $("#admin-nav-link"),
  adminAccessLink: $("#admin-access-link"),
  adminAccessState: $("#admin-access-state"),
  brandSelector: $("#brand-selector"),
  mapBrandFilter: $("#map-brand-filter"),
  marketplaceBrandFilter: $("#marketplace-brand-filter"),
  passportTitle: $("#passport-title"),
  passportStatusBadge: $("#passport-status-badge"),
  passportResult: $("#passport-result"),
  addWardrobeButton: $("#add-wardrobe-button"),
  openListingButton: $("#open-listing-button"),
  learnBrandButton: $("#learn-brand-button"),
  mapNodes: $("#map-nodes"),
  mapDetails: $("#map-details"),
  mapSummary: $("#map-summary"),
  wardrobeInsights: $("#wardrobe-insights"),
  outfitSuggestions: $("#outfit-suggestions"),
  wardrobeList: $("#wardrobe-list"),
  refreshWardrobeButton: $("#refresh-wardrobe-button"),
  generateOutfitsButton: $("#generate-outfits-button"),
  marketplaceList: $("#marketplace-list"),
  brandList: $("#brand-list"),
  adminPanel: $("#admin-panel"),
  adminQueue: $("#admin-queue"),
  brandApiStatus: $("#brand-api-status"),
  scannerVideo: $("#scanner-video"),
  scannerCanvas: $("#scanner-canvas"),
  scanFileInput: $("#scan-file-input"),
  heroPassportCount: $("#hero-passport-count"),
  heroSupplierCount: $("#hero-supplier-count"),
  heroListingCount: $("#hero-listing-count"),
  heroBrandCount: $("#hero-brand-count"),
  listingAccessNote: $("#listing-access-note"),
};

function getFormField(form, name) {
  return form?.elements?.namedItem(name);
}

function showToast(message, kind = "info") {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  elements.toast.style.background =
    kind === "error" ? "rgba(120, 43, 34, 0.96)" : kind === "success" ? "rgba(36, 77, 57, 0.96)" : "rgba(32, 50, 42, 0.94)";
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => elements.toast.classList.add("hidden"), 3400);
}

function scrollToSection(selector, block = "start") {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block });
}

function ensureSignedIn(featureName, targetSelector = "#auth-access") {
  if (state.bootstrap?.user?.profile) {
    return true;
  }
  showToast(`Sign in to access ${featureName}.`);
  scrollToSection(targetSelector, "start");
  return false;
}

function ensureAdmin(featureName) {
  if (state.bootstrap?.user?.profile?.role === "admin") {
    return true;
  }
  showToast(`This action requires an admin account for ${featureName}.`);
  scrollToSection("#auth-access", "start");
  return false;
}

function ensureActivePassport(featureName) {
  if (state.activePassport) {
    return true;
  }
  showToast(`Scan or open a verified passport before ${featureName}.`);
  scrollToSection("#scanner", "start");
  return false;
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (state.token) {
    headers.set("Authorization", `Bearer ${state.token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(payload.detail || payload.message || "Request failed.");
  }
  return payload;
}

function setToken(token) {
  state.token = token || "";
  if (token) {
    localStorage.setItem("circularFinderToken", token);
  } else {
    localStorage.removeItem("circularFinderToken");
  }
}

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function percent(value) {
  return `${Math.round(value || 0)}%`;
}

function fillBrandSelectors(brands = []) {
  const options = ['<option value="">All / Any brand</option>']
    .concat(brands.map((brand) => `<option value="${brand.name}">${brand.name}</option>`))
    .join("");
  [elements.brandSelector, elements.mapBrandFilter, elements.marketplaceBrandFilter].forEach((node) => {
    if (node) {
      node.innerHTML = options;
    }
  });
}

function projectToMap(latitude, longitude) {
  return {
    left: `${((longitude + 180) / 360) * 100}%`,
    top: `${((90 - latitude) / 180) * 100}%`,
  };
}

function renderHero() {
  const brands = state.bootstrap?.brands || [];
  const suppliers = state.bootstrap?.suppliers || [];
  const marketplace = state.bootstrap?.marketplace || [];
  const products = state.bootstrap?.products || [];
  elements.heroPassportCount.textContent = String(products.length);
  elements.heroSupplierCount.textContent = String(suppliers.length);
  elements.heroListingCount.textContent = String(marketplace.length);
  elements.heroBrandCount.textContent = String(brands.length);
}

function renderAuth() {
  const user = state.bootstrap?.user?.profile;
  if (!user) {
    elements.authStatus.textContent = "Not signed in";
    elements.logoutButton.classList.add("hidden");
    elements.adminNavLink.classList.add("hidden");
    elements.adminPanel.classList.add("hidden");
    elements.adminAccessLink.setAttribute("href", "#auth-access");
    elements.adminAccessState.textContent = "Admin account required";
    elements.listingAccessNote.textContent = "Sign in to create verified listings.";
    return;
  }

  elements.authStatus.textContent = `${user.fullName} · ${user.role}`;
  elements.logoutButton.classList.remove("hidden");
  elements.listingAccessNote.textContent =
    user.role === "admin"
      ? "Admin access is active. Review live verification requests and moderation tasks."
      : "Signed in. Verified wardrobe items and scanned passports can be listed for resale.";
  if (user.role === "admin") {
    elements.adminNavLink.classList.remove("hidden");
    elements.adminPanel.classList.remove("hidden");
    elements.adminAccessLink.setAttribute("href", "#admin-panel");
    elements.adminAccessState.textContent = "Moderation unlocked for this session";
  } else {
    elements.adminNavLink.classList.add("hidden");
    elements.adminPanel.classList.add("hidden");
    elements.adminAccessLink.setAttribute("href", "#auth-access");
    elements.adminAccessState.textContent = "Sign in with an admin account to open moderation tools";
  }
}

function renderPassport(passport) {
  state.activePassport = passport || null;
  if (!passport) {
    const previews = (state.bootstrap?.products || []).slice(0, 2);
    elements.passportTitle.textContent = "Featured verified passports";
    elements.passportStatusBadge.textContent = "Scan to replace preview";
    if (!previews.length) {
      elements.passportResult.className = "passport-result empty-state";
      elements.passportResult.textContent = "Start the camera, scan a code, or upload an image to retrieve the digital passport.";
      return;
    }
    elements.passportResult.className = "passport-result";
    elements.passportResult.innerHTML = `
      <p class="preview-note">Use the scanner, QR lookup, barcode, NFC, or image upload to replace this curated preview with a live digital passport match.</p>
      <div class="preview-passport-grid">
        ${previews
          .map(
            (product) => `
              <article class="preview-card">
                <img src="${product.imageUrl}" alt="${product.name}" />
                <p class="eyebrow">${product.brand.name}</p>
                <h5>${product.name}</h5>
                <p>${product.materialsSummary}</p>
                <div class="detail-grid">
                  <span class="tag">${product.passport.circularityScore}/100 circularity</span>
                  <span class="tag">${product.passport.durabilityRating} durability</span>
                  <span class="tag">${product.targetDemographic}</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
    return;
  }

  const product = passport.product;
  const brand = passport.brand || product.brand;
  elements.passportTitle.textContent = product.name;
  elements.passportStatusBadge.textContent = `${passport.passportStatus} · ${passport.circularityScore}/100`;
  elements.passportResult.className = "passport-result";
  elements.passportResult.innerHTML = `
    <div class="passport-hero">
      <img class="passport-image" src="${product.imageUrl}" alt="${product.name}" />
      <div>
        <p class="eyebrow">${brand.name}</p>
        <h4>${product.name}</h4>
        <p>${product.productStory}</p>
        <div class="detail-grid">
          <span class="tag">${product.garmentType}</span>
          <span class="tag">${product.baseColor}</span>
          <span class="tag">${product.targetDemographic}</span>
          <span class="tag">${currency(passport.resaleValueEstimate)} resale estimate</span>
        </div>
      </div>
    </div>
    <div class="stats-grid">
      <article class="stat-card"><span>Circularity score</span><strong>${passport.circularityScore}</strong></article>
      <article class="stat-card"><span>Durability rating</span><strong>${passport.durabilityRating}</strong></article>
      <article class="stat-card"><span>Carbon footprint</span><strong>${passport.carbonFootprintKg}kg</strong></article>
      <article class="stat-card"><span>Water usage</span><strong>${Math.round(passport.waterUsageLiters)}L</strong></article>
    </div>
    <div class="meta-grid">
      ${passport.sustainabilityCertifications.map((item) => `<span class="tag">${item}</span>`).join("")}
    </div>
    <div class="supplier-card">
      <h5>Repair & Recycling</h5>
      <p><strong>Repair:</strong> ${passport.repairInstructions}</p>
      <p><strong>Recycle:</strong> ${passport.recyclingInstructions}</p>
      <p><strong>Factory:</strong> ${passport.factoryLocation} · ${passport.countryOfOrigin}</p>
    </div>
    <div>
      <p class="eyebrow">Product Journey</p>
      <div class="journey-list">
        ${passport.journey
          .map(
            (step) => `
              <article class="journey-step">
                <strong>${step.stepType}</strong>
                <h5>${step.name}</h5>
                <p>${step.country}</p>
                <p>${step.details}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderMap() {
  const suppliers = state.bootstrap?.suppliers || [];
  if (!suppliers.length) {
    elements.mapNodes.innerHTML = "";
    elements.mapDetails.innerHTML = "";
    state.selectedSupplierId = null;
    return;
  }

  const hasSelectedSupplier = suppliers.some((supplier) => supplier.id === state.selectedSupplierId);
  if (!hasSelectedSupplier) {
    state.selectedSupplierId = suppliers[0].id;
  }

  elements.mapNodes.innerHTML = suppliers
    .map((supplier) => {
      const point = projectToMap(supplier.latitude, supplier.longitude);
      const isActive = supplier.id === state.selectedSupplierId;
      return `
        <button
          class="map-node ${isActive ? "active" : ""}"
          data-supplier-id="${supplier.id}"
          style="left:${point.left}; top:${point.top};"
          title="${supplier.name}"
          aria-label="${supplier.name}, ${supplier.supplierType} in ${supplier.city || supplier.country}"
        ></button>
      `;
    })
    .join("");

  renderMapDetails();
}

function renderMapDetails() {
  const suppliers = state.bootstrap?.suppliers || [];
  const supplier = suppliers.find((item) => item.id === state.selectedSupplierId);
  if (!supplier) {
    elements.mapSummary.textContent = "No suppliers match the current filter set.";
    elements.mapDetails.innerHTML = "";
    return;
  }

  elements.mapSummary.textContent = `${supplier.name} · ${supplier.supplierType} · ${supplier.city}, ${supplier.country}`;
  elements.mapDetails.innerHTML = `
    <article class="supplier-card">
      <h5>${supplier.name}</h5>
      <p>${supplier.transparencyNotes}</p>
      <div class="detail-grid">
        ${supplier.certifications.map((item) => `<span class="tag">${item}</span>`).join("")}
        ${supplier.materials.map((item) => `<span class="tag">${item}</span>`).join("")}
      </div>
      <p><strong>Labor standard:</strong> ${supplier.laborStandard}</p>
      <p><strong>Associated brands:</strong></p>
      <div class="brand-pill-row">
        ${supplier.brands.map((brand) => `<span class="brand-pill">${brand.name} · ${brand.relationshipType}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderWardrobe() {
  const user = state.bootstrap?.user;
  if (!user) {
    const products = state.bootstrap?.products || [];
    const marketplace = state.bootstrap?.marketplace || [];
    const averageCircularity =
      products.length > 0
        ? Math.round(products.reduce((sum, product) => sum + (product.passport?.circularityScore || 0), 0) / products.length)
        : 0;
    const resalePool = marketplace.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const previewProducts = products.slice(0, 3);

    elements.wardrobeInsights.className = "stats-grid";
    elements.wardrobeInsights.innerHTML = `
      <article class="stat-card"><span>Preview passports</span><strong>${products.length}</strong></article>
      <article class="stat-card"><span>Average circularity</span><strong>${averageCircularity}</strong></article>
      <article class="stat-card"><span>Visible resale pool</span><strong>${currency(resalePool)}</strong></article>
      <article class="stat-card"><span>Repair-ready brands</span><strong>${state.bootstrap?.brands?.length || 0}</strong></article>
    `;

    elements.outfitSuggestions.className = "outfit-grid";
    elements.outfitSuggestions.innerHTML = `
      <article class="outfit-card">
        <p class="eyebrow">Signed-out preview</p>
        <h5>Capsule recombination</h5>
        <p>Sign in to generate wardrobe-specific outfits from your owned pieces and repair history.</p>
        <div class="detail-grid">
          ${previewProducts.slice(0, 2).map((item) => `<span class="tag">${item.name}</span>`).join("")}
        </div>
      </article>
      <article class="outfit-card">
        <p class="eyebrow">Resale intelligence</p>
        <h5>Unlock dormant value</h5>
        <p>Track wears, identify low-use garments, and route them directly into verified resale.</p>
        <div class="detail-grid">
          ${marketplace.slice(0, 2).map((item) => `<span class="tag">${item.product.brand.name}</span>`).join("")}
        </div>
      </article>
    `;

    elements.wardrobeList.className = "wardrobe-list";
    elements.wardrobeList.innerHTML = `
      <div class="preview-wardrobe-grid">
        ${previewProducts
          .map(
            (item) => `
              <article class="preview-card">
                <img src="${item.imageUrl}" alt="${item.name}" />
                <p class="eyebrow">${item.brand.name}</p>
                <h5>${item.name}</h5>
                <p>${item.productStory}</p>
                <div class="detail-grid">
                  <span class="tag">${item.passport.passportId}</span>
                  <span class="tag">${currency(item.passport.resaleValueEstimate)} resale</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
    return;
  }

  const insights = user.insights;
  elements.wardrobeInsights.className = "stats-grid";
  elements.wardrobeInsights.innerHTML = `
    <article class="stat-card"><span>Inventory</span><strong>${insights.inventoryCount}</strong></article>
    <article class="stat-card"><span>Usage rate</span><strong>${percent(insights.usageRate)}</strong></article>
    <article class="stat-card"><span>Wardrobe value</span><strong>${currency(insights.totalWardrobeValue)}</strong></article>
    <article class="stat-card"><span>Unused resale value</span><strong>${currency(insights.unusedClothingValue)}</strong></article>
    <article class="stat-card"><span>Outfit potential</span><strong>${insights.outfitPotential}</strong></article>
    <article class="stat-card"><span>Repair-ready items</span><strong>${insights.repairReadyCount}</strong></article>
  `;

  elements.outfitSuggestions.className = "outfit-grid";
  elements.outfitSuggestions.innerHTML =
    user.outfits.length > 0
      ? user.outfits
          .map(
            (outfit) => `
              <article class="outfit-card">
                <h5>${outfit.title}</h5>
                <p>${outfit.summary}</p>
                <div class="detail-grid">
                  ${outfit.items.map((item) => `<span class="tag">${item.product.name}</span>`).join("")}
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state">Add more categories to your wardrobe to expand styling combinations.</div>`;

  elements.wardrobeList.className = "wardrobe-list";
  elements.wardrobeList.innerHTML =
    user.wardrobe.length > 0
      ? user.wardrobe
          .map(
            (item) => `
              <article class="wardrobe-item">
                <img class="wardrobe-image" src="${item.product.imageUrl}" alt="${item.product.name}" />
                <div>
                  <p class="eyebrow">${item.product.brand.name}</p>
                  <h5>${item.nickname || item.product.name}</h5>
                  <p>${item.product.name} · ${item.condition} · Passport ${item.passport.passportId}</p>
                  <div class="detail-grid">
                    <span class="tag">${item.wearCount} wears</span>
                    <span class="tag">${item.repairCount} repairs</span>
                    <span class="tag">${currency(item.resaleOpportunity)} resale potential</span>
                    <span class="tag">${item.status}</span>
                  </div>
                  <p>${item.notes || item.passport.repairInstructions}</p>
                  <div class="wardrobe-actions">
                    <button class="button button-secondary" data-item-action="worn" data-item-id="${item.id}">Mark Worn</button>
                    <button class="button button-ghost" data-item-action="repaired" data-item-id="${item.id}">Log Repair</button>
                    <button class="button button-ghost" data-item-action="donated" data-item-id="${item.id}">Donate</button>
                    <button class="button button-ghost" data-item-action="recycled" data-item-id="${item.id}">Recycle</button>
                    <button class="button" data-fill-listing="${item.id}" data-passport-id="${item.passport.passportId}" data-product-name="${item.product.name}">Sell This Item</button>
                  </div>
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state">Your wardrobe is empty. Use the scanner to add verified pieces.</div>`;
}

function renderMarketplace() {
  const listings = state.bootstrap?.marketplace || [];
  elements.marketplaceList.innerHTML =
    listings.length > 0
      ? listings
          .map(
            (listing) => `
              <article class="marketplace-item">
                <div class="marketplace-media">
                  <img class="listing-image" src="${listing.imageUrl}" alt="${listing.title}" />
                  <span class="marketplace-badge">${currency(listing.price)}</span>
                </div>
                <div class="marketplace-copy">
                  <div class="marketplace-summary">
                    <p class="eyebrow">${listing.product.brand.name}</p>
                    <h5>${listing.title}</h5>
                    <p>${listing.condition} condition · ${listing.sizeLabel} · ${listing.passport.circularityScore}/100 circularity</p>
                  </div>
                  <div class="marketplace-tags">
                    <span class="tag">${listing.expectedDaysToSell} days to sell</span>
                    <span class="tag">Suggested ${currency(listing.predictedPrice)}</span>
                  </div>
                  <footer class="marketplace-actions">
                    <button class="button" data-buy-listing="${listing.id}">Buy Now</button>
                    <button class="button button-secondary" data-view-passport="${listing.passport.passportId}">Open Passport</button>
                  </footer>
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state">No listings match the current marketplace filter.</div>`;
}

function renderBrands() {
  const brands = state.bootstrap?.brands || [];
  elements.brandList.innerHTML =
    brands.length > 0
      ? brands
          .map(
            (brand) => `
              <article class="brand-card">
                <p class="eyebrow">${brand.headquartersRegion}</p>
                <h5>${brand.name}</h5>
                <p>${brand.description}</p>
                <div class="detail-grid">
                  <span class="tag">Transparency ${brand.transparencyScore}</span>
                  <span class="tag">Rating ${brand.sustainabilityRating} · ${brand.ratingLabel}</span>
                  ${brand.demographics.map((item) => `<span class="tag">${item}</span>`).join("")}
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state">No brands match the current search.</div>`;
}

function renderAdmin() {
  const user = state.bootstrap?.user?.profile;
  if (!user || user.role !== "admin") {
    elements.adminQueue.innerHTML = "";
    return;
  }

  api("/api/admin/verification-requests")
    .then((payload) => {
      elements.adminQueue.innerHTML =
        payload.items.length > 0
          ? payload.items
              .map(
                (item) => `
                  <article class="admin-item">
                    <p class="eyebrow">${item.requestType} · ${item.status}</p>
                    <h5>${item.brandName || "Unknown brand"} · ${item.productName || "Pending item"}</h5>
                    <p>${item.payload.notes || "No extra notes provided."}</p>
                    <div class="detail-grid">
                      ${item.payload.targetDemographic ? `<span class="tag">${item.payload.targetDemographic}</span>` : ""}
                      ${item.payload.countryOfOrigin ? `<span class="tag">${item.payload.countryOfOrigin}</span>` : ""}
                      <span class="tag">${new Date(item.submittedAt).toLocaleString()}</span>
                    </div>
                    <div class="admin-actions">
                      <button class="button" data-review-request="${item.id}" data-review-status="approved">Approve</button>
                      <button class="button button-secondary" data-review-request="${item.id}" data-review-status="rejected">Reject</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<div class="empty-state">The moderation queue is clear.</div>`;
    })
    .catch((error) => {
      elements.adminQueue.innerHTML = `<div class="empty-state">${error.message}</div>`;
    });
}

function updateBootstrap(payload) {
  state.bootstrap = payload;
  fillBrandSelectors(payload.knownBrandOptions || payload.brands || []);
  renderHero();
  renderAuth();
  renderPassport(state.activePassport);
  renderMap();
  renderWardrobe();
  renderMarketplace();
  renderBrands();
  renderAdmin();
}

async function fetchBootstrap() {
  const payload = await api("/api/bootstrap", { headers: state.token ? {} : { "Content-Type": "application/json" } });
  updateBootstrap(payload);
}

async function handleAuth(event, endpoint) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const body = Object.fromEntries(formData.entries());
  const payload = await api(endpoint, { method: "POST", body: JSON.stringify(body) });
  setToken(payload.token);
  await fetchBootstrap();
  showToast(`Signed in as ${payload.user.fullName}.`, "success");
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera access is not available in this browser.", "error");
    return;
  }
  if (state.cameraStream) {
    return;
  }
  state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
  elements.scannerVideo.srcObject = state.cameraStream;
  elements.scannerVideo.closest(".camera-shell")?.classList.add("is-live");
  await elements.scannerVideo.play();
  showToast("Camera ready for passport scanning.");
}

async function scanByCode() {
  const scanValue = $("#scan-code").value.trim();
  const hints = $("#scan-hints").value.trim();
  if (!scanValue) {
    showToast("Enter a QR, barcode, NFC, or passport value first.", "error");
    return;
  }
  const scanType = scanValue.startsWith("QR-")
    ? "qr"
    : scanValue.startsWith("NFC-")
    ? "nfc"
    : scanValue.startsWith("DPP-")
    ? "passport"
    : "barcode";
  const payload = await api("/api/scan/lookup", {
    method: "POST",
    body: JSON.stringify({ scan_type: scanType, scan_value: scanValue, hints }),
  });
  if (payload.recognized) {
    renderPassport(payload.passport);
    showToast(`Passport matched with ${(payload.confidence * 100).toFixed(0)}% confidence.`, "success");
  } else {
    renderPassport(null);
    showToast(payload.message, "error");
  }
}

async function detectBarcodeFromVideo() {
  if (!("BarcodeDetector" in window)) {
    return null;
  }
  try {
    const detector = new BarcodeDetector({
      formats: ["qr_code", "ean_13", "code_128", "upc_a", "upc_e"],
    });
    const results = await detector.detect(elements.scannerVideo);
    if (!results.length) {
      return null;
    }
    const first = results[0];
    return {
      scan_type: first.format === "qr_code" ? "qr" : "barcode",
      scan_value: first.rawValue,
    };
  } catch (error) {
    return null;
  }
}

async function captureAndScan() {
  if (!state.cameraStream) {
    await startCamera();
  }
  const barcodeResult = await detectBarcodeFromVideo();
  if (barcodeResult) {
    const payload = await api("/api/scan/lookup", {
      method: "POST",
      body: JSON.stringify({ ...barcodeResult, hints: $("#scan-hints").value.trim() }),
    });
    if (payload.recognized) {
      renderPassport(payload.passport);
      showToast("QR or barcode detected from the camera feed.", "success");
      return;
    }
  }

  const canvas = elements.scannerCanvas;
  canvas.width = elements.scannerVideo.videoWidth || 1280;
  canvas.height = elements.scannerVideo.videoHeight || 720;
  const context = canvas.getContext("2d");
  context.drawImage(elements.scannerVideo, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  const data = new FormData();
  data.append("file", blob, "camera-capture.jpg");
  data.append("hints", $("#scan-hints").value.trim());
  data.append("brand_hint", elements.brandSelector.value);
  const payload = await api("/api/scan/upload", { method: "POST", body: data });
  if (payload.recognized) {
    renderPassport(payload.passport);
    showToast(`AI garment recognition matched ${payload.passport.product.name}.`, "success");
  } else {
    renderPassport(null);
    $("#verification-form [name='image_url']").value = payload.uploadedImageUrl || "";
    showToast(payload.message, "error");
  }
}

async function uploadImage(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("hints", $("#scan-hints").value.trim());
  data.append("brand_hint", elements.brandSelector.value);
  const payload = await api("/api/scan/upload", { method: "POST", body: data });
  if (payload.recognized) {
    renderPassport(payload.passport);
    showToast("Uploaded garment matched a verified passport.", "success");
  } else {
    renderPassport(null);
    const imageField = $("#verification-form [name='image_url']");
    if (imageField) {
      imageField.value = payload.uploadedImageUrl || "";
    }
    showToast(payload.message, "error");
  }
}

function serializeForm(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  Object.keys(values).forEach((key) => {
    if (values[key] === "") {
      delete values[key];
    }
  });
  return values;
}

async function submitVerification(event) {
  event.preventDefault();
  if (!ensureSignedIn("verification submissions")) {
    return;
  }
  const form = event.currentTarget;
  const payload = serializeForm(form);
  payload.materials = payload.materials ? payload.materials.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const response = await api("/api/verification/passports", { method: "POST", body: JSON.stringify(payload) });
  showToast(response.message, "success");
  form.reset();
}

async function refreshSupplierMap(event) {
  if (event) {
    event.preventDefault();
  }
  const params = new URLSearchParams(serializeForm($("#map-filter-form")));
  const payload = await api(`/api/suppliers/map?${params.toString()}`);
  state.bootstrap.suppliers = payload.items;
  state.selectedSupplierId = payload.items[0]?.id || null;
  renderMap();
}

async function refreshMarketplace(event) {
  if (event) {
    event.preventDefault();
  }
  const params = new URLSearchParams(serializeForm($("#marketplace-filter-form")));
  const payload = await api(`/api/marketplace/listings?${params.toString()}`);
  state.bootstrap.marketplace = payload.items;
  renderMarketplace();
}

async function refreshBrands(event) {
  if (event) {
    event.preventDefault();
  }
  const params = new URLSearchParams(serializeForm($("#brand-filter-form")));
  const payload = await api(`/api/brands?${params.toString()}`);
  state.bootstrap.brands = payload.items;
  renderBrands();
}

async function refreshWardrobe() {
  if (!ensureSignedIn("wardrobe analytics")) {
    return;
  }
  const payload = await api("/api/wardrobe");
  state.bootstrap.user.wardrobe = payload.items;
  state.bootstrap.user.insights = payload.insights;
  state.bootstrap.user.outfits = payload.outfits;
  renderWardrobe();
}

async function addPassportToWardrobe() {
  if (!ensureSignedIn("your wardrobe")) {
    return;
  }
  if (!ensureActivePassport("adding a piece to your wardrobe")) {
    return;
  }
  const payload = await api("/api/wardrobe/items", {
    method: "POST",
    body: JSON.stringify({
      passport_id: state.activePassport.passportId,
      nickname: state.activePassport.product.name,
      condition: "excellent",
      purchase_price: state.activePassport.product.msrp,
    }),
  });
  await refreshWardrobe();
  showToast(payload.message, "success");
}

function fillListingFromPassport() {
  if (!ensureSignedIn("resale listings")) {
    return;
  }
  if (!ensureActivePassport("creating a resale listing")) {
    return;
  }
  const form = $("#listing-form");
  getFormField(form, "passport_id").value = state.activePassport.passportId;
  getFormField(form, "title").value = `${state.activePassport.product.name}, verified passport included`;
  getFormField(form, "description").value = `Circularity score ${state.activePassport.circularityScore}. ${state.activePassport.repairInstructions}`;
  showToast("Listing form prefilled from the active passport.");
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function createListing(event) {
  event.preventDefault();
  if (!ensureSignedIn("resale listings")) {
    return;
  }
  const form = event.currentTarget;
  const values = serializeForm(form);
  if (values.wardrobe_item_id) {
    values.wardrobe_item_id = Number(values.wardrobe_item_id);
  }
  values.price = Number(values.price);
  const payload = await api("/api/marketplace/listings", { method: "POST", body: JSON.stringify(values) });
  showToast(payload.message, "success");
  form.reset();
  await refreshMarketplace();
  if (state.bootstrap.user) {
    await refreshWardrobe();
  }
}

async function buyListing(listingId) {
  if (!ensureSignedIn("marketplace purchases", "#marketplace")) {
    return;
  }
  const shipping = window.prompt("Enter a shipping address for this verified order:");
  if (!shipping) {
    return;
  }
  const payload = await api("/api/marketplace/orders", {
    method: "POST",
    body: JSON.stringify({ listing_id: Number(listingId), shipping_address: shipping }),
  });
  showToast(`Order placed. Tracking ref ${payload.order.trackingReference}.`, "success");
  await refreshMarketplace();
}

async function reviewRequest(requestId, reviewStatus) {
  if (!ensureAdmin("moderation tools")) {
    return;
  }
  const notes = window.prompt(`Optional notes for ${reviewStatus}:`, "") || "";
  const payload = await api(`/api/admin/verification-requests/${requestId}/review`, {
    method: "POST",
    body: JSON.stringify({ status: reviewStatus, review_notes: notes }),
  });
  showToast(payload.message, "success");
  renderAdmin();
}

async function logWardrobeEvent(itemId, eventType) {
  if (!ensureSignedIn("wardrobe history")) {
    return;
  }
  const noteMap = {
    worn: "Wear logged from the dashboard.",
    repaired: "Repair logged from the dashboard.",
    donated: "Donation marked in dashboard history.",
    recycled: "Recycling event logged in dashboard history.",
  };
  await api(`/api/wardrobe/items/${itemId}/events`, {
    method: "POST",
    body: JSON.stringify({ event_type: eventType, note: noteMap[eventType] || "" }),
  });
  await refreshWardrobe();
  showToast("Wardrobe history updated.", "success");
}

function bindEvents() {
  $("#login-form").addEventListener("submit", (event) => handleAuth(event, "/api/auth/login").catch((error) => showToast(error.message, "error")));
  $("#register-form").addEventListener("submit", (event) => handleAuth(event, "/api/auth/register").catch((error) => showToast(error.message, "error")));
  $("#verification-form").addEventListener("submit", (event) => submitVerification(event).catch((error) => showToast(error.message, "error")));
  $("#map-filter-form").addEventListener("submit", (event) => refreshSupplierMap(event).catch((error) => showToast(error.message, "error")));
  $("#marketplace-filter-form").addEventListener("submit", (event) => refreshMarketplace(event).catch((error) => showToast(error.message, "error")));
  $("#brand-filter-form").addEventListener("submit", (event) => refreshBrands(event).catch((error) => showToast(error.message, "error")));
  $("#listing-form").addEventListener("submit", (event) => createListing(event).catch((error) => showToast(error.message, "error")));

  elements.logoutButton.addEventListener("click", async () => {
    setToken("");
    state.activePassport = null;
    await fetchBootstrap();
    renderPassport(null);
    showToast("Logged out.");
  });

  $("#start-camera-button").addEventListener("click", () => startCamera().catch((error) => showToast(error.message, "error")));
  $("#capture-scan-button").addEventListener("click", () => captureAndScan().catch((error) => showToast(error.message, "error")));
  $("#lookup-code-button").addEventListener("click", () => scanByCode().catch((error) => showToast(error.message, "error")));
  $("#upload-image-button").addEventListener("click", () => elements.scanFileInput.click());
  elements.scanFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    uploadImage(file).catch((error) => showToast(error.message, "error"));
    event.target.value = "";
  });

  elements.addWardrobeButton.addEventListener("click", () => addPassportToWardrobe().catch((error) => showToast(error.message, "error")));
  elements.openListingButton.addEventListener("click", fillListingFromPassport);
  elements.learnBrandButton.addEventListener("click", () => {
    $("#verification-form").scrollIntoView({ behavior: "smooth", block: "center" });
    if (state.activePassport) {
      $("#verification-form [name='product_name']").value = state.activePassport.product.name;
      $("#verification-form [name='brand_name']").value = state.activePassport.product.brand.name;
    } else if (elements.brandSelector.value) {
      $("#verification-form [name='brand_name']").value = elements.brandSelector.value;
    }
  });

  $("#reset-map-button").addEventListener("click", async () => {
    $("#map-filter-form").reset();
    await fetchBootstrap();
    renderMap();
  });

  $("#refresh-wardrobe-button").addEventListener("click", () => refreshWardrobe().catch((error) => showToast(error.message, "error")));
  $("#generate-outfits-button").addEventListener("click", async () => {
    if (!ensureSignedIn("AI styling suggestions", "#wardrobe")) {
      return;
    }
    const payload = await api("/api/styling/outfits");
    state.bootstrap.user.outfits = payload.items;
    renderWardrobe();
    showToast("Styling engine refreshed.", "success");
  });

  $("#refresh-admin-button").addEventListener("click", () => {
    if (!ensureAdmin("moderation tools")) {
      return;
    }
    renderAdmin();
  });
  $("#copy-api-button").addEventListener("click", async () => {
    const codeText = $("#brand-api-code").textContent;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(codeText);
      elements.brandApiStatus.textContent = "API example copied to clipboard";
      showToast("Brand API example copied.", "success");
      return;
    }
    elements.brandApiStatus.textContent = "Clipboard access unavailable. Copy from the code sample directly.";
    showToast("Clipboard access is unavailable in this browser.", "error");
  });

  elements.mapNodes.addEventListener("click", (event) => {
    const button = event.target.closest("[data-supplier-id]");
    if (!button) {
      return;
    }
    state.selectedSupplierId = Number(button.dataset.supplierId);
    renderMap();
  });

  document.body.addEventListener("click", (event) => {
    const wardrobeAction = event.target.closest("[data-item-action]");
    if (wardrobeAction) {
      logWardrobeEvent(Number(wardrobeAction.dataset.itemId), wardrobeAction.dataset.itemAction).catch((error) => showToast(error.message, "error"));
      return;
    }

    const fillListing = event.target.closest("[data-fill-listing]");
    if (fillListing) {
      const form = $("#listing-form");
      getFormField(form, "passport_id").value = fillListing.dataset.passportId;
      getFormField(form, "wardrobe_item_id").value = fillListing.dataset.fillListing;
      getFormField(form, "title").value = `${fillListing.dataset.productName}, verified passport included`;
      getFormField(form, "description").value = "Verified wardrobe item routed into the resale marketplace.";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Listing form prefilled from your wardrobe item.");
      return;
    }

    const buyButton = event.target.closest("[data-buy-listing]");
    if (buyButton) {
      buyListing(buyButton.dataset.buyListing).catch((error) => showToast(error.message, "error"));
      return;
    }

    const passportButton = event.target.closest("[data-view-passport]");
    if (passportButton) {
      api(`/api/passports/${passportButton.dataset.viewPassport}`)
        .then((payload) => {
          renderPassport(payload);
          $("#scanner").scrollIntoView({ behavior: "smooth", block: "start" });
        })
        .catch((error) => showToast(error.message, "error"));
      return;
    }

    const reviewButton = event.target.closest("[data-review-request]");
    if (reviewButton) {
      reviewRequest(reviewButton.dataset.reviewRequest, reviewButton.dataset.reviewStatus).catch((error) => showToast(error.message, "error"));
    }
  });
}

async function init() {
  bindEvents();
  try {
    await fetchBootstrap();
    renderPassport(null);
  } catch (error) {
    showToast(error.message, "error");
  }
}

init();
