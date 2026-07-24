import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Wand2, CheckCircle2, Circle, ChevronDown, ChevronUp, Zap, Users, Target } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

interface Question {
  id: number;
  question: string;
  why: string;
  flowCircuitConnection: string;
  role: string;
  followUp: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What is the single most important outcome this project must achieve?",
    why: "If you can't answer this in one sentence, you don't have a project — you have a wish list. This question forces the Spark to crystallize the vision into something the relay can actually carry.",
    flowCircuitConnection: "This is the Spark's moment. The answer to this question IS the baton. If the Spark can't define it, the Amplifier has nothing to amplify.",
    role: "Spark",
    followUp: "Can you say it in 10 words or fewer? If not, you're not ready to start.",
  },
  {
    id: 2,
    question: "Who needs to hear about this — and who needs to believe it?",
    why: "Ideas don't die because they're bad. They die because they never reach the right ears. This question identifies the Amplifier's target audience and the resistance they'll face.",
    flowCircuitConnection: "The Amplifier's job isn't just to spread the word — it's to make the right people believe. This question maps the amplification strategy.",
    role: "Amplifier",
    followUp: "List three people who must be convinced. Now list what each one is afraid of.",
  },
  {
    id: 3,
    question: "What assumptions are we making that could kill this project?",
    why: "Every project is built on assumptions. Most of them are invisible. This question is the Filter's superpower — surfacing the hidden assumptions before they become hidden failures.",
    flowCircuitConnection: "The Filter doesn't just check quality — they check assumptions. This is the question that separates 'refinement' from 'rubber stamping.'",
    role: "Filter",
    followUp: "For each assumption, ask: 'What would we do differently if this assumption were wrong?'",
  },
  {
    id: 4,
    question: "What does 'done' look like — specifically?",
    why: "If the team can't agree on what 'done' looks like, they'll never agree on whether they got there. This question gives the Ground a clear finish line.",
    flowCircuitConnection: "The Ground can't execute without a definition of done. This question is the contract between the Spark's vision and the Ground's reality.",
    role: "Ground",
    followUp: "Write the 'done' criteria as a checklist. If you can't check it off, it's not a criterion — it's a feeling.",
  },
  {
    id: 5,
    question: "Who is responsible for each handoff in this project?",
    why: "Projects don't fail in the middle of a task. They fail in the gaps between tasks — the handoffs. This question maps the relay and identifies where batons will be dropped.",
    flowCircuitConnection: "This is the Conductor's question. Every unnamed handoff is a dropped baton waiting to happen. The Conductor's job is to name every one of them.",
    role: "Conductor",
    followUp: "For each handoff, name the person giving the baton AND the person catching it. If either is 'TBD,' you have a gap.",
  },
  {
    id: 6,
    question: "What will we say no to?",
    why: "Scope creep kills more projects than bad ideas. This question forces the team to define boundaries before the pressure to expand begins.",
    flowCircuitConnection: "The Filter's second superpower: saying no. A project without boundaries is a project without a Filter. And a project without a Filter ships garbage.",
    role: "Filter",
    followUp: "Write down three things that are explicitly OUT of scope. Post them where everyone can see them.",
  },
  {
    id: 7,
    question: "What's the fastest way to prove this won't work?",
    why: "Most teams spend months building something before testing the core assumption. This question inverts the process — kill the bad idea fast so you can find the good one.",
    flowCircuitConnection: "This is the 'Getting to No Faster' principle. The Conductor's job is to accelerate disqualification so the team's energy flows to what actually works.",
    role: "Conductor",
    followUp: "Design a 48-hour test that would disprove your core assumption. If you can't, your assumption might be untestable — which is its own problem.",
  },
  {
    id: 8,
    question: "Who on this team has done something like this before?",
    why: "Experience isn't just about skill — it's about pattern recognition. Someone who's been through a similar relay before can spot the dropped batons before they hit the floor.",
    flowCircuitConnection: "The Ground's experience is the team's insurance policy. If nobody has done this before, you need more Filter time and more Conductor oversight.",
    role: "Ground",
    followUp: "If the answer is 'nobody,' that's not a disqualifier — but it means you need to budget for learning curves and build in more checkpoints.",
  },
  {
    id: 9,
    question: "What does this project need that we don't have?",
    why: "Honesty about gaps is more valuable than optimism about strengths. This question surfaces the missing pieces before they become missing deadlines.",
    flowCircuitConnection: "This is the circuit health check. Missing a role? Missing a skill? Missing a resource? Name it now or discover it at the worst possible moment.",
    role: "Spark",
    followUp: "For each gap, decide: do we build it, buy it, or borrow it? And who's responsible for closing the gap?",
  },
  {
    id: 10,
    question: "If this project succeeds, what changes — and for whom?",
    why: "The ultimate question. If you can't articulate the impact, you can't justify the effort. This question connects the project back to the 'why' that started it.",
    flowCircuitConnection: "This is where the relay comes full circle. The Spark ignited it, the Amplifier spread it, the Filter refined it, the Ground built it — and now the Conductor asks: did it matter?",
    role: "Conductor",
    followUp: "Write the success story as if it already happened. If it doesn't excite you, the project isn't worth the relay.",
  },
];

const roleColors: Record<string, string> = {
  Spark: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Amplifier: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  Filter: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  Ground: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Conductor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

const roleEmoji: Record<string, string> = {
  Spark: "⚡",
  Amplifier: "📡",
  Filter: "🔬",
  Ground: "🏗️",
  Conductor: "🎯",
};

export default function MagicQuestions() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleAnswered = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnsweredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = (answeredIds.size / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-mono text-amber-400">Project Diagnostic</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            10 Magic Questions
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">
              to Make Your Project Go Right
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Based on Tony Greenberg's original framework for kicking
            assumptions before they kick you. Each question maps to a Flow
            Circuit role — because every project failure is a relay failure.
          </p>
          <a
            href="https://tonygreenberg.com/10-magic-questions-to-make-your-project-go-right-how-to-kick-ass-by-kicking-assumptions/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mt-4 transition-colors"
          >
            Read the original article
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Progress */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-muted-foreground">
              Questions Addressed
            </span>
            <span className="text-sm font-mono text-primary">
              {answeredIds.size}/{questions.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isAnswered = answeredIds.has(q.id);
            const colorClass = roleColors[q.role] || "";

            return (
              <div
                key={q.id}
                className={`rounded-xl border transition-all duration-300 ${
                  isAnswered
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-card/30"
                }`}
              >
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-5 flex items-start gap-4 text-left"
                >
                  <button
                    onClick={(e) => toggleAnswered(q.id, e)}
                    className="mt-0.5 shrink-0"
                  >
                    {isAnswered ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        Q{q.id}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${colorClass}`}>
                        {roleEmoji[q.role]} {q.role}
                      </span>
                    </div>
                    <h3 className={`text-lg font-display font-bold ${isAnswered ? "text-primary" : "text-foreground"}`}>
                      {q.question}
                    </h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pl-15 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="ml-10">
                      <h4 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
                        Why This Matters
                      </h4>
                      <p className="text-foreground leading-relaxed">{q.why}</p>
                    </div>

                    <div className="ml-10">
                      <h4 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
                        Flow Circuit Connection
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {q.flowCircuitConnection}
                      </p>
                    </div>

                    <div className="ml-10 p-4 rounded-lg bg-muted/30 border border-border/30">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary">
                        Follow-Up
                      </span>
                      <p className="text-sm text-foreground mt-1 font-medium">
                        {q.followUp}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion */}
      {answeredIds.size === questions.length && (
        <section className="py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <Wand2 className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold mb-3">
              All 10 Questions Addressed
            </h3>
            <p className="text-muted-foreground mb-6">
              Your project has been through the assumption audit. Now the
              question is: does your team have the right wiring to execute it?
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Now Map Your Team's Wiring
          </h2>
          <p className="text-muted-foreground mb-8">
            The 10 questions tell you what your project needs. The assessment
            tells you whether your team is wired to deliver it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button
                size="lg"
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg"
              >
                Take the Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/conductor-playbook">
              <Button size="lg" variant="outline" className="font-medium">
                <Target className="mr-2 w-4 h-4" />
                Conductor's Playbook
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogBridge pageKey="protocol" />
    </div>
  );
}
