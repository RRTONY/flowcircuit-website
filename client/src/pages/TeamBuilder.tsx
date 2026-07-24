import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, User, ArrowRight, ClipboardCheck, BarChart3 } from "lucide-react";

export default function TeamBuilder() {
  const [, setLocation] = useLocation();
  const [teamCode, setTeamCode] = useState("");

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamCode.trim()) {
      setLocation(`/assessment?team=${encodeURIComponent(teamCode.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            TEAM ARCHITECTURE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Map your innovation relay. Identify the friction. Engineer the flow.
          </p>
        </motion.div>

        {/* Step 1: Take the Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-2 border-black/10 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-lg">1</span>
                  <h2 className="text-2xl md:text-3xl font-bold">Take the 12-Question Assessment</h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Every team member starts here. The assessment reveals your natural energy role — 
                  Spark, Amplifier, Filter, Ground, or Conductor. It takes about 5 minutes.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
                  <Link href="/assessment">
                    <Button className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-black/80">
                      <User className="mr-2 h-5 w-5" />
                      Individual
                    </Button>
                  </Link>
                  <div>
                    <form onSubmit={handleJoinTeam} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Team code..."
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        className="h-14 text-lg bg-white border-black/10"
                      />
                      <Button 
                        type="submit" 
                        className="h-14 px-6 bg-blue-600 text-white hover:bg-blue-700 shrink-0"
                        disabled={!teamCode.trim()}
                      >
                        <Users className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 2: View Team Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-md border-2 border-black/10 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">2</span>
                  <h2 className="text-2xl md:text-3xl font-bold">View Your Team Dashboard</h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Once your team has taken the assessment, the Team Dashboard shows the Energy Matrix, 
                  friction points, gap analysis, and hiring recommendations.
                </p>
                <Link href="/team-dashboard">
                  <Button variant="outline" className="h-14 text-lg px-8 border-2">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Go to Team Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 3: Sample Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-black text-white border-0 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">Want to See What You'll Get?</h2>
                <p className="text-lg text-white/70 max-w-xl mx-auto">
                  View a sample team report with 10 pre-filled profiles, complete with Energy Matrix, 
                  radar charts, friction analysis, and executive summary.
                </p>
                <Link href="/sample-reports">
                  <Button className="h-14 text-lg px-8 bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
                    View Sample Reports <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
