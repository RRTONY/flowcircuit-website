import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Download, Users, Zap } from "lucide-react";

// --- Sample Data (matches the real report output) ---
const ROLE_COLORS: Record<string, string> = {
  Spark: "#C84B31",
  Amplifier: "#D4A03C",
  Filter: "#5B8C5A",
  Ground: "#6B8F71",
  Conductor: "#7B68AE",
};

interface SampleMember {
  name: string;
  initials: string;
  role: string;
  purity: number;
  comboLabel: string;
  x: number;
  y: number;
}

interface FrictionPair {
  badge: string;
  badgeColor: string;
  names: string;
  description: string;
  action: string;
}

interface Playbook {
  name: string;
  role: string;
  comboLabel: string;
  purity: number;
  superpower: string;
  leak: string;
  thisWeek: string;
}

// Fictional 8-person team for the sample
const sampleTeam: SampleMember[] = [
  { name: "Sarah Chen", initials: "SC", role: "Spark", purity: 88, comboLabel: "Spark-Amplifier", x: 82, y: 78 },
  { name: "Marcus Webb", initials: "MW", role: "Amplifier", purity: 72, comboLabel: "Amplifier-Conductor", x: 70, y: 62 },
  { name: "David Kim", initials: "DK", role: "Filter", purity: 94, comboLabel: "Filter-Ground", x: 25, y: 30 },
  { name: "Rachel Torres", initials: "RT", role: "Ground", purity: 85, comboLabel: "Ground-Filter", x: 30, y: 42 },
  { name: "James Okafor", initials: "JO", role: "Ground", purity: 67, comboLabel: "Ground-Amplifier", x: 45, y: 38 },
  { name: "Priya Sharma", initials: "PS", role: "Filter", purity: 78, comboLabel: "Filter-Conductor", x: 35, y: 25 },
  { name: "Tom Nguyen", initials: "TN", role: "Amplifier", purity: 63, comboLabel: "Amplifier-Spark", x: 75, y: 70 },
  { name: "Lisa Park", initials: "LP", role: "Spark", purity: 71, comboLabel: "Spark-Filter", x: 80, y: 55 },
];

const sampleFrictionPairs: FrictionPair[] = [
  {
    badge: "SPARK x FILTER",
    badgeColor: "#C84B31",
    names: "Sarah Chen and David Kim",
    description: "Sarah generates ideas at speed. David stress-tests everything. Without a protocol, this produces the most expensive friction on any team.",
    action: "Designate David as Red Team lead on strategy deliverables. When David knows the job is to find holes, they stop fighting the idea and start strengthening it.",
  },
  {
    badge: "SPARK x GROUND",
    badgeColor: "#C84B31",
    names: "Sarah Chen and Rachel Torres",
    description: "Sarah opens doors. Rachel has to walk through them and deliver. The gap between vision and execution structure is where work stalls.",
    action: "Every thread Rachel owns needs a written handoff note from Sarah within 24 hours — context, desired next step, what not to say. Remove the ambiguity.",
  },
  {
    badge: "AMPLIFIER x FILTER",
    badgeColor: "#D4A03C",
    names: "Marcus Webb and David Kim",
    description: "Marcus builds momentum and excitement. David needs proof before committing. Enthusiasm vs. evidence creates a natural tension.",
    action: "When Marcus needs buy-in from David, frame it as a defined deliverable with a deadline rather than 'this is exciting, let's go.' Amplifiers who speak Filter fluently become the most effective people on any team.",
  },
  {
    badge: "AMPLIFIER x GROUND",
    badgeColor: "#D4A03C",
    names: "Tom Nguyen and James Okafor",
    description: "Tom amplifies energy and builds momentum. James needs to know what they are building before they can build it.",
    action: "When Tom needs something from James, frame it as a defined deliverable with a deadline rather than 'this is exciting, let's go.'",
  },
];

const samplePlaybooks: Playbook[] = [
  {
    name: "Sarah Chen",
    role: "Spark",
    comboLabel: "Spark-Amplifier, 88% purity",
    purity: 88,
    superpower: "Sarah is the ignition source — sees the deal, the opportunity, the angle before anyone else has the language for it. The Amplifier secondary means Sarah can also rally others — rare for a Spark.",
    leak: "Sarah context-switches faster than the team can absorb. Every new thread opened without a handoff note creates drag for the execution team.",
    thisWeek: "For every open thread, write a 5-line brief: what it is, why now, who owns what, what done looks like. Send before the next team touchpoint.",
  },
  {
    name: "David Kim",
    role: "Filter",
    comboLabel: "Filter-Ground, 94% purity",
    purity: 94,
    superpower: "David sees risk, contradiction, and structural weakness faster than anyone else. This is not negativity — it is advanced pattern recognition for failure modes. At 94% purity, this is the highest-conviction Filter energy on the team.",
    leak: "Without a formal role, Filter energy lands as resistance. The team hears 'no' when David means 'here is the gap we have to fix first.'",
    thisWeek: "Ask to be formally designated Red Team lead on every strategy deliverable. Write a one-page Filter Review for the current highest-priority deck.",
  },
  {
    name: "Marcus Webb",
    role: "Amplifier",
    comboLabel: "Amplifier-Conductor, 72% purity",
    purity: 72,
    superpower: "Marcus makes people want to be part of something. The Conductor secondary means Marcus can hold the relay — in a team without a Conductor, Marcus is the closest thing to one.",
    leak: "Amplifiers who are not careful create momentum without direction — which exhausts Grounds and confuses Filters.",
    thisWeek: "Pick one high-friction pair on the team and act as the explicit relay. Schedule a 20-minute sync, set the agenda, translate between the two worldviews.",
  },
  {
    name: "Rachel Torres",
    role: "Ground",
    comboLabel: "Ground-Filter, 85% purity",
    purity: 85,
    superpower: "Rachel executes in ambiguous terrain — delivers when others are still planning. The Filter secondary gives Rachel quality instincts that prevent rework.",
    leak: "Without a clear brief, Rachel burns energy waiting for direction or improvising a frame that may not match the Spark's intent.",
    thisWeek: "For the top 2 open threads — write out current understanding of the what, why, and win condition for each. Send to the Spark for alignment.",
  },
];

// --- Components ---

function ScatterPlot({ members }: { members: SampleMember[] }) {
  const width = 520;
  const height = 380;
  const padding = 40;

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ backgroundColor: "#FAF6F0" }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Quadrant labels */}
        <text x={padding + 4} y={padding - 8} fontSize="8" fill="#9CA3AF" fontWeight="500" letterSpacing="1">VISIONARY</text>
        <text x={width - padding - 60} y={padding - 8} fontSize="8" fill="#9CA3AF" fontWeight="500" letterSpacing="1">CATALYST</text>
        <text x={padding + 4} y={height - padding + 16} fontSize="8" fill="#9CA3AF" fontWeight="500" letterSpacing="1">ARCHITECT</text>
        <text x={width - padding - 60} y={height - padding + 16} fontSize="8" fill="#9CA3AF" fontWeight="500" letterSpacing="1">EXECUTOR</text>

        {/* Axis labels */}
        <text x={width / 2} y={padding - 12} fontSize="7" fill="#9CA3AF" textAnchor="middle" letterSpacing="1">INNOVATION</text>
        <text x={width / 2} y={height - padding + 20} fontSize="7" fill="#9CA3AF" textAnchor="middle" letterSpacing="1">EXECUTION</text>

        {/* Grid lines */}
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,4" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,4" />

        {/* Friction lines */}
        {sampleFrictionPairs.map((pair, i) => {
          const names = pair.names.split(" and ");
          const m1 = members.find(m => m.name === names[0]);
          const m2Name = names[1]?.split(",")[0]?.trim();
          const m2 = members.find(m => m.name === m2Name);
          if (!m1 || !m2) return null;
          const x1 = padding + (m1.x / 100) * (width - 2 * padding);
          const y1 = height - padding - (m1.y / 100) * (height - 2 * padding);
          const x2 = padding + (m2.x / 100) * (width - 2 * padding);
          const y2 = height - padding - (m2.y / 100) * (height - 2 * padding);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#C84B31" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          );
        })}

        {/* Open Conductor role */}
        <circle cx={width / 2} cy={height / 2} r="18" fill="none" stroke="#7B68AE" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x={width / 2} y={height / 2 - 4} fontSize="5" fill="#7B68AE" textAnchor="middle" fontWeight="600">OPEN ROLE</text>
        <text x={width / 2} y={height / 2 + 5} fontSize="5" fill="#7B68AE" textAnchor="middle">CONDUCTOR</text>

        {/* Member nodes */}
        {members.map((member, i) => {
          const x = padding + (member.x / 100) * (width - 2 * padding);
          const y = height - padding - (member.y / 100) * (height - 2 * padding);
          const r = 12 + (member.purity / 100) * 8;
          const color = ROLE_COLORS[member.role] || "#666";
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill={color} opacity="0.9" />
              <text x={x} y={y + 1} fontSize="7" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="700">
                {member.initials}
              </text>
              <text x={x} y={y - r - 5} fontSize="7" fill="#374151" textAnchor="middle" fontWeight="500">
                {member.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PillRow({ members }: { members: SampleMember[] }) {
  const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
  const roleCounts = roles.map(role => ({
    role,
    count: members.filter(m => m.role === role).length,
    pct: Math.round((members.filter(m => m.role === role).length / members.length) * 100),
  }));

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {roleCounts.map(({ role, count, pct }) => {
        const color = ROLE_COLORS[role];
        const isOpen = count === 0;
        return (
          <span
            key={role}
            className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold ${
              isOpen ? "border-2 border-dashed" : "text-white"
            }`}
            style={isOpen
              ? { borderColor: color, color }
              : { backgroundColor: color }
            }
          >
            {isOpen ? `0 ${role} · OPEN` : `${count} ${role} · ${pct}%`}
          </span>
        );
      })}
    </div>
  );
}

function FrictionCard({ pair }: { pair: FrictionPair }) {
  return (
    <div className="rounded-lg border border-stone-200 p-5" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide"
          style={{ backgroundColor: pair.badgeColor }}
        >
          {pair.badge}
        </span>
        <span className="font-bold text-stone-800 text-sm">{pair.names}</span>
      </div>
      <p className="text-stone-600 text-sm leading-relaxed mb-3">{pair.description}</p>
      <p className="text-stone-800 text-sm leading-relaxed">
        <span className="font-bold">What to do:</span> {pair.action}
      </p>
    </div>
  );
}

function PlaybookCard({ pb }: { pb: Playbook }) {
  const color = ROLE_COLORS[pb.role] || "#666";
  return (
    <div className="rounded-lg border border-stone-200 p-5" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="font-bold text-stone-800 text-sm">{pb.name} — {pb.comboLabel}</span>
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="font-bold text-stone-700">Superpower:</span>{" "}
          <span className="text-stone-600">{pb.superpower}</span></p>
        <p><span className="font-bold text-stone-700">Your leak:</span>{" "}
          <span className="text-stone-600">{pb.leak}</span></p>
        <p><span className="font-bold text-stone-700">This week:</span>{" "}
          <span className="text-stone-600">{pb.thisWeek}</span></p>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function SampleReports() {
  const [activeTab, setActiveTab] = useState<"team" | "individual">("team");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FBF8F3" }}>
      {/* Header */}
      <header className="border-b border-stone-200 py-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-2">
            Sample Report Preview
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">
            What Your Team Report Looks Like
          </h1>
          <p className="text-stone-500 text-base max-w-2xl leading-relaxed">
            This is a preview of the Tribe Energy Map your team receives after completing
            the assessment. Real reports include personalized friction analysis, individual
            playbooks, and hiring recommendations specific to your team composition.
          </p>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "team"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Team Report
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "individual"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Individual Playbooks
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {activeTab === "team" ? (
          <div className="space-y-10">
            {/* Scatter Plot Section */}
            <section>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                  Tribe Energy Map
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">
                Sample Corp
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                8 members mapped · May 2026
              </p>
              <ScatterPlot members={sampleTeam} />
              <PillRow members={sampleTeam} />

              {/* Roster */}
              <div className="mt-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-stone-400 font-bold mb-3">
                  Tribe Roster
                </h3>
                <div className="grid gap-1.5">
                  {sampleTeam.map((m) => (
                    <div key={m.name} className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                        style={{ backgroundColor: ROLE_COLORS[m.role] }}>
                        {m.initials}
                      </span>
                      <span className="font-medium text-stone-800 w-36">{m.name}</span>
                      <span className="text-xs font-medium" style={{ color: ROLE_COLORS[m.role] }}>{m.role}</span>
                      <span className="text-xs text-stone-400 ml-auto">{m.purity}% purity</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Friction Pairs Section */}
            <section>
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#C84B31] font-bold">
                  Tribe Stress Analysis
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 mt-1 leading-tight">
                  These are not personality conflicts.{" "}
                  <span className="block">They are operational physics.</span>
                </h2>
                <p className="text-sm text-stone-500 mt-2 max-w-xl">
                  Different archetypes optimize for different things. When they collide
                  without a protocol, it drains energy from both people and from the
                  mission. Here is what to do about each friction pair.
                </p>
              </div>
              <div className="grid gap-4">
                {sampleFrictionPairs.map((pair, i) => (
                  <FrictionCard key={i} pair={pair} />
                ))}
              </div>
            </section>

            {/* Conductor Gap */}
            <section>
              <div className="rounded-lg border-2 border-dashed border-[#7B68AE] p-6" style={{ backgroundColor: "#F9F7FC" }}>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#7B68AE] font-bold mb-2">
                  Critical Gap — Priority Hire or Designate
                </p>
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  This team has no Conductor.
                </h3>
                <p className="text-lg font-bold text-stone-900 mb-3">
                  Someone is absorbing that cost right now.
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Best internal candidate: Marcus Webb has the highest Conductor secondary
                  score (Amplifier-Conductor) and already builds bridges between team
                  members. With a formal mandate and protected time, they are the most
                  viable internal Conductor. If hiring externally: look for someone who
                  notices when the wrong person is doing the wrong task.
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Individual Playbooks */}
            <section>
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                  Your Team — Individual Playbooks
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 mt-1">
                  What each person should do this week.
                </h2>
              </div>
              <div className="grid gap-4">
                {samplePlaybooks.map((pb, i) => (
                  <PlaybookCard key={i} pb={pb} />
                ))}
              </div>
            </section>

            {/* Path to Flow */}
            <section>
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                  Team Archetype
                </span>
                <h2 className="text-2xl font-bold text-stone-900 mt-1">
                  "The Innovation Engine"
                </h2>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed max-w-xl">
                  With strong Spark and Amplifier energy, this team generates and
                  promotes ideas faster than most. The risk is outrunning execution
                  capacity. The Filter and Ground members are the guardrails that
                  prevent momentum from becoming chaos.
                </p>
              </div>

              <div className="rounded-lg border border-stone-200 p-5 mt-6" style={{ backgroundColor: "#FAF6F0" }}>
                <h3 className="text-xs uppercase tracking-wide text-stone-500 font-bold mb-3">
                  Path to Less Friction
                </h3>
                <div className="space-y-3">
                  {[
                    { n: 1, title: "DESIGNATE A CONDUCTOR", desc: "For now, Marcus (Amplifier, 72% Conductor energy) can cover short Conductor sprints. Limit to 2-week rotations to prevent burnout." },
                    { n: 2, title: "PAIR PEOPLE TO THEIR NATURAL HANDOFFS", desc: "Each person should know who they receive from and who they pass to. When the relay is explicit, nobody wastes energy guessing." },
                    { n: 3, title: "THE 2-MINUTE RELAY CHECK (DAILY)", desc: "At each standup: 'What did I receive? What am I passing?' This surfaces stuck energy before it becomes a bottleneck." },
                    { n: 4, title: "LET ONE GROUND DEVELOP ADJACENT SKILLS", desc: "2 people share Ground energy. One could grow into an adjacent role — reducing overlap and filling a gap naturally." },
                  ].map((rec) => (
                    <div key={rec.n} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#5B8C5A] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {rec.n}
                      </span>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{rec.title}</p>
                        <p className="text-stone-600 text-sm">{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 rounded-lg border border-stone-200 p-8 text-center" style={{ backgroundColor: "#FAF6F0" }}>
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            Want this for your team?
          </h3>
          <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
            Get your team's real Tribe Energy Map in under 10 minutes per person.
            Named friction pairs, individual playbooks, and hiring recommendations
            specific to your team composition.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing">
              <Button className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 h-11">
                <Zap className="mr-2 h-4 w-4" /> Get Started
              </Button>
            </Link>
            <Link href="/team-map?domain=ramprate.com">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 font-medium px-6 h-11">
                View Live Example <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
