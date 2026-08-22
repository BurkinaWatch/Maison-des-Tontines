import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
export const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().default(4000),
    API_PREFIX: z.string().default("/api/v1"),
    DATABASE_URL: z.string().url("Invalid DATABASE_URL"),
    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
    JWT_ACCESS_EXPIRY: z.string().default("15m"),
    JWT_REFRESH_EXPIRY: z.string().default("7d"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_PREFIX: z.string().default("mt"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    WAVE_API_KEY: z.string().optional(),
    WAVE_API_SECRET: z.string().optional(),
    WAVE_WEBHOOK_SECRET: z.string().optional(),
    WAVE_BASE_URL: z.string().default("https://api.wave.com"),
    SMS_PROVIDER: z.string().optional(),
    SMS_API_KEY: z.string().optional(),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    MAX_FILE_SIZE_MB: z.coerce.number().default(10),
    UPLOAD_DIR: z.string().default("./uploads"),
    AI_PROVIDER: z.string().optional(),
    AI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default("gpt-4"),
});
let env;
export function getEnv() {
    if (!env) {
        const parsed = envSchema.safeParse({
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL ?? process.env.RAILWAY_DATABASE_URL,
        });
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("\n");
            throw new Error(`Invalid environment variables:\n${errors}`);
        }
        env = parsed.data;
    }
    return env;
}
//# sourceMappingURL=env.js.map