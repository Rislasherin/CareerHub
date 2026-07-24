// fetch html using iframe 
//avid each html creation
import { logger } from "@infrastructure/logger/logger";

interface CacheEntry {
    html: string;
    expiresAt: number;
}

export class PreviewCacheService {
    private static cache = new Map<string, CacheEntry>();
    private static readonly DEFAULT_TTL_MS = 1000 * 60 * 15; // 15 minutes

    public static get(key: string): string | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        logger.info(`[PreviewCache] Cache HIT for key: ${key}`);
        return entry.html;
    }

    public static set(key: string, html: string, ttlMs: number = this.DEFAULT_TTL_MS): void {
        this.cache.set(key, {
            html,
            expiresAt: Date.now() + ttlMs
        });
        logger.info(`[PreviewCache] Cached HTML for key: ${key} (TTL: ${ttlMs}ms)`);
    }

    public static invalidate(keyPrefix: string): void {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(keyPrefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        logger.info(`[PreviewCache] Invalidated ${count} cache entries for prefix: ${keyPrefix}`);
    }

    public static clear(): void {
        this.cache.clear();
        logger.info(`[PreviewCache] Cleared all cache entries.`);
    }
}
