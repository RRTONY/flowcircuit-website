"use client";

import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Users, BarChart3, Building2, MessageSquare, Mail, Shield, ArrowLeft, TrendingUp, Zap, Activity, Download, Globe, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const ROLE_COLORS: Record<string, string> = {
  Spark: "#f59e0b",
  Amplifier: "#3b82f6",
  Filter: "#8b5cf6",
  Ground: "#10b981",
  Conductor: "#ef4444",
};

const ROLE_TAGLINES: Record<string, string> = {
  Spark: "The Innovator",
  Amplifier: "The Expander",
  Filter: "The Refiner",
  Ground: "The Executor",
  Conductor: "The Orchestrator",
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [emailDripDay, setEmailDripDay] = useState<'day1' | 'day3' | 'day7'>('day1');

  const { data: stats, isLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: !!user && user.role === 'admin',
  });

  const { data: pendingDrips } = trpc.emailDrip.pending.useQuery(
    { day: emailDripDay },
    { enabled: !!user && user.role === 'admin' }
  );

  const generateEmail = trpc.emailDrip.generateEmail.useMutation();
  const markSent = trpc.emailDrip.markSent.useMutation();

  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);
  const generateIndividualPDF = trpc.admin.generateIndividualPDF.useMutation();

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-gray-300 mx-auto" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Admin access required.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No data available yet.</p>
      </div>
    );
  }

  const maxRoleCount = Math.max(
    ...stats.roleDistribution.map((r: any) => r.count),
    1
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Flow Circuit adoption metrics and management
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </Button>
        </div>

        {/* ═══ KPI Cards ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.totals.assessments}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.totals.teams}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.totals.users}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.totals.peerReviews}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">360 Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.totals.feedback}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.totals.emailDrips}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email Drips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* ═══ Role Distribution ═══ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.roleDistribution.map((r: any) => (
                  <div key={r.role} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{r.role}</span>
                      <span className="text-muted-foreground">{r.count}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(r.count / maxRoleCount) * 100}%`,
                          backgroundColor: ROLE_COLORS[r.role] || '#6b7280',
                        }}
                      />
                    </div>
                  </div>
                ))}
                {stats.roleDistribution.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No assessments completed yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ═══ Domain Activity ═══ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Active Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.domainActivity.map((d: any, i: number) => (
                  <div
                    key={d.domain}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">
                        #{i + 1}
                      </span>
                      <span className="font-medium">{d.domain}</span>
                    </div>
                    <span className="text-sm font-bold bg-black text-white px-2 py-0.5 rounded">
                      {d.count} assessments
                    </span>
                  </div>
                ))}
                {stats.domainActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No domain-based assessments yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ Recent Assessments ═══ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Name</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Email</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Domain</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Role</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Score</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Date</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentAssessments.map((a: any) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedAssessment(a)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-2 px-3 font-medium">{a.guestName || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground">{a.guestEmail || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground">{a.domain || '—'}</td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: ROLE_COLORS[a.role] || '#6b7280' }}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold">{a.score}%</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateIndividualPDF(a);
                          }}
                          disabled={generatingPDF === a.id}
                          className="text-primary hover:text-primary/80 h-8 px-2"
                        >
                          {generatingPDF === a.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.recentAssessments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No assessments yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ═══ Teams ═══ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Name</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Company</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Domain</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Max</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Alpha</th>
                    <th className="py-2 px-3 font-bold text-gray-500 uppercase text-xs">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.teamStats.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{t.name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{t.companyName || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground">{t.domain || '—'}</td>
                      <td className="py-2 px-3">{t.maxMembers || '∞'}</td>
                      <td className="py-2 px-3">
                        {t.isAlpha ? (
                          <span className="text-green-600 font-bold text-xs">YES</span>
                        ) : (
                          <span className="text-gray-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ═══ Email Drip Manager ═══ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Drip Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              {(['day1', 'day3', 'day7'] as const).map((day) => (
                <Button
                  key={day}
                  variant={emailDripDay === day ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmailDripDay(day)}
                >
                  {day === 'day1' ? 'Day 1: Results Recap' :
                   day === 'day3' ? 'Day 3: Invite Tribe' :
                   'Day 7: Stress Cost'}
                </Button>
              ))}
            </div>

            {pendingDrips && pendingDrips.length > 0 ? (
              <div className="space-y-3">
                {pendingDrips.map((drip: any) => (
                  <div
                    key={drip.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-white"
                  >
                    <div>
                      <p className="font-medium">{drip.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {drip.email} {drip.domain && `· ${drip.domain}`} {drip.role && `· ${drip.role}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={generatingFor === drip.id}
                        onClick={async () => {
                          setGeneratingFor(drip.id);
                          try {
                            const result = await generateEmail.mutateAsync({
                              day: emailDripDay,
                              recipientName: drip.name || 'there',
                              role: drip.role || undefined,
                              domain: drip.domain || undefined,
                            });
                            setGeneratedEmail(result.content);
                          } finally {
                            setGeneratingFor(null);
                          }
                        }}
                      >
                        {generatingFor === drip.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Generate Email'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await markSent.mutateAsync({ id: drip.id, day: emailDripDay });
                        }}
                      >
                        Mark Sent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending {emailDripDay} emails.
              </p>
            )}

            {generatedEmail && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-gray-500">
                  Generated Email Preview
                </h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedEmail}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedEmail);
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Report Modal */}
      <Dialog open={!!selectedAssessment} onOpenChange={(open) => !open && setSelectedAssessment(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedAssessment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedAssessment.guestName || "Anonymous"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {selectedAssessment.guestEmail && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {selectedAssessment.guestEmail}
                    </span>
                  )}
                  {selectedAssessment.domain && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> {selectedAssessment.domain}
                    </span>
                  )}
                  {selectedAssessment.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedAssessment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: ROLE_COLORS[selectedAssessment.role], backgroundColor: `${ROLE_COLORS[selectedAssessment.role]}1a` }}>
                  <div className="text-lg font-bold" style={{ color: ROLE_COLORS[selectedAssessment.role] }}>
                    {selectedAssessment.role} — {ROLE_TAGLINES[selectedAssessment.role]}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Dominant Score: <strong className="text-foreground">{selectedAssessment.score}%</strong>
                  </div>
                </div>

                {selectedAssessment.scores && Object.keys(selectedAssessment.scores).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Energy Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedAssessment.scores as Record<string, number>)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([role, score]) => (
                          <div key={role} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{role}</span>
                              <span className="text-muted-foreground">{score}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${score}%`, backgroundColor: ROLE_COLORS[role] || '#6b7280' }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => handleGenerateIndividualPDF(selectedAssessment)}
                  disabled={generatingPDF === selectedAssessment.id}
                >
                  {generatingPDF === selectedAssessment.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download PDF Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
