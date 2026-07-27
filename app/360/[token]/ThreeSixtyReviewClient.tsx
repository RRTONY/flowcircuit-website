"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

const ENERGY_TYPES = [
  {
    key: "spark",
    label: "Spark",
    color: "#F59E0B",
    description: "Generates ideas, sees possibilities, starts things",
  },
  {
    key: "amplifier",
    label: "Amplifier",
    color: "#8B5CF6",
    description: "Builds momentum, connects people, sells the vision",
  },
  {
    key: "filter",
    label: "Filter",
    color: "#3B82F6",
    description: "Questions assumptions, finds flaws, ensures quality",
  },
  {
    key: "ground",
    label: "Ground",
    color: "#10B981",
    description: "Executes reliably, finishes what others start",
  },
  {
    key: "conductor",
    label: "Conductor",
    color: "#EC4899",
    description: "Orchestrates flow, removes blockers, keeps rhythm",
  },
];

export default function ThreeSixtyReviewClient({ token }: { token: string }) {
  const { data, isLoading, error } = trpc.threeSixty.getSession.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const submitMutation = trpc.threeSixty.submitResponse.useMutation();

  const [rankings, setRankings] = useState<string[]>([
    "spark",
    "amplifier",
    "filter",
    "ground",
    "conductor",
  ]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const moveItem = useCallback(
    (index: number, direction: "up" | "down") => {
      const newRankings = [...rankings];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newRankings.length) return;
      [newRankings[index], newRankings[targetIndex]] = [
        newRankings[targetIndex],
        newRankings[index],
      ];
      setRankings(newRankings);
    },
    [rankings]
  );

  const handleSubmit = async () => {
    // Convert position to rank (position 0 = rank 1 = most like them)
    const rankMap: Record<string, number> = {};
    rankings.forEach((key, i) => {
      rankMap[key] = i + 1;
    });

    await submitMutation.mutateAsync({
      token,
      reviewerName: reviewerName || undefined,
      reviewerEmail: reviewerEmail || undefined,
      reviewerRelationship: relationship || undefined,
      sparkRank: rankMap["spark"],
      amplifierRank: rankMap["amplifier"],
      filterRank: rankMap["filter"],
      groundRank: rankMap["ground"],
      conductorRank: rankMap["conductor"],
    });

    setSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-pulse text-[#2C1810]/60 text-lg">
          Loading review...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#E8DDD3]">
          <CardContent className="p-8 text-center">
            <p className="text-[#2C1810] text-lg font-semibold mb-2">
              Link Not Found
            </p>
            <p className="text-[#2C1810]/60">
              This 360 review link may have expired or is invalid.
              Please ask the person who sent it
              to generate a new one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#E8DDD3]">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#2C1810] mb-2">
              Thank You!
            </h2>
            <p className="text-[#2C1810]/70 mb-6">
              Your review of{" "}
              <span className="font-semibold">
                {data.session.subjectName}
              </span>{" "}
              has been submitted. They'll see the aggregated
              results once 3 or more people respond.
            </p>
            <div className="border-t border-[#E8DDD3] pt-6 mt-6">
              <p className="text-sm text-[#2C1810]/60 mb-3">
                Curious about your own energy type?
              </p>
              <a href="/assessment">
                <Button className="bg-[#2C1810] hover:bg-[#1a0f0a] text-white">
                  Take the Free Assessment
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjectFirstName = data.session.subjectName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-[#2C1810]/50 mb-2">
            360 Peer Review
          </p>
          <h1 className="text-3xl font-bold text-[#2C1810] mb-2">
            How does{" "}
            <span className="text-amber-600">{subjectFirstName}</span>{" "}
            show up?
          </h1>
          <p className="text-[#2C1810]/70 max-w-sm mx-auto">
            Rank these 5 energy types from{" "}
            <strong>most like {subjectFirstName}</strong> (top) to{" "}
            <strong>least like them</strong> (bottom).
          </p>
        </div>

        {/* Ranking UI */}
        <Card className="border-[#E8DDD3] mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2">
              {rankings.map((key, index) => {
                const energy = ENERGY_TYPES.find((e) => e.key === key)!;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#E8DDD3] bg-white hover:bg-[#FAF8F5] transition-colors"
                  >
                    {/* Rank number */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: energy.color }}
                    >
                      {index + 1}
                    </div>

                    {/* Grip + Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-[#2C1810]/30 shrink-0" />
                        <div>
                          <p className="font-semibold text-[#2C1810] text-sm sm:text-base">
                            {energy.label}
                          </p>
                          <p className="text-xs text-[#2C1810]/50 hidden sm:block">
                            {energy.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Move buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-[#E8DDD3] disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                        aria-label={`Move ${energy.label} up`}
                      >
                        <ArrowUp className="w-4 h-4 text-[#2C1810]" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === rankings.length - 1}
                        className="p-1 rounded hover:bg-[#E8DDD3] disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                        aria-label={`Move ${energy.label} down`}
                      >
                        <ArrowDown className="w-4 h-4 text-[#2C1810]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-[#2C1810]/40 mt-3">
              Use arrows to reorder. Top = most like {subjectFirstName}.
            </p>
          </CardContent>
        </Card>

        {/* Optional info */}
        <Card className="border-[#E8DDD3] mb-6">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <p className="text-sm text-[#2C1810]/60 font-medium">
              Optional — helps {subjectFirstName} understand context
            </p>

            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="reviewerName"
                  className="text-xs text-[#2C1810]/70"
                >
                  Your name
                </Label>
                <Input
                  id="reviewerName"
                  placeholder="Anonymous if blank"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="border-[#E8DDD3] bg-white"
                />
              </div>

              <div>
                <Label
                  htmlFor="reviewerEmail"
                  className="text-xs text-[#2C1810]/70"
                >
                  Your email
                </Label>
                <Input
                  id="reviewerEmail"
                  type="email"
                  placeholder="Optional"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="border-[#E8DDD3] bg-white"
                />
              </div>

              <div>
                <Label className="text-xs text-[#2C1810]/70">
                  Your relationship to {subjectFirstName}
                </Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger className="border-[#E8DDD3] bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">
                      Their manager
                    </SelectItem>
                    <SelectItem value="direct_report">
                      Their direct report
                    </SelectItem>
                    <SelectItem value="peer">Peer / colleague</SelectItem>
                    <SelectItem value="client">Client / customer</SelectItem>
                    <SelectItem value="friend">Friend / family</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="w-full py-6 text-lg bg-[#2C1810] hover:bg-[#1a0f0a] text-white"
        >
          {submitMutation.isPending
            ? "Submitting..."
            : `Submit Review of ${subjectFirstName}`}
        </Button>

        <p className="text-xs text-center text-[#2C1810]/40 mt-4">
          Responses are aggregated anonymously.{" "}
          {subjectFirstName} only sees averages, never individual rankings.
        </p>
      </div>
    </div>
  );
}
