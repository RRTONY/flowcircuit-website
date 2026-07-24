import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ExternalLink, Lightbulb, Heart, Sparkles,
  GraduationCap, FlaskConical, Users, Brain, Zap, Code2
} from "lucide-react";
import { Link } from "wouter";

// Amazon referral tag — replace with actual referral code
const AMAZON_TAG = "flowcircuit-20";

interface Thinker {
  name: string;
  years: string;
  title: string;
  institution: string;
  contribution: string;
  connectionToFlowCircuit: string;
  keyWork: {
    title: string;
    year: string;
    amazonUrl: string;
  };
  additionalWorks?: { title: string; year: string; amazonUrl?: string }[];
  quote?: string;
  icon: React.ReactNode;
  accentColor: string;
}

const thinkers: Thinker[] = [
  {
    name: "Al Fahden",
    years: "1950–present",
    title: "Innovation Architect & Stand-Up Philosopher",
    institution: "Innovation On Demand",
    contribution:
      "Identified that innovation isn't a solo act — it's a relay. His Team Dimensions framework mapped the distinct cognitive roles people play in the innovation process: Creator, Advancer, Refiner, Executor. The original spark behind The Flow Circuit's five-role model.",
    connectionToFlowCircuit:
      "The direct ancestor. Fahden's insight that people have innate innovation styles — and that forcing someone out of their natural role kills both the idea and the person — is the foundational DNA of everything we've built.",
    keyWork: {
      title: "Innovation on Demand",
      year: "1993",
      amazonUrl: `https://www.amazon.com/Innovation-Demand-Allen-Fahden/dp/0962966312?tag=${AMAZON_TAG}`,
    },
    quote: "The fastest way to kill innovation is to put the wrong person in the wrong seat at the wrong time.",
    icon: <Zap className="w-6 h-6" />,
    accentColor: "text-yellow-400",
  },
  {
    name: "Michael Scriven",
    years: "1928–2023",
    title: "The Godfather of Evaluation",
    institution: "Claremont Graduate University",
    contribution:
      "Created the foundational distinction between formative and summative evaluation that underpins all modern assessment science. His work established that evaluation is not a luxury — it's a discipline with its own logic, its own rigor, and its own ethics. Without Scriven, there is no defensible assessment.",
    connectionToFlowCircuit:
      "Every ipsative question, every construct validity check, every percentile ranking in The Flow Circuit stands on the shoulders of Scriven's evaluation methodology. He taught us that measuring people is a moral act — do it right or don't do it at all.",
    keyWork: {
      title: "Evaluation Thesaurus",
      year: "1991",
      amazonUrl: `https://www.amazon.com/Evaluation-Thesaurus-Michael-Scriven/dp/0803943644?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      { title: "The Logic of Evaluation", year: "1980" },
      { title: "Key Evaluation Checklist (KEC)", year: "2007" },
    ],
    quote: "Bad evaluation is worse than no evaluation, because it creates the illusion of knowledge.",
    icon: <GraduationCap className="w-6 h-6" />,
    accentColor: "text-blue-400",
  },
  {
    name: "Justin Menkes",
    years: "1970s–present",
    title: "Executive Intelligence Pioneer",
    institution: "Claremont Graduate University / DHR Global",
    contribution:
      "Proved that the cognitive qualities separating great leaders from average ones can be isolated and measured. His work on Executive Intelligence — cited by Malcolm Gladwell in The New Yorker — demonstrated that what leaders do under pressure reveals who they are, not what they've memorized.",
    connectionToFlowCircuit:
      "Menkes validated the thesis that innate cognitive patterns matter more than credentials. His research on how leaders perform under pressure directly informs our stress radiation model — the cost of operating outside your natural role.",
    keyWork: {
      title: "Executive Intelligence: What All Great Leaders Have",
      year: "2005",
      amazonUrl: `https://www.amazon.com/Executive-Intelligence-What-Great-Leaders/dp/0060781874?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "Better Under Pressure: How Great Leaders Bring Out the Best in Themselves and Others",
        year: "2011",
        amazonUrl: `https://www.amazon.com/Better-Under-Pressure-Leaders-Themselves/dp/1422138704?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "The right people aren't the smartest people. They're the people whose minds work the right way for the challenge at hand.",
    icon: <Brain className="w-6 h-6" />,
    accentColor: "text-purple-400",
  },
  {
    name: "Clayton Christensen",
    years: "1952–2020",
    title: "Prophet of Disruption",
    institution: "Harvard Business School",
    contribution:
      "Showed the world that great companies fail not because they're stupid, but because they're rational. His theory of disruptive innovation revealed that the very processes that make organizations successful eventually make them blind to existential threats.",
    connectionToFlowCircuit:
      "Christensen proved that organizational DNA matters. The Flow Circuit extends this: it's not just the company's DNA that determines survival — it's whether the right human operating systems are in the right seats when disruption arrives.",
    keyWork: {
      title: "The Innovator's Dilemma",
      year: "1997",
      amazonUrl: `https://www.amazon.com/Innovators-Dilemma-Technologies-Management-Innovation/dp/1633691780?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "The Innovator's Solution",
        year: "2003",
        amazonUrl: `https://www.amazon.com/Innovators-Solution-Creating-Sustaining-Successful/dp/1422196577?tag=${AMAZON_TAG}`,
      },
      {
        title: "How Will You Measure Your Life?",
        year: "2012",
        amazonUrl: `https://www.amazon.com/How-Will-Measure-Your-Life/dp/0062102419?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "The reason why it is so difficult for existing firms to capitalize on disruptive innovations is that their processes and their business model that make them good at the existing business actually make them bad at competing for the disruption.",
    icon: <Lightbulb className="w-6 h-6" />,
    accentColor: "text-orange-400",
  },
  {
    name: "Peter Drucker",
    years: "1909–2005",
    title: "The Inventor of Modern Management",
    institution: "Claremont Graduate University",
    contribution:
      "Before Drucker, management was instinct. After Drucker, it was a discipline. He coined 'knowledge worker,' predicted the rise of the information economy, and insisted that the purpose of a business is to create a customer — not to maximize shareholder value.",
    connectionToFlowCircuit:
      "Drucker's insight that effectiveness is a habit, not a talent, is the philosophical bedrock. The Flow Circuit asks: what if effectiveness isn't just about habits, but about operating from your innate wiring? Drucker opened the door. We walked through it.",
    keyWork: {
      title: "The Effective Executive",
      year: "1967",
      amazonUrl: `https://www.amazon.com/Effective-Executive-Definitive-Harperbusiness-Essentials/dp/0060833459?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "Management: Tasks, Responsibilities, Practices",
        year: "1973",
        amazonUrl: `https://www.amazon.com/Management-Tasks-Responsibilities-Practices-Drucker/dp/0887306152?tag=${AMAZON_TAG}`,
      },
      {
        title: "The Practice of Management",
        year: "1954",
        amazonUrl: `https://www.amazon.com/Practice-Management-Peter-F-Drucker/dp/0060878975?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "The most important thing in communication is hearing what isn't said.",
    icon: <BookOpen className="w-6 h-6" />,
    accentColor: "text-emerald-400",
  },
  {
    name: "Mihaly Csikszentmihalyi",
    years: "1934–2021",
    title: "The Architect of Flow",
    institution: "Claremont Graduate University",
    contribution:
      "Discovered and named the 'flow state' — that optimal experience where challenge meets skill, self-consciousness dissolves, and time distorts. His research proved that happiness isn't something that happens to you; it's something you engineer through the right conditions.",
    connectionToFlowCircuit:
      "The name says it all. The Flow Circuit exists because Csikszentmihalyi proved that humans have an optimal operating frequency. Our assessment maps where that frequency lives for each person — and what happens when organizations force them to broadcast on the wrong channel.",
    keyWork: {
      title: "Flow: The Psychology of Optimal Experience",
      year: "1990",
      amazonUrl: `https://www.amazon.com/Flow-Psychology-Experience-Perennial-Classics/dp/0061339202?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "Creativity: Flow and the Psychology of Discovery and Invention",
        year: "1996",
        amazonUrl: `https://www.amazon.com/Creativity-Psychology-Discovery-Invention-Csikszentmihalyi/dp/0062283251?tag=${AMAZON_TAG}`,
      },
      {
        title: "Finding Flow: The Psychology of Engagement with Everyday Life",
        year: "1997",
        amazonUrl: `https://www.amazon.com/Finding-Flow-Psychology-Engagement-Masterminds/dp/0465024114?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "The best moments in our lives are not the passive, receptive, relaxing times. The best moments usually occur if a person's body or mind is stretched to its limits in a voluntary effort to accomplish something difficult and worthwhile.",
    icon: <Sparkles className="w-6 h-6" />,
    accentColor: "text-cyan-400",
  },
  {
    name: "Richard Condon",
    years: "1960s–2024",
    title: "Transformation Architect",
    institution: "MissionB / Inside Consulting / Condon Consulting International",
    contribution:
      "A former submarine officer and McKinsey engagement manager who spent decades proving that sustainable business transformation requires understanding the human operating system, not just the balance sheet. Co-founded MissionB and Inside Consulting to bridge the gap between strategy and execution through people.",
    connectionToFlowCircuit:
      "Condon understood that the gap between strategy and execution is always a people gap. His work on rapid, sustainable earnings improvement through human alignment directly validates The Flow Circuit's thesis: get the right people in the right roles, and execution follows naturally.",
    keyWork: {
      title: "Inside Consulting: Business Performance Methodology",
      year: "2005",
      amazonUrl: `https://insideconsulting.net/about/`,
    },
    quote: "The distance between a brilliant strategy and a failed execution is always measured in people.",
    icon: <Users className="w-6 h-6" />,
    accentColor: "text-red-400",
  },
  {
    name: "Meredith Belbin",
    years: "1926–present",
    title: "The Original Team Role Scientist",
    institution: "Henley Management College / University of Cambridge",
    contribution:
      "Conducted the legendary nine-year study at Henley Management College that proved teams of brilliant individuals ('Apollo teams') consistently lost to balanced teams with diverse cognitive roles. Identified 9 team roles that predict team success better than individual IQ.",
    connectionToFlowCircuit:
      "Belbin proved the thesis before we named it. His Apollo study is the single most important piece of evidence for 'who you ARE > what you KNOW.' The Flow Circuit's five roles are a modernized, stress-aware evolution of Belbin's foundational framework.",
    keyWork: {
      title: "Team Roles at Work",
      year: "1993",
      amazonUrl: `https://www.amazon.com/Team-Roles-Work-Meredith-Belbin/dp/0367756005?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "Management Teams: Why They Succeed or Fail",
        year: "1981",
        amazonUrl: `https://www.amazon.com/Management-Teams-They-Succeed-Fail/dp/1856178072?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "Nobody is perfect, but a team can be.",
    icon: <Users className="w-6 h-6" />,
    accentColor: "text-teal-400",
  },
  {
    name: "Patrick Lencioni",
    years: "1965–present",
    title: "The Trust Architect",
    institution: "The Table Group",
    contribution:
      "Made the invisible visible. His Five Dysfunctions model showed that team failure cascades from a single root: absence of trust. When people can't be vulnerable about their weaknesses, everything downstream — conflict, commitment, accountability, results — breaks.",
    connectionToFlowCircuit:
      "Lencioni diagnosed the disease. The Flow Circuit prescribes the treatment. When people know their role and trust that others will play theirs, vulnerability becomes natural. The assessment creates a shared language that makes Lencioni's trust possible.",
    keyWork: {
      title: "The Five Dysfunctions of a Team",
      year: "2002",
      amazonUrl: `https://www.amazon.com/Five-Dysfunctions-Team-Leadership-Fable/dp/0787960756?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "The Ideal Team Player",
        year: "2016",
        amazonUrl: `https://www.amazon.com/Ideal-Team-Player-Recognize-Cultivate/dp/1119209595?tag=${AMAZON_TAG}`,
      },
      {
        title: "The Advantage",
        year: "2012",
        amazonUrl: `https://www.amazon.com/Advantage-Organizational-Health-Everything-Business/dp/0470941529?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "Not finance. Not strategy. Not technology. It is teamwork that remains the ultimate competitive advantage, both because it is so powerful and so rare.",
    icon: <Heart className="w-6 h-6" />,
    accentColor: "text-pink-400",
  },
  {
    name: "Steven Kotler",
    years: "1967–present",
    title: "The Flow Genome Decoder",
    institution: "Flow Research Collective",
    contribution:
      "Took Csikszentmihalyi's flow state from the psychology lab to the battlefield, the boardroom, and the mountain. His research quantified the neurochemistry of peak performance — dopamine, norepinephrine, endorphins, anandamide, serotonin — and proved that flow states can be engineered, not just hoped for.",
    connectionToFlowCircuit:
      "Kotler proved that flow has a biological signature and organizational triggers. The Flow Circuit maps the conditions under which each role type enters flow — and the specific friction that pulls them out of it.",
    keyWork: {
      title: "Stealing Fire: How Silicon Valley, the Navy SEALs, and Maverick Scientists Are Revolutionizing the Way We Live and Work",
      year: "2017",
      amazonUrl: `https://www.amazon.com/Stealing-Fire-Maverick-Scientists-Revolutionizing/dp/0062429655?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "The Rise of Superman: Decoding the Science of Ultimate Human Performance",
        year: "2014",
        amazonUrl: `https://www.amazon.com/Rise-Superman-Decoding-Ultimate-Performance/dp/1477800832?tag=${AMAZON_TAG}`,
      },
      {
        title: "The Art of Impossible",
        year: "2021",
        amazonUrl: `https://www.amazon.com/Art-Impossible-Peak-Performance-Primer/dp/0062977539?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "Flow is an optimal state of consciousness where we feel our best and perform our best.",
    icon: <FlaskConical className="w-6 h-6" />,
    accentColor: "text-violet-400",
  },
  {
    name: "Amy Edmondson",
    years: "1959–present",
    title: "The Safety Engineer of Teams",
    institution: "Harvard Business School",
    contribution:
      "Proved that the number one predictor of team performance isn't talent, resources, or strategy — it's psychological safety. Her research at Google (Project Aristotle) and in hospitals showed that teams where people feel safe to take risks, admit mistakes, and speak up consistently outperform 'safer' teams.",
    connectionToFlowCircuit:
      "Psychological safety is the soil. The Flow Circuit is the seed. Edmondson proved you need the environment; we provide the self-knowledge. When people understand their role and see it valued, psychological safety emerges organically.",
    keyWork: {
      title: "The Fearless Organization: Creating Psychological Safety in the Workplace for Learning, Innovation, and Growth",
      year: "2018",
      amazonUrl: `https://www.amazon.com/Fearless-Organization-Psychological-Workplace-Innovation/dp/1119477247?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "Right Kind of Wrong: The Science of Failing Well",
        year: "2023",
        amazonUrl: `https://www.amazon.com/Right-Kind-Wrong-Science-Failing/dp/1982195061?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "Psychological safety is not about being nice. It's about giving candid feedback, openly admitting mistakes, and learning from each other.",
    icon: <Heart className="w-6 h-6" />,
    accentColor: "text-green-400",
  },
  {
    name: "Daniel Coyle",
    years: "1969–present",
    title: "The Culture Decoder",
    institution: "Independent Researcher & Author",
    contribution:
      "Went inside the world's most successful groups — Navy SEALs, Pixar, the San Antonio Spurs, Zappos — and reverse-engineered what makes them tick. Found three universal skills: Build Safety, Share Vulnerability, Establish Purpose. Simple to name. Extraordinarily hard to execute.",
    connectionToFlowCircuit:
      "Coyle proved that culture is not vibes — it's signals. The Flow Circuit gives teams a shared signal system: 'Here's who I am, here's what I bring, here's where I need you.' That signal clarity is what Coyle found in every high-performing group he studied.",
    keyWork: {
      title: "The Culture Code: The Secrets of Highly Successful Groups",
      year: "2018",
      amazonUrl: `https://www.amazon.com/Culture-Code-Secrets-Highly-Successful/dp/0804176981?tag=${AMAZON_TAG}`,
    },
    additionalWorks: [
      {
        title: "The Talent Code: Greatness Isn't Born. It's Grown.",
        year: "2009",
        amazonUrl: `https://www.amazon.com/Talent-Code-Greatness-Born-Grown/dp/055380684X?tag=${AMAZON_TAG}`,
      },
    ],
    quote: "Group culture is one of the most powerful forces on the planet. We sense its presence inside successful businesses, championship teams, and thriving families.",
    icon: <Users className="w-6 h-6" />,
    accentColor: "text-amber-400",
  },
];

// Research citations that underpin The Flow Circuit
const researchCitations = [
  {
    study: "The Apollo Syndrome",
    authors: "Meredith Belbin, Henley Management College",
    year: "1981",
    finding:
      "Teams composed entirely of high-IQ individuals consistently underperformed balanced teams. Cognitive diversity in team roles predicted success better than raw intelligence.",
    relevance: "Foundation for 'who you ARE > what you KNOW'",
  },
  {
    study: "Deloitte Role Misfit & Turnover Research",
    authors: "Deloitte Human Capital Trends",
    year: "2019",
    finding:
      "Employees in role-misfit positions are 3.5x more likely to leave within 18 months. Organizations lose an average of $15,000 per misfit departure in replacement costs alone.",
    relevance: "Validates the stress radiation model — operating outside your role has measurable economic cost",
  },
  {
    study: "Flow State Neurochemistry",
    authors: "Arne Dietrich, American University of Beirut",
    year: "2004",
    finding:
      "Flow states involve transient hypofrontality — temporary deactivation of the prefrontal cortex — accompanied by a cocktail of neurochemicals (dopamine, norepinephrine, endorphins, anandamide, serotonin) that produce peak performance.",
    relevance: "The neurological basis for why operating in your natural role feels effortless and produces better outcomes",
  },
  {
    study: "Cortisol and Cognitive Performance",
    authors: "Lupien et al., McGill University",
    year: "2007",
    finding:
      "Chronic cortisol elevation from sustained stress impairs hippocampal function, reducing memory consolidation, creative problem-solving, and decision-making quality by up to 40%.",
    relevance: "The biological mechanism behind stress radiation — forcing people out of their natural role triggers chronic cortisol, degrading the very performance you're trying to optimize",
  },
  {
    study: "Google Project Aristotle",
    authors: "Google People Analytics / Amy Edmondson",
    year: "2015",
    finding:
      "After studying 180+ teams, Google found that psychological safety — not talent, seniority, or resources — was the #1 predictor of team effectiveness.",
    relevance: "Self-knowledge (knowing your role) creates the conditions for psychological safety that Edmondson and Google identified",
  },
  {
    study: "Ipsative Assessment Validity in Team Contexts",
    authors: "Bartram, D., International Journal of Selection and Assessment",
    year: "1996",
    finding:
      "Ipsative (forced-choice) measures produce more reliable within-person profiles than normative Likert scales for team role identification, as they eliminate social desirability bias and acquiescence effects.",
    relevance: "The psychometric foundation for The Flow Circuit's forced-choice assessment methodology",
  },
];

export default function Inspirations() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background text-foreground relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,200,0,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(100,150,255,0.1),transparent_50%)]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO                                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">
              Standing on the Shoulders of Giants
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
              THE <span className="text-primary">MINDS</span><br />
              BEHIND THE<br />
              CIRCUIT
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
            style={{ textWrap: 'pretty' as any }}
          >
            The Flow Circuit didn't emerge from thin air. It was forged in the crucible of
            decades of research by people who dared to ask the uncomfortable question:
            <span className="text-foreground font-semibold"> what if we've been building teams wrong this entire time?</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto italic"
          >
            These are the thinkers, researchers, and practitioners whose work made ours possible.
            We owe them everything. Buy their books.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* THOUGHT LEADERS                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-24 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {thinkers.map((thinker, index) => (
            <motion.div
              key={thinker.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card className="bg-card/50 border-border/30 backdrop-blur-sm hover:border-border/60 transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left accent bar */}
                    <div className={`lg:w-1.5 w-full h-1.5 lg:h-auto bg-gradient-to-b from-current to-transparent ${thinker.accentColor}`} />

                    <div className="flex-1 p-6 lg:p-8">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-2.5 rounded-lg bg-muted/50 ${thinker.accentColor} shrink-0`}>
                          {thinker.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {thinker.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {thinker.title} &middot; {thinker.institution} &middot; {thinker.years}
                          </p>
                        </div>
                      </div>

                      {/* Contribution */}
                      <p className="text-base text-muted-foreground leading-relaxed mb-4" style={{ textWrap: 'pretty' as any }}>
                        {thinker.contribution}
                      </p>

                      {/* Connection to Flow Circuit */}
                      <div className="bg-muted/30 rounded-lg p-4 mb-5 border-l-2 border-primary/40">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1.5">
                          Connection to The Flow Circuit
                        </p>
                        <p className="text-sm text-foreground/90 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                          {thinker.connectionToFlowCircuit}
                        </p>
                      </div>

                      {/* Quote */}
                      {thinker.quote && (
                        <blockquote className="text-sm italic text-muted-foreground/80 border-l-2 border-muted-foreground/20 pl-4 mb-5">
                          "{thinker.quote}"
                        </blockquote>
                      )}

                      {/* Books */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          Essential Reading
                        </p>

                        {/* Primary work */}
                        <a
                          href={thinker.keyWork.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
                        >
                          <BookOpen className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
                            {thinker.keyWork.title}
                          </span>
                          <span className="text-xs text-muted-foreground">{thinker.keyWork.year}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </a>

                        {/* Additional works */}
                        {thinker.additionalWorks?.map((work) => (
                          <a
                            key={work.title}
                            href={work.amazonUrl || "#"}
                            target={work.amazonUrl ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/20 transition-colors group"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                              {work.title}
                            </span>
                            <span className="text-xs text-muted-foreground">{work.year}</span>
                            {work.amazonUrl && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* RESEARCH CITATIONS                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">
              The Evidence Base
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              RESEARCH THAT<br />
              <span className="text-primary">CHANGED THE GAME</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ textWrap: 'pretty' as any }}>
              The Flow Circuit isn't built on opinion. It's built on decades of peer-reviewed research
              from some of the most rigorous institutions in the world.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {researchCitations.map((citation, index) => (
              <motion.div
                key={citation.study}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="bg-card/30 border-border/20 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-foreground mb-1">
                          {citation.study}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {citation.authors} &middot; {citation.year}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2" style={{ textWrap: 'pretty' as any }}>
                          {citation.finding}
                        </p>
                        <p className="text-xs font-medium text-primary/80 flex items-center gap-1.5">
                          <Zap className="w-3 h-3" />
                          {citation.relevance}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* OPEN SOURCE & GRATITUDE                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card/30 border-border/20">
              <CardContent className="p-8 md:p-12 text-center">
                <Code2 className="w-10 h-10 text-primary mx-auto mb-6" />
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  Built on Open Source
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6" style={{ textWrap: 'pretty' as any }}>
                  The Flow Circuit is built with React, TypeScript, Tailwind CSS, Framer Motion, Recharts,
                  and dozens of other open source projects maintained by developers who share their work
                  freely with the world. We are grateful to every contributor who makes modern software possible.
                </p>
                <p className="text-sm text-muted-foreground/70 italic mb-8">
                  Special thanks to the open source community — the ultimate example of Sparks, Amplifiers,
                  Filters, Grounds, and Conductors working in concert across time zones and cultures
                  without ever meeting in person.
                </p>

                <div className="border-t border-border/30 pt-8 mt-2">
                  <p className="text-sm text-muted-foreground mb-6">
                    Know someone whose work should be on this page? We're always learning.
                  </p>
                  <Link href="/feedback">
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                      <Heart className="mr-2 h-4 w-4" />
                      Suggest an Inspiration
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CTA                                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Find Your Role<br />in the Circuit?
            </h2>
            <p className="text-lg text-muted-foreground">
              These thinkers built the science. Now it's your turn to live it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Take the Assessment
                </Button>
              </Link>
              <Link href="/science">
                <Button size="lg" variant="outline" className="border-border/50">
                  <Brain className="mr-2 h-5 w-5" />
                  Explore the Science
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
