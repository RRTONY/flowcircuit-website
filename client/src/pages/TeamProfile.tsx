import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useMemo, useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Zap, AlertTriangle, Download, Share2, ArrowRight, CheckCircle2, XCircle, Copy, Check, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

const RELAY_ORDER = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

const ROLE_COLORS: Record<string, string> = {
  Spark: "#facc15",
  Amplifier: "#f97316",
  Filter: "#60a5fa",
  Ground: "#22c55e",
  Conductor: "#a855f7",
};

const ROLE_BG_CLASS: Record<string, string> = {
  Spark: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  Amplifier: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  Filter: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  Ground: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  Conductor: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

const ROLE_ICONS: Record<string, string> = {
  Spark: "\u26a1",
  Amplifier: "\ud83d\udce1",
  Filter: "\ud83d\udd2c",
  Ground: "\u2693",
  Conductor: "\ud83c\udfbc",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Spark: "Generates the raw ideas and provocations that ignite the innovation cycle.",
  Amplifier: "Takes the Spark's raw idea and builds momentum, excitement, and coalition.",
  Filter: "Stress-tests ideas for feasibility, risk, and quality before they move forward.",
  Ground: "Converts refined ideas into executable plans, timelines, and deliverables.",
  Conductor: "Orchestrates the relay, ensuring each role hands off at the right moment.",
};

interface AssessmentData {
  id: number;
  guestName: string | null;
  guestEmail: string | null;
  role: string;
  score: number;
  scores: Record<string, number> | null;
  createdAt: string | Date;
}

interface AffiliateData extends AssessmentData {
  affiliationLabel: string;
}

function RadarChart({ avgScores, size = 280 }: { avgScores: Record<string, number>; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;
    const n = RELAY_ORDER.length;
    const startAngle = -Math.PI / 2;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (radius * ring) / 4;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = startAngle + (i % n) * ((2 * Math.PI) / n);
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(140,140,150,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw spokes
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * ((2 * Math.PI) / n);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
      ctx.strokeStyle = "rgba(140,140,150,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Normalize scores
    const total = RELAY_ORDER.reduce((s, r) => s + (avgScores[r] || 0), 0);
    const pcts: Record<string, number> = {};
    RELAY_ORDER.forEach(r => {
      pcts[r] = total > 0 ? ((avgScores[r] || 0) / total) * 100 : 20;
    });

    // Find min/max for scaling
    const vals = Object.values(pcts);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;

    // Draw data polygon
    const points: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const role = RELAY_ORDER[i];
      const normalized = 0.3 + 0.7 * ((pcts[role] - minVal) / range);
      const r = radius * normalized;
      const a = startAngle + i * ((2 * Math.PI) / n);
      points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }

    // Fill
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
    ctx.fill();

    // Stroke
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dots and labels
    for (let i = 0; i < n; i++) {
      const role = RELAY_ORDER[i];
      const color = ROLE_COLORS[role];
      const [px, py] = points[i];

      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      const a = startAngle + i * ((2 * Math.PI) / n);
      const labelR = radius + 28;
      const lx = cx + labelR * Math.cos(a);
      const ly = cy + labelR * Math.sin(a);

      ctx.fillStyle = color;
      ctx.font = "bold 13px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(role, lx, ly - 8);

      ctx.fillStyle = "rgba(210,210,215,0.8)";
      ctx.font = "11px Manrope, sans-serif";
      ctx.fillText(`${Math.round(pcts[role])}%`, lx, ly + 8);
    }
  }, [avgScores, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function MemberCard({ m, badge }: { m: AssessmentData; badge?: string }) {
  const scores = (m.scores || {}) as Record<string, number>;
  const total = Object.values(scores).reduce((s, v) => s + (v || 0), 0);
  const pct = total > 0 ? Math.round(((scores[m.role] || 0) / total) * 100) : 0;

  return (
    <div
      className={`p-4 rounded-xl border ${ROLE_BG_CLASS[m.role] || "bg-muted/10 border-border text-foreground"} relative`}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-foreground text-base">
            {m.guestName || "Anonymous"}
          </h3>
          <p className="text-sm opacity-80">
            {ROLE_ICONS[m.role]} {m.role}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display font-bold">{pct}%</span>
          <p className="text-xs opacity-60">purity</p>
        </div>
      </div>
      {/* Mini score bar */}
      <div className="flex gap-0.5 mt-2">
        {RELAY_ORDER.map(r => {
          const rPct = total > 0 ? ((scores[r] || 0) / total) * 100 : 20;
          return (
            <div
              key={r}
              className="h-1.5 rounded-full"
              style={{
                width: `${rPct}%`,
                backgroundColor: ROLE_COLORS[r],
                opacity: r === m.role ? 1 : 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function TeamProfile() {
  const params = useParams<{ domain: string }>();
  const domain = params.domain || "";
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const { data: teamData, isLoading } = trpc.assessment.teamWithAffiliates.useQuery(
    { domain },
    { enabled: !!domain }
  );

  const allMembers = useMemo(() => {
    if (!teamData) return [];
    const domain = teamData.domainMembers as AssessmentData[];
    const affiliates = (teamData.affiliates || []) as AffiliateData[];
    return [...domain, ...affiliates];
  }, [teamData]);

  const analysis = useMemo(() => {
    if (allMembers.length === 0) return null;

    const roleCounts: Record<string, number> = {};
    const roleScoreSums: Record<string, number> = {};
    const roleScoreCounts: Record<string, number> = {};

    RELAY_ORDER.forEach(r => {
      roleCounts[r] = 0;
      roleScoreSums[r] = 0;
      roleScoreCounts[r] = 0;
    });

    allMembers.forEach(m => {
      roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
      const scores = (m.scores || {}) as Record<string, number>;
      RELAY_ORDER.forEach(r => {
        if (scores[r]) {
          roleScoreSums[r] += scores[r];
          roleScoreCounts[r]++;
        }
      });
    });

    const avgScores: Record<string, number> = {};
    RELAY_ORDER.forEach(r => {
      avgScores[r] = roleScoreCounts[r] > 0 ? roleScoreSums[r] / roleScoreCounts[r] : 0;
    });

    const missingRoles = RELAY_ORDER.filter(r => roleCounts[r] === 0);
    const overloadedRoles = RELAY_ORDER.filter(r => roleCounts[r] >= 3);
    const dominantRole = RELAY_ORDER.reduce((a, b) => (roleCounts[a] > roleCounts[b] ? a : b));

    // Circuit health score
    const coverageScore = ((5 - missingRoles.length) / 5) * 40;
    const balanceScore = (() => {
      const ideal = allMembers.length / 5;
      const deviation = RELAY_ORDER.reduce((sum, r) => sum + Math.abs(roleCounts[r] - ideal), 0);
      const maxDeviation = allMembers.length * 2;
      return Math.max(0, (1 - deviation / maxDeviation) * 30);
    })();
    const sizeScore = Math.min(allMembers.length / 5, 1) * 30;
    const healthScore = Math.round(coverageScore + balanceScore + sizeScore);

    return {
      roleCounts,
      avgScores,
      missingRoles,
      overloadedRoles,
      dominantRole,
      healthScore,
      totalMembers: allMembers.length,
    };
  }, [allMembers]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const companyName = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);

  const domainMembers = (teamData?.domainMembers || []) as unknown as AssessmentData[];
  const affiliates = (teamData?.affiliates || []) as unknown as AffiliateData[];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-lg">Loading team data for {companyName}...</p>
        </div>
      </div>
    );
  }

  if (allMembers.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-card border-border">
          <CardContent className="p-8 text-center space-y-4">
            <Users className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-display font-bold text-foreground">No Team Data Yet</h2>
            <p className="text-muted-foreground">
              No assessments found for <strong>{domain}</strong>. Team members need to take the
              Flow Circuit assessment first.
            </p>
            <Button onClick={() => setLocation("/assessment")} className="mt-4">
              Take the Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  const healthColor =
    analysis.healthScore >= 70 ? "text-emerald-400" :
    analysis.healthScore >= 50 ? "text-amber-400" : "text-amber-500";

  const healthLabel =
    analysis.healthScore >= 70 ? "Flowing" :
    analysis.healthScore >= 50 ? "Building" : "Emerging";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background" />
        <div className="container relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Zap className="w-4 h-4" />
                Team Flow Circuit
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                {companyName}
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {analysis.totalMembers} team member{analysis.totalMembers !== 1 ? "s" : ""} assessed
                {affiliates.length > 0 ? ` (including ${affiliates.length} candidate${affiliates.length > 1 ? "s" : ""})` : ""}.
                {analysis.missingRoles.length > 0
                  ? ` ${5 - analysis.missingRoles.length} of 5 relay stages covered.`
                  : " All 5 relay stages covered."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Share Link"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocation("/assessment")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Join This Team
                </Button>
              </div>
            </div>

            {/* Circuit Health Score */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-36 h-36 rounded-full border-4 border-border flex items-center justify-center bg-card">
                <div className="text-center">
                  <span className={`text-4xl font-display font-bold ${healthColor}`}>
                    {analysis.healthScore}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Relay Readiness</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${healthColor}`}>{healthLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container max-w-5xl mx-auto px-4 space-y-8">
          {/* Energy Radar + Role Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">Team Energy Radar</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <RadarChart avgScores={analysis.avgScores} size={280} />
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">Role Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RELAY_ORDER.map(role => {
                  const count = analysis.roleCounts[role];
                  const pct = analysis.totalMembers > 0 ? (count / analysis.totalMembers) * 100 : 0;
                  const isMissing = count === 0;
                  const isOverloaded = count >= 3;

                  return (
                    <div key={role} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{ROLE_ICONS[role]}</span>
                          <span className={isMissing ? "text-red-400 line-through" : "text-foreground font-medium"}>
                            {role}
                          </span>
                          {isMissing && (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                              MISSING
                            </span>
                          )}
                          {isOverloaded && (
                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              OVERLOADED
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {count} member{count !== 1 ? "s" : ""} ({Math.round(pct)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor: isMissing ? "rgba(239,68,68,0.3)" : ROLE_COLORS[role],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Circuit Break Analysis */}
          {analysis.missingRoles.length > 0 && (
            <Card className="bg-red-500/5 border-red-500/20">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Circuit Break Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  The innovation relay requires all 5 roles to function. When a role is missing,
                  the baton drops and ideas stall. This team is missing{" "}
                  <strong className="text-red-400">
                    {analysis.missingRoles.join(" and ")}
                  </strong>
                  .
                </p>
                <div className="flex flex-wrap gap-2">
                  {RELAY_ORDER.map(role => {
                    const filled = analysis.roleCounts[role] > 0;
                    return (
                      <div
                        key={role}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                          filled
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {filled ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {role}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold text-foreground mb-2">What This Means</h4>
                  {analysis.missingRoles.map(role => (
                    <p key={role} className="text-muted-foreground text-sm mb-2 last:mb-0">
                      <strong style={{ color: ROLE_COLORS[role] }}>{ROLE_ICONS[role]} {role}:</strong>{" "}
                      {ROLE_DESCRIPTIONS[role]} Without this role, the team{" "}
                      {role === "Spark" && "has no source of new ideas — innovation dies at the starting line."}
                      {role === "Amplifier" && "can't build momentum — good ideas die in silence."}
                      {role === "Filter" && "ships untested ideas — quality suffers and trust erodes."}
                      {role === "Ground" && "can't execute — brilliant plans never become reality."}
                      {role === "Conductor" && "has no orchestrator — handoffs are chaotic and roles collide."}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Roster — Domain Members + Member Affiliates */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {domainMembers.map(m => (
                  <MemberCard key={m.id} m={m} />
                ))}
                {affiliates.filter(a => a.affiliationLabel === "member").map(a => (
                  <MemberCard key={a.id} m={a} badge={a.guestEmail?.split("@")[1] || "affiliate"} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Candidates Under Evaluation — only non-member affiliates */}
          {affiliates.filter(a => a.affiliationLabel !== "member").length > 0 && (
            <Card className="bg-cyan-500/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2 text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                  Candidates Under Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  These individuals have been assessed and are being evaluated for fit with the {companyName} team.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {affiliates.filter(a => a.affiliationLabel !== "member").map(a => (
                    <MemberCard key={a.id} m={a} badge={a.affiliationLabel} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-2xl font-display font-bold text-foreground">
                Strengthen This Circuit
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {analysis.missingRoles.length > 0
                  ? `This team needs ${analysis.missingRoles.join(" and ")} energy. Know someone who fits? Send them the assessment.`
                  : "All roles are covered. Invite more team members to deepen the data and unlock coaching insights."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => setLocation("/assessment")} size="lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Take the Assessment
                </Button>
                <Button variant="outline" size="lg" onClick={handleCopyLink}>
                  <Share2 className="w-5 h-5 mr-2" />
                  Share This Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
