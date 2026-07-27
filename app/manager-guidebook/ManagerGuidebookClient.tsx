"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, ArrowLeft, Mail, MessageSquare, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function ManagerGuidebookClient() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const { data: teams, isLoading: teamsLoading, refetch } = trpc.team.myTeams.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createTeam = trpc.team.create.useMutation({
    onSuccess: () => { refetch(); },
  });

  const selectedTeam = teams?.[0];

  const inviteLink = useMemo(() => {
    if (!selectedTeam) return "";
    return `${window.location.origin}/assessment?team=${selectedTeam.code}`;
  }, [selectedTeam]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const alphaSlackMessage = useMemo(() => {
    if (!inviteLink) return "";
    return `Hey team! :zap:

We're participating in the *alpha* of a brand new team dynamics assessment called *The Flow Circuit*.

It takes about 2 minutes and maps your natural working style — whether you're a Spark (Innovator), Amplifier (Expander), Filter (Refiner), Ground (Executor), or Conductor (Orchestrator).

:point_right: *Take the assessment here:* ${inviteLink}

Once you complete it:
• You'll get your *individual report* instantly (with a PDF download)
• Your results will auto-sync to our *team dashboard* so we can see how our energies align
• Please share your honest feedback — this is an alpha and your input shapes the product

This is part of a new approach to understanding team dynamics beyond personality tests. Let's decode our flow! :rocket:`;
  }, [inviteLink]);

  const alphaEmailMessage = useMemo(() => {
    if (!inviteLink) return "";
    return `Subject: You're Invited to the Alpha — The Flow Circuit Team Assessment

Team,

I'm inviting you to participate in the alpha of a new team dynamics assessment called "The Flow Circuit."

Unlike traditional personality tests, this maps your natural "operational physics" — the invisible energy you bring to a team. It takes about 2 minutes.

Here's what happens:
1. Click the link below and enter your name
2. Answer 12 rapid-fire questions
3. Get your individual "Flow Circuit" role instantly (Spark, Amplifier, Filter, Ground, or Conductor)
4. Download your personal PDF report
5. Your results automatically sync to our team dashboard

Take the assessment here:
${inviteLink}

After you complete it, I'd love your honest feedback on the experience. This is an alpha — your impressions will directly shape the product.

Let's decode our flow.

- [Your Name]`;
  }, [inviteLink]);

  if (authLoading || teamsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Team Captain's Protocol</h1>
          <p className="text-gray-400 text-lg">Sign in to create your team and get your invite link.</p>
          <Button
            onClick={() => { window.location.href = "/login"; }}
            className="bg-yellow-400 text-black hover:bg-white font-bold px-8 py-4 text-lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Team creation flow
  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-xl mx-auto space-y-8 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Create Your <span className="text-yellow-400">Team Circuit</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Set up your team to start inviting members. Up to 25 people per team.
            </p>
          </motion.div>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Team Name *</label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., RampRate Leadership"
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Company Name (optional)</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., RampRate Inc."
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <Button
                onClick={() => createTeam.mutate({ name: teamName, companyName: companyName || undefined })}
                disabled={!teamName.trim() || createTeam.isPending}
                className="w-full bg-yellow-400 text-black hover:bg-white font-bold h-12"
              >
                {createTeam.isPending ? "Creating..." : "Create Team & Get Invite Link"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white pl-0"
            onClick={() => router.push("/team-dashboard")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push("/team-settings")}
          >
            <Settings className="w-4 h-4 mr-2" /> Team Settings
          </Button>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
            <Users className="w-4 h-4" /> Alpha Program
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
            Team Captain's <span className="text-yellow-400">Protocol</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
            Send one link. Get individual reports and a group dynamic matrix. Up to 25 people.
          </p>
        </div>

        <div className="grid gap-8">

          {/* Step 1: The Magic Link */}
          <Card className="bg-yellow-400/5 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                <span className="bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span>
                Your Unique Signal Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                This link is tied to your team <strong className="text-white">"{selectedTeam.name}"</strong>. Anyone who completes the assessment via this URL will automatically appear in your team matrix.
              </p>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="bg-black/50 border-yellow-400/30 text-yellow-200 font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(inviteLink, "link")}
                  className="bg-yellow-400 hover:bg-white text-black font-bold"
                >
                  {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Communication Templates */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Slack Template */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" /> Slack / Teams Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/50 p-4 rounded-lg border border-white/5 text-sm text-gray-300 font-mono whitespace-pre-wrap h-[350px] overflow-y-auto">
                  {alphaSlackMessage}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/10 text-white"
                  onClick={() => copyToClipboard(alphaSlackMessage, "slack")}
                >
                  {copied === "slack" ? <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Copied!</span> : "Copy Slack Message"}
                </Button>
              </CardContent>
            </Card>

            {/* Email Template */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" /> Email Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/50 p-4 rounded-lg border border-white/5 text-sm text-gray-300 font-mono whitespace-pre-wrap h-[350px] overflow-y-auto">
                  {alphaEmailMessage}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/10 text-white"
                  onClick={() => copyToClipboard(alphaEmailMessage, "email")}
                >
                  {copied === "email" ? <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Copied!</span> : "Copy Email Template"}
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Step 3: What Happens Next */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">3</span>
                What Your Team Gets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-3xl font-black text-yellow-400/30 mb-2">01</div>
                  <h3 className="font-bold text-white mb-2">Individual Report</h3>
                  <p className="text-sm text-gray-400">Each person gets their Flow Circuit role with a downloadable PDF.</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-3xl font-black text-yellow-400/30 mb-2">02</div>
                  <h3 className="font-bold text-white mb-2">Team Matrix</h3>
                  <p className="text-sm text-gray-400">Everyone plotted on the Innovation vs. Execution grid.</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-3xl font-black text-yellow-400/30 mb-2">03</div>
                  <h3 className="font-bold text-white mb-2">Group Dynamic</h3>
                  <p className="text-sm text-gray-400">Role distribution, gaps, friction points, and hiring recommendations.</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-3xl font-black text-yellow-400/30 mb-2">04</div>
                  <h3 className="font-bold text-white mb-2">Feedback Loop</h3>
                  <p className="text-sm text-gray-400">Every participant can share their impression of the experience.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => router.push("/team-dashboard")}
              className="flex-1 bg-yellow-400 text-black hover:bg-white font-bold h-14 text-lg"
            >
              View Team Dashboard
            </Button>
            <Button
              onClick={() => router.push("/team-settings")}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 h-14 text-lg"
            >
              Configure Settings
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
