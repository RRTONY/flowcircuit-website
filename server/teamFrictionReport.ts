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
const RED: [number, number, number] = [190, 50, 50];
const GREEN: [number, number, number] = [40, 140, 70];
const AMBER: [number, number, number] = [180, 130, 20];

const RELAY_ORDER = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

// ── Types ────────────────────────────────────────────────────
export interface TeamMember {
  name: string;
  role: string;
  score: number;
  scores: Record<string, number>;
}

export interface TeamFrictionData {
  teamName: string;
  domain: string;
  members: TeamMember[];
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
    doc.fillColor(rc).fontSize(7.5).font("Helvetica-Bold")
      .text(`${role} ${pctVal}%`, lx - 32, ly - 5, { width: 64, align: "center", lineBreak: false });
  }
}

function drawPageHeader(doc: PDFKit.PDFDocument, logo: Buffer | null, subtitle: string, teamName: string, PW: number, M: number, CW: number) {
  doc.rect(0, 0, PW, 4).fill(GREEN);
  const logoSize = 18;
  let hx = M;
  if (logo) {
    try { doc.image(logo, M, 12, { width: logoSize, height: logoSize }); hx = M + logoSize + 6; } catch { /* */ }
  }
  doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica")
    .text(`THE FLOW CIRCUIT  ·  ${subtitle}`, hx, 17, { width: CW * 0.6, characterSpacing: 1.2, lineBreak: false });
  doc.fillColor(TEXT_MUTED).fontSize(6.5).font("Helvetica")
    .text(teamName.toUpperCase(), M, 17, { width: CW, align: "right", lineBreak: false });
}

function drawPageFooter(doc: PDFKit.PDFDocument, page: number, totalPages: number, M: number, PH: number, CW: number) {
  doc.save();
  doc.fillColor(TEXT_MUTED).fontSize(5.5).font("Helvetica");
  doc.text(`flow.tonygreenberg.com  |  Page ${page} of ${totalPages}`, M, PH - 20, { width: CW, align: "center", lineBreak: false, height: 10 });
  doc.restore();
}

// ── Main Generator ───────────────────────────────────────────
export async function generateTeamFrictionPDF(data: TeamFrictionData): Promise<{ url: string; key: string }> {
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
  const health = calculateTeamHealth(data.members);
  const healthColor = health.score >= 70 ? GREEN : AMBER;
  const frictionPairs = identifyFrictionPairs(data.members);
  const teamDNA = analyzeTeamDNA(data.members, roleCount, roleAvgScores);
  const energyFlow = analyzeEnergyFlow(data.members, roleCount, roleAvgScores);
  const hiringRec = generateHiringRecommendation(data.members, roleCount, missingRoles);
  const keyPersonRisk = analyzeKeyPersonRisk(data.members, roleCount);

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: EXECUTIVE DASHBOARD
  // ═══════════════════════════════════════════════════════════
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "TEAM ENERGY MAP", data.teamName, PW, M, CW);

  let y = 38;

  // Title block
  doc.fillColor(TEXT_PRIMARY).fontSize(24).font("Helvetica-Bold")
    .text(data.teamName, M, y, { width: CW, lineBreak: false });
  y += 30;

  doc.fillColor(TEXT_SECONDARY).fontSize(9).font("Helvetica")
    .text(`${data.domain.toUpperCase()}  ·  ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}  ·  ${data.members.length} ASSESSED MEMBERS`, M, y, { width: CW, lineBreak: false });
  y += 18;

  // ── KPI Row ──
  const kpiW = (CW - 12) / 4;
  drawKPI(doc, M, y, kpiW, 46, `${health.score}`, "RELAY READINESS", healthColor);
  drawKPI(doc, M + kpiW + 4, y, kpiW, 46, `${5 - missingRoles.length}/5`, "STAGES COVERED", missingRoles.length === 0 ? GREEN : AMBER);
  drawKPI(doc, M + (kpiW + 4) * 2, y, kpiW, 46, `${frictionPairs.length}`, "HANDOFF GAPS", frictionPairs.length <= 1 ? GREEN : AMBER);
  drawKPI(doc, M + (kpiW + 4) * 3, y, kpiW, 46, energyFlow.dominantQuadrant, "TEAM ENERGY", AMBER);
  y += 54;

  // ── Innovation Relay Coverage ──
  drawPanel(doc, M, y, CW, 78, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("INNOVATION RELAY COVERAGE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

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

    doc.fillColor(hasMembers ? TEXT_SECONDARY : AMBER).fontSize(7).font("Helvetica")
      .text(role, nx, relayY + 34, { width: nodeW, align: "center", lineBreak: false });
  });
  y += 84;

  // ── Work Distribution Notice ──
  if (missingRoles.length > 0) {
    drawPanel(doc, M, y, CW, 48, [235, 228, 215]);
    doc.fillColor(AMBER).fontSize(8).font("Helvetica-Bold")
      .text(`CURRENT WORK DISTRIBUTION — ${missingRoles.length} ${missingRoles.length === 1 ? "STAGE" : "STAGES"} SHARED`, M + 12, y + 8, { width: CW - 24, characterSpacing: 0.5 });
    const gapAdvice = missingRoles.map(r => {
      const stretchers = getStretchCandidates(r, data.members);
      return stretchers.length > 0
        ? `${r}: ${stretchers.join(" or ")} naturally absorb${stretchers.length === 1 ? "s" : ""} this work today`
        : `${r}: being covered by the whole team — adding a natural ${r} would reduce everyone's load`;
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
    .text("TEAM ENERGY RADAR", M + 12, y + 8, { width: colW - 24, characterSpacing: 1 });
  drawRadarChart(doc, M + colW / 2, y + 105, 55, roleAvgScores);

  // Right: Roster
  drawPanel(doc, M + colW + 8, y, colW, 180, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("TEAM ROSTER", M + colW + 20, y + 8, { width: colW - 24, characterSpacing: 1 });

  const rosterX = M + colW + 20;
  let ry = y + 22;
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica-Bold")
    .text("NAME", rosterX, ry, { width: 110, lineBreak: false })
    .text("ROLE", rosterX + 110, ry, { width: 50, lineBreak: false })
    .text("STR", rosterX + 160, ry, { width: 30, lineBreak: false });
  drawDivider(doc, rosterX, ry + 9, colW - 24);
  ry += 12;

  data.members.forEach((member, i) => {
    if (i >= 8) return; // max 8 in sidebar
    const rc = ROLE_COLORS[member.role] || TEXT_MUTED;
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(member.name, rosterX, ry, { width: 110, lineBreak: false });
    doc.fillColor(rc).fontSize(7.5).font("Helvetica-Bold")
      .text(member.role, rosterX + 110, ry, { width: 50, lineBreak: false });
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

  // ── Team DNA Summary ──
  drawPanel(doc, M, y, CW, 60, PANEL_DARK);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("TEAM DNA PROFILE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
    .text(`"${teamDNA.archetype}"`, M + 12, y + 22, { width: CW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(teamDNA.description, M + 12, y + 36, { width: CW - 24, lineGap: 2, height: 20 });
  y += 66;

  // ── Energy Concentration Bar ──
  if (y + 50 < PH - 30) {
    drawPanel(doc, M, y, CW, 44, PANEL);
    doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
      .text("ENERGY CONCENTRATION", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

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
  // PAGE 2: ENERGY FLOW ANALYSIS
  // ═══════════════════════════════════════════════════════════
  doc.addPage({ size: [PW, PH], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "HOW YOUR TEAM FLOWS", data.teamName, PW, M, CW);

  y = 38;
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("How Work Moves Through Your Team", M, y, { width: CW, lineBreak: false });
  y += 24;

  // ── Energy Flow Narrative ──
  drawPanel(doc, M, y, CW, 50, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("THE RELAY TODAY", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(energyFlow.narrative, M + 12, y + 22, { width: CW - 24, lineGap: 2.5, height: 24 });
  y += 56;

  // ── Handoff Friction Matrix ──
  drawPanel(doc, M, y, CW, 18 + frictionPairs.length * 40, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("WHERE HANDOFFS HAPPEN", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  y += 22;

  if (frictionPairs.length === 0) {
    doc.fillColor(GREEN).fontSize(8).font("Helvetica")
      .text("No significant handoff gaps detected. The relay is flowing naturally.", M + 12, y, { width: CW - 24, lineBreak: false });
    y += 20;
  } else {
    frictionPairs.forEach((pair, i) => {
      const severity = pair.severity || "medium";
      const sevColor = severity === "high" ? AMBER : severity === "medium" ? [160, 140, 60] as [number, number, number] : GREEN;

      // Severity indicator
      doc.circle(M + 20, y + 10, 5).fill(sevColor);
      doc.fillColor(WHITE).fontSize(6).font("Helvetica-Bold")
        .text(severity === "high" ? "▶" : severity === "medium" ? "▷" : "✓", M + 16, y + 7, { width: 8, align: "center", lineBreak: false });

      doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
        .text(`${pair.role1} → ${pair.role2}`, M + 32, y + 4, { width: CW - 56, lineBreak: false });
      doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
        .text(pair.description, M + 32, y + 16, { width: CW - 56, lineGap: 2, height: 18 });

      if (i < frictionPairs.length - 1) drawDivider(doc, M + 12, y + 36, CW - 24);
      y += 40;
    });
  }
  y += 4;

  // ── Energy Surplus / Deficit Table ──
  drawPanel(doc, M, y, CW, 18 + RELAY_ORDER.length * 24, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("RELAY STAGE COVERAGE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

  const tableY = y + 22;
  // Header
  doc.fillColor(TEXT_MUTED).fontSize(6).font("Helvetica-Bold")
    .text("ROLE", M + 12, tableY, { width: 70, lineBreak: false })
    .text("HEADCOUNT", M + 82, tableY, { width: 60, lineBreak: false })
    .text("AVG ENERGY", M + 142, tableY, { width: 60, lineBreak: false })
    .text("STATUS", M + 210, tableY, { width: 60, lineBreak: false })
    .text("WHAT THIS MEANS", M + 280, tableY, { width: CW - 292, lineBreak: false });
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
    else if (cnt >= 3) { status = "DEEP BENCH"; statusColor = GREEN; }
    else if (pct >= 30) { status = "STRONG"; statusColor = GREEN; }
    else if (pct >= 15) { status = "ADEQUATE"; statusColor = GREEN; }
    else { status = "DEVELOPING"; statusColor = AMBER; }

    const impact = getEnergyImpact(role, cnt, pct);

    doc.rect(M + 12, ty - 1, 3, 16).fill(rc);
    doc.fillColor(rc).fontSize(7.5).font("Helvetica-Bold")
      .text(role, M + 20, ty + 2, { width: 60, lineBreak: false });
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(cnt === 0 ? "—" : String(cnt), M + 82, ty + 2, { width: 60, lineBreak: false });
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(`${pct}%`, M + 142, ty + 2, { width: 60, lineBreak: false });
    doc.fillColor(statusColor).fontSize(7).font("Helvetica-Bold")
      .text(status, M + 210, ty + 2, { width: 60, lineBreak: false });
    doc.fillColor(TEXT_SECONDARY).fontSize(7).font("Helvetica")
      .text(impact, M + 280, ty + 2, { width: CW - 292, lineBreak: false });

    if (i < RELAY_ORDER.length - 1) drawDivider(doc, M + 12, ty + 18, CW - 24);
  });
  y += 18 + RELAY_ORDER.length * 24 + 6;

  // ── Handoff Protocol ──
  const handoffs = generateHandoffProtocol(data.members, roleCount);
  drawPanel(doc, M, y, CW, 18 + handoffs.length * 16, PANEL_DARK);
  doc.fillColor(GREEN).fontSize(8).font("Helvetica-Bold")
    .text("HOW TO PASS THE BATON", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

  let hy = y + 24;
  handoffs.slice(0, 5).forEach((h, i) => {
    doc.fillColor(TEXT_PRIMARY).fontSize(7.5).font("Helvetica")
      .text(`${i + 1}.  ${h}`, M + 12, hy, { width: CW - 24, lineBreak: false });
    hy += 16;
  });
  y = hy + 6;

  // ── What Happens Under Pressure ──
  if (y + 70 < PH - 30) {
    drawPanel(doc, M, y, CW, 64, [235, 228, 215]);
    doc.fillColor(AMBER).fontSize(8).font("Helvetica-Bold")
      .text("UNDER PRESSURE: WHAT TO WATCH FOR", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(energyFlow.underPressure, M + 12, y + 22, { width: CW - 24, lineGap: 2.5, height: 36 });
    y += 70;
  }

  drawPageFooter(doc, 2, TOTAL_PAGES, M, PH, CW);

  // ═══════════════════════════════════════════════════════════
  // PAGE 3: TEAM DNA & STRATEGIC RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════
  doc.addPage({ size: [PW, PH], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "PATH TO FLOW", data.teamName, PW, M, CW);

  y = 38;
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("Your Team's Natural Pattern", M, y, { width: CW, lineBreak: false });
  y += 24;

  // ── Team Archetype Deep Dive ──
  drawPanel(doc, M, y, CW, 80, PANEL);
  doc.fillColor(TEXT_PRIMARY).fontSize(8).font("Helvetica-Bold")
    .text("TEAM ARCHETYPE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(12).font("Helvetica-Bold")
    .text(`"${teamDNA.archetype}"`, M + 12, y + 22, { width: CW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(teamDNA.deepDive, M + 12, y + 38, { width: CW - 24, lineGap: 2.5, height: 36 });
  y += 86;

  // ── Two-column: Key Person Risk + Hiring Rec ──
  const halfW = (CW - 8) / 2;

  // Left: Key Person Dependency
  drawPanel(doc, M, y, halfW, 110, [235, 228, 215]);
  doc.fillColor(AMBER).fontSize(8).font("Helvetica-Bold")
    .text("KEY PERSON DEPENDENCY", M + 12, y + 8, { width: halfW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text(keyPersonRisk.person, M + 12, y + 24, { width: halfW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(keyPersonRisk.analysis, M + 12, y + 38, { width: halfW - 24, lineGap: 2.5, height: 60 });

  // Right: Hiring Recommendation
  drawPanel(doc, M + halfW + 8, y, halfW, 110, [225, 240, 228]);
  doc.fillColor(GREEN).fontSize(8).font("Helvetica-Bold")
    .text("WHEN YOU'RE READY TO HIRE", M + halfW + 20, y + 8, { width: halfW - 24, characterSpacing: 1 });
  doc.fillColor(TEXT_PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text(hiringRec.title, M + halfW + 20, y + 24, { width: halfW - 24, lineBreak: false });
  doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
    .text(hiringRec.description, M + halfW + 20, y + 38, { width: halfW - 24, lineGap: 2.5, height: 60 });
  y += 116;

  // ── Optimization Recommendations ──
  doc.fillColor(TEXT_PRIMARY).fontSize(12).font("Helvetica-Bold")
    .text("Path to Less Friction", M, y, { width: CW, lineBreak: false });
  y += 18;

  const recommendations = generateRecommendations(data.members, roleCount, missingRoles);
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
  // PAGE 4: INDIVIDUAL DEEP-DIVES
  // ═══════════════════════════════════════════════════════════
  doc.addPage({ size: [PW, PH], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, PW, PH).fill(BG);
  drawPageHeader(doc, logo, "WHO DOES WHAT NATURALLY", data.teamName, PW, M, CW);  y = 38;
  doc.fillColor(TEXT_PRIMARY).fontSize(18).font("Helvetica-Bold")
    .text("Each Person's Natural Strength", M, y, { width: CW, lineBreak: false });
  y += 24;

  data.members.forEach((member, i) => {
    const cardH = 100;
    if (y + cardH > PH - 30) return;

    const rc = ROLE_COLORS[member.role] || TEXT_MUTED;
    const memberInsight = getIndividualInsight(member);

    drawPanel(doc, M, y, CW, cardH, PANEL);
    doc.rect(M, y, 4, cardH).fill(rc);

    // Name and role
    doc.fillColor(TEXT_PRIMARY).fontSize(10).font("Helvetica-Bold")
      .text(member.name, M + 14, y + 8, { width: CW - 100, lineBreak: false });
    doc.fillColor(rc).fontSize(9).font("Helvetica-Bold")
      .text(`${member.role}  ·  ${member.score}%`, M + CW - 100, y + 9, { width: 86, align: "right", lineBreak: false });

    // Two-column insight
    const insightColW = (CW - 28) / 2;

    // Left: Unique Contribution
    doc.fillColor(GREEN).fontSize(6.5).font("Helvetica-Bold")
      .text("WHAT THEY DO BEST", M + 14, y + 26, { width: insightColW, characterSpacing: 0.5 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(memberInsight.contribution, M + 14, y + 36, { width: insightColW - 8, lineGap: 2, height: 28 });

    // Right: Growth Edge
    doc.fillColor(AMBER).fontSize(6.5).font("Helvetica-Bold")
      .text("WHERE THEY GROW", M + 14 + insightColW, y + 26, { width: insightColW, characterSpacing: 0.5 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(memberInsight.blindSpot, M + 14 + insightColW, y + 36, { width: insightColW - 8, lineGap: 2, height: 28 });

    // Best handoff partner
    doc.fillColor(AMBER).fontSize(6.5).font("Helvetica-Bold")
      .text("NATURAL HANDOFF", M + 14, y + 68, { width: CW - 28, characterSpacing: 0.5 });
    doc.fillColor(TEXT_SECONDARY).fontSize(7.5).font("Helvetica")
      .text(memberInsight.bestPartner, M + 14, y + 78, { width: CW - 28, lineGap: 2, height: 16 });

    y += cardH + 6;
  });

  // ── 5 Roles Reference (if space) ──
  if (y + 56 < PH - 30) {
    drawPanel(doc, M, y, CW, 50, PANEL_ACCENT);
    doc.fillColor(TEXT_PRIMARY).fontSize(7).font("Helvetica-Bold")
      .text("THE 5 ROLES AT A GLANCE", M + 12, y + 8, { width: CW - 24, characterSpacing: 1 });

    const refColW = (CW - 24) / 5;
    RELAY_ORDER.forEach((role, i) => {
      const cx = M + 12 + i * refColW;
      const rc = ROLE_COLORS[role] || TEXT_MUTED;
      const cnt = roleCount[role] || 0;
      doc.fillColor(cnt > 0 ? rc : TEXT_MUTED).fontSize(7).font(cnt > 0 ? "Helvetica-Bold" : "Helvetica")
        .text(`${role.toUpperCase()} (${cnt})`, cx, y + 22, { width: refColW - 4, lineBreak: false });
      doc.fillColor(cnt > 0 ? TEXT_SECONDARY : TEXT_MUTED).fontSize(6).font("Helvetica")
        .text(getRoleVerb(role), cx, y + 32, { width: refColW - 4, lineBreak: false });
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
  const fileKey = `reports/team-friction-${safeDomain}-${timestamp}.pdf`;

  const { url, key } = await storagePut(fileKey, pdfBuffer, "application/pdf");
  return { url, key };
}

// ══════════════════════════════════════════════════════════════
// ANALYTICAL ENGINES
// ══════════════════════════════════════════════════════════════

function analyzeTeamDNA(members: TeamMember[], roleCount: Record<string, number>, avgScores: Record<string, number>): { archetype: string; description: string; deepDive: string } {
  const totalEnergy = Object.values(avgScores).reduce((a, b) => a + b, 0);
  const sparkPct = totalEnergy > 0 ? (avgScores.Spark || 0) / totalEnergy : 0;
  const filterPct = totalEnergy > 0 ? (avgScores.Filter || 0) / totalEnergy : 0;
  const groundPct = totalEnergy > 0 ? (avgScores.Ground || 0) / totalEnergy : 0;
  const ampPct = totalEnergy > 0 ? (avgScores.Amplifier || 0) / totalEnergy : 0;
  const condPct = totalEnergy > 0 ? (avgScores.Conductor || 0) / totalEnergy : 0;

  if (sparkPct > 0.3 && groundPct < 0.15) {
    return {
      archetype: "The Visionary Engine",
      description: "This team generates ideas at a prodigious rate. High creative voltage — adding execution capacity would unlock the full relay.",
      deepDive: "Your team's energy signature is heavily front-loaded in the innovation relay. Ideas flow freely, and that creative abundance is a genuine asset. The opportunity is structural: adding a Ground operator who naturally takes the baton and ships would free your Sparks to do what they do best without the stress of finishing. Until then, whoever carries the most Ground energy can take short execution sprints to keep ideas moving."
    };
  }
  if (groundPct > 0.3 && sparkPct < 0.15) {
    return {
      archetype: "The Execution Machine",
      description: "This team ships relentlessly. High throughput — adding creative direction would ensure the right things get built.",
      deepDive: "Your team's energy concentrates at the end of the relay — execution. You ship fast and reliably, which is a rare strength. The opportunity: adding Spark energy would ensure the team is building the most impactful thing, not just the next thing. Until then, schedule a 'what if?' session before each sprint — even 15 minutes of divergent thinking can redirect execution toward higher-impact work."
    };
  }
  if (filterPct > 0.3) {
    return {
      archetype: "The Quality Fortress",
      description: "This team stress-tests everything. Nothing ships without scrutiny — a strength when sequenced after ideation.",
      deepDive: "Your team's dominant energy is Filter — the stress-testing, quality-control function. This means nothing ships without rigorous examination, which prevents costly mistakes. The opportunity: sequence your process so ideas breathe through Spark and Amplifier phases before engaging the Filters. This lets creative energy build momentum before it meets scrutiny — and gives your Filters better raw material to work with."
    };
  }
  if (ampPct > 0.25) {
    return {
      archetype: "The Momentum Builder",
      description: "This team excels at building coalition and translating vision into action. Strong middle relay, needs bookends.",
      deepDive: "Your team has strong Amplifier energy — the ability to take raw ideas and build organizational momentum behind them. This is rare and valuable. The opportunity: pair your Amplifiers with a Spark for raw material and a Filter for quality control. With those bookends, the team's natural momentum-building becomes a superpower rather than undirected enthusiasm."
    };
  }
  if (condPct > 0.25) {
    return {
      archetype: "The Orchestrated System",
      description: "This team manages handoffs well but may lack raw creative power. The relay runs smoothly — when there is something to relay.",
      deepDive: "Conductor energy dominates this team, which means the relay mechanics are well-managed. Handoffs happen on time, energy flows are monitored, and bottlenecks get addressed quickly. The opportunity: adding Spark energy would give this well-orchestrated system transformative ideas to process. Your Conductor infrastructure is ready — it just needs bolder raw material to work with."
    };
  }

  // Balanced or mixed
  const covered = RELAY_ORDER.filter(r => (roleCount[r] || 0) > 0).length;
  if (covered >= 4) {
    return {
      archetype: "The Complete Circuit",
      description: "This team covers most of the innovation relay. Energy flows through multiple stages with minimal dead zones.",
      deepDive: `With ${covered} of 5 roles covered, your team has a nearly complete innovation circuit. Ideas can flow from conception through execution with handoffs at each stage. The key to maintaining this advantage: keep each person in their natural lane and make handoff protocols explicit. When people operate in their natural energy, stress drops and flow increases — protect this by checking in regularly on role drift.`
    };
  }

  return {
    archetype: "The Emerging Circuit",
    description: "This team is building its innovation relay. Filling key roles will reduce the stretch on existing members.",
    deepDive: `With ${covered} of 5 roles covered, your team is building its innovation relay. The immediate opportunity: identify which missing roles matter most for your current objectives, and either recruit or develop team members to fill those gaps. In the meantime, the work distribution section shows who can stretch into adjacent roles for short sprints — keeping the load manageable while you grow.`
  };
}

function analyzeEnergyFlow(members: TeamMember[], roleCount: Record<string, number>, avgScores: Record<string, number>): { narrative: string; dominantQuadrant: string; underPressure: string } {
  const totalEnergy = Object.values(avgScores).reduce((a, b) => a + b, 0);
  const ideation = totalEnergy > 0 ? ((avgScores.Spark || 0) + (avgScores.Amplifier || 0)) / totalEnergy : 0;
  const execution = totalEnergy > 0 ? ((avgScores.Filter || 0) + (avgScores.Ground || 0)) / totalEnergy : 0;

  let dominantQuadrant: string;
  if (ideation > 0.55) dominantQuadrant = "Ideation";
  else if (execution > 0.55) dominantQuadrant = "Execution";
  else dominantQuadrant = "Balanced";

  const sparkNames = members.filter(m => m.role === "Spark").map(m => m.name.split(" ")[0]);
  const filterNames = members.filter(m => m.role === "Filter").map(m => m.name.split(" ")[0]);
  const groundNames = members.filter(m => m.role === "Ground").map(m => m.name.split(" ")[0]);
  const ampNames = members.filter(m => m.role === "Amplifier").map(m => m.name.split(" ")[0]);
  const condNames = members.filter(m => m.role === "Conductor").map(m => m.name.split(" ")[0]);

  const missing = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 0);

  let narrative = "";
  if (sparkNames.length > 0) narrative += `${sparkNames.join(" and ")} generate${sparkNames.length === 1 ? "s" : ""} the raw ideas. `;
  if (ampNames.length > 0) narrative += `${ampNames.join(" and ")} build${ampNames.length === 1 ? "s" : ""} momentum behind them. `;
  if (filterNames.length > 0) narrative += `${filterNames.join(" and ")} stress-test${filterNames.length === 1 ? "s" : ""} for viability. `;
  if (groundNames.length > 0) narrative += `${groundNames.join(" and ")} turn${groundNames.length === 1 ? "s" : ""} plans into shipped reality. `;
  if (condNames.length > 0) narrative += `${condNames.join(" and ")} orchestrate${condNames.length === 1 ? "s" : ""} the handoffs. `;
  if (missing.length > 0) narrative += `The ${missing.join(" and ")} ${missing.length === 1 ? "stage is" : "stages are"} currently covered by whoever is closest — that is where the team feels the most stretch.`;

  let underPressure = "Under deadline pressure, every team defaults to its dominant energy — this is natural, not a flaw. ";
  if (dominantQuadrant === "Ideation") {
    underPressure += "Your team will lean into brainstorming when execution is what's needed. The practical move: when pressure rises, lock scope and explicitly hand the baton to whoever carries the most Ground energy. This gives Sparks permission to step back without guilt.";
  } else if (dominantQuadrant === "Execution") {
    underPressure += "Your team will go heads-down and ship fast — which is a strength. The practical move: before each pressure sprint, spend 15 minutes asking 'are we solving the right problem?' This small pause prevents building the wrong thing at high speed.";
  } else {
    underPressure += "With balanced energy, your team can flex in either direction — which is rare. The practical move: designate a 'mode' for each sprint (ideation or execution) and let the appropriate energy lead. This prevents the team from splitting its attention.";
  }

  return { narrative, dominantQuadrant, underPressure };
}

function analyzeKeyPersonRisk(members: TeamMember[], roleCount: Record<string, number>): { person: string; analysis: string } {
  // Find roles with only 1 person — they carry unique energy
  const singlePoints = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 1);
  const singleMembers = members.filter(m => singlePoints.includes(m.role));

  if (singleMembers.length === 0) {
    return {
      person: "Good Redundancy Across Roles",
      analysis: "All occupied roles have more than one person, which means the team can absorb absences without losing a relay stage. Focus on filling any missing roles to complete the circuit."
    };
  }

  // Highest-scoring single point is the most critical dependency
  const riskPerson = singleMembers.sort((a, b) => b.score - a.score)[0];
  const otherSingles = singleMembers.filter(m => m.name !== riskPerson.name);

  let analysis = `${riskPerson.name.split(" ")[0]} is the team's only natural ${riskPerson.role}. If they're unavailable, ${getMissingRoleImpact(riskPerson.role)}. `;
  analysis += `At ${riskPerson.score}% strength, this is deeply wired energy — consider cross-training a teammate or adding a second ${riskPerson.role} over time. `;
  if (otherSingles.length > 0) {
    analysis += `Also sole owners of their stage: ${otherSingles.map(m => `${m.name.split(" ")[0]} (${m.role})`).join(", ")}.`;
  }

  return { person: `${riskPerson.name} (${riskPerson.role})`, analysis };
}

function generateHiringRecommendation(members: TeamMember[], roleCount: Record<string, number>, missingRoles: string[]): { title: string; description: string } {
  if (missingRoles.length > 0) {
    const priority = missingRoles[0];
    const profiles: Record<string, string> = {
      Spark: "Someone who asks 'what if?' more than 'how?' — a pattern-breaker who energizes rooms. Adding this person frees your team from forcing innovation from people wired to execute. Interview signal: they reframe your questions before answering them.",
      Amplifier: "Someone who translates complex ideas into simple stories that make people lean forward. Adding this person gives good ideas the momentum they deserve. Interview signal: after they explain something, you want to tell someone else about it.",
      Filter: "Someone who finds the flaw in every plan — not to kill it, but to strengthen it. Adding this person gives the team a natural quality gate. Interview signal: they ask the question nobody else thought to ask.",
      Ground: "Someone who turns ambiguity into action items. Adding this person gives plans a natural path to reality. Interview signal: their first response to a problem is 'here is what I would do by Friday.'",
      Conductor: "Someone who notices when the wrong person is doing the wrong task. Adding this person gives the relay a natural flow manager. Interview signal: they ask about your team dynamics before asking about the role."
    };
    return {
      title: `When You're Ready: Add a ${priority}`,
      description: profiles[priority] || "This hire reduces stress by giving the relay a natural owner for this stage."
    };
  }

  // All roles covered — look for balance
  const overRep = Object.entries(roleCount).filter(([_, c]) => c >= 3);
  if (overRep.length > 0) {
    const weakest = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 1).sort((a, b) => (roleCount[a] || 0) - (roleCount[b] || 0))[0];
    if (weakest) {
      return {
        title: `Add a second ${weakest}`,
        description: `Your ${weakest} role has only one person — a single point of failure. Adding a second ${weakest} creates redundancy and allows the existing ${weakest} to specialize deeper. Meanwhile, your ${overRep[0][0]} role has ${overRep[0][1]} people — consider whether one could develop adjacent skills.`
      };
    }
  }

  return {
    title: "Strengthen the Weakest Link",
    description: "Your relay is complete. The next hire should reinforce whichever role has the lowest average energy score, or add redundancy to single-person roles to reduce key-person risk."
  };
}

interface FrictionPair {
  role1: string;
  role2: string;
  description: string;
  severity: "high" | "medium" | "low";
}

function identifyFrictionPairs(members: TeamMember[]): FrictionPair[] {
  const pairs: FrictionPair[] = [];
  const roleCounts: Record<string, number> = {};
  members.forEach(m => { roleCounts[m.role] = (roleCounts[m.role] || 0) + 1; });

  const missing = RELAY_ORDER.filter(r => (roleCounts[r] || 0) === 0);

  // Missing adjacent roles create handoff gaps
  for (let i = 0; i < RELAY_ORDER.length - 1; i++) {
    const from = RELAY_ORDER[i];
    const to = RELAY_ORDER[i + 1];
    if ((roleCounts[from] || 0) > 0 && (roleCounts[to] || 0) === 0) {
      pairs.push({
        role1: from,
        role2: to,
        description: `${from} energy is present but ${to} has no natural owner — someone else absorbs this work. ${getMissingRoleImpact(to).charAt(0).toUpperCase() + getMissingRoleImpact(to).slice(1)}.`,
        severity: "high"
      });
    }
  }

  if ((roleCounts["Spark"] || 0) > 0 && (roleCounts["Ground"] || 0) > 0 && (roleCounts["Filter"] || 0) === 0) {
    pairs.push({
      role1: "Spark",
      role2: "Ground",
      description: "Without a natural Filter, ideas move from Spark directly to Ground execution. The team moves fast but may need to build in a review step to catch issues early.",
      severity: "high"
    });
  }

  if ((roleCounts["Spark"] || 0) >= 2) {
    pairs.push({
      role1: "Spark",
      role2: "Spark",
      description: "Multiple Sparks bring creative abundance — channel this by assigning one Spark per initiative cycle so ideas get full development before the next one starts.",
      severity: "medium"
    });
  }

  if ((roleCounts["Filter"] || 0) >= 2 && (roleCounts["Spark"] || 0) <= 1) {
    pairs.push({
      role1: "Filter",
      role2: "Filter",
      description: "Strong Filter energy with limited Spark input means ideas face rigorous scrutiny early. Consider letting ideas breathe through an Amplifier phase before engaging the Filters.",
      severity: "medium"
    });
  }

  if ((roleCounts["Ground"] || 0) >= 2 && (roleCounts["Spark"] || 0) === 0) {
    pairs.push({
      role1: "Ground",
      role2: "Ground",
      description: "Strong execution energy without a natural Spark. The team ships reliably — adding a Spark would ensure they're building the most impactful thing, not just the next thing.",
      severity: "medium"
    });
  }

  return pairs;
}

interface Recommendation {
  title: string;
  description: string;
  color: [number, number, number];
}

function generateRecommendations(members: TeamMember[], roleCount: Record<string, number>, missingRoles: string[]): Recommendation[] {
  const recs: Recommendation[] = [];

  // First: how to spread the work with who you have
  if (missingRoles.length > 0) {
    const stretchers = getStretchCandidates(missingRoles[0], members);
    const stretchAdvice = stretchers.length > 0
      ? `For now, ${stretchers[0]} can cover short ${missingRoles[0]} sprints. Limit to 2-week rotations to prevent burnout.`
      : `No one on the team has natural ${missingRoles[0]} energy. This work is being forced — the team feels it as stress.`;
    recs.push({
      title: `SPREAD THE ${missingRoles[0].toUpperCase()} WORK`,
      description: `${stretchAdvice} Long-term: invite someone who naturally fills this role to take the assessment.`,
      color: AMBER,
    });
  }

  if (missingRoles.length > 1) {
    const stretchers2 = getStretchCandidates(missingRoles[1], members);
    const stretchAdvice2 = stretchers2.length > 0
      ? `${stretchers2[0]} can stretch into ${missingRoles[1]} temporarily.`
      : `Nobody has natural ${missingRoles[1]} energy — this gap creates the most friction.`;
    recs.push({
      title: `COVER THE ${missingRoles[1].toUpperCase()} GAP`,
      description: `${stretchAdvice2} When people work against their nature for too long, stress compounds. Prioritize filling this seat.`,
      color: AMBER,
    });
  }

  // Practical flow improvements
  recs.push({
    title: "PAIR PEOPLE TO THEIR NATURAL HANDOFFS",
    description: "Each person should know who they receive from and who they pass to. When the relay is explicit, nobody wastes energy guessing what to do next. Less ambiguity = less stress.",
    color: GREEN,
  });

  recs.push({
    title: "THE 2-MINUTE RELAY CHECK (DAILY)",
    description: "At each standup, every member answers: 'What did I receive? What am I passing?' This surfaces stuck energy before it becomes a bottleneck. It takes 2 minutes and prevents 2-hour meetings.",
    color: GREEN,
  });

  const overRep = Object.entries(roleCount).filter(([_, c]) => c >= 3);
  if (overRep.length > 0) {
    recs.push({
      title: `LET ONE ${overRep[0][0].toUpperCase()} DEVELOP ADJACENT SKILLS`,
      description: `${overRep[0][1]} people share ${overRep[0][0]} energy. That is strength in depth, but one could grow into an adjacent role — reducing overlap and filling a gap naturally.`,
      color: GREEN,
    });
  } else if (members.length >= 4) {
    recs.push({
      title: "PROTECT PEOPLE FROM ROLE DRIFT",
      description: "When someone operates outside their natural energy for more than 2 weeks, cortisol rises and flow drops. Check in: 'Are you doing work that energizes you or drains you?'",
      color: GREEN,
    });
  }

  return recs.slice(0, 5);
}

function generateHandoffProtocol(members: TeamMember[], roleCount: Record<string, number>): string[] {
  const protocol: string[] = [];
  const present = RELAY_ORDER.filter(r => (roleCount[r] || 0) > 0);

  for (let i = 0; i < present.length - 1; i++) {
    const from = present[i];
    const to = present[i + 1];
    protocol.push(`${from} hands to ${to}: ${getHandoffInstruction(from, to)}`);
  }

  if (protocol.length === 0) {
    protocol.push("Complete the relay by inviting members for each role.");
  }

  return protocol;
}

function getHandoffInstruction(from: string, to: string): string {
  const instructions: Record<string, string> = {
    "Spark-Amplifier": "Pass the raw idea with context. Amplifier translates for the team.",
    "Amplifier-Filter": "Pass the momentum-tested concept. Filter stress-tests for viability.",
    "Filter-Ground": "Pass the vetted, refined plan. Ground executes with clear specs.",
    "Ground-Conductor": "Pass the shipped result. Conductor orchestrates the next cycle.",
    "Spark-Filter": "Skip the Amplifier? Expect resistance. Frame ideas as hypotheses.",
    "Spark-Ground": "Dangerous skip. Ground will execute an untested idea. Add specs.",
    "Amplifier-Ground": "Skip the Filter? Move fast but accept higher failure rate.",
    "Filter-Conductor": "Skip the Ground? Conductor must find an executor externally.",
  };
  return instructions[`${from}-${to}`] || "Establish a clear handoff artifact (doc, spec, or brief).";
}

// Adjacent roles that can stretch into a missing role for short sprints
const STRETCH_MAP: Record<string, string[]> = {
  Spark: ["Conductor", "Amplifier"],
  Amplifier: ["Spark", "Conductor"],
  Filter: ["Ground", "Conductor"],
  Ground: ["Filter", "Conductor"],
  Conductor: ["Amplifier", "Ground"],
};

function getStretchCandidates(missingRole: string, members: TeamMember[]): string[] {
  const adjacentRoles = STRETCH_MAP[missingRole] || [];
  const candidates: string[] = [];
  for (const adjRole of adjacentRoles) {
    const stretchers = members.filter(m => m.role === adjRole && (m.scores[missingRole] || 0) >= 15);
    for (const s of stretchers) {
      candidates.push(`${s.name.split(" ")[0]} (${s.role}, ${Math.round(s.scores[missingRole] || 0)}% ${missingRole} energy)`);
    }
  }
  return candidates;
}

function getMissingRoleImpact(role: string): string {
  const impacts: Record<string, string> = {
    Spark: "the team tends to optimize what already exists rather than exploring new directions",
    Amplifier: "good ideas need more effort to gain traction because nobody naturally translates vision into momentum",
    Filter: "ideas move to execution without enough stress-testing, which creates rework downstream",
    Ground: "plans take longer to become reality because nobody naturally owns the execution sprint",
    Conductor: "energy gets scattered because nobody naturally manages the handoff sequence",
  };
  return impacts[role] || "the relay requires extra coordination at this stage";
}

function getEnergyImpact(role: string, count: number, pct: number): string {
  if (count === 0) {
    const impacts: Record<string, string> = {
      Spark: "Others stretch to cover ideation — adding a natural Spark would free them.",
      Amplifier: "Ideas need extra effort to gain traction — a natural Amplifier would ease this.",
      Filter: "Quality checks happen informally — a natural Filter would make this effortless.",
      Ground: "Execution requires extra coordination — a natural Ground would own delivery.",
      Conductor: "Handoffs happen ad-hoc — a natural Conductor would smooth the flow.",
    };
    return impacts[role] || "This stage is covered by the team collectively.";
  }
  if (count >= 3) return `Strong bench depth — one could develop adjacent skills to add range.`;
  if (pct >= 30) return `Dominant energy — this team leads with ${role} instincts.`;
  if (pct >= 15) return `Solid coverage — relay flows naturally here.`;
  return `Present but could be strengthened with development or a hire.`;
}

function getIndividualInsight(member: TeamMember): { contribution: string; blindSpot: string; bestPartner: string } {
  const insights: Record<string, { contribution: string; blindSpot: string; bestPartner: string }> = {
    Spark: {
      contribution: `${member.name.split(" ")[0]} generates the raw material for innovation — novel connections that others cannot see. At ${member.score}% strength, this is a deeply wired pattern-breaker who should be deployed at project kickoffs and pivot points.`,
      blindSpot: `Naturally moves on to the next idea before the current one matures. The team benefits when ${member.name.split(" ")[0]} hands the baton to an Amplifier early — this frees them to do what they do best.`,
      bestPartner: `Pair with an Amplifier who can translate raw vision into language the team rallies behind. Without this partner, ideas stay trapped in ${member.name.split(" ")[0]}'s head.`
    },
    Amplifier: {
      contribution: `${member.name.split(" ")[0]} translates vision into team momentum — the bridge between a Spark's raw idea and the team's willingness to act. At ${member.score}% strength, this is a natural coalition builder.`,
      blindSpot: `Brings equal energy to every idea, which means a Filter partner helps focus that enthusiasm on the highest-impact initiatives.`,
      bestPartner: `Pair with a Spark for raw material and a Filter for quality control. ${member.name.split(" ")[0]} is most effective in the middle of the relay, not at either end.`
    },
    Filter: {
      contribution: `${member.name.split(" ")[0]} stress-tests ideas for viability and separates signal from noise. At ${member.score}% strength, this is a rigorous analytical mind that prevents costly mistakes.`,
      blindSpot: `Naturally applies rigor early — which is powerful at the right stage. The team flows best when ${member.name.split(" ")[0]} holds analysis until ideas have been through the Amplifier phase.`,
      bestPartner: `Pair with a Ground operator who can take ${member.name.split(" ")[0]}'s vetted, refined plans and turn them into shipped reality. The Filter-Ground handoff is the most efficient in the relay.`
    },
    Ground: {
      contribution: `${member.name.split(" ")[0]} turns refined plans into shipped reality — the execution engine of the team. At ${member.score}% strength, this is someone who converts ambiguity into action items and delivers.`,
      blindSpot: `Naturally wants to start building immediately — which is a strength in sprints. The team flows best when ${member.name.split(" ")[0]} receives vetted specs from a Filter before diving in.`,
      bestPartner: `Pair with a Filter who provides clear, vetted specs. ${member.name.split(" ")[0]} is most effective when receiving well-defined handoffs, not ambiguous direction.`
    },
    Conductor: {
      contribution: `${member.name.split(" ")[0]} manages the energy flow between all roles — the orchestrator who ensures the relay runs smoothly. At ${member.score}% strength, this is a natural systems thinker.`,
      blindSpot: `Naturally wants to coordinate everything — which is essential at handoff points. The team flows best when ${member.name.split(" ")[0]} trusts each role to operate autonomously between handoffs.`,
      bestPartner: `Works with everyone, but most critical pairing is with the Spark — ensuring creative energy is channeled into the relay rather than dissipated across too many initiatives.`
    }
  };

  return insights[member.role] || {
    contribution: `${member.name} contributes to the team's innovation circuit as a ${member.role}.`,
    blindSpot: "Individual blind spots should be explored through the personal Flow Circuit report.",
    bestPartner: "Review the handoff protocol for optimal pairing recommendations."
  };
}

function getMemberContribution(role: string): string {
  const contributions: Record<string, string> = {
    Spark: "Generates novel ideas and breaks patterns. Best deployed at project kickoffs and pivot points.",
    Amplifier: "Translates vision into team momentum. Best deployed after ideation phases to build coalition.",
    Filter: "Stress-tests ideas for viability and separates signal from noise. Best deployed before commitments.",
    Ground: "Turns refined plans into shipped reality. Best deployed during execution sprints with clear specs.",
    Conductor: "Manages energy flow between all roles. Best deployed throughout the full innovation cycle.",
  };
  return contributions[role] || "Contributes to the team's innovation circuit.";
}

function calculateTeamHealth(members: TeamMember[]): { score: number; summary: string } {
  const roleCount: Record<string, number> = {};
  members.forEach(m => { roleCount[m.role] = (roleCount[m.role] || 0) + 1; });

  let score = 100;
  const insights: string[] = [];

  const missing = RELAY_ORDER.filter(r => (roleCount[r] || 0) === 0);
  const covered = 5 - missing.length;
  // Proportional: each missing role costs 18 points
  // 0 missing = 100, 1 missing = 82, 2 missing = 64, 3 missing = 46
  score -= missing.length * 18;
  if (missing.length >= 3) insights.push(`${covered} of 5 relay stages covered — existing members stretch across ${missing.length} gaps. Filling even one would noticeably reduce the load`);
  else if (missing.length === 2) insights.push(`${covered} of 5 stages covered — ${missing.join(" and ")} work is absorbed by adjacent roles. Adding either would free up energy`);
  else if (missing.length === 1) insights.push(`${covered} of 5 stages covered — ${missing[0]} work is distributed across the team until that seat is filled`);

  Object.entries(roleCount).forEach(([role, count]) => {
    if (count >= 3) {
      score -= (count - 2) * 6;
      insights.push(`${role} has ${count} people — strong bench depth. One could develop adjacent skills to add range`);
    }
  });

  if (missing.length === 0) {
    score = Math.min(100, score + 5);
    insights.push("Full relay coverage — every stage has a natural owner");
  }

  score = Math.max(0, Math.min(100, score));

  const summary = insights.length > 0
    ? insights.join(". ") + "."
    : "Team energy is well-distributed across all roles.";

  return { score, summary };
}

function getRoleVerb(role: string): string {
  const verbs: Record<string, string> = {
    Spark: "Ignite", Amplifier: "Amplify", Filter: "Refine", Ground: "Execute", Conductor: "Orchestrate",
  };
  return verbs[role] || "";
}

function getRoleDesc(role: string): string {
  const descs: Record<string, string> = {
    Spark: "Generates novel ideas and breaks patterns",
    Amplifier: "Translates vision into team momentum",
    Filter: "Stress-tests ideas and separates signal from noise",
    Ground: "Turns refined plans into shipped reality",
    Conductor: "Manages the energy flow between all roles",
  };
  return descs[role] || "";
}
