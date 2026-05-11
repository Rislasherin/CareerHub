import { env } from "@infrastructure/config/env.validator";

export const JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET;
export const JWT_ACCESS_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN;
export const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;
