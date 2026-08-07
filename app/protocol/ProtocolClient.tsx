"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users, Activity } from "lucide-react";
import MonroeProtocol from "@/components/MonroeProtocol";
import { motion } from "framer-motion";

export default function ProtocolClient() {
  const protocols = [
    {
      title: "Relay, Not a Scrum",
      icon: <Activity className="h-8 w-8 text-primary" />,
      description: "Innovation is a sequence, not a mosh pit. The baton must pass cleanly from Spark to Amplifier to Filter to Ground. If everyone touches the baton at once, you drop it."
    },
    {
      title: "The Facilitator is Traffic Control",
      icon: <Shield className="h-8 w-8 text-primary" />,
      description: "The Facilitator (or 'Oil') has absolute authority to stop the line. If a Spark tries to bypass the Filter and go straight to the Ground, the Facilitator blows the whistle."
    },
    {
      title: "Identity is Mandatory",
      icon: <Users className="h-8 w-8 text-primary" />,
      description: "You cannot play the game if you don't know your position. Every team member must know their primary role and respect the roles of others."
    },
    {
      title: "Expect the Immune Response",
      icon: <Zap className="h-8 w-8 text-primary" />,
      description: "Expect real resistance from the organization when you roll out a new operating system — that's normal, not a sign of failure. Think of it as an 'immune system' reaction. Do not fight it; navigate around it using the Flow Circuit."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/mMqEfcwIslMQXZsn.png"
          alt="Protocol Dynamo Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="container mx-auto px-4 py-24 space-y-24 relative z-10">

        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            The Protocol
          </motion.h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            The Operating Manual for High-Performance Teams.
          </p>
        </div>

        {/* The Rules of Engagement */}
        <section className="grid md:grid-cols-2 gap-8">
          {protocols.map((item, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all group">
              <CardHeader>
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <CardTitle className="text-2xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* The Handoff Sequence */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">The Handoff Sequence</h2>
            <p className="text-muted-foreground">How energy moves through the system.</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { role: "Spark", action: "Ignites", desc: "Creates the idea out of nothing." },
                { role: "Amplifier", action: "Expands", desc: "Sells the vision and gathers resources." },
                { role: "Filter", action: "Refines", desc: "Debugs the plan and removes risk." },
                { role: "Ground", action: "Executes", desc: "Makes it real and repeatable." }
              ].map((step, i) => (
                <div key={i} className="bg-background/80 backdrop-blur border border-primary/20 p-6 rounded-xl text-center space-y-2 shadow-lg">
                  <div className="text-4xl font-bold text-primary mb-2">{i + 1}</div>
                  <h3 className="text-xl font-bold">{step.role}</h3>
                  <p className="text-sm font-mono text-primary/80 uppercase tracking-widest">{step.action}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Monroe Protocol Integration */}
        <section className="bg-secondary/5 rounded-3xl p-12 border border-secondary/20 backdrop-blur-md">
          <MonroeProtocol />
        </section>

        {/* AI Opposition Protocol */}
        <section className="bg-gradient-to-r from-red-900/20 to-background p-12 rounded-3xl border-l-4 border-red-500 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-4">
              <Shield className="h-8 w-8 text-red-500" />
              AI Opposition Protocol
            </h2>
            <div className="prose prose-lg prose-invert">
              <p>
                As we integrate AI agents into the workforce, the "Human OS" becomes even more critical. AI is the ultimate "Ground" role—it executes perfectly but lacks the Spark of creation.
              </p>
              <p>
                <strong>The Protocol ensures that humans remain the Architects.</strong> We use the Flow Circuit to direct AI, not to be replaced by it.
              </p>
            </div>
            <Button variant="destructive" size="lg" className="mt-4" onClick={() => window.open('https://tonygreenberg.com/human-os-2-0', '_blank')}>
              Upgrade Your Kernel
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
