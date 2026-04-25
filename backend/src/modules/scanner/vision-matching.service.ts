import { createHash } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Prisma } from "@prisma/client";

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

type CircularIdCandidate = {
  id: string;
  code: string;
  origin: string;
  materials: Prisma.JsonValue;
  repairGuide: string;
  authenticityStatus: string;
  careInstructions: string;
  sustainabilityScore: number;
  passportData: Prisma.JsonValue;
};

type ProductCandidate = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  origin: string;
  materials: Prisma.JsonValue;
  price: Prisma.Decimal | number | string;
  verified: boolean;
  sustainabilityScore: number;
  brand: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    website: string | null;
    governanceScore: number;
    sustainabilityScore: number;
    trustScore: number;
    verified: boolean;
  };
  circularIds: CircularIdCandidate[];
};

type UploadScanDto = {
  hints?: string;
  brand_hint?: string;
};

type VisionCandidate = ProductCandidate & {
  imageUrl: string;
  embedding: number[];
  signatureTags: string[];
};

type RankedCandidate = {
  product: VisionCandidate;
  finalScore: number;
  confidence: number;
  evidence: {
    provider: string;
    model: string;
    visualSimilarity: number;
    semanticSimilarity: number;
    brandBoost: number;
    tokenHits: string[];
    phraseHits: string[];
    fallbackUsed: boolean;
  };
};

type RemoteMatchPayload = {
  provider?: string;
  model?: string;
  matches?: Array<{
    candidateId: string;
    score: number;
    confidence?: number;
    evidence?: Record<string, unknown>;
  }>;
};

const EMBEDDING_SIZE = 48;
const SCAN_STOP_WORDS = new Set([
  "and",
  "capture",
  "demo",
  "file",
  "finder",
  "garment",
  "image",
  "img",
  "jpeg",
  "jpg",
  "look",
  "photo",
  "png",
  "scan",
  "screenshot",
  "studio",
  "the",
  "upload",
  "webp"
]);

@Injectable()
export class VisionMatchingService {
  private readonly logger = new Logger(VisionMatchingService.name);

  constructor(private readonly configService: ConfigService) {}

  getRuntimeInfo() {
    const provider = this.configService.get<string>("vision.provider") ?? "local-signature";
    const model = this.configService.get<string>("vision.model") ?? "cf-vision-signature-v2";
    const remoteUrl = this.configService.get<string>("vision.remoteUrl") ?? "";

    return {
      provider,
      model,
      remoteConfigured: Boolean(remoteUrl),
      minScore: this.configService.get<number>("vision.minScore") ?? 0.58
    };
  }

  async rankUploadAgainstProducts(file: UploadedImageFile, dto: UploadScanDto, products: ProductCandidate[]) {
    const runtime = this.getRuntimeInfo();
    const candidates = products.map((product) => this.buildCandidate(product));

    if (!candidates.length) {
      return {
        provider: runtime.provider,
        model: runtime.model,
        matches: [] as RankedCandidate[],
        fallbackUsed: false
      };
    }

    if (runtime.provider === "remote-image-model" && runtime.remoteConfigured) {
      const remoteResult = await this.tryRemoteMatch(file, dto, candidates);
      if (remoteResult) {
        return remoteResult;
      }
    }

    return this.rankLocally(file, dto, candidates, runtime.provider, runtime.model, runtime.provider === "remote-image-model");
  }

  private buildCandidate(product: ProductCandidate): VisionCandidate {
    const signatureText = buildCatalogSignatureText(product);
    const imageUrl = catalogReferenceImage(product.category, product.id);
    return {
      ...product,
      imageUrl,
      signatureTags: uniqueStrings(tokenizeSearchText(signatureText)),
      embedding: buildEmbedding(`${signatureText} ${normalizeText(imageUrl)}`)
    };
  }

  private async tryRemoteMatch(file: UploadedImageFile, dto: UploadScanDto, candidates: VisionCandidate[]) {
    const runtime = this.getRuntimeInfo();
    const remoteUrl = this.configService.get<string>("vision.remoteUrl") ?? "";
    if (!remoteUrl) {
      return null;
    }

    try {
      const response = await fetch(remoteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.configService.get<string>("vision.remoteApiKey")
            ? { Authorization: `Bearer ${this.configService.get<string>("vision.remoteApiKey")}` }
            : {})
        },
        body: JSON.stringify({
          upload: {
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            hints: dto.hints ?? "",
            brandHint: dto.brand_hint ?? "",
            bytesBase64: file.buffer?.toString("base64") ?? null
          },
          candidates: candidates.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            brand: candidate.brand.name,
            category: candidate.category,
            origin: candidate.origin,
            imageUrl: candidate.imageUrl,
            materials: extractMaterialStrings(candidate.materials),
            circularCodes: candidate.circularIds.map((entry) => entry.code)
          }))
        })
      });

      if (!response.ok) {
        this.logger.warn(`Remote vision matcher returned ${response.status}. Falling back to local signature matching.`);
        return null;
      }

      const payload = (await response.json()) as RemoteMatchPayload;
      const matches = (payload.matches ?? [])
        .map((remoteMatch): RankedCandidate | null => {
          const candidate = candidates.find((item) => item.id === remoteMatch.candidateId);
          if (!candidate) {
            return null;
          }

          const finalScore = clamp(remoteMatch.score, 0, 1);
          return {
            product: candidate,
            finalScore,
            confidence: clamp(remoteMatch.confidence ?? finalScore, 0, 1),
            evidence: {
              provider: payload.provider ?? runtime.provider,
              model: payload.model ?? runtime.model,
              visualSimilarity: finalScore,
              semanticSimilarity: 0,
              brandBoost: 0,
              tokenHits: [] as string[],
              phraseHits: [] as string[],
              fallbackUsed: false,
              ...(remoteMatch.evidence ?? {})
            }
          };
        })
        .filter((match): match is RankedCandidate => Boolean(match))
        .sort((left, right) => right.finalScore - left.finalScore);

      return {
        provider: payload.provider ?? runtime.provider,
        model: payload.model ?? runtime.model,
        matches,
        fallbackUsed: false
      };
    } catch (error) {
      this.logger.warn(`Remote vision matcher failed: ${error instanceof Error ? error.message : String(error)}. Falling back to local signature matching.`);
      return null;
    }
  }

  private rankLocally(file: UploadedImageFile, dto: UploadScanDto, candidates: VisionCandidate[], provider: string, model: string, fallbackUsed: boolean) {
    const uploadContext = buildUploadContext(file, dto);
    const matches = candidates
      .map((candidate) => {
        const semantic = semanticSimilarity(candidate, uploadContext);
        const visual = cosineSimilarity(uploadContext.embedding, candidate.embedding);
        const brandBoost = candidateBrandBoost(candidate, uploadContext.brandHint);
        const finalScore = clamp(semantic * 0.52 + visual * 0.38 + brandBoost, 0, 1);
        return {
          product: candidate,
          finalScore,
          confidence: deriveConfidence(finalScore, semantic, visual),
          evidence: {
            provider,
            model,
            visualSimilarity: roundScore(visual),
            semanticSimilarity: roundScore(semantic),
            brandBoost: roundScore(brandBoost),
            tokenHits: uploadContext.tokens.filter((token) => candidate.signatureTags.includes(token)).slice(0, 6),
            phraseHits: uploadContext.phrases.filter((phrase) => buildCatalogSignatureText(candidate).includes(phrase)).slice(0, 4),
            fallbackUsed
          }
        } satisfies RankedCandidate;
      })
      .sort((left, right) => {
        if (right.finalScore !== left.finalScore) {
          return right.finalScore - left.finalScore;
        }
        return right.product.sustainabilityScore - left.product.sustainabilityScore;
      });

    return {
      provider,
      model,
      matches,
      fallbackUsed
    };
  }
}

function buildUploadContext(file: UploadedImageFile, dto: UploadScanDto) {
  const fileStem = stripFileExtension(file.originalname);
  const phrases = uniqueStrings([dto.hints, dto.brand_hint, fileStem].map(normalizeText).filter(Boolean));
  const tokens = uniqueStrings(phrases.flatMap(tokenizeSearchText));
  const byteSketch = buildByteSketch(file.buffer, file.size);
  const embedding = buildEmbedding(`${phrases.join(" ")} ${file.mimetype} ${byteSketch}`);

  return {
    phrases,
    tokens,
    embedding,
    brandHint: normalizeText(dto.brand_hint)
  };
}

function buildCatalogSignatureText(product: ProductCandidate | VisionCandidate) {
  return normalizeText(
    [
      product.name,
      product.sku,
      product.category,
      product.description,
      product.origin,
      product.brand.name,
      ...extractMaterialStrings(product.materials),
      ...product.circularIds.map((entry) => entry.code)
    ].join(" ")
  );
}

function extractMaterialStrings(value: unknown) {
  if (!value || typeof value !== "object") {
    return [] as string[];
  }

  const values = Array.isArray(value) ? value : Object.values(value as Record<string, unknown>);
  return values.flatMap((entry) => (Array.isArray(entry) ? entry : [entry])).filter((entry): entry is string => typeof entry === "string");
}

function semanticSimilarity(candidate: VisionCandidate, uploadContext: ReturnType<typeof buildUploadContext>) {
  const signatureText = buildCatalogSignatureText(candidate);
  const phraseHits = uploadContext.phrases.reduce((total, phrase) => total + (signatureText.includes(phrase) ? 1 : 0), 0);
  const tokenHits = uploadContext.tokens.reduce((total, token) => total + (candidate.signatureTags.includes(token) ? 1 : 0), 0);
  const phraseScore = uploadContext.phrases.length ? phraseHits / uploadContext.phrases.length : 0;
  const tokenScore = uploadContext.tokens.length ? tokenHits / uploadContext.tokens.length : 0;
  return clamp(phraseScore * 0.62 + tokenScore * 0.38, 0, 1);
}

function candidateBrandBoost(candidate: VisionCandidate, brandHint: string) {
  if (!brandHint) {
    return 0;
  }
  const candidateBrand = normalizeText(candidate.brand.name);
  return candidateBrand.includes(brandHint) ? 0.12 : 0;
}

function deriveConfidence(finalScore: number, semantic: number, visual: number) {
  const weighted = finalScore * 0.76 + semantic * 0.12 + visual * 0.12;
  return roundScore(clamp(Math.max(0.28, weighted), 0, 0.98));
}

function buildEmbedding(text: string) {
  const normalized = normalizeText(text);
  const vector = Array.from({ length: EMBEDDING_SIZE }, () => 0);
  for (const token of tokenizeSearchText(normalized)) {
    const hash = createHash("sha256").update(token).digest();
    for (let index = 0; index < EMBEDDING_SIZE; index += 1) {
      const value = hash[index % hash.length] / 255;
      vector[index] += value;
    }
  }

  return normalizeVector(vector.map((value, index) => value + charDistribution(normalized, index)));
}

function charDistribution(text: string, index: number) {
  let total = 0;
  for (let cursor = index; cursor < text.length; cursor += EMBEDDING_SIZE) {
    total += text.charCodeAt(cursor) / 255;
  }
  return total;
}

function normalizeVector(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((total, value) => total + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

function cosineSimilarity(left: number[], right: number[]) {
  const size = Math.min(left.length, right.length);
  let total = 0;
  for (let index = 0; index < size; index += 1) {
    total += left[index] * right[index];
  }
  return clamp((total + 1) / 2, 0, 1);
}

function buildByteSketch(buffer: Buffer | undefined, size: number) {
  if (!buffer?.length) {
    return `size-${size}`;
  }

  const buckets = [0, 0, 0, 0, 0, 0];
  for (let index = 0; index < buffer.length; index += 1) {
    buckets[index % buckets.length] += buffer[index];
  }

  return buckets.map((bucket, index) => `b${index}-${Math.round(bucket / buffer.length)}`).join(" ");
}

function stripFileExtension(value: string) {
  return value.replace(/\.[a-z0-9]+$/i, "");
}

function normalizeText(value: string | undefined | null) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchText(value: string) {
  return value
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => {
      if (!token || SCAN_STOP_WORDS.has(token)) {
        return false;
      }

      if (/^\d+$/.test(token)) {
        return token.length >= 2;
      }

      return token.length >= 2;
    });
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundScore(value: number) {
  return Number(value.toFixed(3));
}

function catalogReferenceImage(category: string, seed: string) {
  const library: Record<string, string[]> = {
    outerwear: [
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
    ],
    knitwear: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
    ],
    tailoring: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    ],
    accessories: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
    ],
    denim: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
    ],
    shirting: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
    ]
  };

  const pool =
    library[normalizeText(category)] ?? [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    ];

  return pool[stableId(seed) % pool.length];
}

function stableId(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
}
