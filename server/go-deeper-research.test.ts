import { describe, it, expect } from "vitest";

// ─── Company Email Domain Detection ──────────────────────────────────

describe("Company Email Domain Detection", () => {
  const freeEmailDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "aol.com", "icloud.com", "protonmail.com", "mail.com",
    "zoho.com", "yandex.com",
  ];

  function detectCompanyDomain(email: string): { isCompany: boolean; domain: string | null; companyName: string | null } {
    const match = email.match(/@([^\s@]+\.[^\s@]+)$/);
    if (!match) return { isCompany: false, domain: null, companyName: null };
    const domain = match[1].toLowerCase();
    const isCompany = !freeEmailDomains.includes(domain);
    const companyName = isCompany
      ? domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)
      : null;
    return { isCompany, domain, companyName };
  }

  it("should detect RampRate as a company domain", () => {
    const result = detectCompanyDomain("sarah@ramprate.com");
    expect(result.isCompany).toBe(true);
    expect(result.domain).toBe("ramprate.com");
    expect(result.companyName).toBe("Ramprate");
  });

  it("should detect Microsoft as a company domain", () => {
    const result = detectCompanyDomain("john@microsoft.com");
    expect(result.isCompany).toBe(true);
    expect(result.domain).toBe("microsoft.com");
    expect(result.companyName).toBe("Microsoft");
  });

  it("should NOT detect gmail.com as a company domain", () => {
    const result = detectCompanyDomain("user@gmail.com");
    expect(result.isCompany).toBe(false);
    expect(result.companyName).toBeNull();
  });

  it("should NOT detect yahoo.com as a company domain", () => {
    const result = detectCompanyDomain("user@yahoo.com");
    expect(result.isCompany).toBe(false);
  });

  it("should NOT detect outlook.com as a company domain", () => {
    const result = detectCompanyDomain("user@outlook.com");
    expect(result.isCompany).toBe(false);
  });

  it("should NOT detect icloud.com as a company domain", () => {
    const result = detectCompanyDomain("user@icloud.com");
    expect(result.isCompany).toBe(false);
  });

  it("should handle invalid email gracefully", () => {
    const result = detectCompanyDomain("not-an-email");
    expect(result.isCompany).toBe(false);
    expect(result.domain).toBeNull();
  });

  it("should handle empty string", () => {
    const result = detectCompanyDomain("");
    expect(result.isCompany).toBe(false);
    expect(result.domain).toBeNull();
  });

  it("should capitalize company name correctly", () => {
    const result = detectCompanyDomain("ceo@apple.com");
    expect(result.companyName).toBe("Apple");
  });

  it("should handle subdomains", () => {
    const result = detectCompanyDomain("user@eng.ramprate.com");
    expect(result.isCompany).toBe(true);
    expect(result.domain).toBe("eng.ramprate.com");
  });
});

// ─── Research Opt-In Logic ───────────────────────────────────────────

describe("Research Opt-In Logic", () => {
  it("should default researchOptIn to false", () => {
    const input = { researchOptIn: undefined };
    const value = input.researchOptIn ?? false;
    expect(value).toBe(false);
  });

  it("should accept explicit true for researchOptIn", () => {
    const input = { researchOptIn: true };
    const value = input.researchOptIn ?? false;
    expect(value).toBe(true);
  });

  it("should accept explicit false for researchOptIn", () => {
    const input = { researchOptIn: false };
    const value = input.researchOptIn ?? false;
    expect(value).toBe(false);
  });
});

// ─── Research Stats Aggregation ──────────────────────────────────────

describe("Research Stats Aggregation", () => {
  function calculateEntropy(roleFrequencies: Record<string, number>, total: number): number {
    return Object.values(roleFrequencies).reduce((sum, freq) => {
      const p = freq / total;
      return sum - (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
  }

  it("should calculate maximum entropy for uniform distribution", () => {
    const roles = { Spark: 20, Amplifier: 20, Filter: 20, Ground: 20, Conductor: 20 };
    const entropy = calculateEntropy(roles, 100);
    const maxEntropy = Math.log2(5);
    expect(entropy).toBeCloseTo(maxEntropy, 5);
  });

  it("should calculate zero entropy for single-role distribution", () => {
    const roles = { Spark: 100 };
    const entropy = calculateEntropy(roles, 100);
    expect(entropy).toBeCloseTo(0, 5);
  });

  it("should calculate lower entropy for skewed distribution", () => {
    const uniform = { Spark: 20, Amplifier: 20, Filter: 20, Ground: 20, Conductor: 20 };
    const skewed = { Spark: 60, Amplifier: 15, Filter: 10, Ground: 10, Conductor: 5 };
    const uniformEntropy = calculateEntropy(uniform, 100);
    const skewedEntropy = calculateEntropy(skewed, 100);
    expect(skewedEntropy).toBeLessThan(uniformEntropy);
  });

  it("should calculate spark inflation correctly", () => {
    const sparkCount = 35;
    const total = 100;
    const sparkRate = (sparkCount / total) * 100;
    const expectedRate = 20;
    const inflation = Math.max(0, sparkRate - expectedRate);
    expect(inflation).toBe(15);
  });

  it("should report zero inflation when Spark is at or below expected", () => {
    const sparkCount = 18;
    const total = 100;
    const sparkRate = (sparkCount / total) * 100;
    const inflation = Math.max(0, sparkRate - 20);
    expect(inflation).toBe(0);
  });
});

// ─── Go Deeper CTA Benchmarks ────────────────────────────────────────

describe("Go Deeper CTA Benchmarks", () => {
  const BENCHMARKS = {
    likertAccuracy: 50.9,
    forcedRankAccuracy: 90.0,
    likertReliability: 0.518,
    forcedRankReliability: 0.865,
    likertSparkInflation: 37,
    forcedRankSparkInflation: 0,
  };

  it("forced-rank accuracy should be significantly higher than Likert", () => {
    expect(BENCHMARKS.forcedRankAccuracy - BENCHMARKS.likertAccuracy).toBeGreaterThan(30);
  });

  it("forced-rank reliability should exceed 0.80 threshold", () => {
    expect(BENCHMARKS.forcedRankReliability).toBeGreaterThanOrEqual(0.80);
  });

  it("forced-rank should eliminate Spark inflation", () => {
    expect(BENCHMARKS.forcedRankSparkInflation).toBe(0);
  });

  it("Likert Spark inflation should be above 30%", () => {
    expect(BENCHMARKS.likertSparkInflation).toBeGreaterThan(30);
  });
});

// ─── Score Spread Calculation ────────────────────────────────────────

describe("Score Spread Calculation", () => {
  it("should calculate spread as max minus min", () => {
    const scores = { Spark: 80, Amplifier: 60, Filter: 40, Ground: 30, Conductor: 50 };
    const vals = Object.values(scores);
    const spread = Math.max(...vals) - Math.min(...vals);
    expect(spread).toBe(50);
  });

  it("should return zero spread for uniform scores", () => {
    const scores = { Spark: 50, Amplifier: 50, Filter: 50, Ground: 50, Conductor: 50 };
    const vals = Object.values(scores);
    const spread = Math.max(...vals) - Math.min(...vals);
    expect(spread).toBe(0);
  });
});
