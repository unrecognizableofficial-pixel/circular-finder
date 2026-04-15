"use client";

import * as React from "react";
import { FeaturePage } from "@/components/feature-page";
import { LivePassportReport } from "@/components/live-passport-report";
import { usePlatform } from "@/components/platform-state";
import { addWardrobeItem, lookupPassport, uploadScan } from "@/lib/api";

export default function ScannerPage() {
  const { bootstrap, token, refreshWardrobe } = usePlatform();
  const [scanValue, setScanValue] = React.useState("");
  const [hints, setHints] = React.useState("");
  const [brandHint, setBrandHint] = React.useState("");
  const [passport, setPassport] = React.useState<Awaited<ReturnType<typeof lookupPassport>>["passport"] | null>(null);
  const [status, setStatus] = React.useState("Start a live lookup using a passport id, QR value, barcode, or garment image.");
  const [isBusy, setIsBusy] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  React.useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const detectScanType = React.useCallback((value: string) => {
    if (value.startsWith("QR-")) return "qr";
    if (value.startsWith("NFC-")) return "nfc";
    if (value.startsWith("DPP-")) return "passport";
    return "barcode";
  }, []);

  const handleLookup = React.useCallback(async () => {
    if (!scanValue.trim()) {
      setStatus("Enter a code value before running a live lookup.");
      return;
    }

    setIsBusy(true);
    try {
      const response = await lookupPassport(detectScanType(scanValue.trim()), scanValue.trim(), hints.trim(), token || undefined);
      if (response.recognized && response.passport) {
        setPassport(response.passport);
        setStatus(`Live passport match returned ${(response.confidence * 100).toFixed(0)}% confidence.`);
      } else {
        setPassport(null);
        setStatus(response.message ?? "No verified passport matched this code.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Scan lookup failed.");
    } finally {
      setIsBusy(false);
    }
  }, [detectScanType, hints, scanValue, token]);

  const handleUpload = React.useCallback(
    async (file: File | Blob, fileName: string) => {
      setIsBusy(true);
      try {
        const response = await uploadScan(file, fileName, hints.trim(), brandHint, token || undefined);
        if (response.recognized && response.passport) {
          setPassport(response.passport);
          setStatus(`Image scan matched ${response.passport.product?.name ?? "a verified garment"}.`);
        } else {
          setPassport(null);
          setStatus(response.message ?? "Image scan did not match a verified passport.");
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Image scan failed.");
      } finally {
        setIsBusy(false);
      }
    },
    [brandHint, hints, token]
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
    setStream(nextStream);
    if (videoRef.current) {
      videoRef.current.srcObject = nextStream;
      await videoRef.current.play();
      setStatus("Camera is live. Capture a frame to query the garment database.");
    }
  }, []);

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
    await handleUpload(blob, "camera-capture.jpg");
  }, [handleUpload]);

  const handleAddToWardrobe = React.useCallback(async () => {
    if (!passport?.passportId) {
      return;
    }
    if (!token) {
      setStatus("Sign in from the Profile tab to save scanned garments to your wardrobe.");
      return;
    }
    try {
      const response = await addWardrobeItem(passport.passportId, token, passport.product?.name, passport.product?.msrp);
      await refreshWardrobe();
      setStatus(response.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add passport to wardrobe.");
    }
  }, [passport, refreshWardrobe, token]);

  return (
    <FeaturePage
      eyebrow="Digital Product Passport"
      title="Scan garments and reveal the complete journey"
      description="Use live code lookup, image upload, or camera capture to query the garment database and render a full provenance report from raw materials to factory to end user."
      highlights={["Camera", "QR lookup", "Journey report"]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">Scanner interface</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Query the live passport database through direct code lookups or camera-assisted image uploads.</p>

          <div className="mt-5 grid gap-4">
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
              Code lookup
              <input
                value={scanValue}
                onChange={(event) => setScanValue(event.target.value)}
                placeholder="DPP-EL-TRN-001 or QR-EL-TRN-001"
                className="rounded-2xl border-stone-200 bg-sand-50 px-4 py-3"
              />
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
                onClick={() => void startCamera()}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
              >
                Start camera
              </button>
              <label className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUpload(file, file.name);
                    }
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] bg-stone-900">
              <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <button
              type="button"
              onClick={() => void captureFrame()}
              className="rounded-2xl border border-stone-200 bg-sand-50 px-4 py-3 text-sm font-medium text-stone-700"
            >
              Capture frame and query
            </button>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Live scan status</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{status}</p>
          </div>

          <LivePassportReport
            passport={passport ?? null}
            actions={
              passport?.passportId ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleAddToWardrobe()}
                    className="rounded-2xl bg-forest-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
                  >
                    Add to wardrobe
                  </button>
                  <span className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                    Passport id: {passport.passportId}
                  </span>
                </div>
              ) : null
            }
          />
        </div>
      </div>
    </FeaturePage>
  );
}
