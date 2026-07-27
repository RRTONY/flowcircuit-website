"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-all hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AlphaFeedbackClient() {
  const [submitted, setSubmitted] = useState(false);
  const [authorName, setAuthorName] = useState(() => localStorage.getItem("assessment_guest_name") || "");
  const [authorEmail, setAuthorEmail] = useState("");
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [teamInsightRating, setTeamInsightRating] = useState(0);
  const [teamComment, setTeamComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [suggestion, setSuggestion] = useState("");

  const assessmentId = parseInt(localStorage.getItem("assessment_id") || "0");
  const teamId = parseInt(localStorage.getItem("assessment_team_id") || "0");

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = () => {
    submitFeedback.mutate({
      assessmentId: assessmentId || undefined,
      teamId: teamId || undefined,
      authorName,
      authorEmail: authorEmail || undefined,
      accuracyRating: accuracyRating || undefined,
      comment: comment || undefined,
      teamInsightRating: teamInsightRating || undefined,
      teamComment: teamComment || undefined,
      wouldRecommend: wouldRecommend ?? undefined,
      suggestion: suggestion || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-lg"
        >
          <div className="flex justify-center">
            <div className="bg-green-500 p-4 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Feedback Received</h1>
          <p className="text-gray-300 text-lg">
            Thank you for being part of the alpha, <strong className="text-white">{authorName}</strong>. Your feedback is shaping the future of team dynamics assessment.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => { window.location.href = "/results"; }}
              className="bg-white text-black hover:bg-gray-200 font-bold"
            >
              View My Results
            </Button>
            <Button
              onClick={() => { window.location.href = "/"; }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
            <MessageSquare className="w-4 h-4" /> Alpha Feedback
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Share Your Impression
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            You are one of the first people to experience The Flow Circuit. Your honest feedback is invaluable.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Identity */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Your Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Name *</Label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your name"
                    className="bg-black/50 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email (optional)</Label>
                  <Input
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-black/50 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Assessment Feedback */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Your Individual Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating
                value={accuracyRating}
                onChange={setAccuracyRating}
                label="How accurate was your role assignment? (1 = Way Off, 5 = Nailed It)"
              />
              <div className="space-y-2">
                <Label className="text-gray-300">What was your reaction? Did anything surprise you?</Label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your honest impression..."
                  className="w-full bg-black/50 border border-white/20 text-white rounded-lg p-4 min-h-[120px] resize-y focus:border-yellow-400/50 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Dynamic Feedback */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Team Dynamic Report (if you saw it)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating
                value={teamInsightRating}
                onChange={setTeamInsightRating}
                label="How useful was the team matrix/group dynamic view? (1 = Not Useful, 5 = Game-Changing)"
              />
              <div className="space-y-2">
                <Label className="text-gray-300">Any thoughts on the team dynamics insights?</Label>
                <textarea
                  value={teamComment}
                  onChange={(e) => setTeamComment(e.target.value)}
                  placeholder="What did you notice about the team view..."
                  className="w-full bg-black/50 border border-white/20 text-white rounded-lg p-4 min-h-[100px] resize-y focus:border-yellow-400/50 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Overall Alpha Feedback */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Overall Alpha Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Would you recommend this to other teams?</Label>
                <div className="flex gap-4">
                  <Button
                    variant={wouldRecommend === true ? "default" : "outline"}
                    onClick={() => setWouldRecommend(true)}
                    className={wouldRecommend === true ? "bg-green-600 hover:bg-green-700 text-white" : "border-white/20 text-white hover:bg-white/10"}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" /> Yes, absolutely
                  </Button>
                  <Button
                    variant={wouldRecommend === false ? "default" : "outline"}
                    onClick={() => setWouldRecommend(false)}
                    className={wouldRecommend === false ? "bg-red-600 hover:bg-red-700 text-white" : "border-white/20 text-white hover:bg-white/10"}
                  >
                    Not yet
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Any suggestions for improvement?</Label>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="What would make this better..."
                  className="w-full bg-black/50 border border-white/20 text-white rounded-lg p-4 min-h-[100px] resize-y focus:border-yellow-400/50 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!authorName.trim() || submitFeedback.isPending}
            className="w-full bg-yellow-400 text-black hover:bg-white h-14 text-lg font-bold uppercase tracking-widest"
          >
            {submitFeedback.isPending ? "Submitting..." : (
              <span className="flex items-center gap-2"><Send className="w-5 h-5" /> Submit Feedback</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
