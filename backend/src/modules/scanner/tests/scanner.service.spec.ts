import { ScannerService } from "@/modules/scanner/scanner.service";
import { VisionMatchingService } from "@/modules/scanner/vision-matching.service";

describe("ScannerService", () => {
  function createVisionService() {
    return new VisionMatchingService({
      get: (key: string) => {
        const values: Record<string, unknown> = {
          "vision.provider": "local-signature",
          "vision.model": "cf-vision-signature-v2",
          "vision.remoteUrl": "",
          "vision.remoteApiKey": "",
          "vision.minScore": 0.58
        };
        return values[key];
      }
    } as any);
  }

  it("matches uploaded garment hints to the strongest live product", async () => {
    const scanHistoryCreate = jest.fn().mockResolvedValue(undefined);
    const productFindMany = jest.fn().mockResolvedValue([
      {
        id: "product-1",
        sku: "LP-182",
        name: "Loop Standard 2 Knitwear 182",
        category: "knitwear",
        description: "A premium circular knitwear piece for the demo catalog.",
        materials: { composition: ["Organic Cotton"] },
        price: 198,
        origin: "Portugal",
        verified: true,
        sustainabilityScore: 95,
        brand: {
          id: "brand-1",
          name: "Loop Standard 2",
          slug: "loop-standard-2",
          description: "Demo brand",
          website: null,
          governanceScore: 93,
          sustainabilityScore: 95,
          trustScore: 92,
          verified: true
        },
        circularIds: [
          {
            id: "cid-1",
            code: "CF-182-981",
            origin: "Portugal",
            materials: { composition: ["Organic Cotton"] },
            repairGuide: "Repair carefully.",
            authenticityStatus: "verified",
            careInstructions: "Cold wash.",
            sustainabilityScore: 95,
            passportData: {}
          }
        ]
      },
      {
        id: "product-2",
        sku: "ARC-101",
        name: "Archive Shell 101",
        category: "outerwear",
        description: "Secondary match",
        materials: { composition: ["Recycled Nylon"] },
        price: 220,
        origin: "Italy",
        verified: true,
        sustainabilityScore: 89,
        brand: {
          id: "brand-2",
          name: "Archive House",
          slug: "archive-house",
          description: "Demo brand",
          website: null,
          governanceScore: 88,
          sustainabilityScore: 89,
          trustScore: 86,
          verified: true
        },
        circularIds: [
          {
            id: "cid-2",
            code: "CF-101-404",
            origin: "Italy",
            materials: { composition: ["Recycled Nylon"] },
            repairGuide: "Repair carefully.",
            authenticityStatus: "verified",
            careInstructions: "Cold wash.",
            sustainabilityScore: 89,
            passportData: {}
          }
        ]
      }
    ]);

    const prisma = {
      product: { findMany: productFindMany },
      scanHistory: { create: scanHistoryCreate }
    } as any;

    const service = new ScannerService(prisma, createVisionService());
    const response = await service.upload(
      {
        originalname: "loop-standard-2-knitwear-182.jpg",
        mimetype: "image/jpeg",
        size: 2048,
        buffer: Buffer.from("demo-image")
      },
      {
        hints: "Loop Standard 2 Knitwear 182",
        brand_hint: "Loop Standard 2"
      }
    );

    expect(response.recognized).toBe(true);
    if (!("passport" in response)) {
      throw new Error("Expected the scanner upload to match a live passport.");
    }
    expect(response.passport.passportId).toBe("CF-182-981");
    expect(response.confidence).toBeGreaterThan(0.8);
    if (!("matcher" in response)) {
      throw new Error("Expected matcher metadata on the upload response.");
    }
    expect((response.matcher as { provider: string }).provider).toBe("local-signature");
    expect(scanHistoryCreate).toHaveBeenCalledTimes(1);
  });

  it("returns a clean unmatched response when no live product fits the upload", async () => {
    const prisma = {
      product: { findMany: jest.fn().mockResolvedValue([]) },
      scanHistory: { create: jest.fn() }
    } as any;

    const service = new ScannerService(prisma, createVisionService());
    const response = await service.upload(
      {
        originalname: "mystery-piece.png",
        mimetype: "image/png",
        size: 1024,
        buffer: Buffer.from("demo-image")
      },
      {
        hints: "Unknown garment",
        brand_hint: "Unmatched label"
      }
    );

    expect(response.recognized).toBe(false);
    if (!("message" in response)) {
      throw new Error("Expected the scanner upload to remain unmatched.");
    }
    expect(response.message).toContain("No live product matched");
    if (!("matcher" in response)) {
      throw new Error("Expected matcher metadata on the unmatched upload response.");
    }
    expect((response.matcher as { provider: string }).provider).toBe("local-signature");
  });
});
