import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3400),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL es obligatoria"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe tener al menos 32 caracteres"),

  CORS_ALLOWED_ORIGINS: z
    .string()
    .min(1, "CORS_ALLOWED_ORIGINS es obligatoria"),

  CLOUD_NAME: z.string().min(1),

  API_KEY: z.string().min(1),

  API_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = Array.from(
    new Set(
      parsed.error.issues.map(
        (issue) => issue.path.join(".") || "environment",
      ),
    ),
  );

  throw new Error(
    `Configuración de entorno inválida: ${fields.join(", ")}`,
  );
}

const corsOrigins = parsed.data.CORS_ALLOWED_ORIGINS
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of corsOrigins) {
  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    throw new Error(
      "CORS_ALLOWED_ORIGINS contiene una URL inválida",
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "CORS_ALLOWED_ORIGINS solo permite HTTP o HTTPS",
    );
  }

  if (url.origin !== origin) {
    throw new Error(
      "CORS_ALLOWED_ORIGINS debe contener orígenes sin rutas",
    );
  }

  if (
    parsed.data.NODE_ENV === "production" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "CORS_ALLOWED_ORIGINS debe usar HTTPS en producción",
    );
  }
}

const ENV = Object.freeze({
  ...parsed.data,

  CORS_ORIGINS: Object.freeze(corsOrigins),


  JWT_ISSUER: "tintas-api",
  JWT_AUDIENCE: "tintas-web",
  JWT_EXPIRES_IN_SECONDS: 60 * 60, // 1 hora

  COOKIE_SECURE:
    parsed.data.NODE_ENV === "production",

  COOKIE_SAME_SITE: "lax" as const,

  RESET_TOKEN_TTL_SECONDS: 15 * 60, // 15 minutos

  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_LOGIN_MAX: 5,
  RATE_LIMIT_RECOVERY_MAX: 3,
  RATE_LIMIT_SENSITIVE_MAX: 30,

  UPLOAD_IMAGE_MAX_BYTES:
    5 * 1024 * 1024, // 5 MB

  UPLOAD_BOOK_MAX_BYTES:
    100 * 1024 * 1024, // 100 MB
});

export type AppEnv = typeof ENV;

export default ENV;