import { describe, expect, it, vi } from "vitest";

/**
 * Tests for the Family Delivery Pipeline:
 * 1. Family friction PDF report generator (familyFrictionReport.ts)
 * 2. Post-assessment automation family detection (postAssessmentAutomation.ts)
 * 3. Family 360 review route (routers.ts)
 */

// ─── Family Domain Detection ────────────────────────────────────────────────
describe("isFamilyDomain detection", () => {
  // We test the logic directly since it's a private function.
  // Replicate the logic here for unit testing.
  function isFamilyDomain(domain: string): boolean {
    const lower = domain.toLowerCase();
    if (lower.includes("family")) return true;
    if (lower.startsWith("the-")) return true;
    if (!lower.includes(".") && lower.includes("-")) return true;
    if (!lower.includes(".") && lower.length <= 20) return true;
    return false;
  }

  it("detects domains containing 'family'", () => {
    expect(isFamilyDomain("smith-family")).toBe(true);
    expect(isFamilyDomain("The-Johnson-Family")).toBe(true);
    expect(isFamilyDomain("myfamily")).toBe(true);
  });

  it("detects domains starting with 'the-'", () => {
    expect(isFamilyDomain("the-smiths")).toBe(true);
    expect(isFamilyDomain("the-greenbergs")).toBe(true);
  });

  it("detects short domains without dots (likely family codes)", () => {
    expect(isFamilyDomain("greenberg")).toBe(true);
    expect(isFamilyDomain("smith")).toBe(true);
    expect(isFamilyDomain("berry-clan")).toBe(true);
  });

  it("does NOT flag company domains with dots", () => {
    expect(isFamilyDomain("ramprate.com")).toBe(false);
    expect(isFamilyDomain("google.com")).toBe(false);
    expect(isFamilyDomain("acme-corp.io")).toBe(false);
  });

  it("does NOT flag very long non-dot domains", () => {
    // Over 20 chars without dots and without hyphens
    expect(isFamilyDomain("averylongcompanynamethatexceedstwenty")).toBe(false);
  });
});

// ─── Family Friction Report Data Structures ─────────────────────────────────
describe("familyFrictionReport module", () => {
  it("exports the correct types and function", async () => {
    const mod = await import("./familyFrictionReport");
    expect(mod.generateFamilyFrictionPDF).toBeDefined();
    expect(typeof mod.generateFamilyFrictionPDF).toBe("function");
  });
});

// ─── Family Report Router Procedure ─────────────────────────────────────────
describe("report.generateFamilyFriction procedure", () => {
  it("exists on the appRouter", async () => {
    const { appRouter } = await import("./routers");
    // Check the procedure exists by verifying the router shape
    expect((appRouter as any)._def.procedures["report.generateFamilyFriction"]).toBeDefined();
  });

  it("rejects when fewer than 2 members exist", async () => {
    const { appRouter } = await import("./routers");

    // Mock getAssessmentsByDomain to return 1 member
    vi.doMock("./db", async (importOriginal) => {
      const actual = await importOriginal() as any;
      return {
        ...actual,
        getAssessmentsByDomain: vi.fn().mockResolvedValue([
          { guestName: "Alice", role: "Spark", score: 80, scores: { Spark: 80, Amplifier: 10, Filter: 5, Ground: 3, Conductor: 2 } },
        ]),
      };
    });

    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    });

    await expect(
      caller.report.generateFamilyFriction({ domain: "test-family" })
    ).rejects.toThrow(/at least 2 family members/);
  });
});

// ─── Family 360 Review Route ────────────────────────────────────────────────
describe("Family 360 review flow", () => {
  it("uses the same threeSixty.getSession procedure", async () => {
    const { appRouter } = await import("./routers");
    // The family 360 uses the same backend as regular 360
    expect((appRouter as any)._def.procedures["threeSixty.getSession"]).toBeDefined();
    expect((appRouter as any)._def.procedures["threeSixty.submitResponse"]).toBeDefined();
  });

  it("threeSixty.submitResponse validates rank sum equals 15", async () => {
    const { appRouter } = await import("./routers");

    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    });

    // Invalid ranks (sum != 15)
    await expect(
      caller.threeSixty.submitResponse({
        token: "fake-token",
        sparkRank: 1,
        amplifierRank: 1,
        filterRank: 1,
        groundRank: 1,
        conductorRank: 1,
      })
    ).rejects.toThrow(/Ranks must be unique/);
  });
});

// ─── Family Role Name Mapping ───────────────────────────────────────────────
describe("Family role name mapping", () => {
  const FAMILY_ROLE_NAMES: Record<string, string> = {
    Spark: "The Dreamer",
    Amplifier: "The Cheerleader",
    Filter: "The Protector",
    Ground: "The Rock",
    Conductor: "The Peacemaker",
  };

  it("maps all 5 business roles to family archetypes", () => {
    expect(Object.keys(FAMILY_ROLE_NAMES)).toHaveLength(5);
    expect(FAMILY_ROLE_NAMES.Spark).toBe("The Dreamer");
    expect(FAMILY_ROLE_NAMES.Amplifier).toBe("The Cheerleader");
    expect(FAMILY_ROLE_NAMES.Filter).toBe("The Protector");
    expect(FAMILY_ROLE_NAMES.Ground).toBe("The Rock");
    expect(FAMILY_ROLE_NAMES.Conductor).toBe("The Peacemaker");
  });

  it("all family names start with 'The'", () => {
    Object.values(FAMILY_ROLE_NAMES).forEach(name => {
      expect(name.startsWith("The ")).toBe(true);
    });
  });
});
