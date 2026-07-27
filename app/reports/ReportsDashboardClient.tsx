"use client";

import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ArrowLeft, FileText, Users, Download, RefreshCw, Filter, Calendar, Search, ExternalLink, Zap, Globe, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const ROLE_COLORS: Record<string, string> = {
  Spark: "text-amber-500",
  Amplifier: "text-blue-500",
  Filter: "text-violet-500",
  Ground: "text-emerald-500",
  Conductor: "text-red-500",
};

const ROLE_BG: Record<string, string> = {
  Spark: "bg-amber-500/10 border-amber-500/20",
  Amplifier: "bg-blue-500/10 border-blue-500/20",
  Filter: "bg-violet-500/10 border-violet-500/20",
  Ground: "bg-emerald-500/10 border-emerald-500/20",
  Conductor: "bg-red-500/10 border-red-500/20",
};

const ROLE_ICONS: Record<string, string> = {
  Spark: "⚡",
  Amplifier: "📡",
  Filter: "🔬",
  Ground: "⚓",
  Conductor: "🎼",
};

export default function ReportsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);
  const [generatingTeamPDF, setGeneratingTeamPDF] = useState<string | null>(null);

  const { data: assessments, isLoading } = trpc.admin.allAssessments.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: domains } = trpc.admin.domains.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const generateIndividualPDF = trpc.admin.generateIndividualPDF.useMutation();
  const generateTeamPDF = trpc.admin.generateTeamPDF.useMutation();

  // Filter assessments
  const filtered = useMemo(() => {
    if (!assessments) return [];
    let result = [...assessments];

    // Domain filter
    if (domainFilter !== "all") {
      result = result.filter(a => a.domain === domainFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter(a => a.role === roleFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        (a.guestName || "").toLowerCase().includes(q) ||
        (a.guestEmail || "").toLowerCase().includes(q) ||
        (a.domain || "").toLowerCase().includes(q)
      );
    }

    // Date range
    if (dateRange !== "all") {
      const now = Date.now();
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      result = result.filter(a => a.createdAt && new Date(a.createdAt).getTime() > cutoff);
    }

    return result;
  }, [assessments, domainFilter, roleFilter, searchQuery, dateRange]);

  // Domain stats
  const domainStats = useMemo(() => {
    if (!assessments) return [];
    const map = new Map<string, { count: number; roles: Record<string, number> }>();
    for (const a of assessments) {
      const d = a.domain || "unknown";
      if (!map.has(d)) map.set(d, { count: 0, roles: {} });
      const entry = map.get(d)!;
      entry.count++;
      entry.roles[a.role] = (entry.roles[a.role] || 0) + 1;
    }
    return Array.from(map.entries())
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [assessments]);

  // Role distribution
  const roleStats = useMemo(() => {
    if (!filtered) return {};
    const counts: Record<string, number> = {};
    for (const a of filtered) {
      counts[a.role] = (counts[a.role] || 0) + 1;
    }
    return counts;
  }, [filtered]);

  const handleGenerateIndividualPDF = async (assessment: any) => {
    setGeneratingPDF(assessment.id);
    try {
      const rawScores = assessment.scores as Record<string, unknown> | null;
      const scores: Record<string, number> = {};
      if (rawScores) {
        for (const [k, v] of Object.entries(rawScores)) {
          scores[k] = typeof v === 'number' ? v : 0;
        }
      }
      const result = await generateIndividualPDF.mutateAsync({
        assessmentId: assessment.id,
        name: assessment.guestName || "Anonymous",
        email: assessment.guestEmail || undefined,
        role: assessment.role,
        score: assessment.score,
        scores,
        shareToken: assessment.shareToken || undefined,
        origin: window.location.origin,
      });
      window.open(result.url, "_blank");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleGenerateTeamPDF = async (domain: string) => {
    setGeneratingTeamPDF(domain);
    try {
      const result = await generateTeamPDF.mutateAsync({ domain });
      window.open(result.url, "_blank");
    } catch (err) {
      console.error("Failed to generate team PDF:", err);
    } finally {
      setGeneratingTeamPDF(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">Admin access required.</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-display font-bold text-foreground">Reports Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-10">
              {assessments?.length || 0} total assessments across {domains?.length || 0} domains
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {["Spark", "Amplifier", "Filter", "Ground", "Conductor"].map(role => (
            <Card key={role} className={`border ${ROLE_BG[role]} cursor-pointer transition-all hover:scale-[1.02]`}
              onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{ROLE_ICONS[role]}</div>
                <div className={`text-2xl font-bold ${ROLE_COLORS[role]}`}>
                  {roleStats[role] || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">{role}s</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or domain..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Domain filter */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <select
                  value={domainFilter}
                  onChange={e => setDomainFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Domains</option>
                  {(domains || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Roles</option>
                  {["Spark", "Amplifier", "Filter", "Ground", "Conductor"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value as any)}
                  className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              Showing {filtered.length} of {assessments?.length || 0} assessments
              {domainFilter !== "all" && <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{domainFilter}</span>}
              {roleFilter !== "all" && <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{roleFilter}</span>}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  Individual Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Domain</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Score</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-muted-foreground">
                            No assessments match your filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.slice(0, 50).map(a => (
                          <tr key={a.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{a.guestName || "Anonymous"}</div>
                              <div className="text-xs text-muted-foreground">{a.guestEmail || ""}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border ${ROLE_BG[a.role]}`}>
                                <span>{ROLE_ICONS[a.role]}</span>
                                <span className={ROLE_COLORS[a.role]}>{a.role}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                              {a.domain || <span className="text-muted-foreground/50 italic">none</span>}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="font-mono font-bold text-foreground">{a.score}</span>
                              <span className="text-muted-foreground text-xs">/100</span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                              {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGenerateIndividualPDF(a)}
                                disabled={generatingPDF === a.id}
                                className="text-primary hover:text-primary/80"
                              >
                                {generatingPDF === a.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {filtered.length > 50 && (
                  <div className="px-4 py-3 text-center text-sm text-muted-foreground border-t border-border/30">
                    Showing first 50 of {filtered.length} results. Use filters to narrow down.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Team Reports */}
          <div className="space-y-6">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-secondary" />
                  Team Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {domainStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No domains found.</p>
                ) : (
                  domainStats.map(ds => {
                    const canGenerate = ds.count >= 3;
                    return (
                      <div key={ds.domain} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-foreground text-sm">{ds.domain}</div>
                            <div className="text-xs text-muted-foreground">{ds.count} member{ds.count !== 1 ? "s" : ""}</div>
                          </div>
                          <Button
                            variant={canGenerate ? "default" : "ghost"}
                            size="sm"
                            disabled={!canGenerate || generatingTeamPDF === ds.domain}
                            onClick={() => handleGenerateTeamPDF(ds.domain)}
                            className="text-xs"
                          >
                            {generatingTeamPDF === ds.domain ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <BarChart3 className="w-3 h-3 mr-1" />
                            )}
                            {canGenerate ? "Generate" : `Need ${3 - ds.count} more`}
                          </Button>
                        </div>
                        {/* Mini role distribution */}
                        <div className="flex gap-1 flex-wrap">
                          {Object.entries(ds.roles).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
                            <span key={role} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${ROLE_BG[role]}`}>
                              <span>{ROLE_ICONS[role]}</span>
                              <span className={ROLE_COLORS[role]}>{count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-accent" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Total Assessments</span>
                  <span className="font-bold text-foreground">{assessments?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Active Domains</span>
                  <span className="font-bold text-foreground">{domains?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Team-Ready Domains</span>
                  <span className="font-bold text-foreground">{domainStats.filter(d => d.count >= 3).length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <span className="font-bold text-foreground">
                    {assessments && assessments.length > 0
                      ? Math.round(assessments.reduce((s, a) => s + (a.score || 0), 0) / assessments.length)
                      : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
