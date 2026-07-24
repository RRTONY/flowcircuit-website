import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { ArrowRight, Building2, Users, BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Zap, Shield, Filter as FilterIcon, Radio, Target, Loader2, LogIn } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"] as const;
type Role = (typeof roles)[number];

const roleConfig: Record<Role, { color: string; bgColor: string; icon: typeof Zap; emoji: string; ideal: number }> = {
  Spark: { color: "text-yellow-400", bgColor: "bg-yellow-400", icon: Zap, emoji: "⚡", ideal: 15 },
  Amplifier: { color: "text-cyan-400", bgColor: "bg-cyan-400", icon: Radio, emoji: "📡", ideal: 20 },
  Filter: { color: "text-rose-400", bgColor: "bg-rose-400", icon: FilterIcon, emoji: "🔬", ideal: 20 },
  Ground: { color: "text-emerald-400", bgColor: "bg-emerald-400", icon: Shield, emoji: "🏗️", ideal: 30 },
  Conductor: { color: "text-purple-400", bgColor: "bg-purple-400", icon: Target, emoji: "🎯", ideal: 15 },
};

interface TeamMember {
  name: string;
  role: Role;
  score: number;
}

const sampleTeams: Record<string, TeamMember[]> = {
  "Demo: Product Team": [
    { name: "Alex Chen", role: "Spark", score: 45 },
    { name: "Maria Santos", role: "Amplifier", score: 42 },
    { name: "James Park", role: "Filter", score: 38 },
    { name: "Sarah Johnson", role: "Ground", score: 50 },
    { name: "David Kim", role: "Ground", score: 44 },
    { name: "Lisa Wang", role: "Conductor", score: 47 },
    { name: "Tom Rivera", role: "Spark", score: 40 },
    { name: "Nina Patel", role: "Filter", score: 36 },
  ],
  "Demo: Engineering": [
    { name: "Chris Lee", role: "Ground", score: 48 },
    { name: "Amy Zhang", role: "Ground", score: 46 },
    { name: "Mike Brown", role: "Filter", score: 41 },
    { name: "Rachel Green", role: "Ground", score: 43 },
    { name: "Kevin Wu", role: "Spark", score: 39 },
    { name: "Diana Ross", role: "Ground", score: 45 },
  ],
};

function getCircuitHealth(distribution: Record<Role, number>, total: number) {
  const pcts: Record<Role, number> = {} as any;
  for (const role of roles) {
    pcts[role] = total > 0 ? Math.round((distribution[role] / total) * 100) : 0;
  }
  const gaps: string[] = [];
  const strengths: string[] = [];
  let deviation = 0;
  for (const role of roles) {
    const diff = Math.abs(pcts[role] - roleConfig[role].ideal);
    deviation += diff;
    if (pcts[role] === 0) {
      gaps.push(`Critical gap: No ${role} on the team.`);
    } else if (pcts[role] < roleConfig[role].ideal * 0.5) {
      gaps.push(`${role} underrepresented (${pcts[role]}% vs. ideal ${roleConfig[role].ideal}%).`);
    }
    if (pcts[role] >= roleConfig[role].ideal * 0.8 && pcts[role] <= roleConfig[role].ideal * 1.3) {
      strengths.push(`${role} well-represented at ${pcts[role]}%.`);
    }
  }
  const score = Math.max(0, Math.round(100 - (deviation / 200) * 100));
  let status = "Critical";
  if (score >= 80) status = "Excellent";
  else if (score >= 60) status = "Good";
  else if (score >= 40) status = "Needs Attention";
  return { score, status, gaps, strengths };
}

export default function EnterpriseDashboard() {
  const { user, isAuthenticated } = useAuth();
  const teamsQuery = trpc.team.myTeams.useQuery();
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const teamAssessmentsQuery = trpc.assessment.teamResults.useQuery(
    { teamId: selectedTeamId! },
    { enabled: selectedTeamId !== null }
  );

  // Build combined team list: real teams + demo teams
  const allTeamNames = useMemo(() => {
    const realTeams = (teamsQuery.data || []).map((t: any) => t.name);
    return [...realTeams, ...Object.keys(sampleTeams)];
  }, [teamsQuery.data]);

  // Resolve current team members
  const team: TeamMember[] = useMemo(() => {
    if (selectedTeam.startsWith("Demo:")) {
      return sampleTeams[selectedTeam] || [];
    }
    if (!teamAssessmentsQuery.data) return [];
    return teamAssessmentsQuery.data.map((a: any) => ({
      name: a.guestName || a.guestEmail || `Member #${a.id}`,
      role: a.role as Role,
      score: a.score,
    }));
  }, [selectedTeam, teamAssessmentsQuery.data]);

  // Auto-select first team
  useMemo(() => {
    if (!selectedTeam && allTeamNames.length > 0) {
      const first = allTeamNames[0];
      setSelectedTeam(first);
      if (!first.startsWith("Demo:")) {
        const realTeam = (teamsQuery.data || []).find((t: any) => t.name === first);
        if (realTeam) setSelectedTeamId(realTeam.id);
      }
    }
  }, [allTeamNames]);

  const distribution = useMemo(() => {
    const dist: Record<Role, number> = { Spark: 0, Amplifier: 0, Filter: 0, Ground: 0, Conductor: 0 };
    for (const member of team) {
      if (roles.includes(member.role)) dist[member.role]++;
    }
    return dist;
  }, [team]);

  const health = useMemo(() => getCircuitHealth(distribution, team.length), [distribution, team.length]);

  const handleTeamSelect = (name: string) => {
    setSelectedTeam(name);
    if (name.startsWith("Demo:")) {
      setSelectedTeamId(null);
    } else {
      const realTeam = (teamsQuery.data || []).find((t: any) => t.name === name);
      if (realTeam) setSelectedTeamId(realTeam.id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono text-blue-400">Enterprise View</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Circuit Health
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See your team's entire circuit composition at a glance. Where are the
            gaps? Where's the overload? What does the relay actually look like
            when you map it?
          </p>
        </div>
      </section>

      {/* Auth Gate or Dashboard */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Team Selector */}
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {!isAuthenticated && (
              <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm">
                <LogIn className="w-4 h-4" />
                Sign in to see your real teams
              </a>
            )}
            {teamsQuery.isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your teams...
              </div>
            )}
            {allTeamNames.map((name: string) => (
              <button
                key={name}
                onClick={() => handleTeamSelect(name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTeam === name
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-card/50 border border-border text-muted-foreground hover:text-foreground hover:border-blue-500/30"
                }`}
              >
                {name.startsWith("Demo:") ? name : `📊 ${name}`}
              </button>
            ))}
          </div>

          {/* Loading state for real team data */}
          {selectedTeamId && teamAssessmentsQuery.isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading team assessment data...</p>
            </div>
          )}

          {/* Empty state for real team with no assessments */}
          {selectedTeamId && !teamAssessmentsQuery.isLoading && team.length === 0 && (
            <div className="text-center py-12 bg-card/30 rounded-2xl border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Assessments Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                This team hasn't completed any Flow Circuit assessments yet. Share the team code to get started.
              </p>
              <Link href="/assessment">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Start Team Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Dashboard Content */}
          {team.length > 0 && (
            <>
              {/* Circuit Health Score */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-1 bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 text-center">
                  <div className="relative w-36 h-36 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                      <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                        stroke={health.score >= 80 ? "#22c55e" : health.score >= 60 ? "#3b82f6" : health.score >= 40 ? "#eab308" : "#ef4444"}
                        strokeDasharray={`${health.score * 3.14} 314`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{health.score}</span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1">Circuit Health</h3>
                  <span className={`text-sm font-mono px-3 py-1 rounded-full ${
                    health.score >= 80 ? "bg-green-500/10 text-green-400" :
                    health.score >= 60 ? "bg-blue-500/10 text-blue-400" :
                    health.score >= 40 ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>{health.status}</span>
                </div>

                {/* Gaps */}
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold">Circuit Gaps</h3>
                  </div>
                  {health.gaps.length === 0 ? (
                    <p className="text-sm text-green-400">No critical gaps detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {health.gaps.map((g, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">▸</span> {g}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Strengths */}
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold">Strengths</h3>
                  </div>
                  {health.strengths.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Rebalancing needed across all roles.</p>
                  ) : (
                    <ul className="space-y-2">
                      {health.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Role Distribution */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold">Role Distribution</h3>
                  <span className="text-sm text-muted-foreground ml-auto">{team.length} members</span>
                </div>
                <div className="space-y-4">
                  {roles.map((role) => {
                    const count = distribution[role];
                    const pct = team.length > 0 ? Math.round((count / team.length) * 100) : 0;
                    const cfg = roleConfig[role];
                    return (
                      <div key={role} className="flex items-center gap-4">
                        <div className="w-28 flex items-center gap-2">
                          <span>{cfg.emoji}</span>
                          <span className={`text-sm font-medium ${cfg.color}`}>{role}</span>
                        </div>
                        <div className="flex-1 h-8 bg-border/30 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full ${cfg.bgColor} rounded-full transition-all duration-700 opacity-80`}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                          <div
                            className="absolute top-0 h-full border-r-2 border-dashed border-white/30"
                            style={{ left: `${cfg.ideal}%` }}
                            title={`Ideal: ${cfg.ideal}%`}
                          />
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-mono">{count}</span>
                          <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">Dashed lines indicate ideal distribution targets.</p>
              </div>

              {/* Team Members Grid */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold">Team Members</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {team.map((member, i) => {
                    const cfg = roleConfig[member.role];
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                        <div className={`w-10 h-10 rounded-full ${cfg.bgColor}/20 flex items-center justify-center text-lg`}>
                          {cfg.emoji}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className={`text-xs ${cfg.color}`}>{member.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl border border-blue-500/20 p-8 mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold">Circuit Optimization</h3>
                </div>
                {health.gaps.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Your circuit has {health.gaps.length} gap{health.gaps.length > 1 ? "s" : ""} that could be limiting team performance.
                      Consider these actions:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {distribution.Spark === 0 && (
                        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                          <p className="text-sm font-medium text-yellow-400 mb-1">⚡ Add a Spark</p>
                          <p className="text-xs text-muted-foreground">Without a Spark, innovation stalls. Look for the person who sees what doesn't exist yet.</p>
                        </div>
                      )}
                      {distribution.Ground === 0 && (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <p className="text-sm font-medium text-emerald-400 mb-1">🏗️ Add a Ground</p>
                          <p className="text-xs text-muted-foreground">Without a Ground, nothing ships. Find the person who turns vision into deliverables.</p>
                        </div>
                      )}
                      {distribution.Conductor === 0 && (
                        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                          <p className="text-sm font-medium text-purple-400 mb-1">🎯 Add a Conductor</p>
                          <p className="text-xs text-muted-foreground">Without a Conductor, the relay has no sequencer. Someone needs to read the room and route the energy.</p>
                        </div>
                      )}
                      {distribution.Filter === 0 && (
                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                          <p className="text-sm font-medium text-rose-400 mb-1">🔬 Add a Filter</p>
                          <p className="text-xs text-muted-foreground">Without a Filter, quality drops. You need the person who stress-tests every idea before it ships.</p>
                        </div>
                      )}
                      {distribution.Amplifier === 0 && (
                        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                          <p className="text-sm font-medium text-cyan-400 mb-1">📡 Add an Amplifier</p>
                          <p className="text-xs text-muted-foreground">Without an Amplifier, great ideas die quietly. Find the person who can broadcast the signal.</p>
                        </div>
                      )}
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-sm font-medium text-blue-400 mb-1">📊 Run Team Assessment</p>
                        <p className="text-xs text-muted-foreground">Have all team members take the assessment to get precise circuit mapping.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-green-400">Your circuit is well-balanced. Focus on maintaining role clarity and preventing drift.</p>
                )}
              </div>
            </>
          )}

          {/* CTA */}
          <div className="text-center py-12">
            <Link href="/assessment">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8">
                Map Your Team's Circuit <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogBridge pageKey="enterprise" />
    </div>
  );
}
