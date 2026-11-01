import { describe, expect, it, vi, beforeEach } from "vitest";
import { createSharedRateLimiter } from "./rate-limit";
import { prisma } from "./prisma";

// Mock prisma.rateLimitEntry calls to test DB-backed concurrency and fallbacks
vi.mock("./prisma", () => ({
  prisma: {
    rateLimitEntry: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe("SharedRateLimiter - Atomic checkAndHit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks requests exceeding the rate limit", async () => {
    const limiter = createSharedRateLimiter("test-block", 3, 1000);

    // Mock DB calls to return a count that increments
    let mockCount = 0;
    vi.spyOn(prisma.rateLimitEntry, "updateMany").mockImplementation((async () => {
      mockCount++;
      return { count: mockCount } as any;
    }) as any);
    vi.spyOn(prisma.rateLimitEntry, "findUnique").mockImplementation((async () => {
      return { count: mockCount, resetAt: new Date(Date.now() + 10000) } as any;
    }) as any);

    // 1st request - count 1 <= 3 (allowed)
    const res1 = await limiter.checkAndHit("user-ip");
    expect(res1).toBe(false);

    // 2nd request - count 2 <= 3 (allowed)
    const res2 = await limiter.checkAndHit("user-ip");
    expect(res2).toBe(false);

    // 3rd request - count 3 <= 3 (allowed)
    const res3 = await limiter.checkAndHit("user-ip");
    expect(res3).toBe(false);

    // 4th request - count 4 > 3 (blocked)
    const res4 = await limiter.checkAndHit("user-ip");
    expect(res4).toBe(true);
  });

  it("handles database failures gracefully by failing open to process-local backup", async () => {
    const limiter = createSharedRateLimiter("test-fallback", 2, 10000);

    // Force Prisma to throw an error (simulating database downtime)
    vi.spyOn(prisma.rateLimitEntry, "updateMany").mockRejectedValue(new Error("Database connection lost"));

    // 1st request should hit local fallback (allowed)
    const res1 = await limiter.checkAndHit("test-key");
    expect(res1).toBe(false);

    // 2nd request (allowed)
    const res2 = await limiter.checkAndHit("test-key");
    expect(res2).toBe(false);

    // 3rd request (exceeds limit 2) - should be blocked
    const res3 = await limiter.checkAndHit("test-key");
    expect(res3).toBe(true);
  });

  it("handles high concurrent execution cleanly", async () => {
    const limiter = createSharedRateLimiter("test-concurrency", 5, 5000);

    // Simulating concurrent queries where both see the non-expired entries
    let mockCount = 0;
    vi.spyOn(prisma.rateLimitEntry, "updateMany").mockImplementation((async () => {
      mockCount++;
      return { count: 1 } as any; // 1 means we found an active entry and updated it
    }) as any);
    vi.spyOn(prisma.rateLimitEntry, "findUnique").mockImplementation((async () => {
      return { count: mockCount, resetAt: new Date(Date.now() + 5000) } as any;
    }) as any);

    // Execute 6 concurrent checks
    const results = await Promise.all([
      limiter.checkAndHit("concurrent-ip"),
      limiter.checkAndHit("concurrent-ip"),
      limiter.checkAndHit("concurrent-ip"),
      limiter.checkAndHit("concurrent-ip"),
      limiter.checkAndHit("concurrent-ip"),
      limiter.checkAndHit("concurrent-ip"),
    ]);

    // Since the database count reaches 6, and we execute concurrent checks:
    // Some are allowed (up to 5), but any that read the final count > 5 will block.
    // The rate limiter correctly registers hits and blocks when the final count exceeds 5.
    const blockedCount = results.filter(r => r === true).length;
    expect(mockCount).toBe(6);
    expect(blockedCount).toBeGreaterThanOrEqual(1);
  });
});
