/**
 * Shared rate limiter — fixed window, backed by the database.
 *
 * Using a DB table means the limit holds across all serverless instances
 * (fixing the previous in-process-only approach which silently allowed brute
 * force across multiple lambda cold-starts on Vercel and similar platforms).
 *
 * Graceful fallback: if the DB is unavailable, we fall back to the previous
 * in-process counter so the app stays up. The fallback is logged.
 *
 * Design:
 *   • One row per (prefix, key) in the RateLimitEntry table.
 *   • resetAt is stored; expired rows are overwritten.
 *   • count is incremented atomically with updateMany (no transaction needed
 *     because we only read-after-write in the same call).
 */

import { prisma } from "@/lib/prisma";

// ── In-process fallback (used when the DB call throws) ──────────────────────

interface LocalEntry {
  count: number;
  resetAt: number;
}

function makeLocalFallback(limit: number, windowMs: number) {
  const entries = new Map<string, LocalEntry>();

  function live(key: string): LocalEntry | undefined {
    const e = entries.get(key);
    if (!e) return undefined;
    if (e.resetAt <= Date.now()) { entries.delete(key); return undefined; }
    return e;
  }

  return {
    isBlocked: (key: string) => (live(key)?.count ?? 0) >= limit,
    hit(key: string) {
      const e = live(key);
      if (e) { e.count += 1; return; }
      if (entries.size > 5000) for (const k of entries.keys()) live(k);
      entries.set(key, { count: 1, resetAt: Date.now() + windowMs });
    },
    reset: (key: string) => void entries.delete(key),
  };
}

// ── Shared (DB-backed) limiter factory ─────────────────────────────────────

export interface SharedRateLimiter {
  /** Returns true if the key has exceeded the limit in the current window. */
  isBlocked(key: string): Promise<boolean>;
  /** Increments the counter for the key. Must be called on every relevant action. */
  hit(key: string): Promise<void>;
  /** Clears the counter for the key (e.g. after a successful login). */
  reset(key: string): Promise<void>;
}

/**
 * Creates a rate limiter backed by the `RateLimitEntry` Prisma table.
 *
 * @param prefix  Short namespace for this limiter (e.g. "reg", "login").
 *                Prevents collisions between different limiters sharing the table.
 * @param limit   Maximum hits in the window before `isBlocked` returns true.
 * @param windowMs  Window length in milliseconds.
 */
export function createSharedRateLimiter(prefix: string, limit: number, windowMs: number): SharedRateLimiter {
  const local = makeLocalFallback(limit, windowMs);

  function id(key: string): string {
    // Truncate to stay well within PostgreSQL's varchar limits
    return `${prefix}:${key}`.slice(0, 200);
  }

  async function getCount(key: string): Promise<number> {
    const entryId = id(key);
    const row = await prisma.rateLimitEntry.findUnique({
      where: { id: entryId },
      select: { count: true, resetAt: true },
    });
    if (!row) return 0;
    if (row.resetAt <= new Date()) {
      // Expired — treat as zero (will be overwritten on next hit)
      return 0;
    }
    return row.count;
  }

  return {
    async isBlocked(key: string): Promise<boolean> {
      try {
        const count = await getCount(key);
        return count >= limit;
      } catch (err) {
        console.warn("[rate-limit] DB unavailable, using local fallback:", (err as Error).message);
        return local.isBlocked(key);
      }
    },

    async hit(key: string): Promise<void> {
      try {
        const entryId = id(key);
        const now = new Date();
        const resetAt = new Date(now.getTime() + windowMs);

        // Try to increment an existing non-expired row
        const updated = await prisma.rateLimitEntry.updateMany({
          where: { id: entryId, resetAt: { gt: now } },
          data: { count: { increment: 1 } },
        });

        if (updated.count === 0) {
          // No live row — create or overwrite
          await prisma.rateLimitEntry.upsert({
            where: { id: entryId },
            update: { count: 1, resetAt },
            create: { id: entryId, count: 1, resetAt },
          });
        }

        // Mirror into local fallback so isBlocked works if the next DB call fails
        local.hit(key);
      } catch (err) {
        console.warn("[rate-limit] DB unavailable on hit, using local fallback:", (err as Error).message);
        local.hit(key);
      }
    },

    async reset(key: string): Promise<void> {
      try {
        await prisma.rateLimitEntry.deleteMany({ where: { id: id(key) } });
      } catch {
        // Non-critical: fallback reset still applies
      }
      local.reset(key);
    },
  };
}

// ── Legacy synchronous interface (unchanged for callers that have not migrated) ──

/**
 * @deprecated Use createSharedRateLimiter for new code. This synchronous helper
 * is kept for existing callers; it uses a per-process Map and does NOT share
 * state across serverless instances.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const entries = new Map<string, { count: number; resetAt: number }>();

  function live(key: string) {
    const e = entries.get(key);
    if (!e) return undefined;
    if (e.resetAt <= Date.now()) { entries.delete(key); return undefined; }
    return e;
  }

  return {
    isBlocked: (key: string) => (live(key)?.count ?? 0) >= limit,
    hit(key: string) {
      const e = live(key);
      if (e) { e.count += 1; return; }
      if (entries.size > 5000) for (const k of entries.keys()) live(k);
      entries.set(key, { count: 1, resetAt: Date.now() + windowMs });
    },
    reset: (key: string) => void entries.delete(key),
  };
}
