"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Brain, Clock, Zap, FileText, Download,
  ArrowRight, CheckCircle2, Activity, Target, Heart,
  AlertTriangle, TrendingUp, Users, Flame, Shield
} from "lucide-react";
import MagicQuadrant from "@/components/MagicQuadrant";
import FrictionCostCalculator from "@/components/FrictionCostCalculator";
import { useRouter } from "next/navigation";
import BlogBridge from '@/components/BlogBridge';

export default function ScienceClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background text-foreground relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/BlGGVdyTaOJOVVji.png"
          alt="Science Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO — The Foundational Thesis                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">
              The Science Behind The Flow Circuit
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
              WHO YOU <span className="text-primary">ARE</span><br />
              MATTERS MORE THAN<br />
              WHAT YOU <span className="line-through text-gray-300">KNOW</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
            style={{ textWrap: 'pretty' as any }}
          >
            For decades, organizations have hired for skills, trained for knowledge,
            and promoted for experience. The data says they've been
            optimizing the wrong variable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              onClick={() => router.push("/assessment")}
              size="lg"
              className="bg-black text-white hover:bg-gray-800 font-bold h-14 px-8 rounded-xl text-base"
            >
              <Zap className="mr-2 h-5 w-5" />
              Take the Assessment
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-bold h-14 px-8 rounded-xl text-base"
              onClick={() => document.getElementById('evidence')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              See the Evidence
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* THE CORE ARGUMENT — Three Pillars                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-32 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16"
          >
            Three Truths That Change Everything
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Card className="border-2 border-gray-100 h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
                    <Brain className="w-7 h-7 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Innate Energy Is Fixed
                  </h3>
                  <p className="text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                    Your operational energy — whether you naturally generate ideas (Spark),
                    amplify others (Amplifier), refine quality (Filter), execute reliably (Ground),
                    or orchestrate flow (Conductor) — is not a learned behavior.
                    It's your neurological operating system.
                  </p>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic" style={{ textWrap: 'pretty' as any }}>
                      "Personality trait consistency climbs from the college years into
                      adulthood, reaching test-retest correlations around 0.74 by ages 50–70."
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      — Roberts & DelVecchio, <em>Psychological Bulletin</em>, 2000 (
                      <a href="https://pubmed.ncbi.nlm.nih.gov/10668348/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">source</a>
                      )
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-gray-100 h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Misfit Creates Stress
                  </h3>
                  <p className="text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                    When you're forced to operate outside your natural role — a Spark
                    doing Ground work, a Filter forced to Amplify — cortisol rises,
                    cognitive load increases, and performance degrades.
                    It's not about capability. It's about cost.
                  </p>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400" style={{ textWrap: 'pretty' as any }}>
                      Role misfit — not a skill gap — is one of the most commonly cited drivers
                      of disengagement and turnover in workplace research. We don't have a single
                      verified statistic we're comfortable quoting here, so we're not citing one.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-gray-100 h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Users className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Teams Beat Individuals
                  </h3>
                  <p className="text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                    The highest-IQ teams don't automatically win. Meredith Belbin's team-role
                    research at Henley Management College found that "Apollo teams" (all-star,
                    no role diversity) routinely lost to teams where each member operated in
                    their natural energy.
                  </p>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic" style={{ textWrap: 'pretty' as any }}>
                      "The Apollo Syndrome: teams of the brightest individuals
                      consistently finished last in team competitions."
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      — Meredith Belbin, <em>Management Teams</em>, 1981 (
                      <a href="https://www.belbin.com/resources/articles-directory/belbin-apollo-teams" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">source</a>
                      )
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* THE STRESS SCIENCE — Why Operating Out of Role Hurts      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full mb-32 bg-black text-white py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">
                The Neuroscience
              </p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                The Cost of Operating<br />Outside Your Nature
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                Every hour spent fighting your natural operational energy
                is an hour stolen from your best self.
                The science explains why.
              </p>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed mt-4">
                The studies below describe general findings on stress, cognition, and flow —
                they were not conducted on The Flow Circuit assessment.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold">Cortisol Cascade</h3>
                </div>
                <p className="text-gray-300 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                  When forced into an unnatural role, the brain's threat detection
                  system activates. Sustained stress and elevated cortisol are
                  associated with impaired prefrontal cortex function — the very
                  region responsible for creative thinking and decision-making.
                </p>
                <p className="text-xs text-gray-500">
                  Arnsten, 2009 — "Stress signalling pathways that impair
                  prefrontal cortex structure and function," <em>Nature Reviews Neuroscience</em> (
                  <a href="https://www.nature.com/articles/nrn2648" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">source</a>
                  )
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">Cognitive Load Tax</h3>
                </div>
                <p className="text-gray-300 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                  Operating in your natural role draws on System 1 thinking —
                  fast, intuitive, effortless. Operating outside it forces
                  System 2 — slow, deliberate, effortful. Kahneman's research
                  shows System 2 reasoning consumes noticeably more cognitive
                  effort for the same task.
                </p>
                <p className="text-xs text-gray-500">
                  Kahneman, 2011 — <em>Thinking, Fast and Slow</em> (
                  <a href="https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">source</a>
                  )
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Flow State Blockade</h3>
                </div>
                <p className="text-gray-300 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                  Flow states require transient hypofrontality — the
                  deactivation of the inner critic. Role misfit keeps the
                  prefrontal cortex hyperactive (monitoring, compensating,
                  translating), making flow neurologically impossible.
                  You can't enter flow while fighting your own wiring.
                </p>
                <p className="text-xs text-gray-500">
                  Dietrich, 2004 — "Neurocognitive mechanisms underlying
                  the experience of flow"
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">The Best-Self Effect</h3>
                </div>
                <p className="text-gray-300 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                  When people operate in their natural role, dopamine and
                  norepinephrine are believed to help optimize attention,
                  pattern recognition, and creative output. This isn't just
                  motivation — it has a neurochemical basis. Your best self
                  isn't aspirational. It's operational.
                </p>
                <p className="text-xs text-gray-500">
                  Kotler, 2014 — <em>The Rise of Superman: Decoding the
                  Science of Ultimate Human Performance</em> (
                  <a href="https://www.amazon.com/Rise-Superman-Decoding-Science-Performance/dp/0544286249" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">source</a>
                  )
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-2xl md:text-3xl font-black text-yellow-400 italic" style={{ textWrap: 'balance' as any }}>
                "Operating outside your nature doesn't just reduce performance.
                It reduces your possibility as a human being."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHY PERSONALITY TESTS FAIL                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Why "Personality Tests" Fail Teams
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p style={{ textWrap: 'pretty' as any }}>
                Traditional assessments (MBTI, DISC, Enneagram) are
                <strong className="text-black"> static snapshots</strong> of
                individual psychology. They tell you who someone
                <em> is</em> in isolation.
              </p>
              <p style={{ textWrap: 'pretty' as any }}>
                But work doesn't happen in isolation.
                It happens in <strong className="text-black">motion</strong>.
              </p>
              <p style={{ textWrap: 'pretty' as any }}>
                The Flow Circuit measures
                <strong className="text-primary"> Operational Physics</strong>:
                the transfer of energy, information, and responsibility
                between people. It's not about who you are in a vacuum —
                it's about how your energy moves through a system.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Card className="bg-gray-50 border-none">
                <CardContent className="p-6 space-y-2">
                  <Brain className="h-8 w-8 text-gray-400 mb-2" />
                  <h3 className="font-bold">Psychology</h3>
                  <p className="text-sm text-muted-foreground">
                    Internal. Static. Subjective.
                    "Who I am."
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 space-y-2">
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-bold text-primary">Physics</h3>
                  <p className="text-sm text-muted-foreground">
                    External. Kinetic. Objective.
                    "How I move."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="relative aspect-[4/5] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500 z-10" />
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"
              alt="Complex machinery representing team dynamics"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent z-20">
              <p className="text-white text-lg font-medium" style={{ textWrap: 'pretty' as any }}>
                "You can't fix a clock by psychoanalyzing the gears.
                You have to look at how they mesh."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MAGIC QUADRANT                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="w-full mb-32 bg-gradient-to-b from-white via-gray-50 to-white py-16 relative z-10">
        <div className="container mx-auto px-4">
          <MagicQuadrant />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* EVIDENCE LOCKER                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="evidence" className="container mx-auto px-4 mb-32 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black mb-4">The Research That Inspired This Framework</h2>
          <p className="text-muted-foreground text-lg">
            Built on decades of established research into human performance and team dynamics.
          </p>
        </div>
        <div className="max-w-3xl mx-auto mb-12 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
            <strong>Important:</strong> the studies below explain the general science behind flow states,
            stress, and team dynamics. They were the inspiration for The Flow Circuit's design — they are
            not studies of The Flow Circuit itself. We have not yet published an independent validation
            study of this assessment. See our <a href="#validation-status" className="underline hover:text-amber-900">current validation status</a> below.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
            <CardHeader>
              <div className="mb-4"><Clock className="h-8 w-8 text-primary" /></div>
              <CardTitle>Team Dimensions Profile</CardTitle>
              <p className="text-sm text-primary font-mono">
                Al Fahden, <em>Innovation on Demand</em>, 1993
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" style={{ textWrap: 'pretty' as any }}>
                Fahden's insight that innovation is a relay between distinct cognitive roles
                (Creator, Advancer, Refiner, Executor) — and that forcing someone out of their
                natural role stalls both the work and the person — is the direct ancestor of
                the Flow Circuit's five-role model.{" "}
                <a href="https://www.amazon.com/Innovation-Demand-Allen-Fahden/dp/0962966312" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">source</a>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
            <CardHeader>
              <div className="mb-4"><Brain className="h-8 w-8 text-primary" /></div>
              <CardTitle>Transient Hypofrontality</CardTitle>
              <p className="text-sm text-primary font-mono">
                Dr. Arne Dietrich / Steven Kotler
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" style={{ textWrap: 'pretty' as any }}>
                Flow states are associated with deactivation of the prefrontal cortex (the inner
                critic). We designed the Flow Circuit's role model around the idea that removing
                social friction and role ambiguity should make that state easier to reach — a
                hypothesis, not yet something we've measured directly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
            <CardHeader>
              <div className="mb-4"><Zap className="h-8 w-8 text-primary" /></div>
              <CardTitle>The Autotelic Personality</CardTitle>
              <p className="text-sm text-primary font-mono">
                Mihaly Csikszentmihalyi
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" style={{ textWrap: 'pretty' as any }}>
                Individuals who self-induce flow are "autotelic."
                Our framework borrows this concept for what we call the Autotelic Team — a group
                that finds purpose in the process of collaboration itself.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* VALIDATION STATUS                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="validation-status" className="container mx-auto px-4 mb-32 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Where We Are on Validation
            </h2>
            <p className="text-muted-foreground text-lg">
              An honest status update, not a marketing claim.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 p-8 space-y-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-bold uppercase tracking-wider text-sm text-amber-700">
                In Development — Pending Independent Validation
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
              The Flow Circuit is a new assessment. Instruments like Kolbe A, Belbin, and DISC
              have decades of published, peer-reviewed research behind their validity numbers.
              We don't have that yet — and we're not going to publish a validity score for our
              own tool until an independent researcher has actually run the study.
            </p>
            <p className="text-gray-700 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
              What the Flow Circuit is built on today is the established research summarized
              above, plus our own design reasoning about how those findings should translate
              into a team-context tool. That's a hypothesis worth testing — not proof the tool
              itself has been tested. We'll publish real validation data here the moment it exists.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FRICTION COST CALCULATOR                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Calculate Your Friction Cost
          </h2>
          <p className="text-muted-foreground text-lg" style={{ textWrap: 'pretty' as any }}>
            Most leaders underestimate the financial impact of role
            misalignment. Use this calculator to see the hidden
            tax on your payroll.
          </p>
        </div>
        <FrictionCostCalculator />
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHITE PAPER DOWNLOAD                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-24 relative z-10">
        <div className="bg-black text-white rounded-3xl p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium">
              <FileText className="h-4 w-4" />
              <span>Research Paper</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              The Assessment Revolution
            </h2>

            <p className="text-lg text-white/70 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
              Download our white paper laying out the research that shaped The Flow Circuit's
              design — and where the framework's own validation currently stands.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 font-bold h-14 px-8 rounded-xl"
              >
                <Download className="mr-2 h-5 w-5" /> Download PDF
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-bold h-14 px-8 rounded-xl"
                onClick={() => document.getElementById('validation-status')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Validation Status
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FUEL THE SCIENCE                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 mb-24 relative z-10">
        <div className="bg-gradient-to-br from-primary/20 via-background to-background p-12 rounded-3xl border border-primary/20 text-center space-y-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold">Fuel the Science</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ textWrap: 'pretty' as any }}>
            We are constantly researching the "Invisible Architecture"
            of human performance. Your contribution helps us expand the
            open-source dataset and refine the algorithms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => window.open('https://tonygreenberg.com/donate', '_blank')}
            >
              Donate $25
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => window.open('https://tonygreenberg.com/donate', '_blank')}
            >
              Donate $100
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-lg px-8"
              onClick={() => window.open('https://tonygreenberg.com/donate', '_blank')}
            >
              Custom Amount
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            *Contributions go directly to the Human OS Research Fund.
          </p>
        </div>
       </section>

      <BlogBridge pageKey="science" />
    </div>
  );
}
