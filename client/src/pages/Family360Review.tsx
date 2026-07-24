import { useState, useCallback, useMemo } from "react";
import { useRoute } from "wouter";
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
import { CheckCircle, ArrowUp, ArrowDown, Heart, Sparkles } from "lucide-react";

/**
 * Family 360 Review — same mechanics as the business 360,
 * but with family-appropriate language, relationship options,
 * and the family archetype names (Dreamer, Cheerleader, etc.)
 */

const FAMILY_ENERGY_TYPES = [
  {
    key: "spark",
    label: "The Dreamer",
    color: "#F59E0B",
    description: "Imagines what the family could become, proposes new adventures",
  },
  {
    key: "amplifier",
    label: "The Cheerleader",
    color: "#EF4444",
    description: "Rallies the family, celebrates wins, builds excitement",
  },
  {
    key: "filter",
    label: "The Protector",
    color: "#8B5CF6",
    description: "Asks the hard questions, sees risks, keeps everyone safe",
  },
  {
    key: "ground",
    label: "The Rock",
    color: "#2563EB",
    description: "Makes sure plans happen, pays bills, keeps promises",
  },
  {
    key: "conductor",
    label: "The Peacemaker",
    color: "#10B981",
    description: "Keeps everyone connected, resolves tensions, maintains harmony",
  },
];

const FAMILY_RELATIONSHIPS = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child (adult)" },
  { value: "sibling", label: "Sibling" },
  { value: "spouse", label: "Spouse / Partner" },
  { value: "grandparent", label: "Grandparent" },
  { value: "in_law", label: "In-law" },
  { value: "cousin", label: "Cousin" },
  { value: "other_family", label: "Other family member" },
];

export default function Family360Review() {
  const [, params] = useRoute("/family-360/:token");
  const token = params?.token || "";

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
    const rankMap: Record<string, number> = {};
    rankings.forEach((key, i) => {
      rankMap[key] = i + 1;
    });

    await submitMutation.mutateAsync({
      token,
      reviewerName: reviewerName || undefined,
      reviewerEmail: reviewerEmail || undefined,
      reviewerRelationship: relationship ? `family_${relationship}` : "family",
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
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-rose-400 text-lg">
          Loading family review...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-rose-200">
          <CardContent className="p-8 text-center">
            <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">
              Link Not Found
            </p>
            <p className="text-gray-500">
              This family review link may have expired or is invalid.
              Ask your family member to generate a new one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-rose-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your perspective on{" "}
              <span className="font-semibold text-rose-600">
                {data.session.subjectName}
              </span>{" "}
              has been recorded. They'll see the combined family perspective
              once 3 or more people respond.
            </p>
            <div className="border-t border-rose-100 pt-6 mt-6">
              <p className="text-sm text-gray-500 mb-3">
                Curious about your own family energy?
              </p>
              <a href="/assessment?context=family">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Discover Your Energy
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <p className="text-sm uppercase tracking-widest text-rose-400 font-bold">
              Family Energy Review
            </p>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            How does{" "}
            <span className="text-rose-600">{subjectFirstName}</span>{" "}
            show up at home?
          </h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            Rank these 5 family energies from{" "}
            <strong>most like {subjectFirstName}</strong> (top) to{" "}
            <strong>least like them</strong> (bottom).
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Think about how they are <em>at home</em> — not at work.
          </p>
        </div>

        {/* Ranking UI */}
        <Card className="border-rose-200 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2">
              {rankings.map((key, index) => {
                const energy = FAMILY_ENERGY_TYPES.find((e) => e.key === key)!;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-rose-100 bg-white hover:bg-rose-50/50 transition-colors"
                  >
                    {/* Rank number */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: energy.color }}
                    >
                      {index + 1}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {energy.label}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        {energy.description}
                      </p>
                    </div>

                    {/* Move buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-rose-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                        aria-label={`Move ${energy.label} up`}
                      >
                        <ArrowUp className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === rankings.length - 1}
                        className="p-1 rounded hover:bg-rose-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                        aria-label={`Move ${energy.label} down`}
                      >
                        <ArrowDown className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-gray-400 mt-3">
              Use arrows to reorder. Top = most like {subjectFirstName} at home.
            </p>
          </CardContent>
        </Card>

        {/* Optional info */}
        <Card className="border-rose-200 mb-6">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <p className="text-sm text-gray-500 font-medium">
              Optional — helps {subjectFirstName} understand your perspective
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="reviewerName" className="text-xs text-gray-600">
                  Your name
                </Label>
                <Input
                  id="reviewerName"
                  placeholder="Anonymous if blank"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="border-rose-200 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="reviewerEmail" className="text-xs text-gray-600">
                  Your email
                </Label>
                <Input
                  id="reviewerEmail"
                  type="email"
                  placeholder="Optional"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="border-rose-200 bg-white"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Your relationship to {subjectFirstName}
                </Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger className="border-rose-200 bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FAMILY_RELATIONSHIPS.map((rel) => (
                      <SelectItem key={rel.value} value={rel.value}>
                        {rel.label}
                      </SelectItem>
                    ))}
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
          className="w-full py-6 text-lg bg-rose-500 hover:bg-rose-600 text-white"
        >
          {submitMutation.isPending
            ? "Submitting..."
            : `Submit Family Review of ${subjectFirstName}`}
        </Button>

        <p className="text-xs text-center text-gray-400 mt-4">
          Responses are aggregated anonymously.{" "}
          {subjectFirstName} only sees averages, never individual rankings.
        </p>
      </div>
    </div>
  );
}
