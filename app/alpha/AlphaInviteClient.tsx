"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ArrowRight, MessageSquare, Mail, Users, Zap, BarChart3, Brain, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { saveTeamData, getLatestTeam } from "@/lib/assessmentPersistence";

export default function AlphaInviteClient() {
  const { user, isAuthenticated, loading } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  // Fix #3: Restore team data from localStorage on mount
  const [createdTeam, setCreatedTeam] = useState<{ code: string; name: string } | null>(() => {
    const persisted = getLatestTeam();
    return persisted ? { code: persisted.code, name: persisted.name } : null;
  });

  const createTeam = trpc.team.create.useMutation({
    onSuccess: (team) => {
      if (team) {
        setCreatedTeam({ code: team.code, name: team.name });
        // Fix #3: Persist team data to localStorage
        saveTeamData({
          code: team.code,
          name: team.name,
          companyName: companyName || undefined,
          createdAt: new Date().toISOString(),
        });
      }
    },
  });

  const inviteLink = createdTeam
    ? `${window.location.origin}/assessment?team=${createdTeam.code}`
    : "";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const slackMessage = `Hey team! :zap:

I'm inviting you to participate in the *alpha* of a new team assessment — *The Flow Circuit*.

It's a 2-minute test that maps your natural working style across 5 operational roles: Spark (Innovation), Amplifier (Expansion), Filter (Refinement), Ground (Execution), and Conductor (Orchestration).

:point_right: *Take the assessment here:* ${inviteLink}

Once you complete it:
• You'll get your *individual report* with your dominant role and radar chart
• Your results will *automatically sync* to our team dashboard
• We'll see a *group dynamic report* plotting everyone on the matrix

This is an alpha — so after you take it, please share your honest feedback. Did it nail you? Was it off? What surprised you?

Let's decode our flow. :rocket:`;

  const emailMessage = `Subject: Join the Alpha — The Flow Circuit Team Assessment

Team,

I'm inviting you to participate in the alpha of a new team dynamics assessment called The Flow Circuit.

It's a 2-minute test that maps your natural working style across 5 operational roles: Spark (Innovation), Amplifier (Expansion), Filter (Refinement), Ground (Execution), and Conductor (Orchestration).

Take the assessment here: ${inviteLink}

Once you complete it:
- You'll get your individual report with your dominant role and radar chart
- Your results will automatically sync to our team dashboard
- We'll see a group dynamic report plotting everyone on the matrix

This is an alpha — so after you take it, please share your honest feedback. Did it nail you? Was it off? What surprised you?

Let's decode our flow.

Best,
${user?.name || "[Your Name]"}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in — show the alpha pitch
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
              <Star className="w-4 h-4" /> Alpha Program
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Join the Alpha
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Be one of <strong className="text-white">10 companies</strong> to pilot The Flow Circuit — a new team dynamics assessment that maps the invisible architecture of high-performance teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Individual Assessment",
                description: "Each team member takes a 2-minute test to discover their dominant operational role (Spark, Amplifier, Filter, Ground, or Conductor).",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Group Dynamic Report",
                description: "See your entire team plotted on the Energy Matrix. Identify gaps, friction points, and hidden strengths at a glance.",
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Soulprint Integration",
                description: "Optional: Add birth data to unlock a deeper Soulprint analysis synthesizing 8 personality and cosmic frameworks.",
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="pt-8 space-y-4">
                  <div className="text-yellow-400">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold text-white">How It Works</h2>
              <div className="space-y-3 text-left text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p>Sign in and create your team (up to 25 members)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p>Get a single invite link to share with your staff</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <p>Everyone takes the 2-minute assessment</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                  <p>View the combined team matrix and group dynamic report</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => { window.location.href = "/login"; }}
              className="px-12 py-6 text-xl font-black uppercase tracking-widest bg-yellow-400 text-black hover:bg-white transition-all"
            >
              <Users className="mr-2 w-6 h-6" /> Sign In to Start
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but no team created yet
  if (!createdTeam) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
              <Star className="w-4 h-4" /> Alpha Program
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Create Your Team
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome, <strong className="text-white">{user?.name || "Captain"}</strong>. Set up your team to generate the invite link.
            </p>
          </motion.div>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Team Name *</Label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. RampRate Leadership"
                  className="bg-black/50 border-white/20 text-white h-12 text-lg"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Company Name (optional)</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. RampRate Inc."
                  className="bg-black/50 border-white/20 text-white h-12"
                />
              </div>
              <Button
                onClick={() => createTeam.mutate({ name: teamName.trim(), companyName: companyName.trim() || undefined })}
                disabled={!teamName.trim() || createTeam.isPending}
                className="w-full bg-yellow-400 text-black hover:bg-white h-14 text-lg font-bold uppercase tracking-widest"
              >
                {createTeam.isPending ? "Creating..." : "Create Team & Get Link"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-gray-500 text-center">Alpha teams support up to 25 members.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Team created — show the invite link and message templates
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="bg-green-500 text-white p-3 rounded-full">
              <Check className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Team Created
          </h1>
          <p className="text-gray-300 text-xl">
            <strong className="text-white">{createdTeam.name}</strong> is ready. Now share the link with your staff.
          </p>
        </motion.div>

        {/* The Magic Link */}
        <Card className="bg-yellow-400/5 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              Your Invite Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="bg-black/50 border-yellow-400/30 text-yellow-200 font-mono"
              />
              <Button
                onClick={() => copyToClipboard(inviteLink, "link")}
                className="bg-yellow-400 text-black hover:bg-white font-bold px-6"
              >
                {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Anyone who uses this link will automatically join your team. Their results will appear on your dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Message Templates */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" /> Slack Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 p-4 rounded-lg border border-white/5 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto leading-relaxed">
                {slackMessage}
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 hover:bg-white/10 text-white"
                onClick={() => copyToClipboard(slackMessage, "slack")}
              >
                {copied === "slack" ? (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Copied!</span>
                ) : (
                  <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy Slack Message</span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" /> Email Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 p-4 rounded-lg border border-white/5 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto leading-relaxed">
                {emailMessage}
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 hover:bg-white/10 text-white"
                onClick={() => copyToClipboard(emailMessage, "email")}
              >
                {copied === "email" ? (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Copied!</span>
                ) : (
                  <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy Email</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* What Happens Next */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">What Happens Next</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              {[
                { step: "01", title: "They Click", desc: "Staff member opens your unique link" },
                { step: "02", title: "They Assess", desc: "2-minute test maps their operational role" },
                { step: "03", title: "They Share", desc: "They get their individual report + feedback form" },
                { step: "04", title: "You Visualize", desc: "Their dot appears on your Team Matrix" },
              ].map((item) => (
                <div key={item.step} className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-3xl font-black text-gray-700 mb-2">{item.step}</div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.href = "/team-dashboard"}
            className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 text-lg"
          >
            Go to Team Dashboard <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            onClick={() => window.location.href = `/assessment?team=${createdTeam.code}`}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
          >
            Take the Assessment Yourself
          </Button>
        </div>
      </div>
    </div>
  );
}
