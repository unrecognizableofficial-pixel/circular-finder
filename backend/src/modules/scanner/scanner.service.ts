import { Injectable, NotFoundException } from "@nestjs/common";
import { buildUploadResponse } from "@/common/presenters/platform.presenter";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { LookupScanDto } from "@/modules/scanner/dto/lookup-scan.dto";
import { UploadScanDto } from "@/modules/scanner/dto/upload-scan.dto";
import { VisionMatchingService } from "@/modules/scanner/vision-matching.service";

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

@Injectable()
export class ScannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visionMatchingService: VisionMatchingService
  ) {}

  async lookup(dto: LookupScanDto, user?: RequestUser) {
    const circularId = await this.prisma.circularId.findFirst({
      where: {
        OR: [{ code: dto.value }, { id: dto.value }]
      },
      include: {
        product: {
          include: {
            brand: true,
            circularIds: true
          }
        },
        inventory: true,
        ownershipHistory: true
      }
    });

    if (!circularId) {
      throw new NotFoundException("Circular ID not found.");
    }

    await this.prisma.scanHistory.create({
      data: {
        circularIdId: circularId.id,
        userId: user?.sub,
        scanType: dto.scanType ?? "Circular ID",
        locationText: dto.locationText,
        metadata: { source: "scanner.lookup" }
      }
    });

    return circularId;
  }

  history() {
    return this.prisma.scanHistory.findMany({
      include: { circularId: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  async upload(file: UploadedImageFile | undefined, dto: UploadScanDto, user?: RequestUser) {
    if (!file) {
      return {
        recognized: false,
        confidence: 0.18,
        message: "An image file is required for upload scanning.",
        matcher: this.visionMatchingService.getRuntimeInfo()
      };
    }

    const products = await this.prisma.product.findMany({
      where: buildProductSearchWhere(dto, file.originalname),
      include: {
        brand: true,
        circularIds: true
      },
      orderBy: [{ sustainabilityScore: "desc" }, { createdAt: "desc" }],
      take: 40
    });

    const visionMatches = await this.visionMatchingService.rankUploadAgainstProducts(file, dto, products);
    const bestMatch = visionMatches.matches[0];
    const minScore = this.visionMatchingService.getRuntimeInfo().minScore;
    const match = bestMatch?.finalScore !== undefined && bestMatch.finalScore >= minScore ? bestMatch.product : undefined;
    const circularId = match?.circularIds[0];

    if (!match || !circularId) {
      return {
        recognized: false,
        confidence: 0.22,
        message: "No live product matched the uploaded image.",
        matcher: {
          provider: visionMatches.provider,
          model: visionMatches.model,
          minScore,
          fallbackUsed: visionMatches.fallbackUsed
        }
      };
    }

    const winningMatch = bestMatch!;

    await this.prisma.scanHistory.create({
      data: {
        circularIdId: circularId.id,
        userId: user?.sub,
        scanType: "Image upload",
        locationText: dto.hints || file.originalname,
        metadata: {
          source: "scanner.upload",
          fileName: file.originalname,
          mimeType: file.mimetype,
          bytes: file.size,
          brandHint: dto.brand_hint ?? "",
          matcher: {
            provider: visionMatches.provider,
            model: visionMatches.model,
            score: winningMatch.finalScore,
            evidence: winningMatch.evidence
          }
        }
      }
    });

    return buildUploadResponse(match, circularId, winningMatch.product.imageUrl, winningMatch.confidence, {
      matcher: {
        provider: visionMatches.provider,
        model: visionMatches.model,
        score: winningMatch.finalScore,
        evidence: winningMatch.evidence,
        minScore,
        fallbackUsed: visionMatches.fallbackUsed
      }
    });
  }
}

function buildProductSearchWhere(dto: UploadScanDto, originalName: string) {
  const searchPhrases = [dto.hints, dto.brand_hint, originalName]
    .map(normalizeText)
    .filter(Boolean);
  const tokens = uniqueStrings(searchPhrases.flatMap(tokenizeSearchText));

  return searchPhrases.length || tokens.length
        ? {
            OR: [
              ...searchPhrases.flatMap((phrase) => buildSearchFilters(phrase)),
              ...tokens.flatMap((token) => buildSearchFilters(token))
            ]
          }
        : { verified: true };
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
    .filter((token) => token && token.length >= 2);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildSearchFilters(term: string) {
  return [
    { name: { contains: term, mode: "insensitive" as const } },
    { sku: { contains: term, mode: "insensitive" as const } },
    { category: { contains: term, mode: "insensitive" as const } },
    { description: { contains: term, mode: "insensitive" as const } },
    { origin: { contains: term, mode: "insensitive" as const } },
    { brand: { name: { contains: term, mode: "insensitive" as const } } },
    { circularIds: { some: { code: { contains: term.toUpperCase(), mode: "insensitive" as const } } } }
  ];
}
