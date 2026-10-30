/**
 * Small fixed-window rate limiter held in memory.
 * On serverless it is per-instance, so it is a speed bump against scripted abuse, not a hard guarantee.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const entries = new Map<string, { count: number; resetAt: number }>();

  function live(key: string) {
    const e = entries.get(key);
    if (!e) return undefined;
    if (e.resetAt <= Date.now()) {
      entries.delete(key);
      return undefined;
    }
    return e;
  }

  return {
    isBlocked: (key: string) => (live(key)?.count ?? 0) >= limit,
    hit(key: string) {
      const e = live(key);
      if (e) {
        e.count += 1;
        return;
      }
      if (entries.size > 5000) for (const k of entries.keys()) live(k);
      entries.set(key, { count: 1, resetAt: Date.now() + windowMs });
    },
    reset: (key: string) => void entries.delete(key),
  };
}
