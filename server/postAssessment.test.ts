import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.pdf", key: "reports/test.pdf" }),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock db
vi.mock("./db", () => ({
  getAssessmentsByDomain: vi.fn().mockResolvedValue([
    { id: 1, guestName: "Alice", guestEmail: "alice@test.com", role: "Spark", score: 85, scores: { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 25 }, shareToken: "abc123", teamId: 1 },
    { id: 2, guestName: "Bob", guestEmail: "bob@test.com", role: "Ground", score: 78, scores: { Spark: 10, Amplifier: 15, Filter: 20, Ground: 35, Conductor: 20 }, shareToken: "def456", teamId: 1 },
    { id: 3, guestName: "Carol", guestEmail: "carol@test.com", role: "Amplifier", score: 82, scores: { Spark: 15, Amplifier: 30, Filter: 20, Ground: 10, Conductor: 25 }, shareToken: "ghi789", teamId: 1 },
  ]),
}));

describe("Team Friction Report", () => {
  it("should generate a team friction PDF with valid data", async () => {
    const { generateTeamFrictionPDF } = await import("./teamFrictionReport");
    const result = await generateTeamFrictionPDF({
      teamName: "Test Team",
      domain: "test.com",
      members: [
        { name: "Alice", role: "Spark", score: 85, scores: { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 25 } },
        { name: "Bob", role: "Ground", score: 78, scores: { Spark: 10, Amplifier: 15, Filter: 20, Ground: 35, Conductor: 20 } },
        { name: "Carol", role: "Amplifier", score: 82, scores: { Spark: 15, Amplifier: 30, Filter: 20, Ground: 10, Conductor: 25 } },
      ],
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
    // storagePut mock returns fixed key, so just verify it's a string
    expect(typeof result.key).toBe("string");
  });

  it("should generate a PDF buffer that starts with %PDF", async () => {
    const { storagePut } = await import("./storage");
    const mockedPut = vi.mocked(storagePut);
    const { generateTeamFrictionPDF } = await import("./teamFrictionReport");

    await generateTeamFrictionPDF({
      teamName: "Buffer Test",
      domain: "buffer.com",
      members: [
        { name: "A", role: "Spark", score: 80, scores: { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 25 } },
        { name: "B", role: "Ground", score: 75, scores: { Spark: 10, Amplifier: 15, Filter: 20, Ground: 35, Conductor: 20 } },
        { name: "C", role: "Filter", score: 70, scores: { Spark: 15, Amplifier: 10, Filter: 30, Ground: 20, Conductor: 25 } },
      ],
    });

    const lastCall = mockedPut.mock.calls[mockedPut.mock.calls.length - 1];
    const buffer = lastCall[1] as Buffer;
    expect(buffer.toString("ascii", 0, 5)).toBe("%PDF-");
  });

  it("should handle teams with all 5 roles", async () => {
    const { generateTeamFrictionPDF } = await import("./teamFrictionReport");
    const result = await generateTeamFrictionPDF({
      teamName: "Full Team",
      domain: "full.com",
      members: [
        { name: "A", role: "Spark", score: 80, scores: { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 25 } },
        { name: "B", role: "Amplifier", score: 75, scores: { Spark: 10, Amplifier: 35, Filter: 20, Ground: 15, Conductor: 20 } },
        { name: "C", role: "Filter", score: 70, scores: { Spark: 15, Amplifier: 10, Filter: 30, Ground: 20, Conductor: 25 } },
        { name: "D", role: "Ground", score: 85, scores: { Spark: 10, Amplifier: 15, Filter: 20, Ground: 35, Conductor: 20 } },
        { name: "E", role: "Conductor", score: 78, scores: { Spark: 20, Amplifier: 15, Filter: 10, Ground: 20, Conductor: 35 } },
      ],
    });

    expect(result).toHaveProperty("url");
  });

  it("should handle teams with duplicate roles", async () => {
    const { generateTeamFrictionPDF } = await import("./teamFrictionReport");
    const result = await generateTeamFrictionPDF({
      teamName: "Spark Heavy",
      domain: "sparks.com",
      members: [
        { name: "A", role: "Spark", score: 80, scores: { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 25 } },
        { name: "B", role: "Spark", score: 82, scores: { Spark: 32, Amplifier: 18, Filter: 15, Ground: 10, Conductor: 25 } },
        { name: "C", role: "Spark", score: 78, scores: { Spark: 28, Amplifier: 22, Filter: 15, Ground: 10, Conductor: 25 } },
      ],
    });

    expect(result).toHaveProperty("url");
  });
});

describe("Post-Assessment Automation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should run without throwing for valid assessment data", async () => {
    const { runPostAssessmentAutomation } = await import("./postAssessmentAutomation");
    
    // Should not throw
    await expect(runPostAssessmentAutomation({
      id: 1,
      guestName: "Test User",
      guestEmail: "test@example.com",
      domain: "example.com",
      role: "Spark",
      score: 85,
      scores: { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 25 },
      shareToken: "abc123",
      teamId: 1,
    })).resolves.not.toThrow();
  });

  it("should call notifyOwner for individual completion", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const { runPostAssessmentAutomation } = await import("./postAssessmentAutomation");
    
    await runPostAssessmentAutomation({
      id: 2,
      guestName: "Notify Test",
      guestEmail: "notify@test.com",
      domain: null,
      role: "Ground",
      score: 78,
      scores: { Spark: 10, Amplifier: 15, Filter: 20, Ground: 35, Conductor: 20 },
      shareToken: "xyz789",
      teamId: null,
    });

    expect(notifyOwner).toHaveBeenCalled();
    const calls = vi.mocked(notifyOwner).mock.calls;
    // At least one call should be about the individual
    const individualCall = calls.find(c => c[0].title.includes("Notify Test"));
    expect(individualCall).toBeDefined();
  });

  it("should trigger team report when domain has 3+ members", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const { runPostAssessmentAutomation } = await import("./postAssessmentAutomation");
    
    await runPostAssessmentAutomation({
      id: 3,
      guestName: "Team Trigger",
      guestEmail: "trigger@test.com",
      domain: "test.com",
      role: "Filter",
      score: 72,
      scores: { Spark: 15, Amplifier: 10, Filter: 30, Ground: 20, Conductor: 25 },
      shareToken: "team123",
      teamId: 1,
    });

    expect(notifyOwner).toHaveBeenCalled();
    const calls = vi.mocked(notifyOwner).mock.calls;
    // Should have both individual and team notifications
    const teamCall = calls.find(c => c[0].title.includes("Team Report"));
    expect(teamCall).toBeDefined();
  });

  it("should handle missing email gracefully", async () => {
    const { runPostAssessmentAutomation } = await import("./postAssessmentAutomation");
    
    await expect(runPostAssessmentAutomation({
      id: 4,
      guestName: "No Email",
      guestEmail: null,
      domain: null,
      role: "Conductor",
      score: 80,
      scores: { Spark: 20, Amplifier: 15, Filter: 10, Ground: 20, Conductor: 35 },
      shareToken: "noemail",
      teamId: null,
    })).resolves.not.toThrow();
  });
});
