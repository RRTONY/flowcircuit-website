import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Copy, Check } from "lucide-react";
import { Role, getRoleColor } from "@/lib/surveyData";
import { useState } from "react";

interface TeamMember {
  role: Role;
}

interface HiringGuideProps {
  members: TeamMember[];
}

export default function HiringGuide({ members }: HiringGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  // Calculate missing roles
  const roleCounts = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const missingRoles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"].filter(
    role => !roleCounts[role]
  );

  const getInterviewQuestions = (role: string) => {
    switch (role) {
      case "Spark":
        return [
          "Tell me about a time you had an idea that everyone else thought was impossible.",
          "How do you handle it when a project gets bogged down in details?",
          "What is your process for generating new concepts under pressure?"
        ];
      case "Amplifier":
        return [
          "Describe how you take a small idea and make it massive.",
          "How do you get other people excited about a vision that isn't yours?",
          "Tell me about a time you connected two unrelated networks to create value."
        ];
      case "Filter":
        return [
          "Tell me about a time you had to kill a popular project because it wasn't viable.",
          "How do you deliver critical feedback to a visionary leader?",
          "What is your framework for risk assessment?"
        ];
      case "Ground":
        return [
          "Describe a project where you had to turn a vague vision into a concrete plan.",
          "How do you handle scope creep?",
          "What tools do you use to ensure execution happens on time and on budget?"
        ];
      case "Conductor":
        return [
          "Tell me about a time you had to mediate a conflict between two strong personalities.",
          "How do you ensure everyone on the team feels heard?",
          "What is your approach to aligning diverse skill sets toward a common goal?"
        ];
      default:
        return [];
    }
  };

  const copyQuestions = (role: string) => {
    const questions = getInterviewQuestions(role).join("\n");
    navigator.clipboard.writeText(questions);
    setCopied(role);
    setTimeout(() => setCopied(null), 2000);
  };

  if (missingRoles.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold uppercase flex items-center gap-2 text-white">
            <Briefcase className="w-5 h-5 text-green-400" /> Hiring Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-200 text-sm">
              Your circuit is fully connected. You have coverage across all 5 energy types.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold uppercase flex items-center gap-2 text-white">
          <Briefcase className="w-5 h-5 text-purple-400" /> Hiring Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-400">
          Based on your matrix, you have critical gaps in <strong>{missingRoles.join(", ")}</strong> energy. 
          Use these questions to screen candidates for these specific traits.
        </p>

        <div className="space-y-4">
          {missingRoles.map(role => (
            <div key={role} className="bg-black/30 border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`font-bold ${getRoleColor(role as Role)} flex items-center gap-2`}>
                  <Plus className="w-4 h-4" /> Hiring for: {role}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-gray-400 hover:text-white"
                  onClick={() => copyQuestions(role)}
                >
                  {copied === role ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied === role ? "Copied" : "Copy Questions"}
                </Button>
              </div>
              <ul className="space-y-2">
                {getInterviewQuestions(role).map((q, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-gray-600">•</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
