"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FrictionDashboard from '@/components/FrictionDashboard';
import { Zap, ArrowRight, Users, User, ClipboardCheck, Sparkles, Shield, Target, Activity, TrendingDown, Brain, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function HomeClient() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teamCode, setTeamCode] = useState("");

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamCode.trim()) {
      router.push(`/assessment?team=${encodeURIComponent(teamCode.trim())}`);
    }
  };

  const roles = [
    { name: "Spark", icon: Zap, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", desc: "Ignites ideas and sees what others can't yet" },
    { name: "Amplifier", icon: Activity, color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/20", desc: "Builds momentum and rallies belief" },
    { name: "Filter", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", desc: "Stress-tests and refines the plan" },
    { name: "Ground", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", desc: "Executes with precision and delivers" },
    { name: "Conductor", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "Orchestrates the flow between all roles" },
  ];

  return (
    <>
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO: Stress/Flow Hook — "Stop fighting your nature" */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay loop muted playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/HyOBAibfDVCWexqm.mp4" type="video/mp4" />
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/FNWsxTgAVMLjFeTN.jpg" alt="Glass Clockwork" className="w-full h-full object-cover" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background z-10" />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center space-y-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg sm:text-xl md:text-2xl text-yellow-400/90 font-medium tracking-wide uppercase">
              The Invisible Architecture of Performance
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9]">
              Stop Fighting<br/>Your Nature.
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto font-light leading-snug">
              You're not burned out because you work too hard.<br className="hidden md:block" />
              You're burned out because you're in the wrong seat.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/assessment">
              <Button size="lg" className="text-lg px-8 py-6 bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                <ClipboardCheck className="mr-2 h-5 w-5" />
                Find Your Natural Role
              </Button>
            </Link>
            <Link href="/science">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white/30 text-white hover:bg-white/10">
                The Science Behind It
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-sm text-white/50"
          >
            12 questions. 5 minutes. One insight that changes how you work.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* THE PROBLEM: Why Teams Break */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-5xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Why Teams Break</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              It's not personality conflicts. It's not bad culture. It's physics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur border-destructive/20 hover:border-destructive/40 transition-all">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold">The Burnout Trap</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A natural Spark forced into execution work doesn't just underperform — they burn out. The stress isn't from the workload. It's from fighting their own wiring.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold">The Friction Tax</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When energy can't flow from ideation to execution, every handoff creates friction. Innovation cycles stretch from weeks to quarters. The best ideas die in committee.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardContent className="pt-8 pb-6 px-6 space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">The Invisible Gap</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Org charts show reporting lines. They don't show energy flow. A team with three Sparks and no Ground has a circuit break nobody can see — until the project fails.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* THE SOLUTION: The Five Energy Roles */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">The Five Energy Roles</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every team needs all five. The assessment reveals which one is your natural superpower — the seat where stress disappears and flow begins.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.name}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`text-center space-y-3 p-4 rounded-2xl border ${role.border} ${role.bg} transition-all`}
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center bg-background/80 shadow-md`}>
                    <Icon className={`w-7 h-7 md:w-8 md:h-8 ${role.color}`} />
                  </div>
                  <h3 className={`text-lg md:text-xl font-bold ${role.color}`}>{role.name}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">{role.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/assessment">
              <Button size="lg" className="text-lg px-10 py-6 bg-black text-white hover:bg-black/80 font-bold shadow-lg">
                Which One Are You? <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Go Deeper link */}
          <div className="text-center">
            <Link href="/science" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
              Explore the science behind the relay model
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TWO PATHS: Individual vs Team */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Two Ways In</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Individual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card/80 backdrop-blur border-2 border-border hover:border-yellow-400/50 transition-all group">
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/10 rounded-full flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                    <User className="w-8 h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Find Your Role</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Discover your natural energy seat
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3 text-muted-foreground text-sm">
                    <li className="flex items-start gap-3">
                      <ClipboardCheck className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>12 questions, 5 minutes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>Personalized report with radar chart</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>PDF download with your energy breakdown</span>
                    </li>
                  </ul>
                  <Link href="/assessment">
                    <Button className="w-full h-12 text-lg font-bold bg-black text-white hover:bg-black/80 shadow-lg">
                      Start the Assessment <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full bg-card/80 backdrop-blur border-2 border-border hover:border-blue-400/50 transition-all group">
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-400/10 rounded-full flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Map Your Team</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    See where the circuit breaks
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3 text-muted-foreground text-sm">
                    <li className="flex items-start gap-3">
                      <ClipboardCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Same assessment, linked to your team</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Live team dashboard with energy radar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Friction report showing missing roles</span>
                    </li>
                  </ul>
                  <form onSubmit={handleJoinTeam} className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Enter your company domain (e.g. ramprate.com)"
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value)}
                      className="h-12 text-base bg-background border-border focus:ring-blue-400/20"
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      disabled={!teamCode.trim()}
                    >
                      Join & Take Assessment <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CONSEQUENCE: The Friction Calculator */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">What Misalignment Costs You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              When people fight their nature, the friction shows up in dollars. Calculate what your team is losing.
            </p>
          </div>
          <FrictionDashboard />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM CTA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="bg-black text-white border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500" />
            <CardContent className="p-12 text-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Ready to Stop<br/>Fighting the Current?</h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto">
                12 questions. 5 minutes. Discover the role where stress disappears and flow begins.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/assessment">
                  <Button size="lg" className="text-lg px-10 py-6 bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                    <ClipboardCheck className="mr-2 h-5 w-5" />
                    Take the Assessment
                  </Button>
                </Link>
                <Link href="/sample-reports">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10">
                    See Sample Reports
                  </Button>
                </Link>
              </div>

              {/* Go Deeper links */}
              <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-white/40">
                <Link href="/protocol" className="hover:text-white/70 transition-colors underline underline-offset-4">Protocol</Link>
                <Link href="/soulprint" className="hover:text-white/70 transition-colors underline underline-offset-4">Soulprint</Link>
                <Link href="/family" className="hover:text-white/70 transition-colors underline underline-offset-4">Family Circuit</Link>
                <Link href="/consciousness" className="hover:text-white/70 transition-colors underline underline-offset-4">Consciousness</Link>
                <Link href="/origin" className="hover:text-white/70 transition-colors underline underline-offset-4">Origin</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
    </>
  );
}
