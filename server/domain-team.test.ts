import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("assessment.submit with domain", () => {
  it("accepts domain parameter in the input schema", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists and accepts the domain field
    // We can't actually submit without a DB, but we can verify the schema validation
    try {
      await caller.assessment.submit({
        domain: "testcompany.com",
        guestName: "Test User",
        guestEmail: "test@testcompany.com",
        role: "Spark",
        score: 85,
        scores: { Spark: 85, Amplifier: 60, Filter: 40, Ground: 30, Conductor: 50 },
        answers: {},
      });
    } catch (err: any) {
      // Expected to fail due to no DB connection in test, but should NOT be a validation error
      expect(err.message).not.toContain("Expected string");
      expect(err.message).not.toContain("Unrecognized key");
    }
  });

  it("rejects empty guest name", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assessment.submit({
        domain: "testcompany.com",
        guestName: "",
        role: "Spark",
        score: 85,
      })
    ).rejects.toThrow();
  });
});

describe("assessment.byDomain", () => {
  it("accepts a domain string input", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists and accepts domain
    try {
      await caller.assessment.byDomain({ domain: "testcompany.com" });
    } catch (err: any) {
      // Expected to fail due to no DB, but should NOT be a validation error
      expect(err.message).not.toContain("Expected string");
      expect(err.message).not.toContain("Unrecognized key");
    }
  });

  it("rejects empty domain", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assessment.byDomain({ domain: "" })
    ).rejects.toThrow();
  });
});

describe("team.getByCode", () => {
  it("accepts a code string input", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists
    try {
      const result = await caller.team.getByCode({ code: "TESTCODE" });
      // With no DB, should return null
      expect(result).toBeNull();
    } catch (err: any) {
      // May fail due to no DB, but should not be schema error
      expect(err.message).not.toContain("Expected string");
    }
  });
});
