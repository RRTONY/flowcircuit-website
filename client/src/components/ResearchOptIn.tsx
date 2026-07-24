import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FlaskConical, BarChart3, Shield } from "lucide-react";

interface ResearchOptInProps {
  assessmentId: number;
}

export default function ResearchOptIn({ assessmentId }: ResearchOptInProps) {
  const [optedIn, setOptedIn] = useState(false);
  const [justOptedIn, setJustOptedIn] = useState(false);

  const updateOptIn = trpc.assessment.updateResearchOptIn.useMutation();

  // Check localStorage for previous opt-in
  useEffect(() => {
    const stored = localStorage.getItem("research_opt_in");
    if (stored === "true") setOptedIn(true);
  }, []);

  const handleOptIn = async () => {
    try {
      await updateOptIn.mutateAsync({ assessmentId, optIn: true });
      setOptedIn(true);
      setJustOptedIn(true);
      localStorage.setItem("research_opt_in", "true");
    } catch (err) {
      console.error("Failed to opt in", err);
    }
  };

  if (optedIn) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-6 h-6 text-sky-600" />
          <h3 className="text-lg font-bold text-sky-900">Contributing to Research</h3>
        </div>
        <AnimatePresence>
          {justOptedIn && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sky-700 text-sm leading-relaxed mb-3"
            >
              Thank you! Your anonymized data is now part of the Flow Circuit validation study. 
              You're helping build the evidence base for a more rigorous approach to team dynamics.
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-sky-600 text-xs">
          Your data is anonymized — no names, emails, or identifying information are included in research datasets. 
          You can opt out anytime from your profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-6 md:p-8">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
          <FlaskConical className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-sky-900 mb-1">Help Validate the Science</h3>
          <p className="text-sky-700 text-sm leading-relaxed" style={{ textWrap: 'pretty' as any }}>
            Our Monte Carlo simulations show forced-ranking outperforms Likert scoring — but simulated data 
            isn't real data. By opting in, your anonymized results feed a live validation dashboard that 
            tracks whether the theory holds up in the wild.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white/80 rounded-lg p-3 border border-sky-100">
          <Shield className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-xs text-sky-800 font-medium">Fully anonymized</span>
        </div>
        <div className="flex items-center gap-2 bg-white/80 rounded-lg p-3 border border-sky-100">
          <BarChart3 className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-xs text-sky-800 font-medium">Live dashboard</span>
        </div>
        <div className="flex items-center gap-2 bg-white/80 rounded-lg p-3 border border-sky-100">
          <FlaskConical className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-xs text-sky-800 font-medium">Opt out anytime</span>
        </div>
      </div>

      <Button
        onClick={handleOptIn}
        disabled={updateOptIn.isPending}
        className="bg-sky-600 text-white hover:bg-sky-700 font-bold gap-2"
      >
        <FlaskConical className="w-4 h-4" />
        {updateOptIn.isPending ? "Opting in..." : "Contribute My Data to Research"}
      </Button>
    </div>
  );
}
