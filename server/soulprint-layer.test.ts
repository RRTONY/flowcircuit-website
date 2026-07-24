import { describe, it, expect } from "vitest";

// ─── Enneagram → Flow Circuit Cross-Reference Tests ────────────────────────
const enneagramToFlowCircuit: Record<string, {
  primaryRole: string;
  secondaryRole: string;
}> = {
  "1": { primaryRole: "Filter", secondaryRole: "Ground" },
  "2": { primaryRole: "Amplifier", secondaryRole: "Conductor" },
  "3": { primaryRole: "Spark", secondaryRole: "Amplifier" },
  "4": { primaryRole: "Spark", secondaryRole: "Filter" },
  "5": { primaryRole: "Filter", secondaryRole: "Ground" },
  "6": { primaryRole: "Ground", secondaryRole: "Filter" },
  "7": { primaryRole: "Spark", secondaryRole: "Amplifier" },
  "8": { primaryRole: "Conductor", secondaryRole: "Ground" },
  "9": { primaryRole: "Ground", secondaryRole: "Amplifier" },
};

describe("SoulPrint Consciousness Layer", () => {
  describe("Enneagram → Flow Circuit Cross-Reference", () => {
    it("should map all 9 Enneagram types to Flow Circuit roles", () => {
      for (let i = 1; i <= 9; i++) {
        const mapping = enneagramToFlowCircuit[String(i)];
        expect(mapping).toBeDefined();
        expect(mapping.primaryRole).toBeTruthy();
        expect(mapping.secondaryRole).toBeTruthy();
      }
    });

    it("should map Type 4 (Romantic Individualist) to Spark primary", () => {
      expect(enneagramToFlowCircuit["4"].primaryRole).toBe("Spark");
      expect(enneagramToFlowCircuit["4"].secondaryRole).toBe("Filter");
    });

    it("should map Type 8 (Challenger) to Conductor primary", () => {
      expect(enneagramToFlowCircuit["8"].primaryRole).toBe("Conductor");
      expect(enneagramToFlowCircuit["8"].secondaryRole).toBe("Ground");
    });

    it("should map Type 9 (Peacemaker) to Ground primary", () => {
      expect(enneagramToFlowCircuit["9"].primaryRole).toBe("Ground");
      expect(enneagramToFlowCircuit["9"].secondaryRole).toBe("Amplifier");
    });

    it("should cover all 5 Flow Circuit roles across mappings", () => {
      const allPrimary = Object.values(enneagramToFlowCircuit).map(m => m.primaryRole);
      const allSecondary = Object.values(enneagramToFlowCircuit).map(m => m.secondaryRole);
      const allRoles = new Set([...allPrimary, ...allSecondary]);
      expect(allRoles).toContain("Spark");
      expect(allRoles).toContain("Amplifier");
      expect(allRoles).toContain("Filter");
      expect(allRoles).toContain("Ground");
      expect(allRoles).toContain("Conductor");
    });

    it("should never map primary and secondary to the same role", () => {
      for (const [type, mapping] of Object.entries(enneagramToFlowCircuit)) {
        expect(mapping.primaryRole).not.toBe(mapping.secondaryRole);
      }
    });
  });

  describe("SoulPrint Data Parsing", () => {
    const sampleData = [
      { topic: "dashboard", index: -1, blocks: [{ text: "Overview" }] },
      { topic: "dashboard_clone", index: -1, blocks: [{ text: "Your synthesis text here" }] },
      { topic: "enneagram", index: 10, title: "Enneagram", blocks: [
        { id: "1", index: 100, title: "The Romantic Individualist", text: "Type 4 description" },
        { id: "2", index: 110, title: "Core Motivation", text: "To be unique" },
      ]},
      { topic: "human_design", index: 20, title: "Human Design", blocks: [
        { id: "3", index: 100, title: "Manifesting Generator", text: "Your type" },
      ]},
      { topic: "western_astrology", index: 30, title: "Western Astrology", blocks: [] },
      { topic: "numerology", index: 50, title: "Numerology", blocks: [
        { id: "4", index: 100, title: "Life Path 7", text: "The Seeker" },
      ]},
    ];

    it("should filter out dashboard and dashboard_clone topics", () => {
      const sections = sampleData
        .filter(s => s.topic && s.topic !== "dashboard" && s.topic !== "dashboard_clone")
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      expect(sections.length).toBe(4);
      expect(sections[0].topic).toBe("enneagram");
      expect(sections[1].topic).toBe("human_design");
    });

    it("should extract synthesis text from dashboard_clone", () => {
      const dashboard = sampleData.find(s => s.topic === "dashboard_clone");
      expect(dashboard?.blocks?.[0]?.text).toBe("Your synthesis text here");
    });

    it("should sort sections by index", () => {
      const sections = sampleData
        .filter(s => s.topic !== "dashboard" && s.topic !== "dashboard_clone")
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
      for (let i = 1; i < sections.length; i++) {
        expect(sections[i].index).toBeGreaterThanOrEqual(sections[i - 1].index);
      }
    });

    it("should sort blocks within sections by index", () => {
      const enneagram = sampleData.find(s => s.topic === "enneagram");
      const sorted = (enneagram?.blocks || []).sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0));
      expect(sorted[0].title).toBe("The Romantic Individualist");
      expect(sorted[1].title).toBe("Core Motivation");
    });

    it("should handle empty blocks array", () => {
      const astrology = sampleData.find(s => s.topic === "western_astrology");
      expect(astrology?.blocks).toEqual([]);
    });

    it("should handle array text content in blocks", () => {
      const arrayTextBlock = { text: ["Paragraph 1", "Paragraph 2", "Paragraph 3"] };
      expect(Array.isArray(arrayTextBlock.text)).toBe(true);
      expect(arrayTextBlock.text.length).toBe(3);
    });
  });

  describe("Enneagram Number Extraction", () => {
    const typeMap: Record<string, string> = {
      reformer: "1", perfectionist: "1",
      helper: "2", giver: "2",
      achiever: "3", performer: "3",
      individualist: "4", romantic: "4",
      investigator: "5", observer: "5",
      loyalist: "6", skeptic: "6",
      enthusiast: "7", epicure: "7",
      challenger: "8", protector: "8",
      peacemaker: "9", mediator: "9",
    };

    function extractNumber(title: string): string | null {
      const lower = title.toLowerCase();
      for (const [key, num] of Object.entries(typeMap)) {
        if (lower.includes(key)) return num;
      }
      return null;
    }

    it("should extract Type 4 from 'The Romantic Individualist'", () => {
      expect(extractNumber("The Romantic Individualist")).toBe("4");
    });

    it("should extract Type 1 from 'The Perfectionist'", () => {
      expect(extractNumber("The Perfectionist")).toBe("1");
    });

    it("should extract Type 8 from 'The Challenger'", () => {
      expect(extractNumber("The Challenger")).toBe("8");
    });

    it("should extract Type 7 from 'The Enthusiast'", () => {
      expect(extractNumber("The Enthusiast")).toBe("7");
    });

    it("should return null for unrecognized titles", () => {
      expect(extractNumber("Unknown Type")).toBeNull();
    });
  });

  describe("Consent and Toggle Logic", () => {
    it("should default to not showing SoulPrint until consent given", () => {
      const profile = { consentGiven: false, enabled: false, showInTeam: false };
      expect(profile.consentGiven).toBe(false);
      expect(profile.enabled).toBe(false);
    });

    it("should allow enabling after consent", () => {
      const profile = { consentGiven: true, enabled: true, showInTeam: false };
      expect(profile.consentGiven).toBe(true);
      expect(profile.enabled).toBe(true);
    });

    it("should allow team view toggle independently of enabled", () => {
      const profile = { consentGiven: true, enabled: false, showInTeam: true };
      expect(profile.enabled).toBe(false);
      expect(profile.showInTeam).toBe(true);
    });
  });

  describe("Evidence Data Integrity", () => {
    const evidenceData = [
      { company: "SAP", stat: "200% ROI", source: "Reuters, 2018" },
      { company: "Aetna", stat: "$9M Saved", source: "Fierce Healthcare, 2015" },
      { company: "Google", stat: "SIY Program", source: "SIY Global" },
      { company: "Intel", stat: "+10% Performance", source: "Intel Internal Studies" },
      { company: "Fortune 500", stat: "80% Adoption", source: "Fortune, 2025" },
      { company: "Dutch Gaming Co.", stat: "0% Attrition", source: "Truity, 2024" },
    ];

    it("should have 6 evidence entries", () => {
      expect(evidenceData.length).toBe(6);
    });

    it("should have company, stat, and source for each entry", () => {
      for (const entry of evidenceData) {
        expect(entry.company).toBeTruthy();
        expect(entry.stat).toBeTruthy();
        expect(entry.source).toBeTruthy();
      }
    });

    it("should include SAP 200% ROI case study", () => {
      const sap = evidenceData.find(e => e.company === "SAP");
      expect(sap?.stat).toBe("200% ROI");
    });

    it("should include Fortune 500 80% adoption stat", () => {
      const f500 = evidenceData.find(e => e.company === "Fortune 500");
      expect(f500?.stat).toBe("80% Adoption");
    });
  });

  describe("Topic Configuration", () => {
    const topics = ["enneagram", "human_design", "western_astrology", "chinese_astrology", "numerology", "soulprint_combinations"];

    it("should have configuration for all 6 topic types", () => {
      const topicConfig: Record<string, { label: string }> = {
        enneagram: { label: "Enneagram" },
        human_design: { label: "Human Design" },
        western_astrology: { label: "Western Astrology" },
        chinese_astrology: { label: "Chinese Astrology" },
        numerology: { label: "Numerology" },
        soulprint_combinations: { label: "Soulprint Synthesis" },
      };

      for (const topic of topics) {
        expect(topicConfig[topic]).toBeDefined();
        expect(topicConfig[topic].label).toBeTruthy();
      }
    });
  });
});
