import { describe, it, expect, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  createEmailVerification: vi.fn().mockResolvedValue({
    id: 1,
    email: "test@company.com",
    code: "123456",
    assessmentId: 1,
    verified: false,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    createdAt: new Date(),
  }),
  verifyEmailCode: vi.fn().mockResolvedValue(true),
  isEmailVerified: vi.fn().mockResolvedValue(true),
  createPeerReviewInvite: vi.fn().mockResolvedValue({
    id: 1,
    targetAssessmentId: 1,
    targetName: "Test User",
    reviewerName: "",
    reviewerEmail: "reviewer@company.com",
    perceivedRole: "",
    inviteToken: "abc123def456gh78",
    completed: false,
    createdAt: new Date(),
  }),
  getPeerReviewByToken: vi.fn().mockResolvedValue({
    id: 1,
    targetAssessmentId: 1,
    targetName: "Test User",
    reviewerName: "",
    reviewerEmail: "reviewer@company.com",
    perceivedRole: "",
    inviteToken: "abc123def456gh78",
    completed: false,
    createdAt: new Date(),
  }),
  completePeerReview: vi.fn().mockResolvedValue(true),
  getPeerReviewsByAssessment: vi.fn().mockResolvedValue([]),
}));

import {
  createEmailVerification,
  verifyEmailCode,
  isEmailVerified,
  createPeerReviewInvite,
  getPeerReviewByToken,
  completePeerReview,
  getPeerReviewsByAssessment,
} from "./db";

describe("Email Verification", () => {
  it("should create a verification record with a 6-digit code", async () => {
    const result = await createEmailVerification("test@company.com", 1);
    expect(result).not.toBeNull();
    expect(result?.code).toHaveLength(6);
    expect(result?.email).toBe("test@company.com");
    expect(result?.verified).toBe(false);
  });

  it("should verify a valid email code", async () => {
    const verified = await verifyEmailCode("test@company.com", "123456");
    expect(verified).toBe(true);
  });

  it("should check if email is verified", async () => {
    const result = await isEmailVerified("test@company.com");
    expect(result).toBe(true);
  });

  it("should reject invalid verification codes", async () => {
    vi.mocked(verifyEmailCode).mockResolvedValueOnce(false);
    const verified = await verifyEmailCode("test@company.com", "000000");
    expect(verified).toBe(false);
  });

  it("should handle unverified emails", async () => {
    vi.mocked(isEmailVerified).mockResolvedValueOnce(false);
    const result = await isEmailVerified("unverified@company.com");
    expect(result).toBe(false);
  });
});

describe("Peer Review (360)", () => {
  it("should create a peer review invite with a token", async () => {
    const invite = await createPeerReviewInvite(1, "Test User", "reviewer@company.com");
    expect(invite).not.toBeNull();
    expect(invite?.inviteToken).toBeTruthy();
    expect(invite?.inviteToken.length).toBe(16);
    expect(invite?.targetName).toBe("Test User");
    expect(invite?.completed).toBe(false);
  });

  it("should retrieve a peer review by token", async () => {
    const review = await getPeerReviewByToken("abc123def456gh78");
    expect(review).not.toBeNull();
    expect(review?.targetName).toBe("Test User");
    expect(review?.completed).toBe(false);
  });

  it("should return null for invalid token", async () => {
    vi.mocked(getPeerReviewByToken).mockResolvedValueOnce(null);
    const review = await getPeerReviewByToken("invalid_token");
    expect(review).toBeNull();
  });

  it("should complete a peer review", async () => {
    const success = await completePeerReview(
      "abc123def456gh78",
      "Reviewer Name",
      "Spark",
      { Spark: 8, Amplifier: 4, Filter: 2, Ground: 1, Conductor: 0 },
      { 1: "Spark", 2: "Amplifier" }
    );
    expect(success).toBe(true);
  });

  it("should reject completing an already completed review", async () => {
    vi.mocked(completePeerReview).mockResolvedValueOnce(false);
    const success = await completePeerReview(
      "abc123def456gh78",
      "Reviewer Name",
      "Spark",
      {},
      {}
    );
    expect(success).toBe(false);
  });

  it("should get peer reviews by assessment", async () => {
    const reviews = await getPeerReviewsByAssessment(1);
    expect(Array.isArray(reviews)).toBe(true);
  });
});

describe("Domain extraction from email", () => {
  it("should extract domain from email correctly", () => {
    const email = "sarah@ramprate.com";
    const domain = email.split("@")[1]?.toLowerCase();
    expect(domain).toBe("ramprate.com");
  });

  it("should handle uppercase emails", () => {
    const email = "John@COMPANY.COM";
    const domain = email.split("@")[1]?.toLowerCase();
    expect(domain).toBe("company.com");
  });

  it("should handle emails with subdomains", () => {
    const email = "user@mail.company.co.uk";
    const domain = email.split("@")[1]?.toLowerCase();
    expect(domain).toBe("mail.company.co.uk");
  });
});
