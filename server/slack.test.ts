import { describe, it, expect } from "vitest";

describe("Slack Bot Token", () => {
  it("should authenticate with Slack API via auth.test", async () => {
    const token = process.env.SLACK_BOT_TOKEN;
    expect(token).toBeTruthy();
    expect(token!.startsWith("xoxb-")).toBe(true);

    const res = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await res.json();
    console.log("Slack auth.test response:", JSON.stringify(data, null, 2));

    expect(data.ok).toBe(true);
    expect(data.team).toBeTruthy();
    expect(data.bot_id || data.user_id).toBeTruthy();
  });

  it("should be able to list workspace users", async () => {
    const token = process.env.SLACK_BOT_TOKEN;

    const res = await fetch("https://slack.com/api/users.list?limit=5", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("Slack users.list response ok:", data.ok, "members count:", data.members?.length);

    expect(data.ok).toBe(true);
    expect(data.members).toBeDefined();
    expect(data.members.length).toBeGreaterThan(0);
  });
});
