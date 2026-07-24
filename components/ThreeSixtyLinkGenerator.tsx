import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Users,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Share2,
  Eye,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  assessmentId: number;
  subjectName: string;
  subjectEmail?: string;
  selfScores?: Record<string, number>;
  domain?: string;
}

export default function ThreeSixtyLinkGenerator({
  assessmentId,
  subjectName,
  subjectEmail,
  selfScores,
  domain,
}: Props) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Check if session already exists
  const existingSession = trpc.threeSixty.getByAssessment.useQuery(
    { assessmentId },
    { enabled: showGenerator }
  );

  const createSession = trpc.threeSixty.createSession.useMutation();

  const [session, setSession] = useState<{
    token: string;
    responseCount: number;
  } | null>(null);

  useEffect(() => {
    if (existingSession.data) {
      setSession({
        token: existingSession.data.session.token,
        responseCount: existingSession.data.responseCount,
      });
    }
  }, [existingSession.data]);

  const handleGenerate = async () => {
    if (session) return;

    const result = await createSession.mutateAsync({
      subjectName,
      subjectEmail: subjectEmail || undefined,
      assessmentId,
      teamSlug: domain || undefined,
      selfScores: selfScores || undefined,
    });

    setSession({
      token: result.session.token,
      responseCount: result.responseCount,
    });
  };

  const reviewLink = useMemo(() => {
    if (!session) return "";
    return `${window.location.origin}/360/${session.token}`;
  }, [session]);

  const firstName = subjectName.split(" ")[0];

  const defaultMessage = useMemo(
    () =>
      `Hey — I just took a 2-minute energy assessment and I'd love your honest perspective on how I show up.\n\nIt takes 30 seconds. Just drag-rank 5 energy types from "most like me" to "least like me":\n\n${reviewLink}\n\nNo login needed. Totally anonymous. Thanks!`,
    [reviewLink]
  );

  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    if (reviewLink) {
      setInviteMessage(defaultMessage);
    }
  }, [reviewLink, defaultMessage]);

  const copyLink = () => {
    navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    toast.success("Link copied!", {
      description: "Share it with your colleagues.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedMessage(true);
    toast.success("Message copied!", {
      description: "Paste it in Slack, email, or text.",
    });
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // ─── PRE-GENERATE STATE ───────────────────────────────────────────────
  if (!showGenerator) {
    return (
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <CardContent className="relative p-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-display font-bold text-foreground text-xl tracking-tight">
                  Discover Your Blind Spots
                </h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-md">
                  Get 3+ people who know you to rank your energy in
                  30 seconds. You'll receive a gap report showing
                  where self-perception diverges from reality.
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  30 seconds for reviewers
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Anonymous responses
                </span>
              </div>

              <Button
                onClick={() => setShowGenerator(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                Generate My 360 Link
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── ACTIVE / GENERATED STATE ─────────────────────────────────────────
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card shadow-lg">
      {/* Header gradient strip */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

      <CardContent className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-lg tracking-tight">
                Your 360 Peer Review
              </h3>
              {session && (
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      session.responseCount >= 3
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-accent"
                    }`}
                  />
                  <p className="text-xs font-medium text-muted-foreground">
                    {session.responseCount} response
                    {session.responseCount !== 1 ? "s" : ""} received
                    {session.responseCount >= 3 && (
                      <span className="text-emerald-600 ml-1">
                        — Gap report ready
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {!session ? (
          <Button
            onClick={handleGenerate}
            disabled={createSession.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md"
          >
            {createSession.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate My 360 Link
              </span>
            )}
          </Button>
        ) : (
          <>
            {/* Link display + copy */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your unique review link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={reviewLink}
                    readOnly
                    className="bg-muted/50 border-border font-mono text-sm pr-3 h-11 rounded-xl"
                  />
                </div>
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className={`shrink-0 h-11 w-11 rounded-xl border-border transition-all duration-200 ${
                    copied
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Responses needed for gap report
                </span>
                <span className="text-xs font-bold text-foreground">
                  {session.responseCount}/3
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-accent"
                  style={{
                    width: `${Math.min(
                      (session.responseCount / 3) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`flex items-center gap-1 text-xs ${
                      session.responseCount >= n
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {session.responseCount >= n ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-muted-foreground/40" />
                    )}
                    Reviewer {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Editable invite message */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Invite message
                </label>
                <span className="text-xs text-muted-foreground">
                  Editable — make it yours
                </span>
              </div>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={5}
                className="bg-muted/30 border-border text-sm rounded-xl resize-none focus:ring-primary/20"
              />
              <Button
                onClick={copyMessage}
                variant="outline"
                className={`w-full rounded-xl border-border font-medium transition-all duration-200 ${
                  copiedMessage
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                {copiedMessage ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Message to Share
                  </>
                )}
              </Button>
            </div>

            {/* Gap report CTA */}
            {session.responseCount >= 3 && (
              <a href={`/360-results/${assessmentId}`} className="block">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Your Gap Report ({session.responseCount} responses)
                </Button>
              </a>
            )}

            {/* Footer tip */}
            <p className="text-xs text-center text-muted-foreground leading-relaxed pt-1">
              Share this link with 3+ people who know you well.
              They rank your energy types in 30 seconds — completely
              anonymous. You get a gap report revealing blind spots.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
