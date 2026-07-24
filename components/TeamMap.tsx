import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RefreshCw, Send, CheckCircle2, AlertCircle, Zap, Activity, Filter, Anchor, Hand } from 'lucide-react';
import { toast } from "sonner";

// Define the 10 team members with their roles and "Chaos" vs "Flow" positions
const teamMembers = [
  { id: 1, name: "Sarah", role: "Spark", chaos: { x: 10, y: 20 }, flow: { x: 50, y: 10 }, color: "bg-red-500", icon: Zap },
  { id: 2, name: "Mike", role: "Anchor", chaos: { x: 80, y: 80 }, flow: { x: 50, y: 90 }, color: "bg-blue-500", icon: Anchor },
  { id: 3, name: "Jessica", role: "Amplifier", chaos: { x: 20, y: 70 }, flow: { x: 80, y: 30 }, color: "bg-yellow-500", icon: Activity },
  { id: 4, name: "David", role: "Filter", chaos: { x: 60, y: 30 }, flow: { x: 20, y: 70 }, color: "bg-purple-500", icon: Filter },
  { id: 5, name: "Tom", role: "Spark", chaos: { x: 15, y: 25 }, flow: { x: 40, y: 15 }, color: "bg-red-500", icon: Zap },
  { id: 6, name: "Linda", role: "Anchor", chaos: { x: 85, y: 75 }, flow: { x: 60, y: 90 }, color: "bg-blue-500", icon: Anchor },
  { id: 7, name: "Chris", role: "Amplifier", chaos: { x: 25, y: 65 }, flow: { x: 90, y: 35 }, color: "bg-yellow-500", icon: Activity },
  { id: 8, name: "Amanda", role: "Filter", chaos: { x: 55, y: 35 }, flow: { x: 10, y: 65 }, color: "bg-purple-500", icon: Filter },
  { id: 9, name: "James", role: "Spark", chaos: { x: 12, y: 18 }, flow: { x: 60, y: 10 }, color: "bg-red-500", icon: Zap },
  { id: 10, name: "Emily", role: "Filter", chaos: { x: 65, y: 25 }, flow: { x: 30, y: 70 }, color: "bg-purple-500", icon: Filter },
];

export default function TeamMap() {
  const [isFixed, setIsFixed] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Swipe Logic
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
  };

  const handleFixTeam = () => {
    if (!isFixed) playSound();
    setIsFixed(!isFixed);
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleFixTeam();
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      setSubmitted(true);
      toast.success("Report Unlocked", {
        description: `Sending your ${role} analysis to ${email}`,
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3" preload="auto" />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">The Team Map</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how your team actually moves. Click "Fix This Team" or <span className="font-bold text-primary">Swipe Right</span> to see the Flow Circuit organize the chaos.
        </p>
      </div>

      {/* The Map Visualization */}
      <motion.div 
        className="relative w-full aspect-[16/9] bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden shadow-2xl group touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-30" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        {/* Mobile Swipe Hint */}
        <AnimatePresence>
          {!isFixed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden z-30"
            >
              <div className="bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-2 animate-pulse">
                <Hand className="h-5 w-5" /> Swipe to Fix
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Axis Labels (Visible only in Flow mode for clarity) */}
        <AnimatePresence>
          {isFixed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-red-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Ignition (Spark)</div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-blue-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Solidification (Anchor)</div>
              <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold uppercase tracking-widest text-purple-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Compression (Filter)</div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-xs font-bold uppercase tracking-widest text-yellow-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Expansion (Amplifier)</div>
              
              {/* Flow Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                <defs>
                  <linearGradient id="flowLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="33%" stopColor="#eab308" />
                    <stop offset="66%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <motion.path 
                  d="M 50% 15% Q 90% 15% 90% 50% T 50% 85% T 10% 50% T 50% 15%" 
                  fill="none" 
                  stroke="url(#flowLineGradient)" 
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team Nodes */}
        {teamMembers.map((member) => {
          const Icon = member.icon;
          return (
            <motion.div
              key={member.id}
              className={`absolute w-12 h-12 md:w-16 md:h-16 rounded-full ${member.color} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer z-10 border-2 border-white/50`}
              initial={false}
              animate={{
                left: isFixed ? `${member.flow.x}%` : `${member.chaos.x}%`,
                top: isFixed ? `${member.flow.y}%` : `${member.chaos.y}%`,
                scale: isFixed ? 1.1 : 1,
              }}
              transition={{ 
                type: "spring", 
                stiffness: 40, 
                damping: 15, 
                mass: 1.2,
                delay: isFixed ? member.id * 0.05 : 0 // Staggered animation
              }}
              whileHover={{ scale: 1.2, zIndex: 50 }}
            >
              <Icon className="w-6 h-6" />
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl">
                {member.name} • {member.role}
              </div>
            </motion.div>
          );
        })}

        {/* Control Button */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:block">
          <Button 
            size="lg" 
            onClick={handleFixTeam}
            className={`shadow-2xl transition-all duration-500 h-14 px-8 rounded-full text-lg font-bold ${isFixed ? 'bg-black text-white hover:bg-black/80' : 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse'}`}
          >
            {isFixed ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5" /> Reset Chaos
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5 fill-current" /> Fix This Team
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Role-Based Email Capture */}
      <Card className="bg-white/80 backdrop-blur-md border-black/5 shadow-xl overflow-hidden">
        <CardContent className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold">Get Your Team's Flow Report</h3>
            <p className="text-muted-foreground text-lg">
              Stop guessing why your team is stuck. Get a custom analysis of your friction points and a step-by-step playbook to fix it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-sm">Includes Friction Cost</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">Role-Specific Scripts</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">10-Person Audit</Badge>
            </div>
          </div>

          <div className="bg-gray-50/50 p-8 rounded-2xl border border-black/5">
            {!submitted ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">What is your core energy?</label>
                  <Select onValueChange={setRole} required>
                    <SelectTrigger className="h-12 bg-white border-black/10">
                      <SelectValue placeholder="Select your role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spark">Spark (I start things)</SelectItem>
                      <SelectItem value="Amplifier">Amplifier (I scale things)</SelectItem>
                      <SelectItem value="Filter">Filter (I refine things)</SelectItem>
                      <SelectItem value="Anchor">Anchor (I stabilize things)</SelectItem>
                      <SelectItem value="Unsure">I'm not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Work Email</label>
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white border-black/10"
                    required
                  />
                </div>

                <Button type="submit" className="w-full text-lg font-bold h-12 shadow-lg hover:shadow-xl transition-all" disabled={!role || !email}>
                  <Send className="mr-2 h-5 w-5" /> Unlock My Report
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We respect your inbox. No spam, just flow.
                </p>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-2">You're on the list!</h4>
                  <p className="text-muted-foreground">
                    We're preparing a report specifically for a <strong>{role}</strong> like you. Check your inbox in 5 minutes.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
                  Send to another teammate
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
