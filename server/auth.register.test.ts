import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  createUserWithPassword: vi.fn(),
}));

import { getUserByEmail, createUserWithPassword } from "./db";

function createPublicContext(): TrpcContext {
  return { user: null, req: new Request("https://example.com") };
}

describe("auth.register", () => {
  beforeEach(() => {
    vi.mocked(getUserByEmail).mockReset();
    vi.mocked(createUserWithPassword).mockReset();
  });

  it("creates a new account when the email is not already taken", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(createUserWithPassword).mockResolvedValue({
      id: 1,
      openId: "new@example.com",
      email: "new@example.com",
      name: "New User",
      passwordHash: "hashed",
      loginMethod: "credentials",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      stripeCustomerId: null,
      subscriptionId: null,
      subscriptionStatus: null,
    } as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.register({
      email: "new@example.com",
      password: "supersecret1",
      name: "New User",
    });

    expect(result).toEqual({ success: true });
    expect(createUserWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com", name: "New User" })
    );
  });

  it("rejects registration when the email is already in use", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({ id: 2, email: "existing@example.com" } as any);

    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.register({ email: "existing@example.com", password: "supersecret1", name: "Existing" })
    ).rejects.toThrow(/already exists/i);

    expect(createUserWithPassword).not.toHaveBeenCalled();
  });
});
