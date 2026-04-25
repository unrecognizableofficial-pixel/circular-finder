export default () => ({
  app: {
    name: process.env.APP_NAME ?? "Circular Finder",
    tagline: process.env.APP_TAGLINE ?? "Know how it’s made. Know how it fits. Know your impact.",
    motto: process.env.APP_MOTTO ?? "REUSE • REPAIR • REIMAGINE",
    copyright: process.env.APP_COPYRIGHT ?? "© 2026 Circular Finder, LLC All Rights Reserved",
    port: Number(process.env.PORT ?? 4000),
    apiPrefix: process.env.API_PREFIX ?? "api",
    corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((value) => value.trim())
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "30d"
  },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379"
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
    region: process.env.S3_REGION ?? "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
    bucket: process.env.S3_BUCKET ?? "circular-finder",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true"
  },
  vision: {
    provider: process.env.VISION_PROVIDER ?? (process.env.VISION_REMOTE_URL ? "remote-image-model" : "local-signature"),
    model: process.env.VISION_MODEL ?? (process.env.VISION_REMOTE_URL ? "remote-default" : "cf-vision-signature-v2"),
    remoteUrl: process.env.VISION_REMOTE_URL ?? "",
    remoteApiKey: process.env.VISION_REMOTE_API_KEY ?? "",
    minScore: Number(process.env.VISION_MIN_SCORE ?? 0.58)
  },
  integrations: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    webhookSecret: process.env.WEBHOOK_SECRET ?? ""
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY ?? "circular-finder-encryption-fallback"
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== "false"
  }
});
