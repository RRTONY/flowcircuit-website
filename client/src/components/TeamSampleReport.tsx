import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, ArrowRight, BookOpen, AlertTriangle, CheckCircle2, Users } from "lucide-react";

export default function TeamSampleReport() {
  const teamRoster = [
    { name: "Sarah J.", role: "Spark", score: 92, desc: "Visionary, high energy, low detail." },
    { name: "Mike T.", role: "Anchor", score: 88, desc: "Stabilizer, risk-averse, process-driven." },
    { name: "Elena R.", role: "Amplifier", score: 85, desc: "Connector, persuasive, scales ideas." },
    { name: "David K.", role: "Filter", score: 79, desc: "Critic, quality control, finds flaws." },
    { name: "Jessica L.", role: "Spark", score: 81, desc: "Creative, erratic, needs structure." },
    { name: "Tom B.", role: "Anchor", score: 90, desc: "Execution machine, resists change." },
    { name: "Chris P.", role: "Amplifier", score: 76, desc: "Sales focused, optimistic." },
    { name: "Amanda W.", role: "Filter", score: 84, desc: "Data-driven, skeptical." },
    { name: "Robert H.", role: "Spark", score: 72, desc: "Idea generator, easily distracted." },
    { name: "Lisa M.", role: "Anchor", score: 86, desc: "Reliable, grounded, slow to pivot." }
  ];

  const frictionPoints = [
    {
      pair: "Spark (Sarah) vs. Anchor (Mike)",
      severity: "High",
      issue: "Vision vs. Reality",
      desc: "Sarah feels blocked by Mike's questions. Mike feels panicked by Sarah's lack of plan.",
      cost: "$12k/mo in meeting delays"
    },
    {
      pair: "Filter (David) vs. Amplifier (Elena)",
      severity: "Medium",
      issue: "Quality vs. Speed",
      desc: "David wants to test more. Elena wants to launch now. Launch delayed by 3 weeks.",
      cost: "$45k opportunity cost"
    }
  ];

  const deliverables = [
    {
      title: "The Flow Playbook",
      desc: "Custom protocols for this specific team configuration.",
      items: ["Spark-Anchor Handoff Checklist", "Meeting Agenda Templates", "Decision Rights Matrix"]
    },
    {
      title: "Individual User Manuals",
      desc: "A 'How to Work With Me' guide for every member.",
      items: ["Communication Style", "Trigger Warnings", "Motivation Keys"]
    },
    {
      title: "Re-Org Recommendation",
      desc: "Data-backed suggestion to split into two squads.",
      items: ["Innovation Squad (Sparks/Amps)", "Execution Squad (Filters/Anchors)"]
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Section 1: The Roster */}
      <Card className="border-primary/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="text-primary" />
            The Team Audit
          </CardTitle>
          <CardDescription>
            We analyzed 10 profiles. Here is your raw human capital map.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamRoster.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                    ${member.role === 'Spark' ? 'bg-yellow-500/20 text-yellow-500' : 
                      member.role === 'Anchor' ? 'bg-blue-500/20 text-blue-500' :
                      member.role === 'Amplifier' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-red-500/20 text-red-500'}`}
                  >
                    {member.role[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.desc}</div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">{member.role}</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Friction Analysis */}
      <Card className="border-red-500/20 bg-red-950/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-red-400">
            <AlertTriangle />
            Friction Detection
          </CardTitle>
          <CardDescription>
            Where your team is bleeding money and energy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {frictionPoints.map((point, i) => (
            <div key={i} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-red-200">{point.pair}</h4>
                <Badge variant="destructive">{point.severity} Severity</Badge>
              </div>
              <p className="text-sm text-red-200/80 mb-2"><strong>Issue:</strong> {point.issue} - {point.desc}</p>
              <div className="text-xs font-mono text-red-400 bg-red-950/30 p-2 rounded inline-block">
                Est. Cost: {point.cost}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 3: The Deliverables */}
      <Card className="border-green-500/20 bg-green-950/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-green-400">
            <CheckCircle2 />
            Your Deliverables
          </CardTitle>
          <CardDescription>
            The tactical playbook you receive to fix the friction.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {deliverables.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 h-full">
              <h4 className="font-bold text-green-200 mb-2">{item.title}</h4>
              <p className="text-xs text-green-200/70 mb-4">{item.desc}</p>
              <ul className="space-y-2">
                {item.items.map((sub, j) => (
                  <li key={j} className="text-xs flex items-center gap-2 text-green-100">
                    <div className="w-1 h-1 bg-green-400 rounded-full" />
                    {sub}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
