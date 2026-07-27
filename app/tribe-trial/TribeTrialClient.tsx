"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  GitBranch,
} from "lucide-react";

export default function TribeTrial() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Get source from URL params
  const params = new URLSearchParams(window.location.search);
  const source = (params.get("source") || "pricing") as
    | "results_page"
    | "360_link"
    | "360_gap"
    | "pricing"
    | "pdf";

  const signup = trpc.trial.signup.useMutation({
    onSuccess: (data) => {
      if (data.alreadyActive) {
        toast.info("You already have an active trial!");
      } else {
        toast.success("Your 30-day free trial is live!");
      }
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and work email.");
      return;
    }
    signup.mutate({ name: name.trim(), email: email.trim(), source });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#2C1810]">
            You're In.
          </h1>
          <p className="text-[#2C1810]/70 text-lg">
            Your 30-day Tribe trial is live. Full access to team dashboards,
            360 peer review, friction pair detection, and the manager guidebook.
          </p>
          <div className="bg-[#2C1810] text-white rounded-xl p-6 text-left space-y-3">
            <p className="font-bold text-amber-400 text-sm uppercase tracking-wide">
              Your highest-ROI action right now:
            </p>
            <p className="text-white/90">
              Send your 360 link to 3 colleagues today. The gap between how you
              see yourself and how others experience you is the most actionable
              data you'll collect this month.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => router.push("/results")}
              className="bg-[#2C1810] hover:bg-[#1a0f0a] text-white"
            >
              Go to My Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/assessment")}
              className="border-[#2C1810] text-[#2C1810]"
            >
              Take Assessment First
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <p className="text-sm uppercase tracking-widest text-[#2C1810]/50">
            30-Day Free Trial
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight">
            See How Your Team<br />
            <span className="text-amber-600">Actually Works Together</span>
          </h1>
          <p className="text-lg text-[#2C1810]/70 max-w-2xl mx-auto">
            The gap between how you see yourself and how your team experiences
            you is the most actionable data you'll collect this quarter.
            Start free. No credit card required.
          </p>
        </motion.div>

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Users,
              title: "360 Peer Review",
              desc: "See how others experience your energy — anonymous, honest, actionable.",
            },
            {
              icon: GitBranch,
              title: "Friction Pair Detection",
              desc: "Identify which handoffs slow your team down and how to fix them.",
            },
            {
              icon: BarChart3,
              title: "Team Energy Map",
              desc: "Visualize who covers what role and where the gaps live.",
            },
            {
              icon: Zap,
              title: "Manager Guidebook",
              desc: "Specific actions for each team member based on their energy profile.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-[#E8DDD3]">
              <CardContent className="p-5 space-y-2">
                <item.icon className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-[#2C1810] text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-[#2C1810]/60">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-[#E8DDD3] shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-[#2C1810]">
                  Start Your Free Trial
                </h2>
                <p className="text-sm text-[#2C1810]/60">
                  Full Tribe access for 30 days. Up to 10 team members.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#2C1810] mb-1 block">
                    Your name
                  </label>
                  <Input
                    placeholder="Reeve Collins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-[#E8DDD3] focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#2C1810] mb-1 block">
                    Work email
                  </label>
                  <Input
                    type="email"
                    placeholder="reeve@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[#E8DDD3] focus:border-amber-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2C1810] hover:bg-[#1a0f0a] text-white h-12 text-base"
                  disabled={signup.isPending}
                >
                  {signup.isPending ? "Activating..." : "Start Free for 30 Days"}
                </Button>
              </form>

              <div className="flex items-center gap-2 text-xs text-[#2C1810]/50 justify-center">
                <Shield className="w-3 h-3" />
                <span>No credit card required. Cancel anytime.</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ROI Math */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-lg mx-auto text-center space-y-4"
        >
          <h3 className="font-bold text-[#2C1810] text-lg">The ROI Math</h3>
          <div className="bg-[#2C1810] rounded-xl p-6 text-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">One wasted meeting (10 people)</span>
              <span className="font-bold text-red-400">$1,200</span>
            </div>
            <div className="border-t border-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-white/70">One month of Tribe (10 people)</span>
              <span className="font-bold text-emerald-400">$290</span>
            </div>
            <div className="border-t border-white/10" />
            <p className="text-sm text-white/60 pt-2">
              The Tribe plan pays for itself the first time a
              role-misfit handoff doesn't happen.
            </p>
          </div>
        </motion.div>

        {/* Trial Terms */}
        <div className="max-w-md mx-auto text-center text-xs text-[#2C1810]/40 space-y-1">
          <p>30 days free. Converts to $29/member/month on day 31.</p>
          <p>Cancel anytime before then — one click, no questions.</p>
        </div>
      </div>
    </div>
  );
}
