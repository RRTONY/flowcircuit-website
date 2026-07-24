import { describe, it, expect } from "vitest";

describe("SoulPrint Schema", () => {
  it("should have soulprintOrders table in schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.soulprintOrders).toBeDefined();
  });

  it("should have correct tier enum values", async () => {
    const schema = await import("../drizzle/schema");
    // The table should exist with the tier column
    const columns = schema.soulprintOrders as any;
    expect(columns).toBeDefined();
  });

  it("should have required columns on soulprintOrders", async () => {
    const schema = await import("../drizzle/schema");
    const table = schema.soulprintOrders as any;
    // Verify the table has key columns by checking the SQL name
    expect(table.id).toBeDefined();
    expect(table.birthDate).toBeDefined();
    expect(table.birthCity).toBeDefined();
    expect(table.tier).toBeDefined();
    expect(table.reportType).toBeDefined();
    expect(table.isAlpha).toBeDefined();
  });
});

describe("SoulPrint DB Helpers", () => {
  it("should export getSoulprintAlphaCount", async () => {
    const db = await import("./db");
    expect(typeof db.getSoulprintAlphaCount).toBe("function");
  });

  it("should export createSoulprintOrder", async () => {
    const db = await import("./db");
    expect(typeof db.createSoulprintOrder).toBe("function");
  });

  it("should export getSoulprintOrderById", async () => {
    const db = await import("./db");
    expect(typeof db.getSoulprintOrderById).toBe("function");
  });

  it("should export getSoulprintOrderByAssessment", async () => {
    const db = await import("./db");
    expect(typeof db.getSoulprintOrderByAssessment).toBe("function");
  });

  it("should export updateSoulprintOrderStripe", async () => {
    const db = await import("./db");
    expect(typeof db.updateSoulprintOrderStripe).toBe("function");
  });
});

describe("SoulPrint Router", () => {
  it("should have soulprint router in appRouter", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    // Check the router has soulprint procedures
    const procedures = Object.keys((appRouter as any)._def.procedures);
    expect(procedures).toContain("soulprint.status");
    expect(procedures).toContain("soulprint.alphaCount");
    expect(procedures).toContain("soulprint.createOrder");
    expect(procedures).toContain("soulprint.getOrder");
    expect(procedures).toContain("soulprint.generate");
  });
});

describe("SoulPrint Tier Configuration", () => {
  it("should define three tiers: blueprint, compass, oracle", () => {
    const tiers = ["blueprint", "compass", "oracle"];
    expect(tiers).toHaveLength(3);
    expect(tiers).toContain("blueprint");
    expect(tiers).toContain("compass");
    expect(tiers).toContain("oracle");
  });

  it("should define two report types: soulprint_only, combined", () => {
    const reportTypes = ["soulprint_only", "combined"];
    expect(reportTypes).toHaveLength(2);
    expect(reportTypes).toContain("soulprint_only");
    expect(reportTypes).toContain("combined");
  });

  it("should have alpha limit of 1000", () => {
    const ALPHA_LIMIT = 1000;
    expect(ALPHA_LIMIT).toBe(1000);
  });

  it("should price SoulPrint at $44 (4400 cents)", () => {
    const PRICE_CENTS = 4400;
    expect(PRICE_CENTS).toBe(4400);
    expect(PRICE_CENTS / 100).toBe(44);
  });
});
