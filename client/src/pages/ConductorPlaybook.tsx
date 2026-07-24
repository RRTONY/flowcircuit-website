import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Circle, ExternalLink, Zap, Target, Users, MessageCircle, Shield, Handshake } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const playbookSteps = [
  {
    id: 1,
    icon: Target,
    title: "The Mind Meld",
    subtitle: "Before you connect anyone, understand both sides completely.",
    description: "A Conductor doesn't introduce people — they orchestrate collisions between complementary energies. Before making any introduction, you need to understand what each person actually needs (not what they say they need), what they bring, and where the multiplication zone lives.",
    question: "Can you articulate what both parties need in one sentence each — without using the word 'synergy'?",
    blogRef: {
      title: "Mastering Human and Business Development",
      url: "https://tonygreenberg.com/mastering-human-and-business-development/",
    },
  },
  {
    id: 2,
    icon: Shield,
    title: "The Audit",
    subtitle: "Verify the energy before you transmit it.",
    description: "Not every connection should be made. The Conductor's power comes from discernment — knowing when NOT to connect people is more valuable than knowing when to. A bad introduction doesn't just waste time; it burns trust capital that took years to build.",
    question: "If this introduction goes badly, are you willing to own the fallout?",
    blogRef: {
      title: "The Ethics and Art of Introductions",
      url: "https://tonygreenberg.com/mastering-human-and-business-development/",
    },
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "The Friendly Guidance",
    subtitle: "Frame the introduction so both sides arrive prepared.",
    description: "Never make a blind introduction. Each person should know exactly why they're meeting, what the other person brings, and what the expected outcome is. The Conductor sets the stage — they don't just open the curtain and hope for the best.",
    question: "Have you told each person specifically what to expect from the other — and what's expected of them?",
    blogRef: null,
  },
  {
    id: 4,
    icon: Handshake,
    title: "The Social Impact Check",
    subtitle: "Will this connection create value beyond the two people involved?",
    description: "The best Conductor introductions ripple outward. They don't just serve the two people being connected — they serve the ecosystem. Ask yourself: does this introduction make the network stronger, or does it just make two people slightly less lonely?",
    question: "Who else benefits if this connection works? If the answer is 'nobody,' reconsider.",
    blogRef: null,
  },
  {
    id: 5,
    icon: Users,
    title: "The Informed Introduction",
    subtitle: "Execute with precision, not enthusiasm.",
    description: "The introduction itself should be surgical. Three sentences: who Person A is and why they matter, who Person B is and why they matter, and the specific reason they should talk. No fluff. No 'you two should totally connect!' The Conductor is a precision instrument, not a social butterfly.",
    question: "Can you write the introduction email in under 100 words and make both people feel like the most important person in the room?",
    blogRef: null,
  },
  {
    id: 6,
    icon: Zap,
    title: "Getting to No Faster",
    subtitle: "The Conductor's secret weapon: speed of disqualification.",
    description: "Most people waste months on connections that should have been killed in the first conversation. The Conductor's job is to accelerate the 'no' — to surface incompatibilities early so everyone can redirect their energy to connections that actually multiply.",
    question: "What would make you kill this connection in the first 5 minutes? Define your disqualifiers before the meeting.",
    blogRef: {
      title: "The Arithmetic of Relationships",
      url: "https://tonygreenberg.com/the-arithmetic-of-relationships-whats-our-mutual-net-profit/",
    },
  },
  {
    id: 7,
    icon: CheckCircle2,
    title: "Making the Most of a 'Yes'",
    subtitle: "When the connection works, amplify it.",
    description: "A successful introduction isn't the end — it's the beginning of the Conductor's real work. Follow up. Check in. Ask both sides what happened. Feed the results back into your understanding of the network. The Conductor who follows up is the one who gets invited to orchestrate the next connection.",
    question: "Do you have a system for following up on every introduction you make within 2 weeks?",
    blogRef: null,
  },
];

export default function ConductorPlaybook() {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (id: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const progress = (completedSteps.size / playbookSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-mono text-purple-400">The Conductor's Manual</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            The Conductor's
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Playbook
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Conductor is the least understood and most valuable role in The
            Flow Circuit. Most people think it's networking. It's not. It's
            orchestration — and it has rules.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-muted-foreground">
              Playbook Progress
            </span>
            <span className="text-sm font-mono text-primary">
              {completedSteps.size}/{playbookSteps.length} steps
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {playbookSteps.map((step) => {
            const isComplete = completedSteps.has(step.id);
            return (
              <div
                key={step.id}
                className={`rounded-xl border transition-all duration-300 ${
                  isComplete
                    ? "border-purple-500/30 bg-purple-500/5"
                    : "border-border/50 bg-card/30"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="mt-1 shrink-0 transition-colors"
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-purple-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground hover:text-purple-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <step.icon className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-mono text-muted-foreground">
                          Step {step.id}
                        </span>
                      </div>
                      <h3
                        className={`text-xl font-display font-bold mb-1 transition-colors ${
                          isComplete ? "text-purple-400" : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground italic mb-4">
                        {step.subtitle}
                      </p>
                      <p className="text-foreground leading-relaxed mb-4">
                        {step.description}
                      </p>

                      {/* Self-Check Question */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30 mb-4">
                        <span className="text-xs font-mono uppercase tracking-wider text-primary">
                          Self-Check
                        </span>
                        <p className="text-sm text-foreground mt-1 font-medium">
                          {step.question}
                        </p>
                      </div>

                      {/* Blog Reference */}
                      {step.blogRef && (
                        <a
                          href={step.blogRef.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          Deep dive: {step.blogRef.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion State */}
      {completedSteps.size === playbookSteps.length && (
        <section className="py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl border border-purple-500/30 bg-purple-500/5">
            <Target className="w-10 h-10 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold mb-3">
              Playbook Complete
            </h3>
            <p className="text-muted-foreground mb-6">
              You've internalized the Conductor's operating system. Now go
              orchestrate something that matters. Remember: the Conductor doesn't
              seek credit — they seek multiplication.
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Are You a Natural Conductor?
          </h2>
          <p className="text-muted-foreground mb-8">
            Take the assessment to find out if Conductor is your dominant role —
            or if you've been playing Conductor when you're actually wired as
            something else.
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
            <Link href="/relationship-calculator">
              <Button size="lg" variant="outline" className="font-medium">
                <Users className="mr-2 w-4 h-4" />
                Try the Relationship Calculator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogBridge pageKey="journey" />
    </div>
  );
}
