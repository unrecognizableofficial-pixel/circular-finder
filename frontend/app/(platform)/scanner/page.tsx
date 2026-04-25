"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, Search, Upload, X } from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { LivePassportReport } from "@/components/live-passport-report";
import { usePlatform } from "@/components/platform-state";
import { addWardrobeItem, lookupPassport, uploadScan } from "@/lib/api";

type ScannerFlow = "lookup" | "camera" | "upload";
type ScannerPassport = Awaited<ReturnType<typeof lookupPassport>>["passport"];

export default function ScannerPage() {
  const {
    bootstrap,
    token,
    refreshWardrobe,
    scannerActivity,
    recordScannerLookup,
    recordScannerUpload,
    recordScannerScan,
    watermarkOpacity,
    setWatermarkOpacity
  } = usePlatform();
  const [scanValue, setScanValue] = React.useState("");
  const [hints, setHints] = React.useState("");
  const [brandHint, setBrandHint] = React.useState("");
  const [passport, setPassport] = React.useState<Awaited<ReturnType<typeof lookupPassport>>["passport"] | null>(null);
  const [passportSourceFlow, setPassportSourceFlow] = React.useState<ScannerFlow | null>(null);
  const [loadedLookupPassport, setLoadedLookupPassport] = React.useState<ScannerPassport | null>(null);
  const [showLookupFocusCard, setShowLookupFocusCard] = React.useState(false);
  const [status, setStatus] = React.useState("Start a demo lookup using a passport id, QR value, barcode, or garment image.");
  const [isBusy, setIsBusy] = React.useState(false);
  const [isCameraScanning, setIsCameraScanning] = React.useState(false);
  const [activeFlow, setActiveFlow] = React.useState<ScannerFlow>("lookup");
  const [previewModal, setPreviewModal] = React.useState<{ flow: ScannerFlow; title: string; passport: ScannerPassport | null } | null>(null);
  const [capturedPhoto, setCapturedPhoto] = React.useState<{ fileName: string; url: string } | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const workspaceRef = React.useRef<HTMLDivElement | null>(null);
  const pendingUploadFlowRef = React.useRef<ScannerFlow>("upload");
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  const flowCards = React.useMemo(() => {
    const listings = bootstrap?.marketplace ?? [];
    const lookupPassport = loadedLookupPassport ?? listings[0]?.passport ?? null;
    const lookupId =
      loadedLookupPassport?.passportId ?? loadedLookupPassport?.qrCode ?? loadedLookupPassport?.barcode ?? loadedLookupPassport?.nfcTag ?? "";
    const lookupProductName = loadedLookupPassport?.product?.name ?? "verified garment";
    const lookupBrandName = loadedLookupPassport?.brand?.name ?? loadedLookupPassport?.product?.brand.name ?? "Verified brand";

    return [
      {
        id: "lookup" as const,
        title: lookupId || "Load Circular ID",
        description: loadedLookupPassport
          ? `${lookupProductName} is loaded into the Circular ID field below and ready for a direct passport lookup.`
          : "Preload a Circular ID and reveal the Digital Product Passport instantly from a direct code query.",
        eyebrow: loadedLookupPassport ? "Loaded Circular ID" : "Circular ID demo",
        helper: loadedLookupPassport ? `${lookupBrandName} / ${lookupProductName}` : "Use a saved QR, NFC, barcode, or DPP code.",
        passport: lookupPassport
      },
      {
        id: "camera" as const,
        title: "Open camera UI",
        description: "Preview the in-browser scanner and capture a garment frame to feed the same DPP system.",
        eyebrow: "Camera demo",
        helper: "Frame the garment label or overall silhouette.",
        passport: listings[1]?.passport ?? listings[0]?.passport ?? null
      },
      {
        id: "upload" as const,
        title: "Upload image",
        description: "Drop in a product photo and match it to the most likely passport with image-based recognition.",
        eyebrow: "Image upload demo",
        helper: "Best for marketplace photos and product close-ups.",
        passport: listings[2]?.passport ?? listings[0]?.passport ?? null
      }
    ];
  }, [bootstrap?.marketplace, loadedLookupPassport]);

  const visibleFlowCards = React.useMemo(() => {
    if (showLookupFocusCard && flowCards[0]) {
      return [flowCards[0]];
    }
    return flowCards;
  }, [flowCards, showLookupFocusCard]);

  const activeCard = React.useMemo(
    () => flowCards.find((card) => card.id === activeFlow) ?? flowCards[0] ?? null,
    [activeFlow, flowCards]
  );

  const activePassport = passport && passportSourceFlow === activeFlow ? passport : activeCard?.passport ?? null;
  const canOpenPreviewModal = activeFlow === "lookup";

  React.useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  React.useEffect(() => {
    return () => {
      if (capturedPhoto?.url) {
        URL.revokeObjectURL(capturedPhoto.url);
      }
    };
  }, [capturedPhoto?.url]);

  const detectScanType = React.useCallback((value: string) => {
    if (value.startsWith("QR-")) return "qr";
    if (value.startsWith("NFC-")) return "nfc";
    if (value.startsWith("DPP-")) return "passport";
    return "barcode";
  }, []);

  const openPassportPreview = React.useCallback((flow: ScannerFlow, title: string, nextPassport: ScannerPassport | null) => {
    setPreviewModal({ flow, title, passport: nextPassport });
  }, []);

  const handleLookup = React.useCallback(async () => {
    if (!scanValue.trim()) {
      setStatus("Enter a code value before running a live lookup.");
      return;
    }

    setActiveFlow("lookup");
    setIsBusy(true);
    try {
      const response = await lookupPassport(detectScanType(scanValue.trim()), scanValue.trim(), hints.trim(), token || undefined);
      if (response.recognized && response.passport) {
        setPassport(response.passport);
        setPassportSourceFlow("lookup");
        setLoadedLookupPassport(response.passport);
        setShowLookupFocusCard(true);
        recordScannerLookup(response.passport);
        openPassportPreview("lookup", "Lookup code", response.passport);
        setStatus(`Live passport match returned ${(response.confidence * 100).toFixed(0)}% confidence.`);
      } else {
        setPassport(null);
        setPassportSourceFlow(null);
        setLoadedLookupPassport(null);
        setShowLookupFocusCard(false);
        recordScannerLookup(null);
        setStatus(response.message ?? "No verified passport matched this code.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Scan lookup failed.");
    } finally {
      setIsBusy(false);
    }
  }, [detectScanType, hints, openPassportPreview, recordScannerLookup, scanValue, token]);

  const handleUpload = React.useCallback(
    async (file: File | Blob, fileName: string, sourceFlow: ScannerFlow = "upload") => {
      setActiveFlow(sourceFlow);
      if (sourceFlow !== "lookup") {
        setShowLookupFocusCard(false);
      }
      setIsBusy(true);
      try {
        const response = await uploadScan(file, fileName, hints.trim(), brandHint, token || undefined);
        if (response.recognized && response.passport) {
          setPassport(response.passport);
          setPassportSourceFlow(sourceFlow);
          if (sourceFlow === "camera") {
            recordScannerScan(response.passport);
            setPreviewModal(null);
            setStatus(
              `Camera scan matched ${response.passport.product?.name ?? "a verified garment"}. Use the green Open DPP popup button on the Camera demo card when you want the full popup view.`
            );
          } else {
            recordScannerUpload(response.passport);
            setPreviewModal(null);
            setStatus(`Image scan matched ${response.passport.product?.name ?? "a verified garment"}. The passport is updated inline below.`);
          }
        } else {
          setPassport(null);
          setPassportSourceFlow(null);
          if (sourceFlow === "camera") {
            recordScannerScan(null);
            setStatus(response.message ?? "Camera scan did not match a verified passport.");
          } else {
            recordScannerUpload(null);
            setStatus(response.message ?? "Image scan did not match a verified passport.");
          }
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : sourceFlow === "camera" ? "Camera scan failed." : "Image scan failed.");
      } finally {
        setIsBusy(false);
      }
    },
    [brandHint, hints, recordScannerScan, recordScannerUpload, token]
  );

  const startCamera = React.useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Camera access is not available in this browser.");
      return;
    }

    const nextStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    setActiveFlow("camera");
    setShowLookupFocusCard(false);
    setStream(nextStream);
    if (videoRef.current) {
      videoRef.current.srcObject = nextStream;
      await videoRef.current.play();
      setStatus("Camera is live. Capture a frame to query the garment database.");
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsCameraScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("Camera preview closed. You can reopen it anytime from the camera demo.");
  }, [stream]);

  const captureFrame = React.useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setStatus("Could not capture a frame from the camera.");
      return;
    }
    const fileName = `camera-capture-${Date.now()}.jpg`;
    setCapturedPhoto((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }
      return {
        fileName,
        url: URL.createObjectURL(blob)
      };
    });
    setIsCameraScanning(true);
    setStatus("Camera frame captured. Running a live scan against the passport database...");
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900);
    });
    await handleUpload(blob, fileName, "camera");
    setIsCameraScanning(false);
  }, [handleUpload]);

  const handleAddToWardrobe = React.useCallback(async () => {
    if (!activePassport?.passportId) {
      return;
    }
    if (!token) {
      setStatus("Sign in from the Profile tab to save scanned garments to your wardrobe.");
      return;
    }
    try {
      const response = await addWardrobeItem(activePassport.passportId, token, activePassport.product?.name, activePassport.product?.msrp);
      await refreshWardrobe();
      setStatus(response.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add passport to wardrobe.");
    }
  }, [activePassport, refreshWardrobe, token]);

  const openUploadPicker = React.useCallback((sourceFlow: ScannerFlow = "upload") => {
    pendingUploadFlowRef.current = sourceFlow;
    setActiveFlow(sourceFlow);
    if (sourceFlow !== "lookup") {
      setShowLookupFocusCard(false);
    }
    if (sourceFlow !== "camera") {
      setPreviewModal(null);
    }
    uploadInputRef.current?.click();
  }, []);

  const primeLookupDemo = React.useCallback((nextPassport: ScannerPassport | null) => {
    if (!nextPassport) {
      setStatus("No suggested passport is ready yet for the lookup demo.");
      return;
    }

    const nextCode = nextPassport.qrCode || nextPassport.passportId || nextPassport.barcode || nextPassport.nfcTag;
    const nextLabel = nextPassport.product?.name ?? nextPassport.brand?.name ?? "verified garment";
    const nextBrand = nextPassport.brand?.name ?? nextPassport.product?.brand.name ?? "";

    setActiveFlow("lookup");
    setLoadedLookupPassport(nextPassport);
    setShowLookupFocusCard(true);
    setScanValue(nextCode);
    setHints(nextLabel);
    setBrandHint(nextBrand);
    setPassport(nextPassport);
    setPassportSourceFlow("lookup");
    setStatus(`Suggested code ${nextCode} loaded for ${nextLabel}. Run Lookup code to confirm the passport match.`);
    requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <FeaturePage
      eyebrow="Digital Product Passport"
      title="Scan garments and reveal the complete journey"
      description="Use code lookup, image upload, or camera capture to show the full Digital Product Passport with lifecycle details, care guidance, repair notes, and authenticity signals."
      highlights={["Camera UI", "Circular ID", "Passport preview"]}
      steps={[
        "Choose one scan method: Circular ID, camera, or image upload.",
        "Run the scan and wait for the passport result to appear.",
        "Open the passport panel or popup before moving to shop or rewards."
      ]}
      actions={[
        { href: "/marketplace", label: "See matching listings" },
        { href: "/impact", label: "Open rewards and impact" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">{activeCard?.eyebrow ?? "Circular ID demo"}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">{activeCard?.title ?? "Lookup code"}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {showLookupFocusCard
                    ? "The loaded Circular ID stays pinned here so the scanner workspace and passport preview stay focused on that exact record."
                    : "Choose one demo path, then use the active Circular ID demo below to run the scan and open the passport."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {showLookupFocusCard ? (
                  <button
                    type="button"
                    onClick={() => setShowLookupFocusCard(false)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700"
                  >
                    Show all demos
                  </button>
                ) : null}
                {activeCard ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                    Active: {activeCard.title}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={`mt-5 grid gap-3 ${visibleFlowCards.length === 1 ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}>
              {visibleFlowCards.map((card) => (
                <ScannerDemoCard
                  key={card.id}
                  title={card.title}
                  eyebrow={card.eyebrow}
                  description={card.description}
                  helper={card.helper}
                  active={activeFlow === card.id}
                  icon={
                    card.id === "lookup" ? <Search className="h-4 w-4" /> : card.id === "camera" ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />
                  }
                  onClick={
                    card.id === "lookup"
                      ? () => primeLookupDemo(card.passport)
                      : card.id === "camera"
                        ? () => {
                            setActiveFlow("camera");
                            setShowLookupFocusCard(false);
                            openPassportPreview(card.id, card.title, card.passport);
                          }
                        : () => openUploadPicker()
                  }
                  onPreview={() => openPassportPreview(card.id, card.title, card.passport)}
                  actionLabel={card.id === "lookup" ? "Load Circular ID" : card.id === "camera" ? "Open DPP popup" : "Select image"}
                  showPreviewButton={card.id === "lookup"}
                />
              ))}
            </div>

            <div ref={workspaceRef} className="mt-6 border-t border-stone-200 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">{activeCard?.eyebrow ?? "Circular ID demo"}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">{activeCard?.title ?? "Lookup code"}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{activeCard?.description ?? "Run a scanner path to see the full Digital Product Passport."}</p>
                </div>
                {canOpenPreviewModal ? (
                  <button
                    type="button"
                    onClick={() => openPassportPreview(activeFlow, activeCard?.title ?? "Scanner", activePassport)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                  >
                    Open DPP popup
                  </button>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950">
                <p className="font-semibold">Scanner permissions and image use</p>
                <p className="mt-2">
                  Camera access is requested only to scan garment labels, product tags, and Circular IDs. Uploaded images are used to match known
                  products to a Digital Product Passport and may carry branded metadata in the demo flow.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/trust#privacy-center" className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                    Privacy Center
                  </Link>
                  <Link href="/trust#ai-transparency" className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
                    AI Transparency
                  </Link>
                </div>
              </div>

            <div className="mt-5 grid gap-4">
              {activeFlow === "lookup" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Known brand hint
                      <select
                        value={brandHint}
                        onChange={(event) => setBrandHint(event.target.value)}
                        className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                      >
                        <option value="">All verified brands</option>
                        {bootstrap?.knownBrandOptions.map((brand) => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Garment hints
                      <input
                        value={hints}
                        onChange={(event) => setHints(event.target.value)}
                        placeholder="sage trench, indigo denim, logo"
                        className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Circular ID
                    <input
                      value={scanValue}
                      onChange={(event) => setScanValue(event.target.value)}
                      placeholder="DPP-EL-TRN-001 or QR-EL-TRN-001"
                      className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleLookup()}
                      className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                    >
                      {isBusy ? "Scanning..." : "Lookup code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => primeLookupDemo(activeCard?.passport ?? null)}
                      className="rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                      Load suggested Circular ID
                    </button>
                  </div>
                </>
              ) : null}

              {activeFlow === "camera" ? (
                <>
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-stone-900">
                    {stream ? (
                      <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center px-6 text-center text-sm leading-6 text-stone-300">
                        Open the camera to frame a label, QR tag, or product silhouette for the demo capture flow.
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-6 rounded-[1.5rem] border border-emerald-300/60" />
                      <div className={`absolute left-6 right-6 h-0.5 bg-emerald-300/90 shadow-[0_0_18px_rgba(74,222,128,0.9)] ${isCameraScanning ? "top-1/2 animate-pulse" : "top-[32%]"}`} />
                      <div className="absolute inset-x-10 bottom-8 rounded-full border border-emerald-300/35 bg-stone-950/45 px-3 py-2 text-center text-[11px] uppercase tracking-[0.22em] text-emerald-200">
                        {isCameraScanning ? "Analyzing camera frame" : stream ? "Camera aligned for live scan" : "Camera preview standby"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Known brand hint
                      <select
                        value={brandHint}
                        onChange={(event) => setBrandHint(event.target.value)}
                        className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                      >
                        <option value="">All verified brands</option>
                        {bootstrap?.knownBrandOptions.map((brand) => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Capture hints
                      <input
                        value={hints}
                        onChange={(event) => setHints(event.target.value)}
                        placeholder="logo patch, woven label, trench coat"
                        className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                    >
                      {stream ? "Restart camera" : "Open camera UI"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void captureFrame()}
                      disabled={!stream || isCameraScanning}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCameraScanning ? "Scanning..." : "Scan garment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openUploadPicker("camera")}
                      className="rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                      Upload image
                    </button>
                    {capturedPhoto ? (
                      <a
                        href={capturedPhoto.url}
                        download={capturedPhoto.fileName}
                        className="rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700"
                      >
                        Save photo
                      </a>
                    ) : null}
                    {stream ? (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700"
                      >
                        Close camera
                      </button>
                    ) : null}
                  </div>

                  {capturedPhoto ? (
                    <div className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <img src={capturedPhoto.url} alt="Last camera capture" className="aspect-[4/3] w-full rounded-[1.25rem] object-cover" />
                      <div className="grid gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Last camera photo</p>
                          <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{capturedPhoto.fileName}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            Keep the saved frame, run another live scan, or upload a different image while staying in the Camera demo.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={capturedPhoto.url}
                            download={capturedPhoto.fileName}
                            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                          >
                            Save photo
                          </a>
                          <button
                            type="button"
                            onClick={() => openUploadPicker("camera")}
                            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                          >
                            Upload image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {activeFlow === "upload" ? (
                <>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Known brand hint
                    <select
                      value={brandHint}
                      onChange={(event) => setBrandHint(event.target.value)}
                      className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                    >
                      <option value="">All verified brands</option>
                      {bootstrap?.knownBrandOptions.map((brand) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Image hints
                    <input
                      value={hints}
                      onChange={(event) => setHints(event.target.value)}
                      placeholder="studio photo, tote bag, heritage denim"
                      className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => openUploadPicker()}
                    className="flex min-h-[10rem] items-center justify-center rounded-[1.75rem] border border-dashed border-stone-300 bg-sand-50 px-6 text-center text-sm font-medium leading-6 text-stone-600 transition hover:border-forest-300 hover:bg-white"
                  >
                    Choose a product image to run the upload demo
                  </button>
                  <p className="text-sm leading-6 text-stone-500">
                    Uploaded matches stay in the inline passport preview below instead of opening a separate popup.
                  </p>
                </>
              ) : null}

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const nextFlow = pendingUploadFlowRef.current;
                    void handleUpload(file, file.name, nextFlow);
                  }
                  pendingUploadFlowRef.current = "upload";
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </div>

        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Scanner activity</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">Live preview and system signals</h2>
              </div>
              <span className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">Demo ready</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Lookups" value={String(scannerActivity.lookups)} />
              <Metric label="Scans" value={String(scannerActivity.scans)} />
              <Metric label="Uploads" value={String(scannerActivity.uploads)} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="rounded-[1.5rem] bg-stone-950 p-4 text-stone-50">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Current status</p>
                <p className="mt-2 text-sm leading-6 text-stone-200">{status}</p>
                <p className="mt-4 text-sm leading-6 text-stone-300">
                  {scannerActivity.latestPassportId
                    ? `Latest Circular ID ${scannerActivity.latestPassportId} from ${scannerActivity.latestLocation} at ${scannerActivity.latestTimestamp}.`
                    : "Your most recent scan preview will appear here after the first live lookup."}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-sand-50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Watermark</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">Adjust the branded image protection overlay used in the demo passport flow.</p>
                <label className="mt-4 grid gap-2 text-sm font-medium text-stone-700">
                  Opacity {watermarkOpacity}%
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={watermarkOpacity}
                    onChange={(event) => setWatermarkOpacity(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Authenticity"
                value={activePassport?.passportStatus ? activePassport.passportStatus.replaceAll("_", " ") : "Awaiting scan"}
              />
              <Metric
                label="Verified"
                value={activePassport?.verifiedAt ? new Date(activePassport.verifiedAt).toLocaleDateString() : "Pending"}
              />
              <Metric
                label="Owner history"
                value={activePassport ? "Brand launch → resale owner → current holder" : "Preview after scan"}
              />
              <Metric
                label="Care instructions"
                value={activePassport?.careInstructions ? "Ready in passport" : "Preview after scan"}
              />
            </div>
          </div>

          <LivePassportReport
            passport={activePassport}
            actions={
              activePassport?.passportId ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleAddToWardrobe()}
                    className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                  >
                    Add to wardrobe
                  </button>
                  {canOpenPreviewModal ? (
                    <button
                      type="button"
                      onClick={() => openPassportPreview(activeFlow, activeCard?.title ?? "Scanner", activePassport)}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                    >
                      Open DPP popup
                    </button>
                  ) : null}
                  <span className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                    Passport id: {activePassport.passportId}
                  </span>
                </div>
              ) : null
            }
          />
        </div>
      </div>

      {previewModal ? (
        <ScannerPassportModal
          title={previewModal.title}
          flow={previewModal.flow}
          passport={previewModal.passport}
          onClose={() => setPreviewModal(null)}
        />
      ) : null}
    </FeaturePage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-sand-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-stone-900">{value}</p>
    </div>
  );
}

function ScannerDemoCard({
  title,
  eyebrow,
  description,
  helper,
  active,
  icon,
  actionLabel,
  onClick,
  onPreview,
  showPreviewButton = true
}: {
  title: string;
  eyebrow: string;
  description: string;
  helper: string;
  active: boolean;
  icon: React.ReactNode;
  actionLabel: string;
  onClick: () => void;
  onPreview: () => void;
  showPreviewButton?: boolean;
}) {
  return (
    <article
      className={[
        "grid gap-3 rounded-[1.35rem] border p-3.5 transition",
        active ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-sand-50 shadow-soft" : "border-stone-200 bg-sand-50"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">{eyebrow}</p>
          <h3 className="mt-1.5 text-base font-semibold tracking-tight text-stone-900">{title}</h3>
        </div>
        <span className="rounded-full bg-white p-2 text-forest-800 shadow-sm">{icon}</span>
      </div>

      <p className="text-sm leading-6 text-stone-600">{description}</p>

      <div className="grid gap-2">
        <button type="button" onClick={onClick} className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm">
          {actionLabel}
        </button>
        {showPreviewButton ? (
          <button type="button" onClick={onPreview} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700">
            Open DPP popup
          </button>
        ) : null}
        <p className="text-xs leading-5 text-stone-500">{helper}</p>
      </div>
    </article>
  );
}

function ScannerPassportModal({
  title,
  flow,
  passport,
  onClose
}: {
  title: string;
  flow: ScannerFlow;
  passport: ScannerPassport | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_50px_150px_rgba(17,24,39,0.22)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Demo Digital Product Passport</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {flow === "lookup"
                ? "Preview the passport experience connected to a direct Circular ID query."
                : flow === "camera"
                  ? "Preview the passport experience attached to the camera scanner workflow."
                  : "Preview the passport experience attached to image upload recognition."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-stone-200"
            aria-label="Close passport popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          <LivePassportReport passport={passport ?? null} />
        </div>
      </div>
    </div>
  );
}
