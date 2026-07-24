import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API Key Validation", () => {
  it("should authenticate with Resend using the configured API key", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey!.startsWith("re_")).toBe(true);

    const resend = new Resend(apiKey);

    // Use the domains list endpoint as a lightweight auth check
    const { data, error } = await resend.domains.list();

    // If the key is valid, we get a response (even if empty domains list)
    // If invalid, we get an authentication error
    if (error) {
      // "missing_api_key" or "invalid_api_key" means the key is wrong
      expect(error.name).not.toBe("missing_api_key");
      expect(error.name).not.toBe("invalid_api_key");
    }

    // If we get here without an auth error, the key is valid
    expect(true).toBe(true);
  });
});
