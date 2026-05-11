import "./load.env";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  MONGODB_URI: z.string().nonempty("MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().nonempty("JWT_ACCESS_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string().nonempty("JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRES_IN: z.string(),
});

export const env = envSchema.parse(process.env);
