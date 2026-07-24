import PDFDocument from "pdfkit";
import { storagePut } from "./storage";

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

// ── Family Archetype Mapping ────────────────────────────────
// Business → Family name translation
const FAMILY_ROLE_NAMES: Record<string, string> = {
  Spark: "The Dreamer",
  Amplifier: "The Cheerleader",
  Filter: "The Protector",
  Ground: "The Rock",
  Conductor: "The Peacemaker",
};

const FAMILY_ROLE_VERBS: Record<string, string> = {
  Spark: "Imagines",
  Amplifier: "Rallies",
  Filter: "Protects",
  Ground: "Anchors",
  Conductor: "Connects",
};

const FAMILY_ROLE_DESCRIPTIONS: Record<string, string> = {
  Spark: "Always imagining what the family could become",
  Amplifier: "Rallies everyone and keeps spirits high",
  Filter: "Sees risks, asks the hard questions to keep everyone safe",
  Ground: "Makes sure bills get paid and plans actually happen",
  Conductor: "Keeps everyone connected and in sync",
};

// ── Color Palette (matches individual report — warm tan) ────
const ROLE_COLORS: Record<string, [number, number, number]> = {
  Spark: [217, 155, 30],      // warm gold
  Amplifier: [210, 90, 30],   // warm orange
  Filter: [60, 120, 190],     // steel blue
  Ground: [40, 155, 80],      // forest green
  Conductor: [130, 70, 200],  // deep purple
};

const BG: [number, number, number] = [245, 238, 225];          // warm tan
const PANEL: [number, number, number] = [235, 226, 210];       // slightly darker tan
const PANEL_DARK: [number, number, number] = [225, 215, 198];  // darker panel
const PANEL_ACCENT: [number, number, number] = [215, 205, 188]; // accent panel
const TEXT_PRIMARY: [number, number, number] = [35, 30, 25];   // near-black
const TEXT_SECONDARY: [number, number, number] = [80, 72, 60]; // dark brown
const TEXT_MUTED: [number, number, number] = [120, 110, 95];   // muted brown
const DIVIDER: [number, number, number] = [200, 190, 172];     // subtle line
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [40, 140, 70];
const AMBER: [number, number, number] = [180, 130, 20];

const RELAY_ORDER = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

// ── Types ────────────────────────────────────────────────────
export interface FamilyMember {
  name: string;
  role: string;
  score: number;
  scores: Record<string, number>;
}

export interface FamilyFrictionData {
  familyName: string;
  domain: string;
  members: FamilyMember[];
}

// ── Drawing Helpers ──────────────────────────────────────────
function drawPanel(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, color: [number, number, number] = PANEL) {
  doc.save();
  doc.roundedRect(x, y, w, h, 5).fill(color);
  doc.restore();
}

function drawDivider(doc: PDFKit.PDFDocument, x: number, y: number, w: number) {
  doc.save();
  doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor(DIVIDER).stroke();
  doc.restore();
}

function drawKPI(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, value: string, label: string, color: [number, number, number]) {
  drawPanel(doc, x, y, w, h, PANEL_DARK);
  doc.fillColor(color).fontSize(22).font("Helvetica-Bold")
    .text(value, x, y + 8, { width: w, align: "center", lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica")
    .text(label, x, y + 32, { width: w, align: "center", lineBreak: false });
}

function drawRadarChart(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number, avgScores: Record<string, number>) {
  const roles = RELAY_ORDER;
  const total = Object.values(avgScores).reduce((a, b) => a + b, 0);
  const n = roles.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  [0.25, 0.5, 0.75, 1.0].forEach(pct => {
    const r = radius * pct;
    doc.save();
    doc.strokeColor(DIVIDER).lineWidth(0.5);
    for (let i = 0; i < n; i++) {
      const a1 = startAngle + i * angleStep;
      const a2 = startAngle + ((i + 1) % n) * angleStep;
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    }
    doc.restore();
  });

  doc.save();
  doc.strokeColor(DIVIDER).lineWidth(0.5);
  for (let i = 0; i < n; i++) {
    const a = startAngle + i * angleStep;
    doc.moveTo(cx, cy).lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a)).stroke();
  }
  doc.restore();

  const points: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const role = roles[i];
    const pct = total > 0 ? (avgScores[role] || 0) / total : 0.2;
    const r = radius * Math.min(pct * 5, 1);
    const a = startAngle + i * angleStep;
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }

  doc.save();
  doc.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) doc.lineTo(points[i][0], points[i][1]);
  doc.closePath();
  doc.fillOpacity(0.15).fill(GREEN);
  doc.restore();

  doc.save();
  doc.strokeColor(GREEN).lineWidth(2);
  doc.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) doc.lineTo(points[i][0], points[i][1]);
  doc.closePath().stroke();
  doc.restore();

  for (let i = 0; i < n; i++) {
    const role = roles[i];
    const rc = ROLE_COLORS[role] || TEXT_MUTED;
    doc.save();
    doc.circle(points[i][0], points[i][1], 4).fill(rc);
    doc.restore();

    const labelR = radius + 16;
    const a = startAngle + i * angleStep;
    const lx = cx + labelR * Math.cos(a);
    const ly = cy + labelR * Math.sin(a);
    const pctVal = total > 0 ? Math.round(((avgScores[role] || 0) / total) * 100) : 20;
    const familyName = FAMILY_ROLE_NAMES[role] || role;
    doc.fillColor(rc).fontSize(7).font("Helvetica-Bold")
      .text(`${familyName} ${pctVal}%`, lx - 38, ly - 5, { width: 76, align: "center", lineBreak: false });
  }
}

function drawPageHeader(doc: PDFKit.PDFDocument, logo: Buffer | null, subtitle: string, familyName: string, PW: number, M: number, CW: number) {
  doc.rect(0, 0, PW, 4).fill(GREEN);
  const logoSize = 18;
  let hx = M;
  if (logo) {
    try { doc.image(logo, M, 12, { width: logoSize, height: logoSize }); hx = M + logoSize + 6; } catch { /* */ }
  }
  doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica")
    .text(`THE FLOW CIRCUIT  ·  ${subtitle}`, hx, 17, { width: CW * 0.6, characterSpacing: 1.2, lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica")
    .text(familyName.toUpperCase(), M, 17, { width: CW, align: "right", lineBreak: false });
}

function drawPageFooter(doc: PDFKit.PDFDocument, page: number, totalPages: number, M: number, PH: number, CW: number) {
  doc.save();
  doc.fillColor(TEXT_MUTED).fontSize(5.5).font("Helvetica");
  doc.text(`flowcircuit.manus.space  |  Page ${page} of ${totalPages}`, M, PH - 20, { width: CW, align: "center", lineBreak: false, height: 10 });
  doc.restore();
}

// ── Main Generator ───────────────────────────────────────────
export async function generateFamilyFrictionPDF(data: FamilyFrictionData): Promise<{ url: string; key: string }> {
  const logo = await getLogo();
  const chunks: Buffer[] = [];
  const PW = 595;  // A4 portrait width
  const PH = 842;  // A4 portrait height
  const M = 32;    // margin
  const CW = PW - 2 * M; // content width
  const TOTAL_PAGES = 4;

  const doc = new PDFDocument({
    size: [PW, PH],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: true,
    bufferPages: false,
  });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // ── Pre-compute analytics ──
  const roleCount: Record<string, number> = {};
  const roleAvgScores: Record<string, number> = {};
  RELAY_ORDER.forEach(r => { roleCount[r] = 0; roleAvgScores[r] = 0; });

  for (const member of data.members) {
    roleCount[member.role] = (roleCount[member.role] || 0) + 1;
    for (const role of RELAY_ORDER) {
      roleAvgScores[role] = (roleAvgScores[role] || 0) + (member.scores[role] || 0);
    }
  }
  for (const role of RELAY_ORDER) {
    roleAvgScores[role] = data.members.length > 0 ? roleAvgScores[role] / data.members.length : 0;
  }

  const missingRoles = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 0);
  const health = calculateFamilyHealth(data.members);
  const healthColor = health.score >= 70 ? GREEN : AMBER;
  const frictionPairs = identifyFamilyFriction(data.members);
  const familyDNA = analyzeFamilyDNA(data.members, roleCount, roleAvgScores);
  const energyFlow = analyzeFamilyEnergyFlow(data.members, roleCount, roleAvgScores);
  const growthRec = generateFamilyGrowthRecommendation(data.members, roleCount, missingRoles);
  const keyPersonRisk = analyzeFamilyKeyPerson(data.members, roleCount);

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: FAMILY ENERGY DASHBOARD
  // ═══════════════════════════════════════════════════════════
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "FAMILY ENERGY MAP", data.familyName, PW, M, CW);

  let y = 38;

  // Title block
  doc.fillColor(TEXT_PRIMARY).fontSize(24).font("Helvetica-Bold")
    .text(data.familyName, M, y, { width: CW, lineBreak: false });
  y += 30;

  doc.fillColor(TEXT_SECONDARY).fontSize(9).font("Helvetica")
    .text(`${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}  ·  ${data.members.length} FAMILY MEMBERS`, M, y, { width: CW, lineBreak: false });
  y += 18;

  // ── KPI Row ──
  const kpiW = (CW - 12) / 4;
  drawKPI(doc, M, y, kpiW, 46, `${health.score}`, "FAMILY HARMONY", healthColor);
  drawKPI(doc, M + kpiW + 4, y, kpiW, 46, `${5 - missingRoles.length}/5`, "ENERGIES PRESENT", missingRoles.length === 0 ? GREEN : AMBER);
  drawKPI(doc, M + (kpiW + 4) * 2, y, kpiW, 46, `${frictionPairs.length}`, "GROWTH EDGES", frictionPairs.length <= 1 ? GREEN : AMBER);
  drawKPI(doc, M + (kpiW + 4) * 3, y, kpiW, 46, energyFlow.dominantQuadrant, "FAMILY ENERGY", AMBER);
  y += 54;

  // ── Family Energy Relay ──
  drawPanel(doc, M, y, CW, 78, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("YOUR FAMILY'S ENERGY CIRCUIT", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

  const relayY = y + 24;
  const nodeW = (CW - 24) / 5;

  RELAY_ORDER.forEach((role, i) => {
    const nx = M + 12 + i * nodeW;
    const rc = ROLE_COLORS[role] || TEXT_MUTED;
    const cnt = roleCount[role] || 0;
    const hasMembers = cnt > 0;

    doc.save();
    if (hasMembers) {
      doc.circle(nx + nodeW / 2, relayY + 14, 14).fill(rc);
      doc.fillColor(WHITE).fontSize(11).font("Helvetica-Bold")
        .text(String(cnt), nx + nodeW / 2 - 10, relayY + 9, { width: 20, align: "center", lineBreak: false });
    } else {
      doc.circle(nx + nodeW / 2, relayY + 14, 14).lineWidth(2).strokeColor(AMBER).stroke();
      doc.fillColor(AMBER).fontSize(9).font("Helvetica-Bold")
        .text("0", nx + nodeW / 2 - 10, relayY + 9, { width: 20, align: "center", lineBreak: false });
    }
    doc.restore();

    if (i < 4) {
      doc.save();
      doc.strokeColor(DIVIDER).lineWidth(1.5);
      doc.moveTo(nx + nodeW / 2 + 16, relayY + 14).lineTo(nx + nodeW + nodeW / 2 - 16, relayY + 14).stroke();
      const ax = nx + nodeW + nodeW / 2 - 16;
      doc.moveTo(ax, relayY + 14).lineTo(ax - 4, relayY + 11).lineTo(ax - 4, relayY + 17).closePath().fill(DIVIDER);
      doc.restore();
    }

    const familyLabel = FAMILY_ROLE_NAMES[role] || role;
    doc.fillColor(hasMembers ? TEXT_SECONDARY : AMBER).fontSize(6.5).font("Helvetica")
      .text(familyLabel, nx, relayY + 34, { width: nodeW, align: "center", lineBreak: false });
  });
  y += 84;

  // ── Missing Energy Notice ──
  if (missingRoles.length > 0) {
    drawPanel(doc, M, y, CW, 48, [235, 228, 215]);
    doc.fillColor(AMBER).fontSize(8).font("Helvetica-Bold")
      .text(`SHARED RESPONSIBILITIES — ${missingRoles.length} ${missingRoles.length === 1 ? "ENERGY" : "ENERGIES"} ABSORBED BY OTHERS`, M + 12, y + 8, { width: CW - 24, characterSpacing: 0.5 });
    const gapAdvice = missingRoles.map(r => {
      const stretchers = getFamilyStretchCandidates(r, data.members);
      const familyLabel = FAMILY_ROLE_NAMES[r] || r;
      return stretchers.length > 0
        ? `${familyLabel}: ${stretchers.join(" or ")} naturally absorb${stretchers.length === 1 ? "s" : ""} this at home`
        : `${familyLabel}: being covered by the whole family — this creates invisible load`;
    }).join(". ");
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(gapAdvice + ".", M + 12, y + 22, { width: CW - 24, lineGap: 2, height: 22 });
    y += 54;
  }

  // ── Two-column: Radar + Roster ──
  const colW = (CW - 8) / 2;

  // Left: Radar
  drawPanel(doc, M, y, colW, 180, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("FAMILY ENERGY RADAR", M + 12, y + 8, { width: colW - 24, characterSpacing: 1 });
  drawRadarChart(doc, M + colW / 2, y + 105, 55, roleAvgScores);

  // Right: Family Members
  drawPanel(doc, M + colW + 8, y, colW, 180, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("FAMILY MEMBERS", M + colW + 20, y + 8, { width: colW - 24, characterSpacing: 1 });

  const rosterX = M + colW + 20;
  let ry = y + 22;
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica-Bold")
    .text("NAME", rosterX, ry, { width: 110, lineBreak: false })
    .text("ENERGY", rosterX + 110, ry, { width: 50, lineBreak: false })
    .text("STR", rosterX + 160, ry, { width: 30, lineBreak: false });
  drawDivider(doc, rosterX, ry + 9, colW - 24);
  ry += 12;

  data.members.forEach((member, i) => {
    if (i >= 8) return;
    const rc = ROLE_COLORS[member.role] || TEXT_MUTED;
    const familyLabel = FAMILY_ROLE_NAMES[member.role] || member.role;
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(member.name, rosterX, ry, { width: 110, lineBreak: false });
    doc.fillColor(rc).fontSize(7).font("Helvetica-Bold")
      .text(familyLabel, rosterX + 100, ry, { width: 60, lineBreak: false });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(`${member.score}%`, rosterX + 160, ry, { width: 30, lineBreak: false });

    // Mini bar
    const barX = rosterX;
    const barW = colW - 28;
    const total = Object.values(member.scores).reduce((a, b) => a + b, 0);
    let bx = barX;
    if (total > 0) {
      RELAY_ORDER.forEach(role => {
        const pct = (member.scores[role] || 0) / total;
        const w = barW * pct;
        if (w > 0.5) {
          doc.roundedRect(bx, ry + 11, w, 4, 1).fill(ROLE_COLORS[role] || TEXT_MUTED);
          bx += w;
        }
      });
    }
    ry += 20;
  });
  y += 186;

  // ── Family DNA Summary ──
  drawPanel(doc, M, y, CW, 60, PANEL_DARK);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("YOUR FAMILY'S PERSONALITY", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text(`"${familyDNA.archetype}"`, M + 12, y + 22, { width: CW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(familyDNA.description, M + 12, y + 36, { width: CW - 24, lineGap: 2, height: 20 });
  y += 66;

  // ── Energy Concentration Bar ──
  if (y + 50 < PH - 30) {
    drawPanel(doc, M, y, CW, 44, PANEL);
    doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
      .text("ENERGY BALANCE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

    const barY = y + 24;
    const barW = CW - 24;
    const totalEnergy = Object.values(roleAvgScores).reduce((a, b) => a + b, 0);
    let bx = M + 12;
    RELAY_ORDER.forEach(role => {
      const pct = totalEnergy > 0 ? roleAvgScores[role] / totalEnergy : 0.2;
      const w = barW * pct;
      if (w > 1) {
        doc.roundedRect(bx, barY, w, 12, 2).fill(ROLE_COLORS[role] || TEXT_MUTED);
        if (w > 30) {
          doc.fillColor(WHITE).fontSize(6).font("Helvetica-Bold")
            .text(`${Math.round(pct * 100)}%`, bx + 2, barY + 2, { width: w - 4, align: "center", lineBreak: false });
        }
        bx += w;
      }
    });
    y += 50;
  }

  drawPageFooter(doc, 1, TOTAL_PAGES, M, PH, CW);

  // ═══════════════════════════════════════════════════════════
  // PAGE 2: HOW YOUR FAMILY FLOWS
  // ═══════════════════════════════════════════════════════════
  doc.addPage({ size: [PW, PH], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "HOW YOUR FAMILY FLOWS", data.familyName, PW, M, CW);

  y = 38;
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("How Energy Moves at Home", M, y, { width: CW, lineBreak: false });
  y += 24;

  // ── Energy Flow Narrative ──
  drawPanel(doc, M, y, CW, 50, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("YOUR FAMILY'S RHYTHM", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(energyFlow.narrative, M + 12, y + 22, { width: CW - 24, lineGap: 2.5, height: 24 });
  y += 56;

  // ── Family Friction Points ──
  drawPanel(doc, M, y, CW, 18 + frictionPairs.length * 40, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("WHERE FRICTION SHOWS UP AT HOME", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  y += 22;

  if (frictionPairs.length === 0) {
    doc.fillColor(GREEN).fontSize(8).font("Helvetica")
      .text("No significant friction detected. Your family's energy flows naturally — a rare and beautiful thing.", M + 12, y, { width: CW - 24, lineBreak: false });
    y += 20;
  } else {
    frictionPairs.forEach((pair, i) => {
      const severity = pair.severity || "medium";
      const sevColor = severity === "high" ? AMBER : severity === "medium" ? [160, 140, 60] as [number, number, number] : GREEN;

      doc.circle(M + 20, y + 10, 5).fill(sevColor);
      doc.fillColor(WHITE).fontSize(6).font("Helvetica-Bold")
        .text(severity === "high" ? "▶" : severity === "medium" ? "▷" : "✓", M + 16, y + 7, { width: 8, align: "center", lineBreak: false });

      const label1 = FAMILY_ROLE_NAMES[pair.role1] || pair.role1;
      const label2 = FAMILY_ROLE_NAMES[pair.role2] || pair.role2;
      doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
        .text(`${label1} ↔ ${label2}`, M + 32, y + 4, { width: CW - 56, lineBreak: false });
      doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
        .text(pair.description, M + 32, y + 16, { width: CW - 56, lineGap: 2, height: 18 });

      if (i < frictionPairs.length - 1) drawDivider(doc, M + 12, y + 36, CW - 24);
      y += 40;
    });
  }
  y += 4;

  // ── Family Energy Coverage Table ──
  drawPanel(doc, M, y, CW, 18 + RELAY_ORDER.length * 24, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("FAMILY ENERGY COVERAGE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

  const tableY = y + 22;
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica-Bold")
    .text("ENERGY", M + 12, tableY, { width: 80, lineBreak: false })
    .text("WHO", M + 92, tableY, { width: 50, lineBreak: false })
    .text("STRENGTH", M + 142, tableY, { width: 60, lineBreak: false })
    .text("STATUS", M + 210, tableY, { width: 60, lineBreak: false })
    .text("WHAT THIS MEANS AT HOME", M + 280, tableY, { width: CW - 292, lineBreak: false });
  drawDivider(doc, M + 12, tableY + 9, CW - 24);

  RELAY_ORDER.forEach((role, i) => {
    const ty = tableY + 13 + i * 24;
    const cnt = roleCount[role] || 0;
    const avgE = roleAvgScores[role];
    const totalE = Object.values(roleAvgScores).reduce((a, b) => a + b, 0);
    const pct = totalE > 0 ? Math.round((avgE / totalE) * 100) : 20;
    const rc = ROLE_COLORS[role] || TEXT_MUTED;

    let status: string;
    let statusColor: [number, number, number];
    if (cnt === 0) { status = "SHARED"; statusColor = AMBER; }
    else if (cnt >= 3) { status = "ABUNDANT"; statusColor = GREEN; }
    else if (pct >= 30) { status = "STRONG"; statusColor = GREEN; }
    else if (pct >= 15) { status = "PRESENT"; statusColor = GREEN; }
    else { status = "GROWING"; statusColor = AMBER; }

    const impact = getFamilyEnergyImpact(role, cnt, pct);
    const familyLabel = FAMILY_ROLE_NAMES[role] || role;

    doc.rect(M + 12, ty - 1, 3, 16).fill(rc);
    doc.fillColor(rc).fontSize(7).font("Helvetica-Bold")
      .text(familyLabel, M + 20, ty + 2, { width: 70, lineBreak: false });
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(cnt === 0 ? "—" : String(cnt), M + 92, ty + 2, { width: 50, lineBreak: false });
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(`${pct}%`, M + 142, ty + 2, { width: 60, lineBreak: false });
    doc.fillColor(statusColor).fontSize(7).font("Helvetica-Bold")
      .text(status, M + 210, ty + 2, { width: 60, lineBreak: false });
    doc.fillColor(TEXT_SECONDARY).fontSize(7).font("Helvetica")
      .text(impact, M + 280, ty + 2, { width: CW - 292, lineBreak: false });

    if (i < RELAY_ORDER.length - 1) drawDivider(doc, M + 12, ty + 18, CW - 24);
  });
  y += 18 + RELAY_ORDER.length * 24 + 6;

  // ── Family Rituals (Handoff Protocol) ──
  const rituals = generateFamilyRituals(data.members, roleCount);
  drawPanel(doc, M, y, CW, 18 + rituals.length * 16, PANEL_DARK);
  doc.fillColor(GREEN).fontSize(8).font("Helvetica-Bold")
    .text("FAMILY RITUALS THAT HELP", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

  let hy = y + 24;
  rituals.slice(0, 5).forEach((h, i) => {
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(`${i + 1}.  ${h}`, M + 12, hy, { width: CW - 24, lineBreak: false });
    hy += 16;
  });
  y = hy + 6;

  // ── Under Stress ──
  if (y + 70 < PH - 30) {
    drawPanel(doc, M, y, CW, 64, [235, 228, 215]);
    doc.fillColor(AMBER).fontSize(8).font("Helvetica-Bold")
      .text("WHEN LIFE GETS STRESSFUL", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(energyFlow.underStress, M + 12, y + 22, { width: CW - 24, lineGap: 2.5, height: 36 });
    y += 70;
  }

  drawPageFooter(doc, 2, TOTAL_PAGES, M, PH, CW);

  // ═══════════════════════════════════════════════════════════
  // PAGE 3: FAMILY PERSONALITY & GROWTH
  // ═══════════════════════════════════════════════════════════
  doc.addPage({ size: [PW, PH], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "GROWING TOGETHER", data.familyName, PW, M, CW);

  y = 38;
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("Your Family's Natural Pattern", M, y, { width: CW, lineBreak: false });
  y += 24;

  // ── Family Archetype Deep Dive ──
  drawPanel(doc, M, y, CW, 80, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("FAMILY ARCHETYPE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(12).font("Helvetica-Bold")
    .text(`"${familyDNA.archetype}"`, M + 12, y + 22, { width: CW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(familyDNA.deepDive, M + 12, y + 38, { width: CW - 24, lineGap: 2.5, height: 36 });
  y += 86;

  // ── Two-column: Key Person + Growth Rec ──
  const halfW = (CW - 8) / 2;

  // Left: Key Person
  drawPanel(doc, M, y, halfW, 110, [235, 228, 215]);
  doc.fillColor(AMBER).fontSize(8).font("Helvetica-Bold")
    .text("THE FAMILY ANCHOR", M + 12, y + 8, { width: halfW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text(keyPersonRisk.person, M + 12, y + 24, { width: halfW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(keyPersonRisk.analysis, M + 12, y + 38, { width: halfW - 24, lineGap: 2.5, height: 60 });

  // Right: Growth Recommendation
  drawPanel(doc, M + halfW + 8, y, halfW, 110, [225, 240, 228]);
  doc.fillColor(GREEN).fontSize(8).font("Helvetica-Bold")
    .text("HOW TO GROW TOGETHER", M + halfW + 20, y + 8, { width: halfW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text(growthRec.title, M + halfW + 20, y + 24, { width: halfW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(growthRec.description, M + halfW + 20, y + 38, { width: halfW - 24, lineGap: 2.5, height: 60 });
  y += 116;

  // ── Family Growth Recommendations ──
  doc.fillColor(TEXT_PRIMARY).fontSize(12).font("Helvetica-Bold")
    .text("Path to More Flow at Home", M, y, { width: CW, lineBreak: false });
  y += 18;

  const recommendations = generateFamilyRecommendations(data.members, roleCount, missingRoles);
  recommendations.forEach((rec, i) => {
    if (y + 48 > PH - 30) return;
    drawPanel(doc, M, y, CW, 44, PANEL);

    doc.circle(M + 20, y + 12, 8).fill(rec.color);
    doc.fillColor(WHITE).fontSize(9).font("Helvetica-Bold")
      .text(String(i + 1), M + 14, y + 8, { width: 12, align: "center", lineBreak: false });

    doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
      .text(rec.title, M + 36, y + 8, { width: CW - 48, characterSpacing: 0.3 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(rec.description, M + 36, y + 22, { width: CW - 48, lineGap: 2, height: 18 });
    y += 50;
  });

  drawPageFooter(doc, 3, TOTAL_PAGES, M, PH, CW);

  // ═══════════════════════════════════════════════════════════
  // PAGE 4: INDIVIDUAL FAMILY MEMBER DEEP-DIVES
  // ═══════════════════════════════════════════════════════════
  doc.addPage({ size: [PW, PH], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "EACH PERSON'S GIFT", data.familyName, PW, M, CW);

  y = 38;
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("What Each Person Brings Home", M, y, { width: CW, lineBreak: false });
  y += 24;

  data.members.forEach((member, i) => {
    const cardH = 100;
    if (y + cardH > PH - 30) return;

    const rc = ROLE_COLORS[member.role] || TEXT_MUTED;
    const memberInsight = getFamilyMemberInsight(member);

    drawPanel(doc, M, y, CW, cardH, PANEL);
    doc.rect(M, y, 4, cardH).fill(rc);

    // Name and role
    const familyLabel = FAMILY_ROLE_NAMES[member.role] || member.role;
    doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
      .text(member.name, M + 14, y + 8, { width: CW - 120, lineBreak: false });
    doc.fillColor(rc).fontSize(9).font("Helvetica-Bold")
      .text(`${familyLabel}  ·  ${member.score}%`, M + CW - 120, y + 9, { width: 106, align: "right", lineBreak: false });

    // Two-column insight
    const insightColW = (CW - 28) / 2;

    // Left: Gift
    doc.fillColor(GREEN).fontSize(6.5).font("Helvetica-Bold")
      .text("THEIR GIFT TO THE FAMILY", M + 14, y + 26, { width: insightColW, characterSpacing: 0.5 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(memberInsight.gift, M + 14, y + 36, { width: insightColW - 8, lineGap: 2, height: 28 });

    // Right: Need
    doc.fillColor(AMBER).fontSize(6.5).font("Helvetica-Bold")
      .text("WHAT THEY NEED FROM YOU", M + 14 + insightColW, y + 26, { width: insightColW, characterSpacing: 0.5 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(memberInsight.need, M + 14 + insightColW, y + 36, { width: insightColW - 8, lineGap: 2, height: 28 });

    // Connection tip
    doc.fillColor(AMBER).fontSize(6.5).font("Helvetica-Bold")
      .text("HOW TO CONNECT WITH THEM", M + 14, y + 68, { width: CW - 28, characterSpacing: 0.5 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(memberInsight.connectionTip, M + 14, y + 78, { width: CW - 28, lineGap: 2, height: 16 });

    y += cardH + 6;
  });

  // ── 5 Energies Reference (if space) ──
  if (y + 56 < PH - 30) {
    drawPanel(doc, M, y, CW, 50, PANEL_ACCENT);
    doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica-Bold")
      .text("THE 5 FAMILY ENERGIES", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

    const refColW = (CW - 24) / 5;
    RELAY_ORDER.forEach((role, i) => {
      const cx = M + 12 + i * refColW;
      const rc = ROLE_COLORS[role] || TEXT_MUTED;
      const cnt = roleCount[role] || 0;
      const familyLabel = FAMILY_ROLE_NAMES[role] || role;
      doc.fillColor(cnt > 0 ? rc : TEXT_MUTED).fontSize(6.5).font(cnt > 0 ? "Helvetica-Bold" : "Helvetica")
        .text(`${familyLabel} (${cnt})`, cx, y + 22, { width: refColW - 2, lineBreak: false });
      doc.fillColor(cnt > 0 ? TEXT_SECONDARY : TEXT_MUTED).fontSize(5.5).font("Helvetica")
        .text(FAMILY_ROLE_VERBS[role] || "", cx, y + 32, { width: refColW - 2, lineBreak: false });
    });
  }

  drawPageFooter(doc, 4, TOTAL_PAGES, M, PH, CW);

  // Finalize
  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const timestamp = Date.now();
  const safeDomain = data.domain.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const fileKey = `reports/family-energy-${safeDomain}-${timestamp}.pdf`;

  const { url, key } = await storagePut(fileKey, pdfBuffer, "application/pdf");
  return { url, key };
}

// ══════════════════════════════════════════════════════════════
// FAMILY ANALYTICAL ENGINES
// ══════════════════════════════════════════════════════════════

function analyzeFamilyDNA(members: FamilyMember[], roleCount: Record<string, number>, avgScores: Record<string, number>): { archetype: string; description: string; deepDive: string } {
  const totalEnergy = Object.values(avgScores).reduce((a, b) => a + b, 0);
  const sparkPct = totalEnergy > 0 ? (avgScores.Spark || 0) / totalEnergy : 0;
  const filterPct = totalEnergy > 0 ? (avgScores.Filter || 0) / totalEnergy : 0;
  const groundPct = totalEnergy > 0 ? (avgScores.Ground || 0) / totalEnergy : 0;
  const ampPct = totalEnergy > 0 ? (avgScores.Amplifier || 0) / totalEnergy : 0;
  const condPct = totalEnergy > 0 ? (avgScores.Conductor || 0) / totalEnergy : 0;

  if (sparkPct > 0.3 && groundPct < 0.15) {
    return {
      archetype: "The Dreaming Household",
      description: "Your family is full of ideas, plans, and 'what ifs.' The energy is creative and exciting — grounding that energy into action is the growth edge.",
      deepDive: "Your family's energy is heavily weighted toward imagination and possibility. Dinner conversations probably jump between ideas, plans, and 'wouldn't it be amazing if...' moments. This is a genuine gift — many families lose this spark. The opportunity: someone needs to catch the best ideas and turn them into actual plans. Without that, the family can feel like it's always planning but never doing. Try a 'family project board' where one idea at a time gets real attention and follow-through."
    };
  }
  if (groundPct > 0.3 && sparkPct < 0.15) {
    return {
      archetype: "The Steady Household",
      description: "Your family runs like clockwork. Bills paid, schedules kept, logistics handled. The growth edge is making space for spontaneity and dreams.",
      deepDive: "Your family's energy concentrates in execution and reliability. This is a profound strength — everyone knows what to expect, commitments are honored, and the household functions smoothly. The opportunity: schedule the unscheduled. A monthly 'wild card' day where someone picks something nobody has done before. This gives the family permission to dream without threatening the stability that everyone relies on."
    };
  }
  if (filterPct > 0.3) {
    return {
      archetype: "The Careful Household",
      description: "Your family thinks before it leaps. Decisions are thorough, risks are considered. The growth edge is letting some ideas breathe before they're analyzed.",
      deepDive: "Your family's dominant energy is protective — seeing risks, asking hard questions, making sure nobody gets hurt. This is love expressed through caution. The opportunity: create a 'yes first' rule for low-stakes ideas. When someone suggests a movie, a restaurant, a weekend plan — say yes first, analyze later. Save the careful analysis for decisions that actually matter (finances, safety, big commitments). This lets the family feel lighter without losing its protective wisdom."
    };
  }
  if (ampPct > 0.25) {
    return {
      archetype: "The Enthusiastic Household",
      description: "Your family rallies behind each other with genuine excitement. Celebrations come naturally. The growth edge is following through on the enthusiasm.",
      deepDive: "Your family has strong Cheerleader energy — when someone has good news, everyone celebrates. When someone has an idea, the family gets excited. This is a rare and beautiful quality that many families lack. The opportunity: pair the enthusiasm with follow-through. When the family rallies behind someone's goal, assign a 'buddy' who checks in a week later. This turns momentary excitement into sustained support."
    };
  }
  if (condPct > 0.25) {
    return {
      archetype: "The Connected Household",
      description: "Your family stays in sync. Everyone knows what everyone else is doing. The growth edge is allowing individual space without losing connection.",
      deepDive: "Peacemaker energy dominates this family — someone (or multiple people) naturally keeps everyone connected, resolves tensions before they escalate, and maintains the family's emotional temperature. This is essential and often invisible labor. The opportunity: acknowledge it explicitly. The person doing this work needs to be seen and appreciated. Also: allow healthy conflict. Not every disagreement needs immediate resolution — sometimes people need space to feel their feelings before reconnecting."
    };
  }

  // Balanced or mixed
  const covered = RELAY_ORDER.filter(r => (roleCount[r] || 0) > 0).length;
  if (covered >= 4) {
    return {
      archetype: "The Balanced Household",
      description: "Your family has most energies represented. Dreams get dreamed, plans get made, and people stay connected.",
      deepDive: `With ${covered} of 5 energies present, your family has a naturally balanced circuit. Ideas flow from imagination through enthusiasm, get reality-checked, and turn into action — with someone keeping everyone connected along the way. The key to maintaining this: let each person do what they're naturally wired for. Don't ask The Rock to be The Dreamer, or The Protector to be The Cheerleader. When everyone operates in their natural energy at home, the family feels like a sanctuary rather than another place to perform.`
    };
  }

  return {
    archetype: "The Growing Household",
    description: "Your family is building its energy circuit. Understanding who naturally fills which role reduces the invisible load on everyone.",
    deepDive: `With ${covered} of 5 energies represented, your family has room to grow its circuit. The immediate opportunity: notice who is stretching into roles that don't come naturally. That person is probably exhausted in a way they can't articulate — because home is supposed to be where you can be yourself. Start by naming it: 'I notice you've been carrying the planning/dreaming/connecting for all of us. That's not your natural energy. How can we share that load?'`
  };
}

function analyzeFamilyEnergyFlow(members: FamilyMember[], roleCount: Record<string, number>, avgScores: Record<string, number>): { narrative: string; dominantQuadrant: string; underStress: string } {
  const totalEnergy = Object.values(avgScores).reduce((a, b) => a + b, 0);
  const ideation = totalEnergy > 0 ? ((avgScores.Spark || 0) + (avgScores.Amplifier || 0)) / totalEnergy : 0;
  const execution = totalEnergy > 0 ? ((avgScores.Filter || 0) + (avgScores.Ground || 0)) / totalEnergy : 0;

  let dominantQuadrant: string;
  if (ideation > 0.55) dominantQuadrant = "Dreaming";
  else if (execution > 0.55) dominantQuadrant = "Doing";
  else dominantQuadrant = "Balanced";

  const dreamers = members.filter(m => m.role === "Spark").map(m => m.name.split(" ")[0]);
  const protectors = members.filter(m => m.role === "Filter").map(m => m.name.split(" ")[0]);
  const rocks = members.filter(m => m.role === "Ground").map(m => m.name.split(" ")[0]);
  const cheerleaders = members.filter(m => m.role === "Amplifier").map(m => m.name.split(" ")[0]);
  const peacemakers = members.filter(m => m.role === "Conductor").map(m => m.name.split(" ")[0]);

  const missing = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 0);

  let narrative = "";
  if (dreamers.length > 0) narrative += `${dreamers.join(" and ")} bring${dreamers.length === 1 ? "s" : ""} the ideas and imagination. `;
  if (cheerleaders.length > 0) narrative += `${cheerleaders.join(" and ")} build${cheerleaders.length === 1 ? "s" : ""} excitement and rally the family. `;
  if (protectors.length > 0) narrative += `${protectors.join(" and ")} keep${protectors.length === 1 ? "s" : ""} everyone safe with thoughtful questions. `;
  if (rocks.length > 0) narrative += `${rocks.join(" and ")} make${rocks.length === 1 ? "s" : ""} sure things actually happen. `;
  if (peacemakers.length > 0) narrative += `${peacemakers.join(" and ")} keep${peacemakers.length === 1 ? "s" : ""} everyone connected and in sync. `;
  if (missing.length > 0) {
    const missingLabels = missing.map(r => FAMILY_ROLE_NAMES[r] || r);
    narrative += `The ${missingLabels.join(" and ")} ${missing.length === 1 ? "energy is" : "energies are"} currently absorbed by whoever is closest — that's where the family feels the most stretch.`;
  }

  let underStress = "When life gets stressful — deadlines, illness, financial pressure, transitions — every family defaults to its dominant energy. This is natural, not a flaw. ";
  if (dominantQuadrant === "Dreaming") {
    underStress += "Your family will lean into talking about possibilities when action is what's needed. The practical move: when stress rises, someone needs to say 'what's the ONE thing we do today?' This gives the Dreamers permission to pause without guilt, and gives the family a concrete next step.";
  } else if (dominantQuadrant === "Doing") {
    underStress += "Your family will go into 'fix it' mode — heads down, tasks assigned, problems solved. This is a strength. The practical move: before the sprint, take 5 minutes to check in emotionally. Sometimes what looks like a logistics problem is actually a feelings problem wearing a practical mask.";
  } else {
    underStress += "With balanced energy, your family can flex in either direction — talking it through or taking action. The practical move: name which mode you're in. 'Are we in feelings mode or fixing mode right now?' This prevents the family from splitting its attention between processing and problem-solving.";
  }

  return { narrative, dominantQuadrant, underStress };
}

function analyzeFamilyKeyPerson(members: FamilyMember[], roleCount: Record<string, number>): { person: string; analysis: string } {
  const singlePoints = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 1);
  const singleMembers = members.filter(m => singlePoints.includes(m.role));

  if (singleMembers.length === 0) {
    return {
      person: "Shared Load Across the Family",
      analysis: "No single person carries a unique energy alone. This means the family can absorb absences — when someone travels, is sick, or needs space — without losing a critical function. This is resilience."
    };
  }

  const riskPerson = singleMembers.sort((a, b) => b.score - a.score)[0];
  const familyLabel = FAMILY_ROLE_NAMES[riskPerson.role] || riskPerson.role;

  let analysis = `${riskPerson.name.split(" ")[0]} is the family's only natural ${familyLabel}. When they're unavailable — traveling, overwhelmed, or needing alone time — ${getFamilyMissingImpact(riskPerson.role)}. `;
  analysis += `At ${riskPerson.score}% strength, this is deeply wired. The family depends on this energy more than they realize. `;
  analysis += `Acknowledge it: 'We notice when you're not here. Thank you for what you carry.' That recognition alone reduces burnout.`;

  return { person: `${riskPerson.name} (${familyLabel})`, analysis };
}

function generateFamilyGrowthRecommendation(members: FamilyMember[], roleCount: Record<string, number>, missingRoles: string[]): { title: string; description: string } {
  if (missingRoles.length > 0) {
    const priority = missingRoles[0];
    const familyLabel = FAMILY_ROLE_NAMES[priority] || priority;
    const profiles: Record<string, string> = {
      Spark: "Your family is missing natural Dreamer energy. Without someone pushing for new experiences, growth, and 'what if?' conversations, the family can fall into comfortable routines that slowly calcify. Try: each week, someone different proposes one new thing the family hasn't tried.",
      Amplifier: "Your family is missing natural Cheerleader energy. Good news and achievements may not get the celebration they deserve. Try: create a 'wins' ritual — at dinner, everyone shares one thing that went well. This builds the rallying energy the family needs.",
      Filter: "Your family is missing natural Protector energy. Decisions might happen too fast without enough consideration. Try: before any big family decision, ask 'what could go wrong?' — not to kill the idea, but to strengthen it.",
      Ground: "Your family is missing natural Rock energy. Plans and ideas may float without landing. Try: assign a 'project owner' for family plans — one person who makes sure the vacation actually gets booked, the repair actually gets scheduled.",
      Conductor: "Your family is missing natural Peacemaker energy. People may drift apart without realizing it. Try: a weekly family sync — 10 minutes where everyone shares what's coming up and what they need. This keeps everyone connected without it feeling forced.",
    };
    return {
      title: `Grow Your ${familyLabel} Energy`,
      description: profiles[priority] || "This energy is being absorbed by others — naming it is the first step to sharing the load."
    };
  }

  const overRep = Object.entries(roleCount).filter(([_, c]) => c >= 3);
  if (overRep.length > 0) {
    const familyLabel = FAMILY_ROLE_NAMES[overRep[0][0]] || overRep[0][0];
    return {
      title: `Channel Your ${familyLabel} Abundance`,
      description: `Multiple family members share ${familyLabel} energy. This is strength — but it can also create competition or redundancy. Let each person express this energy in their own way. One Dreamer dreams about travel, another about home projects. Different domains, same energy.`
    };
  }

  return {
    title: "Protect What You Have",
    description: "Your family's energy circuit is complete. The key now: let each person operate in their natural energy at home. Don't ask The Rock to dream or The Dreamer to manage logistics. Home should be where you can be most yourself."
  };
}

interface FamilyFrictionPair {
  role1: string;
  role2: string;
  description: string;
  severity: "high" | "medium" | "low";
}

function identifyFamilyFriction(members: FamilyMember[]): FamilyFrictionPair[] {
  const pairs: FamilyFrictionPair[] = [];
  const roleCounts: Record<string, number> = {};
  members.forEach(m => { roleCounts[m.role] = (roleCounts[m.role] || 0) + 1; });

  // Spark vs Filter — the classic family tension
  if ((roleCounts["Spark"] || 0) > 0 && (roleCounts["Filter"] || 0) > 0) {
    pairs.push({
      role1: "Spark",
      role2: "Filter",
      description: "The Dreamer proposes, the Protector questions. This is healthy creative tension — but at home it can feel like rejection. The Dreamer needs space to dream without immediate critique. The Protector needs their concerns taken seriously.",
      severity: "medium"
    });
  }

  // Spark vs Ground — vision vs logistics
  if ((roleCounts["Spark"] || 0) > 0 && (roleCounts["Ground"] || 0) > 0 && (roleCounts["Amplifier"] || 0) === 0) {
    pairs.push({
      role1: "Spark",
      role2: "Ground",
      description: "The Dreamer imagines, the Rock immediately thinks about how. Without a Cheerleader bridging the gap, great family ideas die between vision and logistics. Try: let the dream breathe for 24 hours before planning begins.",
      severity: "high"
    });
  }

  // Multiple Sparks competing
  if ((roleCounts["Spark"] || 0) >= 2) {
    pairs.push({
      role1: "Spark",
      role2: "Spark",
      description: "Multiple Dreamers means constant new ideas competing for family attention. This can feel chaotic — especially for Rocks and Protectors who need stability. Try: take turns. One Dreamer's idea gets the spotlight this month.",
      severity: "medium"
    });
  }

  // Multiple Filters — over-scrutiny
  if ((roleCounts["Filter"] || 0) >= 2 && (roleCounts["Spark"] || 0) <= 1) {
    pairs.push({
      role1: "Filter",
      role2: "Filter",
      description: "Multiple Protectors means every idea gets scrutinized twice. This can feel like nothing is ever good enough. Create 'no-critique zones' — spaces where ideas are just celebrated, not analyzed.",
      severity: "medium"
    });
  }

  // No Conductor — disconnection risk
  if ((roleCounts["Conductor"] || 0) === 0 && members.length >= 3) {
    pairs.push({
      role1: "Conductor",
      role2: "Conductor",
      description: "No natural Peacemaker means scheduling, logistics, and keeping everyone connected falls on someone who isn't wired for it. This creates silent resentment. Try: a weekly family sync ritual to compensate.",
      severity: "high"
    });
  }

  // Ground without Spark — routine without growth
  if ((roleCounts["Ground"] || 0) >= 2 && (roleCounts["Spark"] || 0) === 0) {
    pairs.push({
      role1: "Ground",
      role2: "Ground",
      description: "Strong Rock energy without a Dreamer. The family runs smoothly but may lack excitement and growth. Schedule regular 'what if?' conversations to keep the energy fresh and prevent comfortable calcification.",
      severity: "medium"
    });
  }

  return pairs;
}

interface FamilyRecommendation {
  title: string;
  description: string;
  color: [number, number, number];
}

function generateFamilyRecommendations(members: FamilyMember[], roleCount: Record<string, number>, missingRoles: string[]): FamilyRecommendation[] {
  const recs: FamilyRecommendation[] = [];

  if (missingRoles.length > 0) {
    const familyLabel = FAMILY_ROLE_NAMES[missingRoles[0]] || missingRoles[0];
    const stretchers = getFamilyStretchCandidates(missingRoles[0], members);
    const stretchAdvice = stretchers.length > 0
      ? `${stretchers[0]} naturally absorbs some of this energy. Acknowledge it — and limit how long they carry it alone.`
      : `Nobody in the family has natural ${familyLabel} energy. This work is being forced — and home should be where you can be yourself.`;
    recs.push({
      title: `SHARE THE ${familyLabel.toUpperCase()} LOAD`,
      description: `${stretchAdvice} Create a family ritual that covers this energy collectively rather than burdening one person.`,
      color: AMBER,
    });
  }

  recs.push({
    title: "NAME EACH PERSON'S GIFT",
    description: "Say it out loud: 'You're our Dreamer. You're our Rock. You're our Protector.' When people are seen for who they naturally are — especially at home — stress drops and connection deepens.",
    color: GREEN,
  });

  recs.push({
    title: "CREATE A WEEKLY FAMILY SYNC",
    description: "10 minutes. Everyone shares: what's coming up, what they need, one thing they're grateful for. This simple ritual keeps the family connected without it feeling forced. Sunday dinner works perfectly.",
    color: GREEN,
  });

  recs.push({
    title: "STOP ASKING PEOPLE TO BE WHAT THEY'RE NOT",
    description: "Don't ask The Rock to be spontaneous. Don't ask The Dreamer to manage the calendar. Don't ask The Protector to 'just relax.' Home is where people should be most themselves. Let them.",
    color: GREEN,
  });

  const overRep = Object.entries(roleCount).filter(([_, c]) => c >= 2);
  if (overRep.length > 0) {
    const familyLabel = FAMILY_ROLE_NAMES[overRep[0][0]] || overRep[0][0];
    recs.push({
      title: `GIVE EACH ${familyLabel.toUpperCase()} THEIR OWN DOMAIN`,
      description: `Multiple family members share ${familyLabel} energy. Let each express it differently — one plans vacations, another plans meals. Same energy, different outlets. This prevents competition and honors everyone's contribution.`,
      color: GREEN,
    });
  } else {
    recs.push({
      title: "CELEBRATE THE INVISIBLE WORK",
      description: "Every family has someone doing work nobody notices — keeping the peace, managing logistics, asking the hard questions. Name it. Thank them. Invisible labor becomes resentment when it stays invisible.",
      color: GREEN,
    });
  }

  return recs.slice(0, 5);
}

function generateFamilyRituals(members: FamilyMember[], roleCount: Record<string, number>): string[] {
  const rituals: string[] = [];
  const present = RELAY_ORDER.filter(r => (roleCount[r] || 0) > 0);

  if (roleCount["Spark"] && roleCount["Ground"]) {
    rituals.push("Dream → Plan handoff: Let the Dreamer share ideas freely for 24 hours before the Rock starts planning logistics.");
  }
  if (roleCount["Spark"] && roleCount["Amplifier"]) {
    rituals.push("Dream → Rally: When someone has an idea, the Cheerleader gets first response — building excitement before analysis begins.");
  }
  if (roleCount["Filter"] && roleCount["Ground"]) {
    rituals.push("Check → Act: The Protector flags concerns, then the Rock builds the plan that addresses them. Efficient and safe.");
  }
  if (roleCount["Conductor"]) {
    rituals.push("Weekly sync: The Peacemaker leads a 10-minute family check-in — what's coming up, what's needed, what's appreciated.");
  }
  if (!roleCount["Conductor"]) {
    rituals.push("Compensate for missing Peacemaker: Rotate a weekly 'family connector' role — someone who checks in with everyone.");
  }

  rituals.push("Gratitude round: At one meal per week, each person names something another family member did that they noticed and appreciated.");

  if (rituals.length < 3) {
    rituals.push("Monthly adventure: One person picks something the family has never done together. Rotate who chooses.");
  }

  return rituals;
}

// ── Helper Functions ────────────────────────────────────────

const FAMILY_STRETCH_MAP: Record<string, string[]> = {
  Spark: ["Conductor", "Amplifier"],
  Amplifier: ["Spark", "Conductor"],
  Filter: ["Ground", "Conductor"],
  Ground: ["Filter", "Conductor"],
  Conductor: ["Amplifier", "Ground"],
};

function getFamilyStretchCandidates(missingRole: string, members: FamilyMember[]): string[] {
  const adjacentRoles = FAMILY_STRETCH_MAP[missingRole] || [];
  const candidates: string[] = [];
  for (const adjRole of adjacentRoles) {
    const stretchers = members.filter(m => m.role === adjRole && (m.scores[missingRole] || 0) >= 15);
    for (const s of stretchers) {
      const familyLabel = FAMILY_ROLE_NAMES[missingRole] || missingRole;
      candidates.push(`${s.name.split(" ")[0]} (${Math.round(s.scores[missingRole] || 0)}% ${familyLabel} energy)`);
    }
  }
  return candidates;
}

function getFamilyMissingImpact(role: string): string {
  const impacts: Record<string, string> = {
    Spark: "the family tends to repeat the same routines without exploring new possibilities",
    Amplifier: "good news doesn't get celebrated and achievements feel unacknowledged",
    Filter: "decisions happen too fast without enough consideration of what could go wrong",
    Ground: "plans float without landing — vacations don't get booked, repairs don't get scheduled",
    Conductor: "people drift apart without realizing it — everyone is busy but nobody is connected",
  };
  return impacts[role] || "the family feels the gap in ways they can't always articulate";
}

function getFamilyEnergyImpact(role: string, count: number, pct: number): string {
  if (count === 0) {
    const impacts: Record<string, string> = {
      Spark: "Others stretch to cover dreaming — adding this energy would free them.",
      Amplifier: "Achievements go uncelebrated — a natural Cheerleader would change this.",
      Filter: "Decisions happen without enough scrutiny — a Protector would add safety.",
      Ground: "Plans float without landing — a Rock would make things happen.",
      Conductor: "People drift apart — a Peacemaker would keep everyone connected.",
    };
    return impacts[role] || "This energy is covered collectively.";
  }
  if (count >= 3) return `Abundant — multiple people share this gift naturally.`;
  if (pct >= 30) return `Dominant energy — the family leads with this instinct.`;
  if (pct >= 15) return `Solid presence — this energy flows naturally at home.`;
  return `Present but could be strengthened with awareness.`;
}

function getFamilyMemberInsight(member: FamilyMember): { gift: string; need: string; connectionTip: string } {
  const insights: Record<string, { gift: string; need: string; connectionTip: string }> = {
    Spark: {
      gift: `${member.name.split(" ")[0]} brings imagination and possibility to the family. They're the one who says 'what if we...' and means it. At ${member.score}% strength, this is a deeply wired dreamer who keeps the family from calcifying into routine.`,
      need: `Space to dream without immediate critique or logistics. When ${member.name.split(" ")[0]} shares an idea, the first response should be curiosity ('tell me more') not analysis ('but how would we...'). They need to feel their imagination is valued, not tolerated.`,
      connectionTip: `Ask them: 'What are you imagining lately?' — and listen without planning. Their ideas are how they express love and hope for the family's future.`
    },
    Amplifier: {
      gift: `${member.name.split(" ")[0]} brings enthusiasm and celebration to the family. They rally everyone, notice achievements, and build excitement. At ${member.score}% strength, this is a natural cheerleader who keeps spirits high.`,
      need: `Reciprocal enthusiasm. ${member.name.split(" ")[0]} gives energy freely but needs it returned. When they share something they're excited about, match their energy — even briefly. They notice when the family doesn't celebrate back.`,
      connectionTip: `Celebrate them specifically: 'I love how you got everyone excited about that.' Their rallying is a gift — name it so they know it's seen.`
    },
    Filter: {
      gift: `${member.name.split(" ")[0]} protects the family by seeing what could go wrong before it does. Their questions aren't criticism — they're love expressed through caution. At ${member.score}% strength, this is a deeply wired protector.`,
      need: `To be heard without being dismissed as 'negative.' When ${member.name.split(" ")[0]} raises a concern, it comes from care. Say 'that's a good point' before moving on. They need to know their protective instinct is valued, not resented.`,
      connectionTip: `Ask them: 'What are you noticing that we might be missing?' — this honors their gift. They feel most connected when their vigilance is appreciated, not tolerated.`
    },
    Ground: {
      gift: `${member.name.split(" ")[0]} makes things happen. Bills get paid, plans get executed, promises get kept. At ${member.score}% strength, this is the family's anchor — the one who turns ideas into reality.`,
      need: `Acknowledgment for the invisible work. ${member.name.split(" ")[0]} carries logistics that nobody notices until they stop. Say 'thank you for handling that' — regularly. They also need permission to NOT be the responsible one sometimes.`,
      connectionTip: `Give them a break: 'I've got this one. You rest.' The Rock carries so much that being relieved of duty — even briefly — is the deepest form of love they can receive.`
    },
    Conductor: {
      gift: `${member.name.split(" ")[0]} keeps everyone connected. They notice when someone is drifting, mediate tensions before they escalate, and maintain the family's emotional temperature. At ${member.score}% strength, this is a natural peacemaker.`,
      need: `Permission to have their own feelings without managing everyone else's. ${member.name.split(" ")[0]} is so attuned to others that their own needs get buried. Ask them: 'How are YOU doing?' — and mean it. They need to be the one who's held sometimes.`,
      connectionTip: `Check in on them specifically — not about the family, about THEM. 'What do you need today?' The Peacemaker is so focused on others that being asked about themselves is profoundly connecting.`
    }
  };

  return insights[member.role] || {
    gift: `${member.name} contributes unique energy to the family.`,
    need: "To be seen and appreciated for who they naturally are.",
    connectionTip: "Ask them what they need — and listen without fixing."
  };
}

function calculateFamilyHealth(members: FamilyMember[]): { score: number; summary: string } {
  const roleCount: Record<string, number> = {};
  members.forEach(m => { roleCount[m.role] = (roleCount[m.role] || 0) + 1; });

  let score = 100;
  const insights: string[] = [];

  const missing = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 0);
  const covered = 5 - missing.length;
  score -= missing.length * 18;
  if (missing.length >= 3) insights.push(`${covered} of 5 energies present — family members stretch across ${missing.length} gaps`);
  else if (missing.length === 2) insights.push(`${covered} of 5 energies present — ${missing.map(r => FAMILY_ROLE_NAMES[r]).join(" and ")} work is absorbed by others`);
  else if (missing.length === 1) insights.push(`${covered} of 5 energies present — ${FAMILY_ROLE_NAMES[missing[0]]} work is shared`);

  if (missing.length === 0) {
    score = Math.min(100, score + 5);
    insights.push("Full energy coverage — every family function has a natural owner");
  }

  score = Math.max(0, Math.min(100, score));

  const summary = insights.length > 0
    ? insights.join(". ") + "."
    : "Family energy is well-distributed across all roles.";

  return { score, summary };
}
