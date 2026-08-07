"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import efficacyData from "@/lib/efficacyData.json";
import {
  BarChart3, Target, Shield, RefreshCw, Brain, ArrowRight,
  CheckCircle2, AlertTriangle, TrendingUp, Zap, FlaskConical
} from "lucide-react";

// --- Mini Bar Chart Component ---
function MiniBar({ label, value, max, color, suffix = "%" }: {
  label: string; value: number; max: number; color: string; suffix?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{value}{suffix}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// --- Role Distribution Chart ---
function RoleDistChart({ data, title, biased }: {
  data: Record<string, number>; title: string; biased?: boolean;
}) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors: Record<string, string> = {
    Spark: "#f59e0b", Amplifier: "#3b82f6", Filter: "#ef4444",
    Ground: "#22c55e", Conductor: "#a855f7"
  };
  const ideal = total / 5;
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{title}</h4>
      {Object.entries(data).sort(([,a],[,b]) => b - a).map(([role, count]) => {
        const pct = (count / total * 100).toFixed(1);
        const deviation = Math.abs(count - ideal) / ideal * 100;
        return (
          <div key={role} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colors[role] }} />
                {role}
              </span>
              <span className="font-mono">
                {pct}%
                {biased && deviation > 30 && (
                  <span className="text-red-400 ml-1 text-xs">
                    ({deviation > 0 ? "+" : ""}{((count - ideal) / ideal * 100).toFixed(0)}% bias)
                  </span>
                )}
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full"
                style={{ width: `${parseFloat(pct)}%`, backgroundColor: colors[role] }}
              />
              {/* Ideal line at 20% */}
              <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: "20%" }} />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground mt-1">
        White line = ideal 20% distribution
      </p>
    </div>
  );
}

export default function EfficacyReportClient() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const d = efficacyData;

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "accuracy", label: "Accuracy", icon: Target },
    { id: "reliability", label: "Reliability", icon: RefreshCw },
    { id: "faking", label: "Faking Resistance", icon: Shield },
    { id: "distribution", label: "Distribution", icon: Brain },
    { id: "methodology", label: "Methodology", icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-background to-blue-950/30" />
        <div className="container relative z-10 max-w-5xl">
          <Badge variant="outline" className="mb-4 border-emerald-500/50 text-emerald-400">
            <FlaskConical className="w-3 h-3 mr-1" /> Psychometric Validation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Does Deep Calibration{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Actually Work?
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            We ran 10,000 synthetic respondents through both assessment methods
            and measured everything. Here are the numbers. No spin, no marketing
            language, just data.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-3">
            Monte Carlo simulation with fixed seed (42) for reproducibility.
            Full methodology and limitations disclosed below.
          </p>
        </div>
      </section>

      {/* Navigation Pills */}
      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-5xl overflow-x-auto">
          <div className="flex gap-1 py-2">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  activeSection === s.id
                    ? "bg-emerald-500/20 text-emerald-400 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-12 space-y-16">

        {/* === OVERVIEW === */}
        {(activeSection === "overview" || activeSection === "all") && (
          <section id="overview" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              Executive Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Classification Accuracy",
                  before: `${d.classification_accuracy.likert}%`,
                  after: `${d.classification_accuracy.forced_rank}%`,
                  delta: `+${d.classification_accuracy.improvement}%`,
                  color: "#10b981",
                  icon: Target,
                },
                {
                  label: "Test-Retest Reliability",
                  before: `r=${d.test_retest_reliability.likert_avg_r}`,
                  after: `r=${d.test_retest_reliability.forced_avg_r}`,
                  delta: `+${(d.test_retest_reliability.forced_avg_r - d.test_retest_reliability.likert_avg_r).toFixed(3)}`,
                  color: "#3b82f6",
                  icon: RefreshCw,
                },
                {
                  label: "Role Distribution Bias",
                  before: "37% Spark-skewed",
                  after: "Near-equal (18-22%)",
                  delta: "Bias eliminated",
                  color: "#a855f7",
                  icon: Brain,
                },
                {
                  label: "Faking Resistance",
                  before: `${d.faking_resistance.likert_fake_success_rate}% fakeable`,
                  after: `${d.faking_resistance.forced_fake_success_rate}% fakeable`,
                  delta: "Minimal improvement",
                  color: "#ef4444",
                  icon: Shield,
                },
              ].map((kpi, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <kpi.icon className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground line-through">{kpi.before}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-bold text-lg" style={{ color: kpi.color }}>{kpi.after}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: kpi.color + "50", color: kpi.color }}
                      >
                        {kpi.delta}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-emerald-950/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-semibold text-emerald-400">Bottom Line (Simulated)</p>
                    <p className="text-muted-foreground leading-relaxed">
                      In our Monte Carlo simulation, the forced-ranking Deep Calibration method correctly
                      identifies a synthetic respondent's dominant role{" "}
                      <strong className="text-foreground">90% of the time</strong>, compared to just 50.9% for
                      the standard Likert assessment. It produces results that are{" "}
                      <strong className="text-foreground">67% more reliable</strong> on simulated retest, and
                      eliminates the social desirability bias that causes 37% of simulated Likert respondents
                      to be misclassified as Sparks. These are simulation results, not measurements from real
                      respondents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* === ACCURACY === */}
        {(activeSection === "accuracy" || activeSection === "all") && (
          <section id="accuracy" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              Classification Accuracy
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              We generated 10,000 synthetic respondents, each with a known "true"
              dominant role. Then we ran each respondent through both assessment
              methods and measured how often each method correctly identified
              the true dominant role.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Standard Assessment (Likert)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MiniBar label="Correct Classification" value={d.classification_accuracy.likert} max={100} color="#f59e0b" />
                  <MiniBar label="Avg Score Spread" value={d.differentiation.likert_avg_spread} max={100} color="#f59e0b" suffix="pp" />
                  <MiniBar label="Entropy" value={d.entropy.likert_avg} max={d.entropy.max_entropy} color="#f59e0b" suffix="" />
                  <p className="text-xs text-muted-foreground mt-2">
                    The Likert method has high spread (42pp) but low accuracy because
                    social desirability bias inflates "attractive" roles. The spread
                    is noise, not signal.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Deep Calibration (Forced-Rank)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MiniBar label="Correct Classification" value={d.classification_accuracy.forced_rank} max={100} color="#10b981" />
                  <MiniBar label="Avg Score Spread" value={d.differentiation.forced_avg_spread} max={100} color="#10b981" suffix="pp" />
                  <MiniBar label="Entropy" value={d.entropy.forced_avg} max={d.entropy.max_entropy} color="#10b981" suffix="" />
                  <p className="text-xs text-muted-foreground mt-2">
                    The forced-rank method has tighter spread (21.5pp) but dramatically
                    higher accuracy. The smaller spread is real differentiation, not
                    inflated by bias. Higher entropy means the distribution is more
                    balanced across roles.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-950/20 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-400">Why Likert Spread is Misleading</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-1">
                      A 42-point spread sounds like strong differentiation, but it's
                      driven by bias, not truth. When everyone inflates their Spark score,
                      the spread between Spark and Ground widens artificially. The forced-rank
                      method's 21.5-point spread is smaller but represents genuine behavioral
                      differences — the signal-to-noise ratio is dramatically higher.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* === RELIABILITY === */}
        {(activeSection === "reliability" || activeSection === "all") && (
          <section id="reliability" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-400" />
              Test-Retest Reliability
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              We simulated 2,000 people taking each assessment twice. The correlation
              between their first and second results measures reliability. In
              psychometrics, r &gt; 0.80 is considered "good" and r &gt; 0.90 is "excellent."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Likert Reliability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <span className="text-5xl font-bold text-amber-400 font-mono">
                      {d.test_retest_reliability.likert_avg_r}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">Average Pearson r</p>
                    <Badge variant="outline" className="mt-2 border-amber-500/50 text-amber-400">
                      Below acceptable threshold
                    </Badge>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      Median r = {d.test_retest_reliability.likert_median_r}. This means
                      if you take the standard assessment on Monday and again on Friday,
                      your results may differ substantially. The noise in the measurement
                      is almost as large as the signal.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-base">Deep Calibration Reliability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <span className="text-5xl font-bold text-blue-400 font-mono">
                      {d.test_retest_reliability.forced_avg_r}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">Average Pearson r</p>
                    <Badge variant="outline" className="mt-2 border-blue-500/50 text-blue-400">
                      Good reliability
                    </Badge>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      Median r = {d.test_retest_reliability.forced_median_r}. Your Monday
                      results and Friday results will be highly consistent. The forced-choice
                      format constrains random variation, producing stable profiles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/20 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Industry Benchmarks</h3>
              <div className="space-y-2">
                {[
                  { name: "CliftonStrengths (Gallup)", r: "0.84", type: "Forced-choice" },
                  { name: "Belbin Team Roles", r: "0.78", type: "Forced-choice" },
                  { name: "MBTI", r: "0.75", type: "Likert-type" },
                  { name: "Big Five (NEO-PI-R)", r: "0.86", type: "Likert" },
                  { name: "Flow Circuit Deep Calibration", r: String(d.test_retest_reliability.forced_avg_r), type: "Forced-rank", highlight: true },
                  { name: "Flow Circuit Standard", r: String(d.test_retest_reliability.likert_avg_r), type: "Likert-type" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${
                      b.highlight ? "bg-emerald-500/10 border border-emerald-500/30" : ""
                    }`}
                  >
                    <span className={b.highlight ? "font-semibold text-emerald-400" : "text-muted-foreground"}>
                      {b.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{b.type}</Badge>
                      <span className={`font-mono ${b.highlight ? "text-emerald-400 font-bold" : ""}`}>
                        r={b.r}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* === FAKING RESISTANCE === */}
        {(activeSection === "faking" || activeSection === "all") && (
          <section id="faking" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              Faking Resistance
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              We simulated 2,000 people who are truly Grounds but are deliberately
              trying to appear as Sparks (the most "attractive" role). This tests
              whether the assessment can be gamed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-red-950/20 border-red-500/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <Shield className="w-10 h-10 text-red-400 mx-auto" />
                  <div>
                    <span className="text-4xl font-bold text-red-400 font-mono">
                      {d.faking_resistance.likert_fake_success_rate}%
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Likert faking success rate
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nearly every faker successfully disguised themselves as a Spark.
                    The Likert format makes it trivially easy to select the "visionary"
                    answer every time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-amber-950/20 border-amber-500/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <Shield className="w-10 h-10 text-amber-400 mx-auto" />
                  <div>
                    <span className="text-4xl font-bold text-amber-400 font-mono">
                      {d.faking_resistance.forced_fake_success_rate}%
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Forced-rank faking success rate
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Still high — deliberate fakers can game forced-ranking too by
                    consistently placing Spark first. The improvement is marginal
                    because our simulation assumes perfect faking strategy.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-semibold">Honest Disclosure: Faking Remains Possible</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Both methods are vulnerable to deliberate faking. The real-world
                      advantage of forced-ranking is against <em>unconscious</em> bias —
                      the tendency to rate yourself higher on socially desirable traits
                      without realizing it. Against a determined faker with a clear strategy,
                      no self-report assessment is fully resistant. This is a known limitation
                      of all personality assessments, including CliftonStrengths, MBTI,
                      and the Big Five.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* === DISTRIBUTION === */}
        {(activeSection === "distribution" || activeSection === "all") && (
          <section id="distribution" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Role Distribution Analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              If both methods were perfectly accurate and the true population has
              equal role distribution, each role should appear at exactly 20%.
              Deviations reveal systematic bias in the measurement method.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Likert Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <RoleDistChart
                    data={d.role_distribution.likert}
                    title="Standard Assessment Results"
                    biased
                  />
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-base">Forced-Rank Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <RoleDistChart
                    data={d.role_distribution.forced}
                    title="Deep Calibration Results"
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-purple-950/20 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-semibold text-purple-400">The Spark Inflation Problem</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      In the Likert method, 37% of respondents are classified as Sparks —
                      nearly double the expected 20%. Meanwhile, Filters (4.7%) and Grounds
                      (6.9%) are dramatically underrepresented. This isn't because most
                      people are Sparks. It's because "I generate innovative ideas" sounds
                      better than "I identify flaws in other people's work." The forced-rank
                      method produces a distribution within 2% of the ideal for every role.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* === METHODOLOGY === */}
        {(activeSection === "methodology" || activeSection === "all") && (
          <section id="methodology" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-cyan-400" />
              Methodology and Limitations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Simulation Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Primary sample</span>
                    <span className="font-mono text-foreground">{d.simulation.n_respondents.toLocaleString()} respondents</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test-retest sample</span>
                    <span className="font-mono text-foreground">{d.simulation.n_retest.toLocaleString()} respondents</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Faking resistance sample</span>
                    <span className="font-mono text-foreground">{d.simulation.n_faking.toLocaleString()} respondents</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Random seed</span>
                    <span className="font-mono text-foreground">{d.simulation.seed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likert questions</span>
                    <span className="font-mono text-foreground">12 (5 options each)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forced-rank sets</span>
                    <span className="font-mono text-foreground">15 (4 statements each)</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Bias Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Social desirability bias coefficients applied to Likert simulation:</p>
                  <div className="space-y-1.5">
                    {[
                      { role: "Spark", bias: "+25%", note: "Innovation sounds impressive" },
                      { role: "Conductor", bias: "+20%", note: "Leadership is aspirational" },
                      { role: "Amplifier", bias: "+15%", note: "Connection is valued" },
                      { role: "Ground", bias: "-5%", note: "Execution feels mundane" },
                      { role: "Filter", bias: "-10%", note: "Criticism feels negative" },
                    ].map(b => (
                      <div key={b.role} className="flex justify-between items-center">
                        <span>{b.role}</span>
                        <span className="text-xs text-muted-foreground/60">{b.note}</span>
                        <span className={`font-mono ${b.bias.startsWith("+") ? "text-red-400" : "text-green-400"}`}>
                          {b.bias}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-2">
                    Forced-rank bias is reduced by 85% because ranking constrains
                    total available points.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-red-950/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-base text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Known Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">1. Synthetic data, not real respondents.</strong>{" "}
                  These results come from Monte Carlo simulation, not clinical trials.
                  The bias coefficients are estimates based on published research on
                  social desirability in personality assessments (Paulhus, 1984;
                  Christiansen et al., 2005), but real-world bias patterns may differ.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">2. Equal true distribution assumed.</strong>{" "}
                  We assumed each role is equally prevalent in the true population.
                  If some roles are genuinely more common, the distribution analysis
                  would need adjustment.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">3. Faking model is simplified.</strong>{" "}
                  Our faking simulation assumes a single, consistent strategy. Real
                  fakers may use more sophisticated approaches, or may only partially
                  fake, producing different results.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">4. No convergent validity testing.</strong>{" "}
                  We have not yet validated Flow Circuit roles against established
                  instruments (Belbin, CliftonStrengths, Big Five). This is planned
                  for the next phase of validation research.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">5. Completion time not modeled.</strong>{" "}
                  The forced-rank method takes longer (12-18 minutes vs 5-8 minutes),
                  which may increase drop-off rates. This tradeoff is not captured
                  in the accuracy metrics.
                </p>
              </CardContent>
            </Card>

            <div className="bg-muted/20 rounded-xl p-6">
              <h3 className="font-semibold mb-3">References</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Paulhus, D. L. (1984). Two-component models of socially desirable responding. <em>Journal of Personality and Social Psychology</em>, 46(3), 598-609.</p>
                <p>Christiansen, N. D., Burns, G. N., & Montgomery, G. E. (2005). Reconsidering forced-choice item formats for applicant personality assessment. <em>Human Performance</em>, 18(3), 267-307.</p>
                <p>Belbin, R. M. (2010). <em>Team Roles at Work</em> (2nd ed.). Butterworth-Heinemann.</p>
                <p>Scriven, M. (1991). <em>Evaluation Thesaurus</em> (4th ed.). Sage Publications.</p>
                <p>Kotler, S. (2014). <em>The Rise of Superman: Decoding the Science of Ultimate Human Performance</em>. New Harvest.</p>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center py-12 space-y-6">
          <Zap className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold">
            Ready to Get Your Calibrated Profile?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            The standard assessment gets you started. Deep Calibration
            tells you the truth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/assessment">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                Take the Assessment First
              </Button>
            </Link>
            <Link href="/deep-calibration">
              <Button size="lg" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                Go Straight to Deep Calibration
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
