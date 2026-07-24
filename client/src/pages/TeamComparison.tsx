import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, GitCompare, AlertTriangle, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";

const ROLE_COLORS: Record<string, string> = {
  Spark: "#f59e0b",
  Amplifier: "#3b82f6",
  Filter: "#8b5cf6",
  Ground: "#10b981",
  Conductor: "#ef4444",
};

const ROLE_ICONS: Record<string, string> = {
  Spark: "⚡",
  Amplifier: "📡",
  Filter: "🔬",
  Ground: "🪨",
  Conductor: "🎯",
};

export default function TeamComparison() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: myTeams, isLoading: teamsLoading } = trpc.team.myTeams.useQuery(undefined, {
    enabled: !!user,
  });

  const [team1Id, setTeam1Id] = useState<number | null>(null);
  const [team2Id, setTeam2Id] = useState<number | null>(null);

  const { data: comparison, isLoading: comparisonLoading } = trpc.teamComparison.compare.useQuery(
    { teamId1: team1Id!, teamId2: team2Id! },
    { enabled: !!team1Id && !!team2Id }
  );

  if (authLoading || teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <GitCompare className="w-16 h-16 text-gray-300 mx-auto" />
          <h1 className="text-2xl font-bold">Login Required</h1>
          <p className="text-muted-foreground">Sign in to compare teams.</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const teams = myTeams || [];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <GitCompare className="w-8 h-8" />
              Team Comparison
            </h1>
            <p className="text-muted-foreground mt-1">
              Side-by-side Flow Circuit analysis — see where teams align and where they clash
            </p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* Team Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Team A</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teams found. Create a team first.</p>
              ) : (
                <div className="space-y-2">
                  {teams.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => setTeam1Id(t.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        team1Id === t.id
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <p className="font-bold">{t.name}</p>
                      {t.companyName && <p className="text-xs opacity-70">{t.companyName}</p>}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Team B</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teams found. Create a team first.</p>
              ) : (
                <div className="space-y-2">
                  {teams.filter((t: any) => t.id !== team1Id).map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => setTeam2Id(t.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        team2Id === t.id
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <p className="font-bold">{t.name}</p>
                      {t.companyName && <p className="text-xs opacity-70">{t.companyName}</p>}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {comparisonLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {comparison && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {[comparison.team1, comparison.team2].map((team: any, idx: number) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{team.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {team.memberCount} members
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">
                        Average alignment: <span className="font-bold">{team.averageScore}%</span>
                      </span>
                    </div>

                    {/* Role Breakdown Bars */}
                    <div className="space-y-2">
                      {team.roleBreakdown.map((r: any) => (
                        <div key={r.role} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold">
                              {ROLE_ICONS[r.role]} {r.role}
                            </span>
                            <span className="text-muted-foreground">
                              {r.count} ({r.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${r.percentage}%`,
                                backgroundColor: ROLE_COLORS[r.role] || "#6b7280",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Missing Roles Warning */}
                    {team.missingRoles.length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="font-bold text-amber-800">Missing Roles</p>
                          <p className="text-amber-700">
                            No {team.missingRoles.join(", ")} energy detected. This team may struggle with{" "}
                            {team.missingRoles.includes("Spark") && "generating new ideas, "}
                            {team.missingRoles.includes("Amplifier") && "building momentum, "}
                            {team.missingRoles.includes("Filter") && "quality control, "}
                            {team.missingRoles.includes("Ground") && "execution and follow-through, "}
                            {team.missingRoles.includes("Conductor") && "coordination and alignment, "}
                            creating stress for those forced to cover the gap.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Head-to-Head Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Head-to-Head Energy Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Spark', 'Amplifier', 'Filter', 'Ground', 'Conductor'].map((role) => {
                    const t1 = comparison.team1.roleBreakdown.find((r: any) => r.role === role);
                    const t2 = comparison.team2.roleBreakdown.find((r: any) => r.role === role);
                    const t1Pct = t1?.percentage || 0;
                    const t2Pct = t2?.percentage || 0;
                    const diff = t1Pct - t2Pct;

                    return (
                      <div key={role} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold w-24">
                            {ROLE_ICONS[role]} {role}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            {/* Team A bar (right-aligned) */}
                            <div className="flex-1 flex justify-end">
                              <div
                                className="h-6 rounded-l-md flex items-center justify-end px-2 text-xs font-bold text-white transition-all duration-700"
                                style={{
                                  width: `${Math.max(t1Pct, 5)}%`,
                                  backgroundColor: ROLE_COLORS[role],
                                  opacity: 0.8,
                                }}
                              >
                                {t1Pct}%
                              </div>
                            </div>
                            <div className="w-px h-6 bg-gray-300" />
                            {/* Team B bar (left-aligned) */}
                            <div className="flex-1">
                              <div
                                className="h-6 rounded-r-md flex items-center px-2 text-xs font-bold text-white transition-all duration-700"
                                style={{
                                  width: `${Math.max(t2Pct, 5)}%`,
                                  backgroundColor: ROLE_COLORS[role],
                                  opacity: 0.6,
                                }}
                              >
                                {t2Pct}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 px-24">
                    <span className="font-bold">{comparison.team1.name}</span>
                    <span className="font-bold">{comparison.team2.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* M&A Integration Insight */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle>Integration Insight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">
                  When merging these two teams, the combined energy profile reveals where natural synergies
                  exist and where friction will emerge. The roles that are <strong>strong in one team but weak
                  in the other</strong> represent the highest-value integration points — these are the people
                  who will fill gaps the other team didn't know it had.
                </p>

                {(() => {
                  const t1Missing = new Set(comparison.team1.missingRoles);
                  const t2Missing = new Set(comparison.team2.missingRoles);
                  const t1Fills = comparison.team2.missingRoles.filter((r: string) => !t1Missing.has(r));
                  const t2Fills = comparison.team1.missingRoles.filter((r: string) => !t2Missing.has(r));
                  const bothMissing = comparison.team1.missingRoles.filter((r: string) => t2Missing.has(r));

                  return (
                    <div className="space-y-3">
                      {t1Fills.length > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm">
                            <span className="font-bold text-green-800">✓ {comparison.team1.name}</span>{" "}
                            <span className="text-green-700">
                              fills {comparison.team2.name}'s gap in: {t1Fills.join(", ")}
                            </span>
                          </p>
                        </div>
                      )}
                      {t2Fills.length > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm">
                            <span className="font-bold text-green-800">✓ {comparison.team2.name}</span>{" "}
                            <span className="text-green-700">
                              fills {comparison.team1.name}'s gap in: {t2Fills.join(", ")}
                            </span>
                          </p>
                        </div>
                      )}
                      {bothMissing.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm">
                            <span className="font-bold text-red-800">⚠ Both teams lack:</span>{" "}
                            <span className="text-red-700">
                              {bothMissing.join(", ")} — this is a critical hire priority post-merger
                            </span>
                          </p>
                        </div>
                      )}
                      {t1Fills.length === 0 && t2Fills.length === 0 && bothMissing.length === 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            Both teams have full role coverage. Focus integration on aligning the{" "}
                            <strong>dominant energies</strong> to prevent role collision.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <p className="text-xs text-muted-foreground italic">
                  "Don't just merge balance sheets; merge nervous systems. Map the acquirer and the acquired
                  to prevent organ rejection."
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!comparison && !comparisonLoading && team1Id && team2Id && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No comparison data available for these teams.</p>
          </div>
        )}

        {(!team1Id || !team2Id) && (
          <div className="text-center py-16">
            <GitCompare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select two teams above to see their side-by-side Flow Circuit comparison.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Ideal for M&A integration, department mergers, or cross-team collaboration planning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
