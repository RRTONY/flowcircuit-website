"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Users, X, ArrowRight, Zap } from "lucide-react";

export default function FloatingCTA() {
  const location = usePathname();
  const router = useRouter();
  const [showTeamInput, setShowTeamInput] = useState(false);
  const [domain, setDomain] = useState("");
  const [dismissed, setDismissed] = useState(false);

  // Hide on assessment page, results page, and team-map page
  if (location === "/assessment" || location === "/results" || location.startsWith("/team-map")) return null;
  if (dismissed) return null;

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      router.push(`/assessment?domain=${encodeURIComponent(domain.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ delay: 2, duration: 0.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Urgency pulse line */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 animate-pulse" />
        
        <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
          <div className="container mx-auto px-4 py-3">
            <AnimatePresence mode="wait">
              {!showTeamInput ? (
                <motion.div
                  key="main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse shrink-0" />
                    <span className="text-sm sm:text-base font-bold">
                      <span className="text-yellow-400">Don't guess your role.</span>{" "}
                      The assessment reveals it in 5 minutes.
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/assessment">
                      <Button 
                        size="sm" 
                        className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-[0_0_20px_rgba(250,204,21,0.4)] text-sm px-4"
                      >
                        <ClipboardCheck className="mr-1.5 h-4 w-4" />
                        Take the Assessment
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 font-bold text-sm px-4"
                      onClick={() => setShowTeamInput(true)}
                    >
                      <Users className="mr-1.5 h-4 w-4" />
                      Find Your Tribe
                    </Button>
                    <button 
                      onClick={() => setDismissed(true)}
                      className="text-white/40 hover:text-white/80 transition-colors ml-1 p-1"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="team-input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-white shrink-0">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-bold">Enter your company domain to join your team:</span>
                  </div>
                  
                  <form onSubmit={handleJoinTeam} className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <Input
                      type="text"
                      placeholder="yourcompany.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-blue-400/30 text-sm"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-400 font-bold shrink-0 text-sm px-4"
                      disabled={!domain.trim()}
                    >
                      Join & Assess <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                    <button 
                      onClick={() => setShowTeamInput(false)}
                      className="text-white/40 hover:text-white/80 transition-colors p-1"
                      aria-label="Back"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
