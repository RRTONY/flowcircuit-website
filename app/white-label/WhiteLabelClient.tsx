"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Palette, Shield, Code2, Globe, Copy, Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function WhiteLabel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  if (authLoading) {
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
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">White-label configuration requires admin privileges.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const embedSnippet = `<!-- Flow Circuit Assessment Embed -->
<div id="flow-circuit-embed"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${window.location.origin}/assessment?embed=true&partner=YOUR_PARTNER_ID';
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.allow = 'clipboard-write';
    document.getElementById('flow-circuit-embed').appendChild(iframe);
  })();
</script>`;

  const apiExample = `// Enterprise API Example
const response = await fetch('${window.location.origin}/api/v1/assessments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY',
  },
  body: JSON.stringify({
    guestName: 'Jane Smith',
    guestEmail: 'jane@company.com',
    domain: 'company.com',
    role: 'Spark',
    score: 85,
    scores: { Spark: 42, Amplifier: 28, Filter: 15, Ground: 10, Conductor: 5 },
  }),
});

const data = await response.json();
console.log(data.assessment);`;

  const webhookExample = `// Webhook Payload (sent on assessment completion)
{
  "event": "assessment.completed",
  "timestamp": "2026-02-14T07:00:00.000Z",
  "data": {
    "assessmentId": 123,
    "guestName": "Jane Smith",
    "guestEmail": "jane@company.com",
    "domain": "company.com",
    "role": "Spark",
    "score": 85,
    "combinationProfile": "Spark-Amplifier",
    "purityScore": 0.72,
    "percentile": 88
  }
}`;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Palette className="w-8 h-8" />
              White-Label Configuration
            </h1>
            <p className="text-muted-foreground mt-1">
              Embed the Flow Circuit assessment in your own platform with custom branding
            </p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Admin Dashboard
          </Button>
        </div>

        <div className="space-y-8">
          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Drop this snippet into any webpage to embed the Flow Circuit assessment.
                Replace <code className="bg-gray-100 px-1 rounded">YOUR_PARTNER_ID</code> with your
                assigned partner identifier.
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">
                  {embedSnippet}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  onClick={() => copyToClipboard(embedSnippet, "Embed code")}
                >
                  {copied === "Embed code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Globe className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>Custom domain support:</strong> For enterprise clients, we can configure a custom
                  subdomain (e.g., <code>assessment.yourcompany.com</code>) that serves the assessment with
                  your branding. Contact us to set this up.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Branding Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Enterprise clients can customize the following elements. These settings apply when the
                assessment is accessed via your partner embed or custom domain.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Visual Identity</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Company Logo", desc: "Replaces Flow Circuit logo in header", status: "Available" },
                      { label: "Primary Color", desc: "Accent color for buttons and highlights", status: "Available" },
                      { label: "Font Family", desc: "Custom typography via Google Fonts", status: "Available" },
                      { label: "Background Style", desc: "Light, dark, or custom gradient", status: "Available" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Content Control</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Custom Welcome Text", desc: "Personalized intro for your audience", status: "Available" },
                      { label: "Results Co-branding", desc: "Your logo on results and PDF exports", status: "Available" },
                      { label: "Custom Email Templates", desc: "Branded drip emails with your voice", status: "Coming Soon" },
                      { label: "Custom Role Names", desc: "Rename roles to match your framework", status: "Enterprise" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          item.status === "Available" ? "text-green-600 bg-green-50" :
                          item.status === "Coming Soon" ? "text-amber-600 bg-amber-50" :
                          "text-purple-600 bg-purple-50"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                REST API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Use the REST API to integrate assessment data into your own systems.
                All endpoints require an API key via the <code className="bg-gray-100 px-1 rounded">x-api-key</code> header.
              </p>

              <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Endpoints</h3>
                <div className="space-y-2">
                  {[
                    { method: "GET", path: "/api/v1/health", desc: "Health check (no auth required)" },
                    { method: "POST", path: "/api/v1/assessments", desc: "Submit assessment results" },
                    { method: "GET", path: "/api/v1/assessments/:domain", desc: "Get assessments by domain" },
                    { method: "GET", path: "/api/v1/norming", desc: "Get aggregate norming data" },
                    { method: "GET", path: "/api/v1/teams/:teamId", desc: "Get team data with assessments" },
                  ].map((ep) => (
                    <div key={ep.path} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        ep.method === "GET" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {ep.method}
                      </span>
                      <code className="text-sm font-mono">{ep.path}</code>
                      <span className="text-xs text-muted-foreground ml-auto">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">
                  {apiExample}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  onClick={() => copyToClipboard(apiExample, "API example")}
                >
                  {copied === "API example" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="relative">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Webhook Payload</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">
                  {webhookExample}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  onClick={() => copyToClipboard(webhookExample, "Webhook example")}
                >
                  {copied === "Webhook example" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Getting Started with White-Label</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    step: "1",
                    title: "Request API Key",
                    desc: "Contact us to receive your enterprise API key and partner ID.",
                  },
                  {
                    step: "2",
                    title: "Configure Branding",
                    desc: "Submit your logo, colors, and custom text. We'll configure your white-label instance.",
                  },
                  {
                    step: "3",
                    title: "Embed or Integrate",
                    desc: "Use the embed code for quick setup, or the REST API for deep integration.",
                  },
                ].map((s) => (
                  <div key={s.step} className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mb-3">
                      {s.step}
                    </div>
                    <h4 className="font-bold mb-1">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="gap-2" onClick={() => {
                  window.open("mailto:enterprise@theflowcircuit.com?subject=White-Label%20Inquiry", "_blank");
                }}>
                  <ExternalLink className="w-4 h-4" /> Contact Enterprise Sales
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => router.push("/pricing")}>
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
