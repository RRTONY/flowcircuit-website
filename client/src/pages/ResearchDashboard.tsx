import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Legend
} from "recharts";
import {
  FlaskConical, Users, BarChart3, Shield, TrendingUp,
  Activity, Zap, Radio, Anchor, ArrowLeft, Database, Target
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  Spark: "#f59e0b",
  Amplifier: "#ef4444",
  Filter: "#8b5cf6",
  Ground: "#2563eb",
  Conductor: "#10b981",
};

const ROLE_ICONS: Record<string, any> = {
  Spark: Zap,
  Amplifier: Activity,
  Filter: Shield,
  Ground: Anchor,
  Conductor: Radio,
};

// Monte Carlo simulation benchmarks (from efficacy report)
const BENCHMARKS = {
  likertAccuracy: 50.9,
  forcedRankAccuracy: 90.0,
  likertReliability: 0.518,
  forcedRankReliability: 0.865,
  likertSparkInflation: 37,
  forcedRankSparkInflation: 0,
};

export default function ResearchDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.assessment.researchStats.useQuery();

  const roleData = useMemo(() => {
    if (!stats?.roleDistribution) return [];
    return Object.entries(stats.roleDistribution).map(([role, count]) => ({
      role,
      count,
      fill: ROLE_COLORS[role] || "#94a3b8",
    }));
  }, [stats]);

  const domainData = useMemo(() => {
    if (!stats?.domainDistribution) return [];
    return Object.entries(stats.domainDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));
  }, [stats]);

  // Calculate live accuracy metrics from real data
  const liveMetrics = useMemo(() => {
    if (!stats?.researchScores || stats.researchScores.length === 0) return null;

    const n = stats.researchScores.length;
    const roleFrequencies: Record<string, number> = {};
    let totalScoreSpread = 0;

    for (const s of stats.researchScores) {
      roleFrequencies[s.role] = (roleFrequencies[s.role] || 0) + 1;
      if (s.scores && typeof s.scores === "object") {
        const vals = Object.values(s.scores as Record<string, number>);
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        totalScoreSpread += max - min;
      }
    }

    const avgSpread = totalScoreSpread / n;
    const entropy = Object.values(roleFrequencies).reduce((sum, freq) => {
      const p = freq / n;
      return sum - (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    const maxEntropy = Math.log2(5); // 5 roles
    const normalizedEntropy = entropy / maxEntropy;

    // Spark inflation rate (% assigned Spark)
    const sparkRate = ((roleFrequencies["Spark"] || 0) / n) * 100;
    const expectedRate = 20; // uniform distribution
    const sparkInflation = Math.max(0, sparkRate - expectedRate);

    return {
      sampleSize: n,
      avgSpread: avgSpread.toFixed(1),
      entropy: normalizedEntropy.toFixed(3),
      sparkRate: sparkRate.toFixed(1),
      sparkInflation: sparkInflation.toFixed(1),
      roleFrequencies,
    };
  }, [stats]);

  // Score distribution for scatter plot
  const scatterData = useMemo(() => {
    if (!stats?.researchScores) return [];
    return stats.researchScores
      .filter((s: any) => s.scores && typeof s.scores === "object")
      .map((s: any, i: number) => {
        const scores = s.scores as Record<string, number>;
        return {
          id: i,
          role: s.role,
          score: s.score,
          spark: scores.Spark || 0,
          ground: scores.Ground || 0,
          fill: ROLE_COLORS[s.role] || "#94a3b8",
        };
      });
  }, [stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <FlaskConical className="w-12 h-12 text-sky-500 animate-pulse mx-auto" />
          <p className="text-gray-500 font-medium">Loading research data...</p>
        </div>
      </div>
    );
  }

  const hasData = stats && stats.researchOptIns > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => setLocation("/efficacy")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Efficacy Report
          </button>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <FlaskConical className="w-7 h-7 text-sky-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Live Research Dashboard
              </h1>
              <p className="text-gray-500 mt-1 max-w-2xl" style={{ textWrap: 'pretty' as any }}>
                Real-time validation data from opted-in participants. Comparing theoretical Monte Carlo
                predictions against actual respondent behavior.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Assessments</span>
              </div>
              <p className="text-4xl font-black">{stats?.totalAssessments ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-sky-500" />
                <span className="text-xs text-sky-600 uppercase tracking-wider font-bold">Research Opt-Ins</span>
              </div>
              <p className="text-4xl font-black text-sky-600">{stats?.researchOptIns ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats && stats.totalAssessments > 0
                  ? `${((stats.researchOptIns / stats.totalAssessments) * 100).toFixed(1)}% opt-in rate`
                  : "No data yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 uppercase tracking-wider font-bold">Deep Calibrated</span>
              </div>
              <p className="text-4xl font-black text-emerald-600">{stats?.calibratedCount ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                Forced-rank validated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-600 uppercase tracking-wider font-bold">Unique Domains</span>
              </div>
              <p className="text-4xl font-black text-amber-600">
                {stats?.domainDistribution ? Object.keys(stats.domainDistribution).length : 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Organizations represented
              </p>
            </CardContent>
          </Card>
        </div>

        {!hasData ? (
          /* Empty state */
          <Card>
            <CardContent className="py-16 text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Waiting for Research Data</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ textWrap: 'pretty' as any }}>
                No participants have opted into the research study yet. Once people complete the assessment
                and opt in, their anonymized data will appear here in real time.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setLocation("/assessment")} className="bg-black text-white hover:bg-gray-800">
                  Take the Assessment
                </Button>
                <Button onClick={() => setLocation("/efficacy")} variant="outline">
                  View Simulation Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Simulation vs Reality Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-600" />
                  Simulation vs. Reality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-6">
                  Comparing Monte Carlo predictions (10,000 synthetic respondents) against live participant data.
                  The closer the real numbers match predictions, the stronger the validation.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Spark Inflation */}
                  <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-600">Spark Inflation Rate</h4>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Predicted (Likert)</p>
                        <p className="text-2xl font-black text-amber-500">{BENCHMARKS.likertSparkInflation}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Observed (Live)</p>
                        <p className="text-2xl font-black text-sky-600">
                          {liveMetrics ? `${liveMetrics.sparkInflation}%` : "—"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {liveMetrics && Number(liveMetrics.sparkInflation) > 25
                        ? "Confirms Spark inflation bias in Likert-based assessment."
                        : liveMetrics && Number(liveMetrics.sparkInflation) < 10
                        ? "Lower than predicted — sample may be self-aware or domain-specific."
                        : "Collecting more data for statistical significance."}
                    </p>
                  </div>

                  {/* Score Spread */}
                  <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-600">Role Differentiation</h4>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Entropy (normalized)</p>
                        <p className="text-2xl font-black text-purple-600">
                          {liveMetrics ? liveMetrics.entropy : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Avg Score Spread</p>
                        <p className="text-2xl font-black text-purple-600">
                          {liveMetrics ? liveMetrics.avgSpread : "—"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Entropy of 1.0 = perfectly uniform distribution. Values below 0.85 suggest
                      clustering around certain roles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Role Distribution (Research Participants)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={roleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="role" tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
                          formatter={(value: number) => [`${value} participants`, "Count"]}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {roleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      No role data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Role Pie (Research Pool)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={roleData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="role"
                          label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                        >
                          {roleData.map((entry, index) => (
                            <Cell key={`pie-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value}`, "Participants"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      No data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Spark vs Ground Scatter */}
            {scatterData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Spark vs. Ground Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Each dot is an anonymized participant. The Spark-Ground axis reveals the primary
                    tension in team dynamics — visionaries vs. executors.
                  </p>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        dataKey="spark"
                        name="Spark Score"
                        tick={{ fontSize: 11 }}
                        label={{ value: "Spark Score", position: "bottom", fontSize: 12 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="ground"
                        name="Ground Score"
                        tick={{ fontSize: 11 }}
                        label={{ value: "Ground Score", angle: -90, position: "left", fontSize: 12 }}
                      />
                      <ZAxis range={[40, 200]} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
                        formatter={(value: number, name: string) => [value, name]}
                      />
                      <Legend />
                      {Object.keys(ROLE_COLORS).map((role) => (
                        <Scatter
                          key={role}
                          name={role}
                          data={scatterData.filter((d) => d.role === role)}
                          fill={ROLE_COLORS[role]}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Domain Distribution */}
            {domainData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Top Organizations (by domain)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {domainData.map((d, i) => (
                      <div key={d.domain} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 w-6">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{d.domain}</span>
                            <span className="text-xs text-gray-500">{d.count} participants</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(d.count / (domainData[0]?.count || 1)) * 100}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full bg-sky-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Methodology Note */}
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="py-6">
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Methodology Note</h4>
                <p className="text-sm text-gray-600 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                  All data on this dashboard is anonymized. No names, emails, or personally identifiable
                  information is displayed or stored in the research dataset. Role scores and distributions
                  are aggregated from participants who explicitly opted in to the research study. The Monte Carlo
                  benchmarks were generated from 10,000 synthetic respondents using the same scoring algorithm.
                  Statistical significance requires a minimum of n=30 for role distribution comparisons and
                  n=100 for reliability estimates. Current sample: n={stats?.researchOptIns ?? 0}.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
          <Button
            onClick={() => setLocation("/assessment")}
            className="bg-black text-white hover:bg-gray-800 font-bold py-5 px-8"
          >
            Take the Assessment
          </Button>
          <Button
            onClick={() => setLocation("/deep-calibration")}
            variant="outline"
            className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold py-5 px-8"
          >
            <Shield className="mr-2 w-4 h-4" />
            Deep Calibration
          </Button>
          <Button
            onClick={() => setLocation("/efficacy")}
            variant="outline"
            className="font-bold py-5 px-8"
          >
            View Efficacy Report
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
          <p>Flow Circuit Research Validation Dashboard</p>
          <p className="mt-1">&copy; 2000-2026 Tony Greenberg and RampRate. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
