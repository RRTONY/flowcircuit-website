import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock the database layer ────────────────────────────────────
vi.mock("./db", () => {
  const teams: any[] = [];
  const assessmentStore: any[] = [];
  const feedbackStore: any[] = [];
  let teamIdCounter = 1;
  let assessmentIdCounter = 1;
  let feedbackIdCounter = 1;

  return {
    getDb: vi.fn().mockResolvedValue({}),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
    createTeam: vi.fn(async (ownerId: number, name: string, companyName?: string) => {
      const team = {
        id: teamIdCounter++,
        code: `TEST${teamIdCounter}`,
        name,
        companyName: companyName ?? null,
        ownerId,
        logoUrl: null,
        slackWebhookUrl: null,
        weeklyReportEnabled: false,
        weeklyReportEmail: null,
        maxMembers: 25,
        isAlpha: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      teams.push(team);
      return team;
    }),
    getTeamByCode: vi.fn(async (code: string) => {
      return teams.find((t) => t.code === code) ?? null;
    }),
    getTeamById: vi.fn(async (id: number) => {
      return teams.find((t) => t.id === id) ?? null;
    }),
    getTeamsByOwner: vi.fn(async (ownerId: number) => {
      return teams.filter((t) => t.ownerId === ownerId);
    }),
    updateTeamSettings: vi.fn(async (_teamId: number, _settings: any) => {}),
    saveAssessment: vi.fn(async (data: any) => {
      const assessment = {
        id: assessmentIdCounter++,
        ...data,
        createdAt: new Date(),
      };
      assessmentStore.push(assessment);
      return assessment;
    }),
    getAssessmentsByTeam: vi.fn(async (teamId: number) => {
      return assessmentStore.filter((a) => a.teamId === teamId);
    }),
    getAssessmentsByUser: vi.fn(async (userId: number) => {
      return assessmentStore.filter((a) => a.userId === userId);
    }),
    getAssessmentByShareToken: vi.fn(async (token: string) => {
      return assessmentStore.find((a) => a.shareToken === token) ?? null;
    }),
    saveFeedback: vi.fn(async (data: any) => {
      const fb = {
        id: feedbackIdCounter++,
        ...data,
        createdAt: new Date(),
      };
      feedbackStore.push(fb);
      return fb;
    }),
    getFeedbackByTeam: vi.fn(async (teamId: number) => {
      return feedbackStore.filter((f) => f.teamId === teamId);
    }),
    sendSlackNotification: vi.fn(async () => true),
  };
});

// ─── Test Helpers ───────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Team Tests ─────────────────────────────────────────────────

describe("team procedures", () => {
  it("creates a team for an authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const team = await caller.team.create({
      name: "RampRate Leadership",
      companyName: "RampRate",
    });

    expect(team).toBeTruthy();
    expect(team!.name).toBe("RampRate Leadership");
    expect(team!.companyName).toBe("RampRate");
    expect(team!.ownerId).toBe(1);
    expect(team!.code).toBeTruthy();
  });

  it("lists teams owned by the authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const teams = await caller.team.myTeams();
    expect(Array.isArray(teams)).toBe(true);
  });

  it("returns team info by code as a public procedure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const team = await caller.team.create({ name: "Alpha Team" });
    expect(team).toBeTruthy();

    const publicCaller = appRouter.createCaller(createPublicContext());
    const found = await publicCaller.team.getByCode({ code: team!.code });
    expect(found).toBeTruthy();
    expect(found!.name).toBe("Alpha Team");
  });

  it("updates team settings for the owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const team = await caller.team.create({ name: "Settings Test" });
    expect(team).toBeTruthy();

    const result = await caller.team.updateSettings({
      teamId: team!.id,
      name: "Updated Name",
      companyName: "Updated Corp",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects team settings update from a non-owner", async () => {
    const ownerCtx = createAuthContext({ id: 10 });
    const ownerCaller = appRouter.createCaller(ownerCtx);
    const team = await ownerCaller.team.create({ name: "Owner Team" });

    const otherCtx = createAuthContext({ id: 99 });
    const otherCaller = appRouter.createCaller(otherCtx);

    await expect(
      otherCaller.team.updateSettings({ teamId: team!.id, name: "Hacked" })
    ).rejects.toThrow();
  });
});

// ─── Assessment Tests ───────────────────────────────────────────

describe("assessment procedures", () => {
  it("submits an assessment without a team code", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    const result = await publicCaller.assessment.submit({
      guestName: "Jane Doe",
      guestEmail: "jane@example.com",
      role: "Spark",
      score: 85,
      scores: { Spark: 85, Amplifier: 60, Filter: 40, Ground: 30, Conductor: 55 },
      answers: { 1: "A", 2: "B" },
    });

    expect(result).toBeTruthy();
    expect(result!.guestName).toBe("Jane Doe");
    expect(result!.role).toBe("Spark");
    expect(result!.shareToken).toBeTruthy();
  });

  it("submits an assessment with birth data for Soulprint", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    const result = await publicCaller.assessment.submit({
      guestName: "John Smith",
      role: "Ground",
      score: 72,
      birthDate: "1985-03-15",
      birthTime: "14:30",
      birthCity: "London, UK",
    });

    expect(result).toBeTruthy();
    expect(result!.birthDate).toBe("1985-03-15");
    expect(result!.birthTime).toBe("14:30");
    expect(result!.birthCity).toBe("London, UK");
  });

  it("retrieves an assessment by share token", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    const submitted = await publicCaller.assessment.submit({
      guestName: "Share Test",
      role: "Amplifier",
      score: 90,
    });

    expect(submitted).toBeTruthy();
    const found = await publicCaller.assessment.getByShareToken({
      token: submitted!.shareToken!,
    });
    expect(found).toBeTruthy();
    expect(found!.guestName).toBe("Share Test");
  });

  it("rejects assessment submission with missing required fields", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    await expect(
      publicCaller.assessment.submit({
        guestName: "",
        role: "Spark",
        score: 50,
      })
    ).rejects.toThrow();
  });
});

// ─── Feedback Tests ─────────────────────────────────────────────

describe("feedback procedures", () => {
  it("submits feedback from an alpha participant", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    const result = await publicCaller.feedback.submit({
      authorName: "Alpha Tester",
      authorEmail: "alpha@test.com",
      accuracyRating: 4,
      comment: "Very accurate assessment of my role!",
      wouldRecommend: true,
      suggestion: "Add more questions about leadership style.",
    });

    expect(result).toBeTruthy();
    expect(result!.authorName).toBe("Alpha Tester");
    expect(result!.accuracyRating).toBe(4);
    expect(result!.wouldRecommend).toBe(true);
  });

  it("submits feedback with team context", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    const result = await publicCaller.feedback.submit({
      authorName: "Team Tester",
      teamId: 1,
      assessmentId: 1,
      teamInsightRating: 5,
      teamComment: "The team matrix was incredibly insightful.",
    });

    expect(result).toBeTruthy();
    expect(result!.teamId).toBe(1);
    expect(result!.teamInsightRating).toBe(5);
  });

  it("rejects feedback with missing author name", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());

    await expect(
      publicCaller.feedback.submit({
        authorName: "",
        comment: "No name provided",
      })
    ).rejects.toThrow();
  });
});

// ─── Auth Tests ─────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const result = await publicCaller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeTruthy();
    expect(result!.name).toBe("Test User");
    expect(result!.email).toBe("test@example.com");
  });
});
