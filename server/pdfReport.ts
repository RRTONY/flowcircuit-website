import PDFDocument from "pdfkit";
import { storagePut } from "./storage";
import { getAssessmentsByDomain } from "./db";

// ── Logo (fetched from CDN, cached in memory) ──────────────
const LOGO_CDN_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663242884547/58a5XX7atDPJGob9D9jfHU/flow-circuit-logo_05a4bbaa.png";
let logoBuf: Buffer | null = null;
let logoLoaded = false;
async function getLogo(): Promise<Buffer | null> {
  if (logoLoaded) return logoBuf;
  try {
    const res = await fetch(LOGO_CDN_URL);
    if (res.ok) logoBuf = Buffer.from(await res.arrayBuffer());
  } catch { /* logo is optional */ }
  logoLoaded = true;
  return logoBuf;
}

// ── Color Palette (warm tan theme) ──────────────────────────
const ROLE_COLORS: Record<string, [number, number, number]> = {
  Spark: [217, 155, 30],      // warm gold
  Amplifier: [210, 90, 30],   // warm orange
  Filter: [60, 120, 190],     // steel blue
  Ground: [40, 155, 80],      // forest green
  Conductor: [130, 70, 200],  // deep purple
};

// Tan/warm background palette
const BG: [number, number, number] = [245, 238, 225];        // warm tan
const PANEL: [number, number, number] = [235, 226, 210];     // slightly darker tan
const PANEL_DARK: [number, number, number] = [225, 215, 198]; // darker panel
const TEXT_PRIMARY: [number, number, number] = [35, 30, 25];  // near-black
const TEXT_SECONDARY: [number, number, number] = [80, 72, 60]; // dark brown
const TEXT_MUTED: [number, number, number] = [120, 110, 95];  // muted brown
const DIVIDER: [number, number, number] = [200, 190, 172];    // subtle line
const WHITE: [number, number, number] = [255, 255, 255];
const RED: [number, number, number] = [190, 50, 50];
const GREEN: [number, number, number] = [40, 140, 70];
const AMBER: [number, number, number] = [180, 130, 20];

// ── Role Content ──────────────────────────────────────────────
const ROLE_DATA: Record<string, {
  tagline: string;
  relayPosition: number;
  oneLiner: string;
  teamNeed: string;
  bestPartner: string;
  frictionPoint: string;
  resonanceIntro: string;
  amplifyTips: string[];
  doList: string[];
  dontList: string[];
  keyPhrase: string;
  stressSignal: string;
  recovery: string;
  atBest: string[];
  blindSpot: string;
}> = {
  Spark: {
    tagline: "THE IGNITION POINT",
    relayPosition: 0,
    oneLiner: "You generate the raw material for innovation. Your mind produces novel connections that others cannot see.",
    teamNeed: "Your team needs you to generate bold ideas and challenge the status quo -- then hand the baton to an Amplifier before you pivot to the next shiny thing.",
    bestPartner: "AMPLIFIER -- They translate your raw vision into language the team can rally behind. Without them, your ideas stay in your head.",
    frictionPoint: "FILTER -- They will stress-test everything you create. That feels like rejection. It is not. It is refinement.",
    resonanceIntro: "Your resonance is highest when generating new ideas and breaking patterns. You create coherence by giving the team a north star worth chasing.",
    amplifyTips: [
      "Pair every big idea with one Amplifier before broadcasting.",
      "Frame ideas as questions: 'What if we tried X?' invites collaboration.",
      "Find your Ground partner. They give ideas legs.",
      "Write new ideas down for a scheduled Spark Session instead of derailing the current sprint.",
    ],
    doList: ["Lead with the big picture and the 'why'", "Use metaphors and 'imagine this' scenarios", "Allow brainstorming without immediate judgment", "Celebrate the novel and unconventional"],
    dontList: ["Lead with constraints or 'why it won't work'", "Demand immediate closure or rigid structure", "Dismiss wild ideas", "Schedule back-to-back detail meetings"],
    keyPhrase: "Imagine if...",
    stressSignal: "Hoarding ideas instead of sharing them, or feeling 'bored' -- you are being forced into a Ground role.",
    recovery: "30 minutes of unstructured thinking. No agenda. Sketch, walk, or brainstorm with a trusted Amplifier.",
    atBest: ["Generating 3-5 novel ideas per meeting that nobody else sees", "Connecting unrelated domains into breakthrough insights", "Energizing the room with possibility and vision", "Challenging assumptions that everyone else takes for granted"],
    blindSpot: "You may not realize how often you abandon ideas before they mature. Your team sees a trail of half-built rockets.",
  },
  Amplifier: {
    tagline: "THE SIGNAL BOOST",
    relayPosition: 1,
    oneLiner: "You take raw ideas and give them momentum. You bridge the gap between the abstract and the real.",
    teamNeed: "Your team needs you to build excitement and translate the Spark's vision into a story everyone can feel -- then pass to the Filter before you overpromise.",
    bestPartner: "SPARK -- They give you the raw material to champion. Without a Spark, you are amplifying noise.",
    frictionPoint: "FILTER -- They will slow your momentum to stress-test. That feels like a wet blanket. It is quality control.",
    resonanceIntro: "Your resonance is highest when connecting people and translating complex ideas into compelling narratives.",
    amplifyTips: [
      "Check with a Filter before selling the dream. Unchecked promises create trust debt.",
      "Rally energy toward actual priorities, not just the shiniest new idea.",
      "When the room goes quiet, that is your cue. But know the difference between needing a boost and needing space.",
      "Build bridges between Spark and Ground. You speak both languages fluently.",
    ],
    doList: ["Focus on people, excitement, and impact", "Be energetic and reciprocally enthusiastic", "Acknowledge their contribution to team spirit", "Give them a stage"],
    dontList: ["Be overly negative without offering a solution", "Ignore the human element", "Be a 'wet blanket'", "Isolate them -- Amplifiers wither in silos"],
    keyPhrase: "Let's get everyone on board...",
    stressSignal: "Feeling like nobody is listening, or energy dropping in meetings -- surrounded by too many Filters without a Spark.",
    recovery: "Find one person excited about something and have a 15-minute conversation. Energy regenerates through connection.",
    atBest: ["Translating a Spark's raw idea into a story the whole team rallies behind", "Building coalitions across departments and functions", "Reading the room and knowing exactly when to inject energy", "Making complex ideas feel simple and exciting"],
    blindSpot: "You may over-promise on behalf of others. Your enthusiasm can create expectations the Ground cannot deliver on.",
  },
  Filter: {
    tagline: "THE SIGNAL-TO-NOISE RATIO",
    relayPosition: 2,
    oneLiner: "You see the flaws that others miss. You challenge assumptions, test logic, and make the plan bulletproof.",
    teamNeed: "Your team needs you to stress-test ideas and separate signal from noise -- then hand the refined plan to a Ground for execution.",
    bestPartner: "GROUND -- They give you the implementation reality check you crave. Together, you turn refined ideas into shipped products.",
    frictionPoint: "SPARK -- They will keep generating new ideas while you are still refining the last one. That feels chaotic.",
    resonanceIntro: "Your resonance is highest when analyzing, stress-testing, and separating signal from noise.",
    amplifyTips: [
      "Frame feedback as 'refining' not 'rejecting.'",
      "Let Spark and Amplifier build momentum before you stress-test. Timing is everything.",
      "Your superpower is pattern recognition. Package it as insight, not criticism.",
      "Partner with a Conductor when unheard.",
    ],
    doList: ["Be logical, prepared, and data-driven", "Give them time to think", "Appreciate their attention to detail", "Present options with pros and cons"],
    dontList: ["Rush them for an immediate 'yes'", "Dismiss concerns as 'negativity'", "Be vague -- Filters need specificity", "Take questions personally"],
    keyPhrase: "Does this make sense?",
    stressSignal: "Saying 'I told you so' or withdrawing from discussions -- you have been overridden too many times.",
    recovery: "Find one problem worth solving deeply. Energy regenerates through analysis and clarity.",
    atBest: ["Catching the fatal flaw before it reaches production", "Asking the question nobody else is willing to ask", "Turning vague plans into precise, testable specifications", "Saving the team from expensive mistakes through early detection"],
    blindSpot: "You may not realize how your timing affects reception. The same feedback delivered too early kills momentum; delivered at the right moment, it saves the project.",
  },
  Ground: {
    tagline: "THE REALITY ENGINE",
    relayPosition: 3,
    oneLiner: "You turn the refined plan into reality. Without you, every brilliant idea remains a whiteboard sketch.",
    teamNeed: "Your team needs you to ship. Execute the plan, surface blockers early, and communicate your wins.",
    bestPartner: "FILTER -- They give you clear specs to execute against. Together, you are the idea-to-reality pipeline.",
    frictionPoint: "SPARK -- They will change the target while you are executing. That is not a productivity problem -- it is a communication breakdown.",
    resonanceIntro: "Your resonance is highest when executing, completing, and delivering tangible outcomes.",
    amplifyTips: [
      "Look up occasionally. Surface blockers before they become crises.",
      "Ask for clarity when the Spark keeps changing the target.",
      "'Reliable' does not mean 'available for everything.' Protect your execution time.",
      "When you finish something, tell the team. Grounds under-communicate wins.",
    ],
    doList: ["Be clear, specific, and practical", "Define roles, responsibilities, and deadlines", "Respect their time", "Celebrate completed milestones"],
    dontList: ["Change the plan constantly", "Be vague about what 'done' looks like", "Interrupt their flow", "Undervalue execution"],
    keyPhrase: "Here is the plan.",
    stressSignal: "Goalposts keep moving, working harder but accomplishing less -- someone is changing the plan without telling you.",
    recovery: "Complete one small, tangible task with a clear beginning and end.",
    atBest: ["Shipping consistently while others are still planning", "Turning a 10-page strategy doc into a working prototype", "Surfacing blockers before they become crises", "Being the person everyone trusts to get it done"],
    blindSpot: "You may under-communicate your wins. The team does not see how much you deliver because you do not tell them.",
  },
  Conductor: {
    tagline: "THE FLOW STATE ARCHITECT",
    relayPosition: 4,
    oneLiner: "You do not play an instrument -- you lead the orchestra. You manage the energy of the system itself.",
    teamNeed: "Your team needs you to orchestrate the handoffs, read the room, and ensure no role is suppressed.",
    bestPartner: "EVERYONE -- You are the hub. But you need at least one strong Ground to anchor execution and one Spark to keep the vision alive.",
    frictionPoint: "ALL ROLES when you start doing their jobs. That is not leadership -- that is a Conductor forced to play every instrument.",
    resonanceIntro: "Your resonance is highest when facilitating and orchestrating the flow of energy between team members.",
    amplifyTips: [
      "Your job is the process, not the content. Trust the Ground to execute.",
      "Read the room before you act. Sometimes the team needs productive friction, not harmony.",
      "Name the dynamic out loud: 'The Spark has an idea, the Filter has a concern -- let us hear both.'",
      "Protect the Spark from premature criticism and the Filter from being ignored.",
    ],
    doList: ["Focus on process, dynamics, and the overall goal", "Be collaborative and open to feedback", "Help maintain harmony -- but allow productive friction", "Give them visibility into how the team functions"],
    dontList: ["Create unnecessary conflict or drama", "Ignore the 'rules of engagement'", "Exclude people from the loop", "Mistake their calm for passivity"],
    keyPhrase: "How do we move forward together?",
    stressSignal: "Doing everyone else's job -- writing code, making sales calls, doing analysis -- you have lost trust in the circuit.",
    recovery: "Step back and observe the team for 24 hours without intervening. Energy regenerates through perspective.",
    atBest: ["Orchestrating seamless handoffs between Spark, Filter, and Ground", "Reading the room and knowing when to let friction play out vs. intervene", "Ensuring every voice is heard without letting any single voice dominate", "Keeping the team aligned on the north star while managing daily energy"],
    blindSpot: "You may confuse orchestrating with doing. When you start playing every instrument, the orchestra has no conductor.",
  },
};

const RELAY_ORDER = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
const RELAY_LABELS = ["IGNITE", "AMPLIFY", "REFINE", "EXECUTE", "ORCHESTRATE"];

// ── Types ─────────────────────────────────────────────────────
export interface PDFReportData {
  name: string;
  email?: string;
  role: string;
  score: number;
  scores: Record<string, number>;
  shareToken?: string;
  assessmentId?: number;
  origin?: string;
  teamDomain?: string; // Override domain for team fit (e.g., show Darryl against ramprate.com)
}

interface TeamMember {
  name: string;
  role: string;
  scores: Record<string, number>;
}

// ── Drawing Helpers ───────────────────────────────────────────

function drawPanel(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, color: [number, number, number] = PANEL) {
  doc.save();
  doc.roundedRect(x, y, w, h, 6).fill(color);
  doc.restore();
}

function drawLine(doc: PDFKit.PDFDocument, x1: number, y1: number, x2: number, y2: number) {
  doc.save().strokeColor(DIVIDER).lineWidth(0.5).moveTo(x1, y1).lineTo(x2, y2).stroke().restore();
}

/**
 * Radar chart with DEVIATION-BASED scaling.
 * Instead of plotting raw % on 0-100, we plot deviation from the 20% baseline.
 * This makes a 23% vs 18% spread look dramatic instead of invisible.
 * The chart center = 0% deviation (perfectly balanced).
 * Each ring = a deviation increment.
 */
function drawRadarChart(
  doc: PDFKit.PDFDocument,
  cx: number, cy: number, radius: number,
  scores: Record<string, number>,
  dominantRole: string,
  teamAvg?: Record<string, number> // optional team overlay
) {
  const roles = RELAY_ORDER;
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const n = roles.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  // Calculate percentage for each role
  const pcts: Record<string, number> = {};
  roles.forEach(r => { pcts[r] = total > 0 ? (scores[r] || 0) / total * 100 : 20; });

  // FIXED SCALING: Use absolute mapping so the chart fills the full radius.
  // minPct maps to 25% of radius (inner ring), maxPct maps to 100% of radius (outer edge).
  // This makes even small differences (e.g. 18% vs 23%) visually dramatic.
  const pctValues = roles.map(r => pcts[r]);
  const minPct = Math.min(...pctValues);
  const maxPct = Math.max(...pctValues);
  const pctRange = maxPct - minPct || 1; // avoid division by zero
  const innerR = radius * 0.25; // minimum radius (lowest score)
  const outerR = radius;        // maximum radius (highest score)

  // Helper: map a percentage to a radius
  const pctToRadius = (pct: number) => {
    const t = (pct - minPct) / pctRange; // 0..1
    return innerR + t * (outerR - innerR);
  };

  // Draw 4 concentric pentagon grid rings at evenly spaced radii
  const ringRadii = [innerR, innerR + (outerR - innerR) * 0.33, innerR + (outerR - innerR) * 0.66, outerR];
  ringRadii.forEach(r => {
    doc.save().strokeColor([180, 172, 158]).lineWidth(0.3);
    for (let i = 0; i < n; i++) {
      const a1 = startAngle + i * angleStep;
      const a2 = startAngle + ((i + 1) % n) * angleStep;
      doc.moveTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1))
        .lineTo(cx + r * Math.cos(a2), cy + r * Math.sin(a2)).stroke();
    }
    doc.restore();
  });

  // Draw center dot
  doc.save().strokeColor([160, 150, 135]).lineWidth(0.8);
  doc.circle(cx, cy, 2).fill([160, 150, 135]);
  doc.restore();

  // Draw axis lines from center to outer edge
  doc.save().strokeColor([180, 172, 158]).lineWidth(0.3);
  for (let i = 0; i < n; i++) {
    const a = startAngle + i * angleStep;
    doc.moveTo(cx, cy).lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a)).stroke();
  }
  doc.restore();

  // Draw team average overlay (if provided) — ghosted polygon
  if (teamAvg) {
    const teamTotal = Object.values(teamAvg).reduce((a, b) => a + b, 0);
    const teamPts: [number, number][] = [];
    roles.forEach((role, i) => {
      const tPct = teamTotal > 0 ? (teamAvg[role] || 0) / teamTotal * 100 : 20;
      const r = pctToRadius(Math.max(minPct, Math.min(maxPct, tPct)));
      const a = startAngle + i * angleStep;
      teamPts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    });

    doc.save();
    doc.moveTo(teamPts[0][0], teamPts[0][1]);
    teamPts.slice(1).forEach(([px, py]) => doc.lineTo(px, py));
    doc.closePath();
    doc.fillOpacity(0.08).fill([120, 110, 95]);
    doc.restore();

    doc.save();
    doc.moveTo(teamPts[0][0], teamPts[0][1]);
    teamPts.slice(1).forEach(([px, py]) => doc.lineTo(px, py));
    doc.closePath();
    doc.fillOpacity(1).strokeColor([150, 140, 125]).lineWidth(0.8).dash(3, { space: 3 }).stroke();
    doc.restore();
  }

  // Draw individual data polygon — uses full radius mapping
  const points: [number, number][] = [];
  roles.forEach((role, i) => {
    const r = pctToRadius(pcts[role]);
    const a = startAngle + i * angleStep;
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  });

  // Fill polygon
  const roleColor = ROLE_COLORS[dominantRole] || ROLE_COLORS.Conductor;
  doc.save();
  doc.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([px, py]) => doc.lineTo(px, py));
  doc.closePath();
  doc.fillOpacity(0.2).fill(roleColor);
  doc.restore();

  // Stroke polygon
  doc.save();
  doc.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([px, py]) => doc.lineTo(px, py));
  doc.closePath();
  doc.fillOpacity(1).strokeColor(roleColor).lineWidth(2).stroke();
  doc.restore();

  // Draw data points with rank labels
  const ranked = roles.map(r => ({ role: r, pct: pcts[r] })).sort((a, b) => b.pct - a.pct);
  const rankMap: Record<string, number> = {};
  ranked.forEach((r, i) => { rankMap[r.role] = i + 1; });

  points.forEach(([px, py], i) => {
    const role = roles[i];
    const color = ROLE_COLORS[role] || TEXT_MUTED;
    const isDom = role === dominantRole;
    // Larger dots for dominant
    doc.save().circle(px, py, isDom ? 5 : 3.5).fillOpacity(1).fill(color).restore();
    // Rank number inside dot
    if (isDom) {
      doc.save().fillColor(WHITE).fontSize(5).font("Helvetica-Bold");
      const rk = String(rankMap[role]);
      doc.text(rk, px - 2, py - 2.5, { lineBreak: false });
      doc.restore();
    }
  });

  // Labels with rank and percentage
  for (let i = 0; i < n; i++) {
    const role = roles[i];
    const pct = Math.round(pcts[role]);
    const rank = rankMap[role];
    const a = startAngle + i * angleStep;
    const labelR = radius + 20;
    const lx = cx + labelR * Math.cos(a);
    const ly = cy + labelR * Math.sin(a);
    const color = ROLE_COLORS[role] || TEXT_MUTED;
    const isDom = role === dominantRole;

    doc.save().fillOpacity(1);
    // Role name
    doc.fillColor(isDom ? color : TEXT_SECONDARY).fontSize(isDom ? 8 : 7).font(isDom ? "Helvetica-Bold" : "Helvetica");
    const nameText = role;
    const tw = doc.widthOfString(nameText);
    doc.text(nameText, lx - tw / 2, ly - 8, { lineBreak: false });
    // Rank + Pct
    const rankText = `#${rank}  ${pct}%`;
    doc.fillColor(isDom ? color : TEXT_MUTED).fontSize(6.5).font("Helvetica");
    const rw = doc.widthOfString(rankText);
    doc.text(rankText, lx - rw / 2, ly + 1, { lineBreak: false });
    doc.restore();
  }

  // Legend for team overlay
  if (teamAvg) {
    doc.save().fillOpacity(1);
    doc.strokeColor([150, 140, 125]).lineWidth(0.8).dash(3, { space: 3 });
    doc.moveTo(cx - radius + 10, cy + radius + 14).lineTo(cx - radius + 30, cy + radius + 14).stroke();
    doc.undash();
    doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica")
      .text("Team Average", cx - radius + 34, cy + radius + 11, { lineBreak: false });
    doc.restore();
  }
}

function drawRelayDiagram(doc: PDFKit.PDFDocument, x: number, y: number, w: number, dominantRole: string, scores: Record<string, number>) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const nodeSpacing = w / 5;
  const nodeR = 14;
  const lineY = y + 18;

  // Draw connecting line
  doc.save().strokeColor(DIVIDER).lineWidth(2);
  doc.moveTo(x + nodeSpacing * 0.5, lineY).lineTo(x + nodeSpacing * 4.5, lineY).stroke();
  doc.restore();

  // Draw arrows between nodes
  for (let i = 0; i < 4; i++) {
    const ax = x + nodeSpacing * (i + 0.5) + nodeR + 4;
    const bx = x + nodeSpacing * (i + 1.5) - nodeR - 4;
    doc.save().strokeColor([170, 160, 145]).lineWidth(1);
    doc.moveTo(ax, lineY).lineTo(bx, lineY).stroke();
    doc.moveTo(bx, lineY).lineTo(bx - 4, lineY - 3).moveTo(bx, lineY).lineTo(bx - 4, lineY + 3).stroke();
    doc.restore();
  }

  // Draw nodes
  RELAY_ORDER.forEach((role, i) => {
    const nx = x + nodeSpacing * (i + 0.5);
    const color = ROLE_COLORS[role] || TEXT_MUTED;
    const isDominant = role === dominantRole;
    const pct = total > 0 ? Math.round(((scores[role] || 0) / total) * 100) : 20;

    if (isDominant) {
      doc.save().circle(nx, lineY, nodeR + 5).fillOpacity(0.15).fill(color).restore();
      doc.save().circle(nx, lineY, nodeR + 5).strokeColor(color).lineWidth(2).stroke().restore();
    }

    doc.save().circle(nx, lineY, nodeR).fill(isDominant ? color : PANEL_DARK).restore();

    doc.save().fillOpacity(1).fillColor(isDominant ? WHITE : TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold");
    const pctStr = `${pct}%`;
    const tw = doc.widthOfString(pctStr);
    doc.text(pctStr, nx - tw / 2, lineY - 4, { lineBreak: false });
    doc.restore();

    doc.save().fillOpacity(1).fillColor(isDominant ? color : TEXT_MUTED).fontSize(7).font(isDominant ? "Helvetica-Bold" : "Helvetica");
    const rw = doc.widthOfString(role);
    doc.text(role, nx - rw / 2, lineY + nodeR + 5, { lineBreak: false });
    doc.restore();

    doc.save().fillOpacity(1).fillColor(isDominant ? TEXT_PRIMARY : [170, 160, 145]).fontSize(5.5).font("Helvetica");
    const lbl = RELAY_LABELS[i];
    const lw = doc.widthOfString(lbl);
    doc.text(lbl, nx - lw / 2, lineY - nodeR - 14, { lineBreak: false });
    doc.restore();

    if (isDominant) {
      doc.save().fillOpacity(1).fillColor(color).fontSize(6.5).font("Helvetica-Bold");
      const youText = "YOU ARE HERE";
      const yw = doc.widthOfString(youText);
      doc.text(youText, nx - yw / 2, lineY + nodeR + 17, { lineBreak: false });
      doc.restore();
    }
  });
}

/**
 * Calculate Team Fit Score: how well does this person fill the team's gaps?
 * Score 0-100:
 *   100 = person's dominant role is the team's most-needed role
 *   0 = person's dominant role is the team's most over-represented role
 */
function calculateTeamFitScore(
  personRole: string,
  personScores: Record<string, number>,
  teamMembers: TeamMember[]
): { score: number; label: string; detail: string; missingRoles: string[]; weakRoles: string[]; overRoles: string[] } {
  const roleCount: Record<string, number> = {};
  RELAY_ORDER.forEach(r => roleCount[r] = 0);
  teamMembers.forEach(m => { roleCount[m.role] = (roleCount[m.role] || 0) + 1; });

  const totalMembers = teamMembers.length;
  const idealPct = 100 / RELAY_ORDER.length;

  // Calculate gap for each role (positive = team needs more)
  const gaps: Record<string, number> = {};
  RELAY_ORDER.forEach(r => {
    const currentPct = totalMembers > 0 ? (roleCount[r] / totalMembers) * 100 : 0;
    gaps[r] = idealPct - currentPct;
  });

  // Person's energy distribution as percentages
  const personTotal = Object.values(personScores).reduce((a, b) => a + b, 0);
  const personPcts: Record<string, number> = {};
  RELAY_ORDER.forEach(r => { personPcts[r] = personTotal > 0 ? (personScores[r] || 0) / personTotal * 100 : 20; });

  // Weighted fit: how much of the person's energy goes toward filling gaps
  let fitScore = 0;
  let maxPossible = 0;
  RELAY_ORDER.forEach(r => {
    const gap = Math.max(gaps[r], 0); // only count positive gaps (needs)
    fitScore += (personPcts[r] / 100) * gap;
    maxPossible += gap;
  });

  // Normalize to 0-100
  const normalized = maxPossible > 0 ? Math.round((fitScore / maxPossible) * 100) : 50;
  // Clamp and adjust: if their dominant role is missing, boost significantly
  let finalScore = Math.min(100, Math.max(0, normalized));
  if (roleCount[personRole] === 0) finalScore = Math.min(100, finalScore + 30);
  else if (roleCount[personRole] === 1) finalScore = Math.min(100, finalScore + 10);
  else if (roleCount[personRole] >= 3) finalScore = Math.max(0, finalScore - 15);

  finalScore = Math.min(100, Math.max(0, finalScore));

  const missingRoles = RELAY_ORDER.filter(r => roleCount[r] === 0);
  const weakRoles = RELAY_ORDER.filter(r => roleCount[r] === 1);
  const overRoles = RELAY_ORDER.filter(r => roleCount[r] >= 3);

  let label: string;
  let detail: string;
  if (finalScore >= 80) {
    label = "Critical Fit";
    detail = `Your ${personRole} energy fills a critical gap on this team.`;
  } else if (finalScore >= 60) {
    label = "Strong Fit";
    detail = `Your energy distribution complements the team's existing strengths.`;
  } else if (finalScore >= 40) {
    label = "Moderate Fit";
    detail = `You add depth to an existing capability. Consider flexing your secondary energy.`;
  } else {
    label = "Redundant Fit";
    detail = `The team already has strong ${personRole} coverage. Your secondary energies may be more valuable here.`;
  }

  return { score: finalScore, label, detail, missingRoles, weakRoles, overRoles };
}

// ── Main PDF Generator (Mobile-First Portrait) ──────────────

export async function generateAssessmentPDF(data: PDFReportData): Promise<{ url: string; key: string }> {
  const logo = await getLogo();

  // Fetch team data if person has a domain
  let teamMembers: TeamMember[] = [];
  let teamAvgScores: Record<string, number> | undefined;
  const domain = data.teamDomain || (data.email ? data.email.split("@")[1]?.toLowerCase() : undefined);

  if (domain) {
    try {
      const domainAssessments = await getAssessmentsByDomain(domain);
      teamMembers = domainAssessments
        .filter(a => a.guestEmail?.toLowerCase() !== data.email?.toLowerCase()) // exclude self
        .map(a => ({
          name: a.guestName || "Unknown",
          role: a.role,
          scores: (a.scores || {}) as Record<string, number>,
        }));

      if (teamMembers.length > 0) {
        teamAvgScores = {};
        RELAY_ORDER.forEach(r => { teamAvgScores![r] = 0; });
        teamMembers.forEach(m => {
          RELAY_ORDER.forEach(r => { teamAvgScores![r] += (m.scores[r] || 0); });
        });
        RELAY_ORDER.forEach(r => { teamAvgScores![r] = Math.round(teamAvgScores![r] / teamMembers.length); });
      }
    } catch { /* team data is optional */ }
  }

  // Portrait Letter: 612 x 792
  const doc = new PDFDocument({
    size: "LETTER",
    layout: "portrait",
    margins: { top: 30, bottom: 0, left: 28, right: 28 },
    bufferPages: false,
    autoFirstPage: true,
    info: {
      Title: `Flow Circuit Report -- ${data.name}`,
      Author: "The Flow Circuit",
      Subject: "Innovation Relay Assessment",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const PW = 612;
  const PH = 792;
  const M = 28;
  const CW = PW - M * 2; // 556
  const roleColor = ROLE_COLORS[data.role] || ROLE_COLORS.Conductor;
  const rd = ROLE_DATA[data.role] || ROLE_DATA.Conductor;

  const sortedScores = Object.entries(data.scores)
    .map(([role, score]) => ({ role, score: score as number }))
    .sort((a, b) => b.score - a.score);
  const totalPoints = sortedScores.reduce((sum, s) => sum + s.score, 0);
  const primary = sortedScores[0];
  const secondary = sortedScores[1];
  const primaryPct = primary && totalPoints > 0 ? Math.round((primary.score / totalPoints) * 100) : 0;
  const secondaryPct = secondary && totalPoints > 0 ? Math.round((secondary.score / totalPoints) * 100) : 0;
  const gap = primaryPct - secondaryPct;
  const isPure = primaryPct >= 40 || gap >= 20;

  // ════════════════════════════════════════════════════════════════
  // PAGE 1: YOUR INNOVATION PROFILE
  // ════════════════════════════════════════════════════════════════

  doc.rect(0, 0, PW, PH).fill(BG);
  doc.rect(0, 0, PW, 5).fill(roleColor);

  // Header
  let headerX = M;
  const logoSize = 20;
  if (logo) {
    try {
      doc.image(logo, M, 10, { width: logoSize, height: logoSize });
      headerX = M + logoSize + 8;
    } catch { /* fallback */ }
  }
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text("THE FLOW CIRCUIT", headerX, 16, { characterSpacing: 3, lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(7).font("Helvetica")
    .text(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase(), PW - M - 180, 16, { width: 180, align: "right", lineBreak: false });

  drawLine(doc, M, 34, PW - M, 34);

  let y = 42;

  // Name + Role header
  doc.fillColor(TEXT_PRIMARY).fontSize(24).font("Helvetica-Bold")
    .text(data.name, M, y, { width: CW });
  y = doc.y + 2;

  doc.fillColor(roleColor).fontSize(12).font("Helvetica-Bold")
    .text(rd.tagline, M, y, { width: CW, characterSpacing: 2 });
  y = doc.y + 2;

  doc.fillColor(TEXT_MUTED).fontSize(8.5).font("Helvetica")
    .text(`${data.role}  |  ${primaryPct}% Dominant  |  ${isPure ? "Pure Type" : `${primary.role}-${secondary.role} Blend`}${domain ? `  |  ${domain}` : ""}`, M, y, { width: CW });
  y = doc.y + 6;

  // One-liner
  doc.fillColor(TEXT_PRIMARY).fontSize(9.5).font("Helvetica")
    .text(rd.oneLiner, M, y, { width: CW, lineGap: 3 });
  y = doc.y + 10;

  // ── Energy Radar (full width, centered) ──
  drawPanel(doc, M, y, CW, 220, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text("ENERGY RADAR", M + 14, y + 10, { characterSpacing: 1, lineBreak: false });

  // Rank badges next to title
  const ranked = sortedScores.map((s, i) => ({ ...s, rank: i + 1, pct: totalPoints > 0 ? Math.round((s.score / totalPoints) * 100) : 20 }));
  let badgeX = M + 110;
  ranked.forEach(r => {
    const c = ROLE_COLORS[r.role] || TEXT_MUTED;
    doc.save().fillColor(c).fontSize(7).font(r.rank === 1 ? "Helvetica-Bold" : "Helvetica");
    doc.text(`#${r.rank} ${r.role} ${r.pct}%`, badgeX, y + 11, { lineBreak: false });
    badgeX += doc.widthOfString(`#${r.rank} ${r.role} ${r.pct}%`) + 12;
    doc.restore();
  });

  const radarCx = M + CW / 2;
  const radarCy = y + 128;
  const radarR = 78;
  drawRadarChart(doc, radarCx, radarCy, radarR, data.scores, data.role, teamAvgScores);
  y += 226;

  // ── Innovation Relay Positioning ──
  drawPanel(doc, M, y, CW, 72, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8.5).font("Helvetica-Bold")
    .text("YOUR POSITION IN THE INNOVATION RELAY", M + 14, y + 8, { characterSpacing: 1, lineBreak: false });
  drawRelayDiagram(doc, M + 10, y + 20, CW - 20, data.role, data.scores);
  y += 78;

  // ── Energy Distribution Bars ──
  drawPanel(doc, M, y, CW, 90, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8.5).font("Helvetica-Bold")
    .text("ENERGY DISTRIBUTION", M + 14, y + 10, { characterSpacing: 1, lineBreak: false });

  let barY = y + 26;
  const barLeft = M + 90;
  const barMaxW = CW - 140;

  sortedScores.forEach(({ role, score }, idx) => {
    const pct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const barW = Math.max(3, (pct / (primaryPct || 1)) * barMaxW * 0.85); // scale relative to max
    const color = ROLE_COLORS[role] || TEXT_MUTED;
    const isDom = role === data.role;

    doc.fillColor(isDom ? TEXT_PRIMARY : TEXT_SECONDARY).fontSize(8).font(isDom ? "Helvetica-Bold" : "Helvetica")
      .text(`#${idx + 1} ${role}`, M + 14, barY + 1, { width: 72, lineBreak: false });
    doc.roundedRect(barLeft, barY, barMaxW, 11, 3).fill([215, 206, 190]);
    doc.roundedRect(barLeft, barY, barW, 11, 3).fill(color);
    doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica-Bold")
      .text(`${pct}%`, barLeft + barMaxW + 6, barY + 1.5, { lineBreak: false });
    barY += 14;
  });
  y += 96;

  // ── Team Fit Score (if team data available) ──
  if (teamMembers.length > 0) {
    const fit = calculateTeamFitScore(data.role, data.scores, teamMembers);
    const fitH = 100;
    drawPanel(doc, M, y, CW, fitH, PANEL);

    doc.fillColor(TEXT_PRIMARY).fontSize(8.5).font("Helvetica-Bold")
      .text(`TEAM FIT SCORE  --  ${domain?.toUpperCase() || "YOUR TEAM"}`, M + 14, y + 10, { characterSpacing: 1, lineBreak: false });

    // Score circle
    const scoreX = M + 50;
    const scoreY = y + 56;
    const scoreR = 24;
    const fitColor = fit.score >= 70 ? GREEN : fit.score >= 40 ? AMBER : RED;
    doc.save().circle(scoreX, scoreY, scoreR).fillOpacity(0.12).fill(fitColor).restore();
    doc.save().circle(scoreX, scoreY, scoreR).strokeColor(fitColor).lineWidth(2.5).stroke().restore();
    doc.save().fillColor(fitColor).fontSize(18).font("Helvetica-Bold");
    const scoreStr = String(fit.score);
    const sw = doc.widthOfString(scoreStr);
    doc.text(scoreStr, scoreX - sw / 2, scoreY - 8, { lineBreak: false });
    doc.restore();
    doc.save().fillColor(TEXT_MUTED).fontSize(6).font("Helvetica");
    const ofStr = "of 100";
    const ow = doc.widthOfString(ofStr);
    doc.text(ofStr, scoreX - ow / 2, scoreY + 10, { lineBreak: false });
    doc.restore();

    // Fit label and detail
    doc.fillColor(fitColor).fontSize(10).font("Helvetica-Bold")
      .text(fit.label, M + 90, y + 30, { width: CW - 110, lineBreak: false });
    doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica")
      .text(fit.detail, M + 90, y + 44, { width: CW - 110, lineGap: 2 });

    // Team composition mini-bar
    const teamRoleCount: Record<string, number> = {};
    RELAY_ORDER.forEach(r => teamRoleCount[r] = 0);
    teamMembers.forEach(m => { teamRoleCount[m.role] = (teamRoleCount[m.role] || 0) + 1; });
    // Include self
    teamRoleCount[data.role] = (teamRoleCount[data.role] || 0) + 1;
    const totalTeam = teamMembers.length + 1;

    let compX = M + 90;
    const compY = y + 68;
    doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica")
      .text("Team:", compX, compY + 1, { lineBreak: false });
    compX += 30;

    RELAY_ORDER.forEach(r => {
      const cnt = teamRoleCount[r];
      const c = ROLE_COLORS[r] || TEXT_MUTED;
      const isMissing = cnt === 0;
      doc.save().fillColor(isMissing ? RED : c).fontSize(7).font(isMissing ? "Helvetica-Bold" : "Helvetica");
      const txt = isMissing ? `${r}: NONE` : `${r}: ${cnt}`;
      doc.text(txt, compX, compY + 1, { lineBreak: false });
      compX += doc.widthOfString(txt) + 10;
      doc.restore();
    });

    // Recalculate missing roles INCLUDING self (fit.missingRoles excludes self)
    const actualMissing = RELAY_ORDER.filter(r => teamRoleCount[r] === 0);
    if (actualMissing.length > 0) {
      doc.fillColor(AMBER).fontSize(7).font("Helvetica-Bold")
        .text(`Gaps: Missing ${actualMissing.join(", ")}`, M + 90, compY + 14, { width: CW - 110, lineBreak: false });
    }

    y += fitH + 6;
  }

  // ── Page 1 Footer ──
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica")
    .text("The Flow Circuit  |  Innovation Relay Assessment  |  flow.tonygreenberg.com  |  Page 1", M, PH - 22, { width: CW, align: "center", lineBreak: false });

  // ════════════════════════════════════════════════════════════════
  // PAGE 2: COMMUNICATION PLAYBOOK
  // ════════════════════════════════════════════════════════════════

  doc.addPage();
  doc.rect(0, 0, PW, PH).fill(BG);
  doc.rect(0, 0, PW, 5).fill(roleColor);

  // Header
  let p2hx = M;
  if (logo) {
    try {
      doc.image(logo, M, 10, { width: logoSize, height: logoSize });
      p2hx = M + logoSize + 8;
    } catch { /* fallback */ }
  }
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text("COMMUNICATION PLAYBOOK", p2hx, 16, { characterSpacing: 3, lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(7).font("Helvetica")
    .text(data.name.toUpperCase(), PW - M - 180, 16, { width: 180, align: "right", lineBreak: false });
  drawLine(doc, M, 34, PW - M, 34);

  let p2y = 42;

  // Title
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("Driving Resonance & Coherence", M, p2y, { width: CW });
  p2y = doc.y + 2;
  doc.fillColor(roleColor).fontSize(10).font("Helvetica")
    .text(`A ${data.role}'s Guide to Communication`, M, p2y, { width: CW });
  p2y = doc.y + 6;
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica")
    .text(rd.resonanceIntro, M, p2y, { width: CW, lineGap: 2.5 });
  p2y = doc.y + 10;

  // ── What Your Team Needs From You ──
  drawPanel(doc, M, p2y, CW, 52, PANEL);
  doc.fillColor(roleColor).fontSize(8).font("Helvetica-Bold")
    .text("WHAT YOUR TEAM NEEDS FROM YOU", M + 14, p2y + 10, { characterSpacing: 1, lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(8.5).font("Helvetica")
    .text(rd.teamNeed, M + 14, p2y + 24, { width: CW - 28, lineGap: 2.5 });
  p2y += 58;

  // ── How to Amplify Your Signal ──
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text("HOW TO AMPLIFY YOUR SIGNAL", M, p2y, { characterSpacing: 1 });
  p2y = doc.y + 6;

  rd.amplifyTips.forEach((tip, i) => {
    doc.fillColor(roleColor).fontSize(8.5).font("Helvetica-Bold")
      .text(`${i + 1}.`, M, p2y, { lineBreak: false });
    doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica")
      .text(tip, M + 16, p2y, { width: CW - 16, lineGap: 2 });
    p2y = doc.y + 4;
  });
  p2y += 6;

  // ── Best Partner / Friction Point ──
  const halfW = (CW - 12) / 2;
  drawPanel(doc, M, p2y, halfW, 70, PANEL);
  drawPanel(doc, M + halfW + 12, p2y, halfW, 70, PANEL);

  doc.fillColor(GREEN).fontSize(7.5).font("Helvetica-Bold")
    .text("BEST PARTNER", M + 12, p2y + 10, { characterSpacing: 1, lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica")
    .text(rd.bestPartner, M + 12, p2y + 24, { width: halfW - 24, lineGap: 2 });

  doc.fillColor(AMBER).fontSize(7.5).font("Helvetica-Bold")
    .text("GROWTH EDGE", M + halfW + 24, p2y + 10, { characterSpacing: 1, lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica")
    .text(rd.frictionPoint, M + halfW + 24, p2y + 24, { width: halfW - 24, lineGap: 2 });
  p2y += 76;

  // ── DO / DON'T ──
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text(`COMMUNICATING WITH A ${data.role.toUpperCase()}`, M, p2y, { characterSpacing: 1 });
  p2y = doc.y + 6;

  const doW = (CW - 12) / 2;
  drawPanel(doc, M, p2y, doW, 80, PANEL);
  drawPanel(doc, M + doW + 12, p2y, doW, 80, PANEL);

  doc.fillColor(GREEN).fontSize(7.5).font("Helvetica-Bold")
    .text("DO", M + 12, p2y + 8, { lineBreak: false });
  let doY = p2y + 20;
  rd.doList.forEach(item => {
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(`+  ${item}`, M + 12, doY, { width: doW - 24, lineGap: 1.5 });
    doY = doc.y + 3;
  });

  doc.fillColor(RED).fontSize(7.5).font("Helvetica-Bold")
    .text("DON'T", M + doW + 24, p2y + 8, { lineBreak: false });
  let dontY = p2y + 20;
  rd.dontList.forEach(item => {
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(`-  ${item}`, M + doW + 24, dontY, { width: doW - 24, lineGap: 1.5 });
    dontY = doc.y + 3;
  });
  p2y += 86;

  // ── Stress Signal + Recovery + Key Phrase (compact row) ──
  const thirdW = (CW - 16) / 3;
  drawPanel(doc, M, p2y, thirdW, 68, PANEL);
  drawPanel(doc, M + thirdW + 8, p2y, thirdW, 68, PANEL);
  drawPanel(doc, M + (thirdW + 8) * 2, p2y, thirdW, 68, PANEL_DARK);

  doc.fillColor(AMBER).fontSize(7).font("Helvetica-Bold")
    .text("STRESS SIGNAL", M + 10, p2y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica")
    .text(rd.stressSignal, M + 10, p2y + 20, { width: thirdW - 20, lineGap: 1.5 });

  doc.fillColor(GREEN).fontSize(7).font("Helvetica-Bold")
    .text("RECOVERY", M + thirdW + 18, p2y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica")
    .text(rd.recovery, M + thirdW + 18, p2y + 20, { width: thirdW - 20, lineGap: 1.5 });

  doc.fillColor(roleColor).fontSize(7).font("Helvetica-Bold")
    .text("KEY PHRASE", M + (thirdW + 8) * 2 + 10, p2y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(11).font("Helvetica-Bold")
    .text(`"${rd.keyPhrase}"`, M + (thirdW + 8) * 2 + 10, p2y + 24, { width: thirdW - 20, lineGap: 2 });

  p2y += 74;

  // ── Your Energy Across the Relay (fills bottom space) ──
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text("YOUR ENERGY ACROSS THE RELAY", M, p2y, { characterSpacing: 1 });
  p2y = doc.y + 6;

  const relayDesc: Record<string, string> = {
    Spark: "You ignite the cycle. Your secondary energies determine whether ideas land or float.",
    Amplifier: "You build momentum. Your secondary energies determine whether the signal reaches the right people.",
    Filter: "You refine the signal. Your secondary energies determine whether refinement becomes bottleneck or breakthrough.",
    Ground: "You execute the plan. Your secondary energies determine whether execution is mechanical or adaptive.",
    Conductor: "You orchestrate the flow. Your secondary energies determine whether you lead or micromanage.",
  };
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica")
    .text(relayDesc[data.role] || relayDesc.Conductor, M, p2y, { width: CW, lineGap: 2 });
  p2y = doc.y + 6;

  // Mini energy breakdown showing how secondary energies contribute
  const secondaryRole = sortedScores[1]?.role || "";
  const tertiaryRole = sortedScores[2]?.role || "";
  const secPct = sortedScores[1] ? Math.round((sortedScores[1].score / totalPoints) * 100) : 0;
  const terPct = sortedScores[2] ? Math.round((sortedScores[2].score / totalPoints) * 100) : 0;

  drawPanel(doc, M, p2y, CW, 50, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text(`Secondary: ${secondaryRole} (${secPct}%)`, M + 14, p2y + 10, { lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font("Helvetica")
    .text(`Your ${secondaryRole} energy is your flex capacity. When the team needs a ${secondaryRole}, you can step in without losing your core identity.`, M + 14, p2y + 22, { width: CW - 28, lineGap: 1.5 });

  doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica")
    .text(`Tertiary: ${tertiaryRole} (${terPct}%) -- available but not your natural mode`, M + 14, p2y + 40, { width: CW - 28, lineBreak: false });

  p2y += 56;

  // ── When You're At Your Best ──
  const bestHalfW = (CW - 12) / 2;
  drawPanel(doc, M, p2y, bestHalfW, 80, PANEL);
  drawPanel(doc, M + bestHalfW + 12, p2y, bestHalfW, 80, PANEL_DARK);

  doc.fillColor(roleColor).fontSize(7.5).font("Helvetica-Bold")
    .text("WHEN YOU'RE AT YOUR BEST", M + 12, p2y + 8, { characterSpacing: 1, lineBreak: false });
  let bestY = p2y + 22;
  rd.atBest.forEach(item => {
    doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica")
      .text(`\u2022  ${item}`, M + 12, bestY, { width: bestHalfW - 24, lineGap: 1.5 });
    bestY = doc.y + 2;
  });

  doc.fillColor(AMBER).fontSize(7.5).font("Helvetica-Bold")
    .text("BLIND SPOT", M + bestHalfW + 24, p2y + 8, { characterSpacing: 1, lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
    .text(rd.blindSpot, M + bestHalfW + 24, p2y + 22, { width: bestHalfW - 24, lineGap: 2 });

  // Page 2 footer
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica")
    .text("The Flow Circuit  |  Communication Playbook  |  Page 2", M, PH - 22, { width: CW, align: "center", lineBreak: false });

  // ════════════════════════════════════════════════════════════════
  // PAGE 3: HOW TO GET YOUR 360
  // ════════════════════════════════════════════════════════════════

  doc.addPage();
  doc.rect(0, 0, PW, PH).fill(BG);
  doc.rect(0, 0, PW, 5).fill(roleColor);

  let p3hx = M;
  if (logo) {
    try {
      doc.image(logo, M, 10, { width: logoSize, height: logoSize });
      p3hx = M + logoSize + 8;
    } catch { /* fallback */ }
  }
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text("HOW TO GET YOUR 360", p3hx, 16, { characterSpacing: 3, lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(7).font("Helvetica")
    .text(data.name.toUpperCase(), PW - M - 180, 16, { width: 180, align: "right", lineBreak: false });
  drawLine(doc, M, 34, PW - M, 34);

  let p3y = 42;

  doc.fillColor(TEXT_PRIMARY).fontSize(20).font("Helvetica-Bold")
    .text("How to Get Your 360", M, p3y, { width: CW });
  p3y = doc.y + 4;
  doc.fillColor(roleColor).fontSize(10).font("Helvetica")
    .text("The gap between self-perception and peer-perception is where the real insight lives.", M, p3y, { width: CW });
  p3y = doc.y + 16;

  // Step 1
  drawPanel(doc, M, p3y, CW, 52, PANEL);
  doc.fillColor(roleColor).fontSize(14).font("Helvetica-Bold")
    .text("1", M + 14, p3y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text("Sign up for your free 30-day Tribe trial", M + 34, p3y + 10, { width: CW - 48 });
  doc.fillColor(TEXT_SECONDARY).fontSize(8.5).font("Helvetica")
    .text("Go to flow.tonygreenberg.com/tribe-trial — no credit card needed. Your trial begins immediately.", M + 34, p3y + 28, { width: CW - 48, lineGap: 2 });
  p3y += 60;

  // Step 2
  drawPanel(doc, M, p3y, CW, 52, PANEL);
  doc.fillColor(roleColor).fontSize(14).font("Helvetica-Bold")
    .text("2", M + 14, p3y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text("Copy your unique 360 reviewer link", M + 34, p3y + 10, { width: CW - 48 });
  doc.fillColor(TEXT_SECONDARY).fontSize(8.5).font("Helvetica")
    .text("From your results page, open \"My 360\" and copy your unique link. It looks like: flow.tonygreenberg.com/360/your-token", M + 34, p3y + 28, { width: CW - 48, lineGap: 2 });
  p3y += 60;

  // Step 3
  drawPanel(doc, M, p3y, CW, 62, PANEL);
  doc.fillColor(roleColor).fontSize(14).font("Helvetica-Bold")
    .text("3", M + 14, p3y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text("Send it to 3\u20135 people", M + 34, p3y + 10, { width: CW - 48 });
  doc.fillColor(TEXT_SECONDARY).fontSize(8.5).font("Helvetica")
    .text("Use the pre-written message template in your dashboard. Choose people who see you under pressure, across functions, and in daily work.", M + 34, p3y + 28, { width: CW - 48, lineGap: 2 });
  p3y += 70;

  // Step 4
  drawPanel(doc, M, p3y, CW, 52, PANEL);
  doc.fillColor(roleColor).fontSize(14).font("Helvetica-Bold")
    .text("4", M + 14, p3y + 8, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text("Watch responses come in live", M + 34, p3y + 10, { width: CW - 48 });
  doc.fillColor(TEXT_SECONDARY).fontSize(8.5).font("Helvetica")
    .text("Your dashboard shows live response tracking. Your gap report unlocks automatically at 3 responses.", M + 34, p3y + 28, { width: CW - 48, lineGap: 2 });
  p3y += 60;

  // Why 3 Responses
  p3y += 10;
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text("WHY 3 RESPONSES MINIMUM", M, p3y, { characterSpacing: 1 });
  p3y = doc.y + 8;

  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica")
    .text("One reviewer sees a role. Three reviewers reveal a pattern. Five reviewers reveal the truth.", M, p3y, { width: CW, lineGap: 3 });
  p3y = doc.y + 12;

  doc.fillColor(TEXT_SECONDARY).fontSize(8.5).font("Helvetica-Oblique")
    .text("The gap between your self-assessment and peer composite is the most actionable data this report produces. Everything else is input. This is signal.", M, p3y, { width: CW, lineGap: 3 });
  p3y = doc.y + 16;

  // CTA panel
  drawPanel(doc, M, p3y, CW, 50, PANEL_DARK);
  doc.fillColor(roleColor).fontSize(10).font("Helvetica-Bold")
    .text("START NOW:", M + 14, p3y + 12, { lineBreak: false });
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica")
    .text("flow.tonygreenberg.com/tribe-trial", M + 14, p3y + 28, { width: CW - 28, underline: true });
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font("Helvetica")
    .text("No credit card required. 30 days free.", M + 14, p3y + 40, { width: CW - 28 });

  // Page 3 footer
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica")
    .text("The Flow Circuit  |  How to Get Your 360  |  Page 3", M, PH - 22, { width: CW, align: "center", lineBreak: false });

  // Finalize
  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const timestamp = Date.now();
  const safeName = data.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const fileKey = `reports/flow-circuit-${safeName}-${timestamp}.pdf`;

  const { url, key } = await storagePut(fileKey, pdfBuffer, "application/pdf");
  return { url, key };
}

// Keep legacy HTML export for backward compatibility
export interface ReportData {
  name: string;
  dominantRole: string;
  combinationProfile: string;
  purityScore: number;
  purityLabel: string;
  percentages: { role: string; percentage: number }[];
  stressZones: { targetRole: string; stressLevel: number; label: string }[];
  teamCode?: string;
  date: string;
}

export function generateReportHTML(data: ReportData): string {
  const roleColor = ({ Spark: "#f59e0b", Amplifier: "#ef4444", Filter: "#8b5cf6", Ground: "#2563eb", Conductor: "#10b981" } as Record<string, string>)[data.dominantRole] || "#000";
  return `<!DOCTYPE html><html><head><title>Flow Circuit Report -- ${data.name}</title></head><body><h1>${data.name} -- ${data.dominantRole}</h1><p>Score: ${data.percentages[0]?.percentage || 0}%</p></body></html>`;
}
