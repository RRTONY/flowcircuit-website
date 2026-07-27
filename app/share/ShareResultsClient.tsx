"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, ExternalLink, Zap, Shield, Target, Layers, Radio, FileDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const roleDescriptions: Record<string, { icon: React.ReactNode; color: string; tagline: string; description: string }> = {
  Spark: {
    icon: <Zap className="w-8 h-8" />,
    color: "text-yellow-400",
    tagline: "The Innovator",
    description: "You are the origin point of new ideas. Your mind naturally generates novel connections and possibilities that others cannot see.",
  },
  Amplifier: {
    icon: <Radio className="w-8 h-8" />,
    color: "text-blue-400",
    tagline: "The Expander",
    description: "You take raw ideas and give them reach. Your energy naturally amplifies signals, building momentum and excitement around new concepts.",
  },
  Filter: {
    icon: <Shield className="w-8 h-8" />,
    color: "text-purple-400",
    tagline: "The Refiner",
    description: "You are the quality gate. Your natural instinct is to stress-test, refine, and ensure only the strongest ideas survive.",
  },
  Ground: {
    icon: <Target className="w-8 h-8" />,
    color: "text-green-400",
    tagline: "The Executor",
    description: "You turn vision into reality. Your energy naturally flows toward implementation, structure, and measurable outcomes.",
  },
  Conductor: {
    icon: <Layers className="w-8 h-8" />,
    color: "text-orange-400",
    tagline: "The Orchestrator",
    description: "You see the whole system. Your natural gift is reading the energy of the room and directing flow where it is needed most.",
  },
};

export default function ShareResults() {
  const [copied, setCopied] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const generateReport = trpc.assessment.generateReport.useMutation();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = searchParams.get("token");

  const { data: assessment, isLoading } = trpc.assessment.getByShareToken.useQuery(
    { token: token! },
    { enabled: !!token }
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Invalid Share Link</h1>
          <p className="text-gray-400">This link does not contain a valid share token.</p>
          <Button onClick={() => { window.location.href = "/"; }} className="bg-white text-black hover:bg-gray-200">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Result Not Found</h1>
          <p className="text-gray-400">This assessment result may not be shared publicly or the link has expired.</p>
          <Button onClick={() => { window.location.href = "/"; }} className="bg-white text-black hover:bg-gray-200">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const roleInfo = roleDescriptions[assessment.role] || roleDescriptions.Spark;
  const shareUrl = window.location.href;
  const scores = (assessment.scores as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-gray-500 uppercase tracking-widest">Flow Circuit Assessment Result</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">
            {assessment.guestName || "Anonymous"}
          </h1>
          <div className={`inline-flex items-center gap-3 text-3xl font-bold ${roleInfo.color}`}>
            {roleInfo.icon}
            <span>{assessment.role}</span>
            <span className="text-lg text-gray-400 font-normal">— {roleInfo.tagline}</span>
          </div>
        </motion.div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-8 space-y-4">
            <p className="text-lg text-gray-300 leading-relaxed">{roleInfo.description}</p>
            <div className="text-sm text-gray-500">
              Dominant Score: <strong className="text-white">{assessment.score}%</strong>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        {Object.keys(scores).length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Energy Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(scores).sort(([, a], [, b]) => (b as number) - (a as number)).map(([role, score]) => (
                <div key={role} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{role}</span>
                    <span className="text-gray-400">{score as number}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${role === assessment.role ? "bg-yellow-400" : "bg-white/30"}`}
                      style={{ width: `${score as number}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* PDF Report */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Flow Circuit Report</h3>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Personalized PDF with results, resonance guide, and 360° invite template.
                </p>
              </div>
              <Button
                onClick={async () => {
                  if (reportUrl) {
                    window.open(reportUrl, '_blank');
                    return;
                  }
                  if (!assessment?.id || reportGenerating) return;
                  setReportGenerating(true);
                  try {
                    const result = await generateReport.mutateAsync({
                      assessmentId: assessment.id,
                      origin: window.location.origin,
                    });
                    setReportUrl(result.url);
                    window.open(result.url, '_blank');
                  } catch (err) {
                    console.error('Failed to generate report', err);
                  } finally {
                    setReportGenerating(false);
                  }
                }}
                disabled={reportGenerating}
                className="bg-yellow-400 text-black hover:bg-white font-bold px-6 h-10 shrink-0"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {reportGenerating ? 'Generating...' : reportUrl ? 'Download PDF' : 'Get PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Share Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Share Link"}
          </Button>
          <Button
            onClick={() => { window.location.href = "/assessment"; }}
            className="bg-yellow-400 text-black hover:bg-white font-bold"
          >
            Take the Assessment <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={() => { window.location.href = "/feedback"; }}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Share Your Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
