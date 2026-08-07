"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Users, Zap } from "lucide-react";
import Link from "next/link";
import BlogBridge from '@/components/BlogBridge';

export default function JourneyClient() {
  const steps = [
    {
      phase: "Phase 1: The Mirror",
      title: "Individual Awakening",
      icon: <User className="h-12 w-12 text-primary" />,
      description: "You cannot optimize what you do not understand. The journey begins with a deep dive into your own operating system.",
      actions: [
        "Take the Flow Circuit Assessment",
        "Discover your 'TrueSelf' Soulprint",
        "Identify your Superpowers & Kryptonite"
      ],
      link: "/team-builder",
      cta: "Start Assessment"
    },
    {
      phase: "Phase 2: The Circuit",
      title: "Team Calibration",
      icon: <Users className="h-12 w-12 text-secondary" />,
      description: "Individual brilliance means nothing if the connection is broken. We map your team to reveal the hidden friction.",
      actions: [
        "Map your team on the Flow Quadrant",
        "Identify 'Short Circuits' (Missing Roles)",
        "Design your custom 'Handoff Protocol'"
      ],
      link: "/team-builder",
      cta: "Map Your Team"
    },
    {
      phase: "Phase 3: The Ritual",
      title: "Daily Integration",
      icon: <Zap className="h-12 w-12 text-accent" />,
      description: "Flow isn't a workshop. It's a habit. We embed the protocol into your daily meetings, emails, and decisions.",
      actions: [
        "Implement 'The Conductor' in meetings",
        "Use 'Friction Scripts' for conflict",
        "Track your team's cycle time to see the trend for yourself"
      ],
      link: "/protocol",
      cta: "View Protocol"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-24">
      <div className="container mx-auto px-4 space-y-24">

        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent"
          >
            THE JOURNEY
          </motion.h1>
          <p className="text-xl text-muted-foreground">
            From Chaos to Flow in Three Steps.
          </p>
        </div>

        {/* The Path */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-20 -z-10" />

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-2 duration-300">
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto p-4 rounded-full bg-background border border-border shadow-lg">
                      {step.icon}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{step.phase}</p>
                      <CardTitle className="text-2xl">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 text-center">
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-3 text-left bg-muted/30 p-6 rounded-xl">
                      {step.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="text-primary mt-1">✓</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                    <Link href={step.link}>
                      <Button className="w-full group">
                        {step.cta}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Destination */}
        <div className="text-center space-y-8 bg-gradient-to-b from-transparent to-primary/5 p-12 rounded-3xl border border-primary/10">
          <h2 className="text-3xl font-bold">The Destination: The Autotelic Team</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            An "Autotelic Team" is one that works for the sheer joy of the work itself.
            The friction is gone. The politics are gone. All that remains is the pure velocity of creation.
          </p>
          <Link href="/team-builder">
            <Button size="lg" className="text-lg px-12 py-6 rounded-full shadow-[0_0_30px_-10px_var(--primary)] hover:shadow-[0_0_50px_-10px_var(--primary)] transition-all">
              Begin Your Journey
            </Button>
          </Link>
        </div>

        <BlogBridge pageKey="journey" />
      </div>
    </div>
  );
}
