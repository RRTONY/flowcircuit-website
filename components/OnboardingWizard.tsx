import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  CheckCircle2, ArrowRight, Users, Map, Sparkles, Copy, X, Zap, Activity, Shield, Anchor, Radio
} from "lucide-react";

interface OnboardingWizardProps {
  role: string;
  score: number;
  teamCode?: string;
  assessmentId?: number;
  onClose: () => void;
}

const ROLE_ICONS: Record<string, any> = {
  Spark: Zap,
  Amplifier: Activity,
  Filter: Shield,
  Ground: Anchor,
  Conductor: Radio,
};

const STEPS = [
  {
    id: "results",
    title: "Your Role is Revealed",
    subtitle: "You now know your natural operating energy",
    icon: Sparkles,
  },
  {
    id: "invite",
    title: "Invite Your Tribe",
    subtitle: "The real insight comes from seeing how your energy interacts with others",
    icon: Users,
  },
  {
    id: "teammap",
    title: "See Your Team Map",
    subtitle: "Watch the invisible architecture of your team come alive",
    icon: Map,
  },
];

export default function OnboardingWizard({ role, score, teamCode, assessmentId, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [invitesCopied, setInvitesCopied] = useState(false);

  const RoleIcon = ROLE_ICONS[role] || Zap;

  const inviteLink = teamCode
    ? `${window.location.origin}/assessment?team=${teamCode}`
    : `${window.location.origin}/assessment`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setInvitesCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setInvitesCopied(false), 3000);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Final step — go to team map
      if (teamCode) {
        setLocation(`/team-map?team=${teamCode}`);
      } else {
        setLocation("/team-builder");
      }
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 border-black shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="flex gap-1 p-3 bg-gray-50">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-black" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step 0: Results Celebration */}
                {step === 0 && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                        <RoleIcon className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">You're a {role}</h2>
                        <p className="text-muted-foreground mt-1">
                          Score: {score}% alignment with your natural operating energy
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-sm leading-relaxed">
                        <p>
                          This isn't a personality label — it's your <strong>operational energy signature</strong>.
                          It reveals how you naturally process information, make decisions, and contribute to teams.
                        </p>
                        <p className="mt-2 text-muted-foreground text-xs">
                          Scroll down to see your full report with stress zones, combination profile, and growth insights.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-700">
                        <strong>Individual results are only 30% of the picture.</strong> The real insight comes from
                        seeing how your energy interacts with your team's energy.
                      </p>
                    </div>
                  </>
                )}

                {/* Step 1: Invite Tribe */}
                {step === 1 && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
                        <Users className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">Invite 3-5 Colleagues</h2>
                        <p className="text-muted-foreground mt-1">
                          Share this link with your team — it takes 5 minutes
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={copyInviteLink}
                    >
                      <code className="flex-1 text-xs truncate">{inviteLink}</code>
                      {invitesCopied ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: "5 min", desc: "to complete" },
                        { label: "Free", desc: "for everyone" },
                        { label: "Instant", desc: "team map" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-black text-lg">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      When 3+ people from the same team complete the assessment, the Team Map unlocks automatically.
                    </p>
                  </>
                )}

                {/* Step 2: Team Map Preview */}
                {step === 2 && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                        <Map className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">Your Team Map Awaits</h2>
                        <p className="text-muted-foreground mt-1">
                          See the invisible architecture of your team
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { icon: "⚡", text: "See who's the Spark, who's the Ground, and where the gaps are" },
                        { icon: "🔥", text: "Identify friction pairs — who's being forced outside their natural role" },
                        { icon: "🎯", text: "Get hiring recommendations based on missing energy types" },
                        { icon: "📊", text: "Compare your team against aggregate norms across all teams" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-lg">{item.icon}</span>
                          <p className="text-sm">{item.text}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-center text-muted-foreground italic">
                      "Don't just merge balance sheets; merge nervous systems."
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip wizard
              </button>
              <Button onClick={handleNext} className="gap-2 bg-black hover:bg-gray-800">
                {step === STEPS.length - 1 ? (
                  <>
                    {teamCode ? "View Team Map" : "Build Your Team"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
}
