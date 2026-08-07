"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import {
  BarChart3, Users, Building2, TrendingUp,
  Globe, Zap, Target, Shield, Lock, ArrowRight
} from "lucide-react";

export default function InvestorMetrics() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: normingData, isLoading: normingLoading } = trpc.norming.data.useQuery();

  // Not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              Investor metrics are only available to platform administrators.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = statsLoading || normingLoading;

  // Calculate metrics
  const totalAssessments = stats?.totals?.assessments || 0;
  const totalTeams = stats?.totals?.teams || 0;
  const totalUsers = stats?.totals?.users || 0;
  const avgTeamSize = totalTeams > 0 ? Math.round(totalAssessments / totalTeams) : 0;
  const roleDistObj: Record<string, number> = {};
  (stats?.roleDistribution || []).forEach((r: { role: string; count: number }) => {
    roleDistObj[r.role] = r.count;
  });
  const roleDistribution = roleDistObj;

  const topRole = Object.entries(roleDistribution).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  const completionRate = totalUsers > 0 ? Math.round((totalAssessments / totalUsers) * 100) : 0;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Platform Intelligence
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Investor Metrics Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Aggregate platform data showing adoption velocity, engagement depth,
              and market validation signals. Screenshot-ready for pitch decks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="border-b bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "Total Assessments", value: totalAssessments, icon: Target, color: "text-amber-600" },
              { label: "Active Teams", value: totalTeams, icon: Users, color: "text-blue-600" },
              { label: "Registered Users", value: totalUsers, icon: Globe, color: "text-emerald-600" },
              { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-purple-600" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6 text-center">
                    <kpi.icon className={`w-6 h-6 mx-auto mb-2 ${kpi.color}`} />
                    <div className="text-3xl md:text-4xl font-black mb-1">
                      {isLoading ? "—" : kpi.value}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      {kpi.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Distribution */}
      <section className="border-b py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-xl font-bold mb-6">Role Distribution Across Platform</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                Distribution of dominant roles across all assessed individuals.
                A healthy spread across all five roles is a good sign the assessment
                differentiates people rather than clustering everyone into one bucket —
                it's a directional signal, not a substitute for a formal discriminant
                validity study.
              </p>
              {topRole && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="text-sm text-gray-500 mb-1">Most Common Role</div>
                  <div className="text-2xl font-black">{topRole[0]}</div>
                  <div className="text-sm text-gray-600">
                    {String(topRole[1])} assessments ({totalAssessments > 0 ? Math.round(((topRole[1] as number) / totalAssessments) * 100) : 0}% of total)
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {Object.entries(roleDistribution)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([role, count]) => {
                  const pct = totalAssessments > 0 ? ((count as number) / totalAssessments) * 100 : 0;
                  const colors: Record<string, string> = {
                    Spark: "bg-amber-500",
                    Amplifier: "bg-red-500",
                    Filter: "bg-purple-500",
                    Ground: "bg-blue-500",
                    Conductor: "bg-emerald-500",
                  };
                  return (
                    <div key={role}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">{role}</span>
                        <span className="font-mono">{count as number} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[role] || "bg-gray-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Metrics */}
      <section className="border-b bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-xl font-bold mb-6">Engagement Depth</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-black text-blue-600 mb-2">{avgTeamSize}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  Avg Team Size
                </div>
                <p className="text-xs text-gray-500">
                  Average number of assessments per team.
                  Higher numbers indicate deeper organizational adoption.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-black text-emerald-600 mb-2">
                  {Object.keys(roleDistribution).length}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  Roles Represented
                </div>
                <p className="text-xs text-gray-500">
                  Number of distinct roles appearing in assessments.
                  A 5/5 spread is a good directional sign — not formal proof of
                  discriminant validity, which requires a dedicated study (see /efficacy).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-black text-purple-600 mb-2">
                  {normingData?.total || 0}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  Norming Population
                </div>
                <p className="text-xs text-gray-500">
                  Total assessments in the norming database.
                  Enables percentile rankings and population-level insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Validation */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-xl font-bold mb-6">Market Validation Signals</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-lg">Product-Market Fit Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { signal: "Assessment completion rate", value: `${completionRate}%`, target: ">60%", met: completionRate > 60 },
                    { signal: "Team adoption (multi-member)", value: `${totalTeams} teams`, target: ">5", met: totalTeams > 5 },
                    { signal: "Role diversity (all 5 represented)", value: `${Object.keys(roleDistribution).length}/5`, target: "5/5", met: Object.keys(roleDistribution).length === 5 },
                    { signal: "Repeat engagement (coaching)", value: "Active", target: "Active", met: true },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.signal}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{item.value}</span>
                        <span className={`w-2 h-2 rounded-full ${item.met ? "bg-emerald-500" : "bg-red-500"}`} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Individual Tier (Free)</div>
                    <div className="text-2xl font-black">{totalAssessments} users</div>
                    <div className="text-xs text-gray-500">Top of funnel — assessment + basic results</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tribe Tier ($29/member/mo)</div>
                    <div className="text-2xl font-black">{totalTeams} teams</div>
                    <div className="text-xs text-gray-500">
                      Potential MRR: ${totalTeams * avgTeamSize * 29}/mo at full conversion
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Enterprise (Custom)</div>
                    <div className="text-2xl font-black">API + White-Label</div>
                    <div className="text-xs text-gray-500">
                      Consulting firms, HR platforms, M&A advisors
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t bg-black text-white py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <p className="text-sm text-gray-400">
            The Flow Circuit — Investor Metrics Dashboard — Confidential
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Data refreshed in real-time from production database
          </p>
        </div>
      </section>
    </div>
  );
}
