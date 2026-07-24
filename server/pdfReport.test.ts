import { describe, it, expect, vi } from "vitest";

// Mock the storage module before importing pdfReport
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://mock-s3.example.com/reports/flow-circuit-test-123.pdf",
    key: "reports/flow-circuit-test-123.pdf",
  }),
}));

import { generateAssessmentPDF, type PDFReportData } from "./pdfReport";
import { storagePut } from "./storage";

describe("generateAssessmentPDF", () => {
  const mockData: PDFReportData = {
    name: "Tony Greenberg",
    email: "tony@ramprate.com",
    role: "Spark",
    score: 42,
    scores: {
      Spark: 42,
      Amplifier: 28,
      Filter: 14,
      Ground: 10,
      Conductor: 6,
    },
    shareToken: "abc123def456",
    assessmentId: 1,
    origin: "https://flowcircuit.manus.space",
  };

  it("should generate a PDF and upload to S3", async () => {
    const result = await generateAssessmentPDF(mockData);

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
    expect(result.url).toContain("mock-s3.example.com");
    expect(result.key).toContain("reports/flow-circuit-");
  });

  it("should call storagePut with correct content type", async () => {
    await generateAssessmentPDF(mockData);

    expect(storagePut).toHaveBeenCalledWith(
      expect.stringContaining("reports/flow-circuit-tony-greenberg-"),
      expect.any(Buffer),
      "application/pdf"
    );
  });

  it("should generate a valid PDF buffer", async () => {
    const mockedPut = vi.mocked(storagePut);
    await generateAssessmentPDF(mockData);

    // Get the buffer that was passed to storagePut
    const lastCall = mockedPut.mock.calls[mockedPut.mock.calls.length - 1];
    const pdfBuffer = lastCall[1] as Buffer;

    // PDF files start with %PDF
    expect(pdfBuffer.toString("ascii", 0, 4)).toBe("%PDF");
    // Should be a reasonable size (at least 1KB for a 3-page report)
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it("should handle all five roles without errors", { timeout: 30000 }, async () => {
    const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

    for (const role of roles) {
      const data: PDFReportData = {
        ...mockData,
        name: `Test ${role}`,
        role,
        score: 35,
      };
      const result = await generateAssessmentPDF(data);
      expect(result).toHaveProperty("url");
    }
  });

  it("should handle missing optional fields gracefully", async () => {
    const minimalData: PDFReportData = {
      name: "Anonymous",
      role: "Conductor",
      score: 25,
      scores: { Conductor: 25, Spark: 20, Amplifier: 20, Filter: 20, Ground: 15 },
    };

    const result = await generateAssessmentPDF(minimalData);
    expect(result).toHaveProperty("url");
  });

  it("should sanitize names for the file key", async () => {
    const data: PDFReportData = {
      ...mockData,
      name: "José María O'Brien-Smith",
    };

    await generateAssessmentPDF(data);

    const mockedPut = vi.mocked(storagePut);
    const lastCall = mockedPut.mock.calls[mockedPut.mock.calls.length - 1];
    const fileKey = lastCall[0] as string;

    // Should not contain special characters
    expect(fileKey).not.toMatch(/[^a-zA-Z0-9\-\/\.]/);
  });
});
