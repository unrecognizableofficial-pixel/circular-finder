import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("api"),
  APP_NAME: z.string().default("Circular Finder"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(12),
  JWT_REFRESH_SECRET: z.string().min(12),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  SWAGGER_ENABLED: z.string().optional(),
  VISION_PROVIDER: z.string().optional(),
  VISION_MODEL: z.string().optional(),
  VISION_REMOTE_URL: z.string().optional(),
  VISION_REMOTE_API_KEY: z.string().optional(),
  VISION_MIN_SCORE: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional()
});

export function validateEnvironment(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
