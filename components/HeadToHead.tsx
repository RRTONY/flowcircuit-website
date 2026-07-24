import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users, Zap, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Role, getRoleColor } from "@/lib/surveyData";

interface TeamMember {
  id: string;
  name: string;
  role: Role;
  score: number;
}

interface HeadToHeadProps {
  members: TeamMember[];
}

export default function HeadToHead({ members }: HeadToHeadProps) {
  const [memberA, setMemberA] = useState<string>("");
  const [memberB, setMemberB] = useState<string>("");

  const getMember = (id: string) => members.find(m => m.id === id);

  const analyzeDynamics = (roleA: Role, roleB: Role) => {
    // Simple matrix of interactions
    // In a real app, this would be a complex lookup table
    if (roleA === roleB) {
      return {
        status: "Resonance",
        color: "text-green-400",
        description: "High alignment. You speak the same language, but may share the same blind spots.",
        tip: "Intentionally invite a third perspective to challenge your consensus."
      };
    }
    
    const pairs = [roleA, roleB].sort().join("-");
    
    switch (pairs) {
      case "Amplifier-Spark":
        return {
          status: "Acceleration",
          color: "text-yellow-400",
          description: "Explosive creativity. Spark ignites, Amplifier expands. Risk of burnout or lack of grounding.",
          tip: "Ensure you have a Filter or Ground to operationalize your ideas."
        };
      case "Filter-Spark":
        return {
          status: "Friction",
          color: "text-red-400",
          description: "Classic tension. Spark wants to go, Filter wants to pause. This friction is healthy if managed, toxic if personal.",
          tip: "Spark: Don't take questions as attacks. Filter: Validate the vision before critiquing the mechanics."
        };
      case "Ground-Spark":
        return {
          status: "Anchor",
          color: "text-blue-400",
          description: "Spark flies high, Ground stays low. Essential for turning dreams into reality, but communication can be difficult.",
          tip: "Translate 'Vision' into 'Milestones'. Use the Conductor as a translator."
        };
      default:
        return {
          status: "Complementary",
          color: "text-purple-400",
          description: "Different energies that can support each other if roles are clear.",
          tip: "Focus on the hand-off points. Where does one responsibility end and the other begin?"
        };
    }
  };

  const selectedA = getMember(memberA);
  const selectedB = getMember(memberB);
  const analysis = selectedA && selectedB ? analyzeDynamics(selectedA.role, selectedB.role) : null;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold uppercase flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-blue-400" /> Head-to-Head Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Member A</label>
            <Select value={memberA} onValueChange={setMemberA}>
              <SelectTrigger className="bg-black/50 border-white/10 text-white">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Member B</label>
            <Select value={memberB} onValueChange={setMemberB}>
              <SelectTrigger className="bg-black/50 border-white/10 text-white">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                {members.filter(m => m.id !== memberA).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {analysis && selectedA && selectedB && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-black/30 border border-white/5 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className={`text-xs font-bold ${getRoleColor(selectedA.role)}`}>{selectedA.role}</div>
                  <div className="text-sm font-bold text-white">{selectedA.name}</div>
                </div>
                <div className="text-gray-500 font-mono text-xs">VS</div>
                <div className="text-center">
                  <div className={`text-xs font-bold ${getRoleColor(selectedB.role)}`}>{selectedB.role}</div>
                  <div className="text-sm font-bold text-white">{selectedB.name}</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className={`text-lg font-black uppercase mb-1 ${analysis.color}`}>
                  {analysis.status}
                </div>
                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                  {analysis.description}
                </p>
                <div className="bg-white/5 p-3 rounded border-l-2 border-white/20">
                  <p className="text-xs text-gray-400 italic">
                    <strong className="text-white not-italic">Manager's Tip:</strong> {analysis.tip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!analysis && (
          <div className="text-center py-8 text-gray-500 text-sm italic">
            Select two members to analyze their interaction dynamics.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
