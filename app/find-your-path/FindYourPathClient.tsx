"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Zap, Heart, Brain, Globe, Droplets, ArrowRight,
  Compass, Fingerprint, Users, Sparkles, ChevronRight
} from "lucide-react";

const PORTALS = [
  {
    id: "energy",
    title: "Your Energy DNA",
    subtitle: "The Flow Circuit Assessment",
    question: "How do you naturally operate in a team?",
    description: "You're either a Spark who ignites, an Amplifier who connects, a Filter who refines, a Ground who builds, or a Conductor who orchestrates. You can't fake it. You can't train it out. You can only discover it — and stop fighting it.",
    icon: Zap,
    color: "#f59e0b",
    gradient: "from-amber-500/20 to-orange-500/20",
    link: "/assessment",
    cta: "Discover Your Role",
    time: "12 min",
    external: false,
  },
  {
    id: "soul",
    title: "Your Soul Blueprint",
    subtitle: "SoulPrint by TrueSelf",
    question: "What were you wired for before you were born?",
    description: "Eight ancient and modern frameworks — Enneagram, Human Design, Gene Keys, Western & Vedic Astrology, Chinese Zodiac, Numerology, Spiral Dynamics — converge into one unified map of your soul's operating system. The things you can't run from.",
    icon: Fingerprint,
    color: "#8b5cf6",
    gradient: "from-violet-500/20 to-purple-500/20",
    link: "/soulprint",
    cta: "Decode Your Blueprint",
    time: "Birth data only",
    external: false,
  },
  {
    id: "team",
    title: "Your Tribe Circuit",
    subtitle: "Team Energy Mapping",
    question: "Why does your team feel stuck?",
    description: "Individual brilliance means nothing if the circuit is broken. Map your team's energy composition, find the friction pairs, discover the missing roles, and design the handoff protocol that turns chaos into flow.",
    icon: Users,
    color: "#3b82f6",
    gradient: "from-blue-500/20 to-cyan-500/20",
    link: "/team-builder",
    cta: "Map Your Team",
    time: "5 min per member",
    external: false,
  },
  {
    id: "purpose",
    title: "Your Impact Vector",
    subtitle: "ImpactSoul",
    question: "What if profit was a byproduct of purpose?",
    description: "The world doesn't need more companies. It needs more companies that give a damn. ImpactSoul is the operating system for ventures where the mission IS the margin. Where community drives asset value. Where doing good is the business model.",
    icon: Heart,
    color: "#ec4899",
    gradient: "from-pink-500/20 to-rose-500/20",
    link: "https://impactsoul.is",
    cta: "Find Your Impact",
    time: "Ongoing journey",
    external: true,
  },
  {
    id: "water",
    title: "Your Sacred Element",
    subtitle: "Holy Water by AG",
    question: "When was the last time water touched your soul?",
    description: "The most essential molecule on earth has been commodified into plastic bottles and marketing lies. We're taking it back. Sacred spring water, tokenized for community ownership, with every drop funding indigenous water rights.",
    icon: Droplets,
    color: "#06b6d4",
    gradient: "from-cyan-500/20 to-teal-500/20",
    link: "https://tonygreenberg.com",
    cta: "Explore the Source",
    time: "Coming soon",
    external: true,
  },
];

const SYNTHESIS_QUESTIONS = [
  { q: "I feel stuck but I don't know why", paths: ["energy", "soul"] },
  { q: "My team is talented but we can't ship", paths: ["energy", "team"] },
  { q: "I want to build something that matters", paths: ["purpose", "energy"] },
  { q: "I need to understand myself at the deepest level", paths: ["soul", "energy"] },
  { q: "I'm merging two teams and it's chaos", paths: ["team", "energy"] },
];

export default function FindYourPathClient() {
  const [activePortal, setActivePortal] = useState<string | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black" />
          {/* Animated sacred geometry grid */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-violet-400 mb-6">
              The Greenberg Ecosystem
            </p>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85]">
              FIND YOUR<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500">
                FREQUENCY
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Five portals into the same truth: you already know who you are.
            You just haven't had the language for it yet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-white/30"
          >
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="text-xs uppercase tracking-widest">Scroll to begin</span>
          </motion.div>
        </div>
      </section>

      {/* Quick Diagnosis */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-center mb-10">
            Where does it <span className="text-violet-400">hurt</span>?
          </h2>
          <div className="space-y-3">
            {SYNTHESIS_QUESTIONS.map((sq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredQuestion(i)}
                onMouseLeave={() => setHoveredQuestion(null)}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all">
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    "{sq.q}"
                  </span>
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {hoveredQuestion === i && sq.paths.map((pathId) => {
                        const portal = PORTALS.find(p => p.id === pathId);
                        if (!portal) return null;
                        return (
                          <motion.div
                            key={pathId}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `${portal.color}30` }}
                          >
                            <portal.icon className="w-3 h-3" style={{ color: portal.color }} />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Five Portals */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-4">
            Five Portals Into Self
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Choose Your Entry Point
          </h2>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {PORTALS.map((portal, i) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`border border-white/10 bg-gradient-to-r ${portal.gradient} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white/30 hover:scale-[1.01] overflow-hidden`}
                onClick={() => setActivePortal(activePortal === portal.id ? null : portal.id)}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${portal.color}25` }}
                    >
                      <portal.icon className="w-7 h-7" style={{ color: portal.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-white">{portal.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                          {portal.time}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mb-3">{portal.subtitle}</p>
                      <p className="text-base text-white/50 italic mb-4">"{portal.question}"</p>

                      <AnimatePresence>
                        {activePortal === portal.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-white/60 leading-relaxed mb-5">
                              {portal.description}
                            </p>
                            {portal.external ? (
                              <a href={portal.link} target="_blank" rel="noopener noreferrer">
                                <Button
                                  className="gap-2"
                                  style={{ backgroundColor: portal.color }}
                                >
                                  {portal.cta} <ArrowRight className="w-4 h-4" />
                                </Button>
                              </a>
                            ) : (
                              <Link href={portal.link}>
                                <Button
                                  className="gap-2"
                                  style={{ backgroundColor: portal.color }}
                                >
                                  {portal.cta} <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Synthesis */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Sparkles className="w-8 h-8 text-violet-400 mx-auto" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            The Combined Report
          </h2>
          <p className="text-lg text-white/50 leading-relaxed">
            When you take the Flow Circuit Assessment AND add your SoulPrint data,
            something extraordinary happens. Your energy DNA meets your soul blueprint.
            The report doesn't just tell you what you do — it tells you <em>why you can't stop doing it</em>.
          </p>
          <p className="text-sm text-white/30">
            Your Flow Circuit role is the WHAT. Your SoulPrint is the WHY.
            Together, they're the closest thing to a user manual for your soul.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/assessment">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2">
                <Zap className="w-5 h-5" /> Start with Energy DNA
              </Button>
            </Link>
            <Link href="/soulprint">
              <Button size="lg" variant="outline" className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10 gap-2">
                <Fingerprint className="w-5 h-5" /> Start with Soul Blueprint
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Embed CTA */}
      <section className="container mx-auto px-4 py-16 mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
            <Globe className="w-6 h-6 text-white/40 mx-auto" />
            <h3 className="text-lg font-bold">Want this on your site?</h3>
            <p className="text-sm text-white/40">
              The Flow Circuit discovery widget can be embedded on any website.
              One script tag. Universal self-discovery. Everywhere.
            </p>
            <code className="block text-xs text-violet-400 bg-black/50 p-3 rounded-lg font-mono">
              {'<script src="https://theflowcircuit.com/embed.js"></script>'}
            </code>
            <p className="text-[10px] text-white/20">Coming soon — contact us for early access</p>
          </div>
        </div>
      </section>
    </div>
  );
}
