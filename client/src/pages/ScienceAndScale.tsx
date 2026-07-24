import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Minus } from "lucide-react";

export default function ScienceAndScale() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter glitch-effect" data-text="SCIENCE & SCALE">
            SCIENCE & SCALE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Why personality tests fail at scale, and how Human OS 2.0 integrates the <strong>Big Five (OCEAN)</strong> and <strong>Psychological Safety</strong> to create a scientifically validated innovation engine.
          </p>
        </motion.div>

        {/* The Tower of Babel Argument */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">The Tower of Babel Problem</h2>
            <p className="text-lg text-muted-foreground">
              As teams scale, complexity explodes. Traditional assessments like Myers-Briggs (MBTI) or Enneagram create <strong>more noise</strong>, not less.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold">1</div>
                <p><strong>Combinatorial Chaos:</strong> 16 MBTI types × 1000 employees = 16,000 potential friction points. No one can remember who is an "INTP-T."</p>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold">2</div>
                <p><strong>Descriptive, Not Functional:</strong> Knowing someone is a "Helper" (Enneagram 2) doesn't tell you if they should lead the product launch or the QA team.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold">3</div>
                <p><strong>Zero Common Language:</strong> Marketing speaks "DISC," Engineering speaks "Agile," HR speaks "StrengthsFinder." The organization fractures.</p>
              </li>
            </ul>
          </div>
          <div className="relative h-[400px] bg-muted/10 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center">
            {/* Abstract visualization of chaos vs order */}
            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/20" />
            <div className="relative z-10 text-center space-y-8">
              <div className="flex justify-center gap-2 opacity-50 blur-[1px]">
                <span className="px-2 py-1 bg-red-500/20 rounded text-xs">INTP</span>
                <span className="px-2 py-1 bg-blue-500/20 rounded text-xs">ENTJ</span>
                <span className="px-2 py-1 bg-green-500/20 rounded text-xs">ISFP</span>
                <span className="px-2 py-1 bg-yellow-500/20 rounded text-xs">ESTJ</span>
              </div>
              <div className="text-4xl font-bold text-muted-foreground">VS</div>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">C</div>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground shadow-lg shadow-secondary/20">A</div>
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground shadow-lg shadow-accent/20">R</div>
                <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center font-bold text-destructive-foreground shadow-lg shadow-destructive/20">E</div>
              </div>
            </div>
          </div>
        </section>

        {/* The Comparison Matrix */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">The Efficacy Matrix</h2>
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] text-lg font-bold">Framework</TableHead>
                    <TableHead className="text-center">Scalability (1-1000+)</TableHead>
                    <TableHead className="text-center">Predictive Power</TableHead>
                    <TableHead className="text-center">Innovation Speed</TableHead>
                    <TableHead className="text-center">Conflict Resolution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-primary/5 hover:bg-primary/10 transition-colors border-l-4 border-l-primary">
                    <TableCell className="font-bold text-primary text-lg">Human OS 2.0 (Z-Process)</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                        <Check className="w-5 h-5" /> High
                      </div>
                      <span className="text-xs text-muted-foreground">4 Universal Roles</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                        <Check className="w-5 h-5" /> Generative
                      </div>
                      <span className="text-xs text-muted-foreground">Predicts Output</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                        <Check className="w-5 h-5" /> Accelerant
                      </div>
                      <span className="text-xs text-muted-foreground">70% Cycle Reduction</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                        <Check className="w-5 h-5" /> Systemic
                      </div>
                      <span className="text-xs text-muted-foreground">"Fix the Handoff"</span>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-bold">Myers-Briggs (MBTI)</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <X className="w-5 h-5" /> Low
                      </div>
                      <span className="text-xs text-muted-foreground">16 Types = Noise</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Descriptive
                      </div>
                      <span className="text-xs text-muted-foreground">"Who you are"</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Neutral
                      </div>
                      <span className="text-xs text-muted-foreground">No Process Link</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Personal
                      </div>
                      <span className="text-xs text-muted-foreground">"Empathy Only"</span>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold">DISC</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Medium
                      </div>
                      <span className="text-xs text-muted-foreground">4 Types (Behavioral)</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Behavioral
                      </div>
                      <span className="text-xs text-muted-foreground">"How you act"</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Neutral
                      </div>
                      <span className="text-xs text-muted-foreground">Sales Focus</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Communication
                      </div>
                      <span className="text-xs text-muted-foreground">Style Matching</span>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold">Kolbe Index</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Medium
                      </div>
                      <span className="text-xs text-muted-foreground">Conative Focus</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-500">
                        <Check className="w-5 h-5" /> Action
                      </div>
                      <span className="text-xs text-muted-foreground">"How you work"</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Individual
                      </div>
                      <span className="text-xs text-muted-foreground">Productivity Focus</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Minus className="w-5 h-5" /> Role Fit
                      </div>
                      <span className="text-xs text-muted-foreground">Individual vs Job</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* The Scale Argument */}
        <section className="grid md:grid-cols-3 gap-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Small Teams (1-10)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>The Problem:</strong> "We like each other too much to critique." (Groupthink)
                <br/><br/>
                <strong>The Fix:</strong> The Z-Process forces constructive conflict. By mapping <strong>Conscientiousness (Refiner)</strong> against <strong>Openness (Creator)</strong>, it prevents the team from agreeing on a bad idea just to be polite.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-secondary">Mid-Size (10-100)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>The Problem:</strong> "Silos and Handoffs." Marketing hates Engineering.
                <br/><br/>
                <strong>The Fix:</strong> The "Advancer" role (High EQ + Extraversion) is explicitly defined as the bridge. Instead of throwing specs over the wall, they translate the "Abstract" vision into "Concrete" requirements.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">Enterprise (1000+)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>The Problem:</strong> "Innovation Theater." Lots of activity, no shipping.
                <br/><br/>
                <strong>The Fix:</strong> <strong>Universal Protocol.</strong> We replace 1,000 personalities with 4 universal functions derived from the <strong>Big Five</strong> traits, creating a scalable "Cognitive Supply Chain" that anyone can plug into.
              </p>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
