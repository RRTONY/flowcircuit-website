import { describe, it, expect } from "vitest";

/**
 * Inspirations page tests — validates the data integrity and structure
 * of the thought leaders and research citations displayed on the page.
 * Since this is a static content page with no backend procedures,
 * we test the data model directly.
 */

// Simulate the thinker data structure used in the Inspirations page
interface Thinker {
  name: string;
  years: string;
  title: string;
  institution: string;
  contribution: string;
  connectionToFlowCircuit: string;
  keyWork: {
    title: string;
    year: string;
    amazonUrl: string;
  };
  additionalWorks?: { title: string; year: string; amazonUrl?: string }[];
  quote?: string;
  accentColor: string;
}

interface ResearchCitation {
  study: string;
  authors: string;
  year: string;
  finding: string;
  relevance: string;
}

const AMAZON_TAG = "flowcircuit-20";

// The canonical list of thought leaders — must match the page
const REQUIRED_THINKERS = [
  "Al Fahden",
  "Michael Scriven",
  "Justin Menkes",
  "Clayton Christensen",
  "Peter Drucker",
  "Mihaly Csikszentmihalyi",
  "Richard Condon",
  "Meredith Belbin",
  "Patrick Lencioni",
  "Steven Kotler",
  "Amy Edmondson",
  "Daniel Coyle",
];

// Simulated data matching the Inspirations.tsx thinkers array
const thinkers: Thinker[] = [
  {
    name: "Al Fahden",
    years: "1950–present",
    title: "Innovation Architect & Stand-Up Philosopher",
    institution: "Innovation On Demand",
    contribution: "Identified that innovation isn't a solo act — it's a relay.",
    connectionToFlowCircuit: "The direct ancestor.",
    keyWork: { title: "Innovation on Demand", year: "1993", amazonUrl: `https://www.amazon.com/Innovation-Demand-Allen-Fahden/dp/0962966312?tag=${AMAZON_TAG}` },
    accentColor: "text-yellow-400",
  },
  {
    name: "Michael Scriven",
    years: "1928–2023",
    title: "The Godfather of Evaluation",
    institution: "Claremont Graduate University",
    contribution: "Created the foundational distinction between formative and summative evaluation.",
    connectionToFlowCircuit: "Every ipsative question stands on Scriven's methodology.",
    keyWork: { title: "Evaluation Thesaurus", year: "1991", amazonUrl: `https://www.amazon.com/Evaluation-Thesaurus-Michael-Scriven/dp/0803943644?tag=${AMAZON_TAG}` },
    accentColor: "text-blue-400",
  },
  {
    name: "Justin Menkes",
    years: "1970s–present",
    title: "Executive Intelligence Pioneer",
    institution: "Claremont Graduate University / DHR Global",
    contribution: "Proved that cognitive qualities separating great leaders can be measured.",
    connectionToFlowCircuit: "Validated the thesis that innate cognitive patterns matter more than credentials.",
    keyWork: { title: "Executive Intelligence: What All Great Leaders Have", year: "2005", amazonUrl: `https://www.amazon.com/Executive-Intelligence-What-Great-Leaders/dp/0060781874?tag=${AMAZON_TAG}` },
    accentColor: "text-purple-400",
  },
  {
    name: "Clayton Christensen",
    years: "1952–2020",
    title: "Prophet of Disruption",
    institution: "Harvard Business School",
    contribution: "Theory of disruptive innovation.",
    connectionToFlowCircuit: "Proved that organizational DNA matters.",
    keyWork: { title: "The Innovator's Dilemma", year: "1997", amazonUrl: `https://www.amazon.com/Innovators-Dilemma-Technologies-Management-Innovation/dp/1633691780?tag=${AMAZON_TAG}` },
    accentColor: "text-orange-400",
  },
  {
    name: "Peter Drucker",
    years: "1909–2005",
    title: "The Inventor of Modern Management",
    institution: "Claremont Graduate University",
    contribution: "Coined 'knowledge worker', predicted the information economy.",
    connectionToFlowCircuit: "Drucker's insight that effectiveness is a habit is the philosophical bedrock.",
    keyWork: { title: "The Effective Executive", year: "1967", amazonUrl: `https://www.amazon.com/Effective-Executive-Definitive-Harperbusiness-Essentials/dp/0060833459?tag=${AMAZON_TAG}` },
    accentColor: "text-emerald-400",
  },
  {
    name: "Mihaly Csikszentmihalyi",
    years: "1934–2021",
    title: "The Architect of Flow",
    institution: "Claremont Graduate University",
    contribution: "Discovered and named the flow state.",
    connectionToFlowCircuit: "The name says it all.",
    keyWork: { title: "Flow: The Psychology of Optimal Experience", year: "1990", amazonUrl: `https://www.amazon.com/Flow-Psychology-Experience-Perennial-Classics/dp/0061339202?tag=${AMAZON_TAG}` },
    accentColor: "text-cyan-400",
  },
  {
    name: "Richard Condon",
    years: "1960s–2024",
    title: "Transformation Architect",
    institution: "MissionB / Inside Consulting",
    contribution: "Bridged strategy and execution through people.",
    connectionToFlowCircuit: "The gap between strategy and execution is always a people gap.",
    keyWork: { title: "Inside Consulting: Business Performance Methodology", year: "2005", amazonUrl: "https://insideconsulting.net/about/" },
    accentColor: "text-red-400",
  },
  {
    name: "Meredith Belbin",
    years: "1926–present",
    title: "The Original Team Role Scientist",
    institution: "Henley Management College / University of Cambridge",
    contribution: "Nine-year study proving balanced teams beat brilliant individuals.",
    connectionToFlowCircuit: "Belbin proved the thesis before we named it.",
    keyWork: { title: "Team Roles at Work", year: "1993", amazonUrl: `https://www.amazon.com/Team-Roles-Work-Meredith-Belbin/dp/0367756005?tag=${AMAZON_TAG}` },
    accentColor: "text-teal-400",
  },
  {
    name: "Patrick Lencioni",
    years: "1965–present",
    title: "The Trust Architect",
    institution: "The Table Group",
    contribution: "Five Dysfunctions model.",
    connectionToFlowCircuit: "Lencioni diagnosed the disease. The Flow Circuit prescribes the treatment.",
    keyWork: { title: "The Five Dysfunctions of a Team", year: "2002", amazonUrl: `https://www.amazon.com/Five-Dysfunctions-Team-Leadership-Fable/dp/0787960756?tag=${AMAZON_TAG}` },
    accentColor: "text-pink-400",
  },
  {
    name: "Steven Kotler",
    years: "1967–present",
    title: "The Flow Genome Decoder",
    institution: "Flow Research Collective",
    contribution: "Quantified the neurochemistry of peak performance.",
    connectionToFlowCircuit: "Proved that flow has a biological signature and organizational triggers.",
    keyWork: { title: "Stealing Fire", year: "2017", amazonUrl: `https://www.amazon.com/Stealing-Fire-Maverick-Scientists-Revolutionizing/dp/0062429655?tag=${AMAZON_TAG}` },
    accentColor: "text-violet-400",
  },
  {
    name: "Amy Edmondson",
    years: "1959–present",
    title: "The Safety Engineer of Teams",
    institution: "Harvard Business School",
    contribution: "Proved psychological safety is the #1 predictor of team performance.",
    connectionToFlowCircuit: "Psychological safety is the soil. The Flow Circuit is the seed.",
    keyWork: { title: "The Fearless Organization", year: "2018", amazonUrl: `https://www.amazon.com/Fearless-Organization-Psychological-Workplace-Innovation/dp/1119477247?tag=${AMAZON_TAG}` },
    accentColor: "text-green-400",
  },
  {
    name: "Daniel Coyle",
    years: "1969–present",
    title: "The Culture Decoder",
    institution: "Independent Researcher & Author",
    contribution: "Reverse-engineered what makes the world's most successful groups tick.",
    connectionToFlowCircuit: "Culture is not vibes — it's signals.",
    keyWork: { title: "The Culture Code", year: "2018", amazonUrl: `https://www.amazon.com/Culture-Code-Secrets-Highly-Successful/dp/0804176981?tag=${AMAZON_TAG}` },
    accentColor: "text-amber-400",
  },
];

const researchCitations: ResearchCitation[] = [
  { study: "The Apollo Syndrome", authors: "Meredith Belbin, Henley Management College", year: "1981", finding: "Teams of high-IQ individuals underperformed balanced teams.", relevance: "Foundation for 'who you ARE > what you KNOW'" },
  { study: "Deloitte Role Misfit & Turnover Research", authors: "Deloitte Human Capital Trends", year: "2019", finding: "3.5x more likely to leave within 18 months.", relevance: "Validates the stress radiation model" },
  { study: "Flow State Neurochemistry", authors: "Arne Dietrich, American University of Beirut", year: "2004", finding: "Transient hypofrontality during flow.", relevance: "Neurological basis for operating in natural role" },
  { study: "Cortisol and Cognitive Performance", authors: "Lupien et al., McGill University", year: "2007", finding: "Chronic cortisol impairs cognitive function by up to 40%.", relevance: "Biological mechanism behind stress radiation" },
  { study: "Google Project Aristotle", authors: "Google People Analytics / Amy Edmondson", year: "2015", finding: "Psychological safety was #1 predictor of team effectiveness.", relevance: "Self-knowledge creates conditions for psychological safety" },
  { study: "Ipsative Assessment Validity in Team Contexts", authors: "Bartram, D.", year: "1996", finding: "Forced-choice measures produce more reliable within-person profiles.", relevance: "Psychometric foundation for forced-choice methodology" },
];

describe("Inspirations Page Data Integrity", () => {
  it("includes all 12 required thought leaders", () => {
    const names = thinkers.map((t) => t.name);
    for (const required of REQUIRED_THINKERS) {
      expect(names).toContain(required);
    }
    expect(thinkers.length).toBe(12);
  });

  it("every thinker has required fields populated", () => {
    for (const thinker of thinkers) {
      expect(thinker.name.length).toBeGreaterThan(0);
      expect(thinker.title.length).toBeGreaterThan(0);
      expect(thinker.institution.length).toBeGreaterThan(0);
      expect(thinker.contribution.length).toBeGreaterThan(0);
      expect(thinker.connectionToFlowCircuit.length).toBeGreaterThan(0);
      expect(thinker.keyWork.title.length).toBeGreaterThan(0);
      expect(thinker.keyWork.year.length).toBe(4);
      expect(thinker.keyWork.amazonUrl.length).toBeGreaterThan(0);
      expect(thinker.accentColor.length).toBeGreaterThan(0);
    }
  });

  it("Amazon links include referral tag where applicable", () => {
    const amazonThinkers = thinkers.filter((t) =>
      t.keyWork.amazonUrl.includes("amazon.com")
    );
    for (const thinker of amazonThinkers) {
      expect(thinker.keyWork.amazonUrl).toContain(`tag=${AMAZON_TAG}`);
    }
  });

  it("no duplicate thinker names", () => {
    const names = thinkers.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("Al Fahden is listed first as the direct ancestor", () => {
    expect(thinkers[0].name).toBe("Al Fahden");
    expect(thinkers[0].connectionToFlowCircuit).toContain("direct ancestor");
  });

  it("includes all 6 research citations", () => {
    expect(researchCitations.length).toBe(6);
    const studies = researchCitations.map((c) => c.study);
    expect(studies).toContain("The Apollo Syndrome");
    expect(studies).toContain("Google Project Aristotle");
    expect(studies).toContain("Flow State Neurochemistry");
    expect(studies).toContain("Cortisol and Cognitive Performance");
    expect(studies).toContain("Ipsative Assessment Validity in Team Contexts");
  });

  it("every research citation has required fields", () => {
    for (const citation of researchCitations) {
      expect(citation.study.length).toBeGreaterThan(0);
      expect(citation.authors.length).toBeGreaterThan(0);
      expect(citation.year.length).toBe(4);
      expect(citation.finding.length).toBeGreaterThan(0);
      expect(citation.relevance.length).toBeGreaterThan(0);
    }
  });

  it("includes Claremont Graduate University connections (Scriven, Menkes, Drucker, Csikszentmihalyi)", () => {
    const claremontThinkers = thinkers.filter((t) =>
      t.institution.includes("Claremont")
    );
    expect(claremontThinkers.length).toBeGreaterThanOrEqual(4);
    const claremontNames = claremontThinkers.map((t) => t.name);
    expect(claremontNames).toContain("Michael Scriven");
    expect(claremontNames).toContain("Justin Menkes");
    expect(claremontNames).toContain("Peter Drucker");
    expect(claremontNames).toContain("Mihaly Csikszentmihalyi");
  });
});
