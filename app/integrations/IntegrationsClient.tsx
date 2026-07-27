"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MessageSquare, Webhook, Copy, CheckCircle, AlertTriangle, Zap, Users, ArrowRight, Shield } from "lucide-react";

const SLACK_BLOCK_TEMPLATE = `{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "⚡ Flow Circuit Alert" }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*{{name}}* just completed their Flow Circuit assessment!\\n\\n🎯 *Primary Role:* {{role}}\\n🔀 *Combination:* {{combinationProfile}}\\n💎 *Purity:* {{purityScore}}%"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "⚠️ *Stress Alert:* Asking a {{role}} to operate as a {{highestStressRole}} costs {{stressCost}}% more energy.\\n\\n_Remember: Who they ARE matters more than what they know._"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Team Map" },
          "url": "{{teamMapUrl}}"
        }
      ]
    }
  ]
}`;

const TEAMS_CARD_TEMPLATE = `{
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  "themeColor": "7C3AED",
  "summary": "Flow Circuit Assessment Complete",
  "sections": [{
    "activityTitle": "⚡ {{name}} completed their Flow Circuit",
    "activitySubtitle": "{{combinationProfile}} ({{purityScore}}% purity)",
    "facts": [
      { "name": "Primary Role", "value": "{{role}}" },
      { "name": "Stress Warning", "value": "Operating as {{highestStressRole}} costs {{stressCost}}% more energy" }
    ],
    "markdown": true
  }],
  "potentialAction": [{
    "@type": "OpenUri",
    "name": "View Team Map",
    "targets": [{ "os": "default", "uri": "{{teamMapUrl}}" }]
  }]
}`;

export default function Integrations() {
  const { user, isAuthenticated, loading } = useAuth();
  const [slackUrl, setSlackUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [testingSlack, setTestingSlack] = useState(false);
  const [testingTeams, setTestingTeams] = useState(false);
  const [slackSaved, setSlackSaved] = useState(false);
  const [teamsSaved, setTeamsSaved] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [copiedTeams, setCopiedTeams] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Shield className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">Sign in to configure integrations.</p>
            <Button onClick={() => window.location.href = "/login"}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const testWebhook = async (type: 'slack' | 'teams') => {
    const url = type === 'slack' ? slackUrl : teamsUrl;
    if (!url) {
      toast.error("Please enter a webhook URL first.");
      return;
    }

    if (type === 'slack') setTestingSlack(true);
    else setTestingTeams(true);

    try {
      const payload = type === 'slack' ? {
        text: "⚡ Flow Circuit Test — Integration working! Your team will now receive role alerts when members complete their assessment.",
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "⚡ Flow Circuit Connected!" }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Your Slack workspace is now connected to The Flow Circuit.\n\n🎯 You'll receive alerts when team members complete their assessment, including:\n• Their primary role and combination profile\n• Stress warnings for role misalignment\n• Direct links to the team map"
            }
          }
        ]
      } : {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        themeColor: "7C3AED",
        summary: "Flow Circuit Connected",
        sections: [{
          activityTitle: "⚡ Flow Circuit Connected!",
          activitySubtitle: "Your Teams channel will now receive role alerts.",
          markdown: true
        }]
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`${type === 'slack' ? 'Slack' : 'Teams'} webhook test successful!`);
        if (type === 'slack') setSlackSaved(true);
        else setTeamsSaved(true);
      } else {
        toast.error(`Webhook test failed (${response.status}). Check the URL.`);
      }
    } catch (err) {
      toast.error("Failed to reach webhook. Check the URL and try again.");
    } finally {
      if (type === 'slack') setTestingSlack(false);
      else setTestingTeams(false);
    }
  };

  const copyTemplate = (type: 'slack' | 'teams') => {
    const template = type === 'slack' ? SLACK_BLOCK_TEMPLATE : TEAMS_CARD_TEMPLATE;
    navigator.clipboard.writeText(template);
    if (type === 'slack') setCopiedSlack(true);
    else setCopiedTeams(true);
    toast.success("Template copied to clipboard!");
    setTimeout(() => {
      if (type === 'slack') setCopiedSlack(false);
      else setCopiedTeams(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="container max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Webhook className="w-4 h-4" />
            Integrations
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Connect Your <span className="text-primary">Workflow</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get real-time role alerts in Slack or Teams when team members complete their Flow Circuit assessment.
            Know who's a Spark, who's a Ground, and where the friction lives — without leaving your workspace.
          </p>
        </div>

        {/* How It Works */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                <h4 className="font-semibold">Add Webhook URL</h4>
                <p className="text-sm text-muted-foreground">Create an incoming webhook in your Slack or Teams workspace and paste the URL below.</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                <h4 className="font-semibold">Team Takes Assessment</h4>
                <p className="text-sm text-muted-foreground">When anyone on your team completes their Flow Circuit assessment, a notification fires automatically.</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                <h4 className="font-semibold">Role Awareness in Real-Time</h4>
                <p className="text-sm text-muted-foreground">See their role, combination profile, purity score, and stress warnings — right in your channel.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slack Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Slack Integration
              {slackSaved && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Incoming Webhook URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste your Slack incoming webhook URL"
                  value={slackUrl}
                  onChange={e => setSlackUrl(e.target.value)}
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={() => testWebhook('slack')}
                  disabled={testingSlack || !slackUrl}
                  variant="outline"
                >
                  {testingSlack ? "Testing..." : "Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Create one at <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener" className="text-primary hover:underline">api.slack.com/messaging/webhooks</a>
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Message Template (Block Kit)</h4>
                <Button variant="ghost" size="sm" onClick={() => copyTemplate('slack')}>
                  {copiedSlack ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedSlack ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is the template sent when a team member completes their assessment. Variables like {"{{name}}"}, {"{{role}}"}, {"{{combinationProfile}}"} are replaced automatically.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Stress Alert Example:</strong> "Asking a Spark to operate as a Ground costs 85% more energy.
                Every day they operate outside their nature, they're leaving performance on the table."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Teams Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#464EB8] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Microsoft Teams Integration
              {teamsSaved && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Incoming Webhook URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://outlook.office.com/webhook/..."
                  value={teamsUrl}
                  onChange={e => setTeamsUrl(e.target.value)}
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={() => testWebhook('teams')}
                  disabled={testingTeams || !teamsUrl}
                  variant="outline"
                >
                  {testingTeams ? "Testing..." : "Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Create one via <a href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook" target="_blank" rel="noopener" className="text-primary hover:underline">Teams Incoming Webhook docs</a>
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Message Card Template</h4>
                <Button variant="ghost" size="sm" onClick={() => copyTemplate('teams')}>
                  {copiedTeams ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedTeams ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Adaptive Card template for Teams. Variables are replaced automatically when assessments are completed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-bold text-lg">For Team Leads</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get notified the moment a new team member completes their assessment. See their role immediately
                so you can assign work that matches their natural energy — not against it.
              </p>
              <div className="text-xs text-primary font-semibold">
                "Sarah just completed her assessment — she's a Spark-Amplifier (78% purity).
                Don't put her on the compliance audit."
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-bold text-lg">For HR / People Ops</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track assessment completion across departments. Identify teams with role gaps before
                they become performance problems. The stress alerts flag misalignment in real-time.
              </p>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                "Engineering team has 4 Sparks and 0 Grounds. Execution risk: HIGH."
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">
            Need a custom integration? The <a href="/white-label" className="text-primary hover:underline">Enterprise API</a> supports
            webhooks for any platform.
          </p>
        </div>
      </div>
    </div>
  );
}
