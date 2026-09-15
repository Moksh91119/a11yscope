import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
