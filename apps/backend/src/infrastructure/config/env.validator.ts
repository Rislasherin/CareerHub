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
  EMAIL_HOST: z.string().nonempty("EMAIL_HOST is required"),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_USER: z.string().nonempty("EMAIL_USER is required"),
  EMAIL_PASS: z.string().nonempty("EMAIL_PASS is required"),
  EMAIL_FROM: z.string().default("CareerHub <no-reply@careerhub.com>"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
