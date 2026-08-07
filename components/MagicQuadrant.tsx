import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Play, RotateCcw, CheckCircle2, Users, Info, AlertTriangle, Target, Brain, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const assessments = [
  { 
    name: "Flow Circuit", 
    x: 90, 
    y: 90, 
    color: "bg-primary", 
    description: "Operational Physics. The only tool that maps how energy moves between people to predict team velocity.",
    validity: "Pending Validation",
    focus: "Team Execution",
    link: "https://flow.tonygreenberg.com/journey",
    cta: "Start Journey",
    type: "kinetic",
    narrative: "Liberates energy. Turns friction into fuel."
  },
  { 
    name: "MBTI", 
    x: 20, 
    y: 80, 
    color: "bg-muted-foreground/30", 
    description: "Cognitive Preference. Great for self-awareness, but fails to predict performance. Use for parties, not payroll.",
    validity: "Debated",
    focus: "Individual Cognition",
    link: "https://www.16personalities.com/",
    cta: "Take MBTI",
    type: "static",
    narrative: "Boxes you in. 'I am an INTJ' becomes an excuse."
  },
  { 
    name: "DISC", 
    x: 80, 
    y: 20, 
    color: "bg-muted-foreground/30", 
    description: "Behavioral Style. Good for communication style, but lacks depth in cognitive processing.",
    validity: "Established",
    focus: "Behavioral Style",
    link: "https://www.discprofile.com/what-is-disc",
    cta: "Learn DISC",
    type: "static",
    narrative: "Labels behavior, but misses the 'why'."
  },
  { 
    name: "Kolbe A", 
    x: 60, 
    y: 60, 
    color: "bg-muted-foreground/30", 
    description: "Conative Action. Measures striving instincts. Excellent for individual role fit, but isolated.",
    validity: "High (established)",
    focus: "Instinctive Action",
    link: "https://www.kolbe.com/",
    cta: "Visit Kolbe",
    type: "static",
    narrative: "Great for individuals, silent on team chemistry."
  },
  { 
    name: "Enneagram", 
    x: 10, 
    y: 70, 
    color: "bg-muted-foreground/30", 
    description: "Core Motivations. Deeply spiritual and psychological, but too abstract for operational speed.",
    validity: "Mixed evidence",
    focus: "Deep Motivation",
    link: "https://www.enneagraminstitute.com/",
    cta: "Explore Enneagram",
    type: "static",
    narrative: "Deep insight, zero operational utility."
  },
  { 
    name: "TrueSelf", 
    x: 15, 
    y: 95, 
    color: "bg-muted-foreground/30", 
    description: "Soulprint. Cosmic alignment. Beautiful for purpose, irrelevant for P&L.",
    validity: "N/A (Spiritual)",
    focus: "Cosmic Identity",
    link: "https://trueself.io/",
    cta: "Discover TrueSelf",
    type: "static",
    narrative: "Find your soul, lose your deadline."
  },
  { 
    name: "Belbin", 
    x: 85, 
    y: 50, 
    color: "bg-muted-foreground/30", 
    description: "Team Roles. The closest ancestor, but relies on self-reporting rather than energetic physics.",
    validity: "Established",
    focus: "Team Roles",
    link: "https://www.belbin.com/",
    cta: "Check Belbin",
    type: "static",
    narrative: "Good theory, outdated execution."
  },
];

export default function MagicQuadrant() {
  const [activePhase, setActivePhase] = useState<'static' | 'kinetic'>('static');
  const [selectedItem, setSelectedItem] = useState<typeof assessments[0] | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'self' | 'team'>('all');
  const togglePhase = () => {
    if (activePhase === 'static') {
      setActivePhase('kinetic');
    } else {
      setActivePhase('static');
    }
    setSelectedItem(null);
  };

  const filteredAssessments = assessments.filter(a => {
    if (filterMode === 'all') return true;
    if (filterMode === 'self') return a.focus.includes("Individual") || a.focus.includes("Motivation") || a.focus.includes("Identity");
    if (filterMode === 'team') return a.focus.includes("Team") || a.focus.includes("Behavior") || a.focus.includes("Action");
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pt-12 md:pt-0 relative">
      {/* Header Narrative */}
      <div className="text-center space-y-4 max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black">
          The Strategic Navigator
        </h2>
        <p className="text-xl text-black/70 max-w-2xl mx-auto">
          Stop using <span className="font-bold text-black">personality tests</span> for <span className="font-bold text-primary">operational problems</span>.
        </p>
      </div>

      {/* Top Controls Bar - Replaces Sidebar for Better Layout */}
      <div className="bg-white/90 backdrop-blur-md border border-black/5 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mx-4">
        
        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground mr-2 hidden md:inline-block">Filter:</span>
          <div className="flex gap-2 bg-muted/20 p-1 rounded-lg">
            <Button 
              variant={filterMode === 'all' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilterMode('all')}
              className="rounded-md"
            >
              All
            </Button>
            <Button 
              variant={filterMode === 'self' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilterMode('self')}
              className="rounded-md"
            >
              <Brain className="mr-2 h-3 w-3" /> Self
            </Button>
            <Button 
              variant={filterMode === 'team' ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilterMode('team')}
              className="rounded-md"
            >
              <Users className="mr-2 h-3 w-3" /> Team
            </Button>
          </div>
        </div>

        {/* Legend / Key */}
        <div className="flex items-center gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="font-medium">High Validity (0.8+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="font-medium">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="font-medium">Low</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={togglePhase}
          size="lg"
          className={`rounded-full font-bold transition-all duration-500 px-6 shadow-xl ${activePhase === 'kinetic' ? 'bg-primary hover:bg-primary/90 ring-4 ring-primary/20' : 'bg-black text-white hover:bg-black/90'}`}
        >
          {activePhase === 'static' ? (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" /> Activate Flow
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset System
            </>
          )}
        </Button>
      </div>

      {/* Main Stage */}
      <div className="px-4">
        {/* Interactive Chart */}
        <div className="relative w-full aspect-square md:aspect-[16/9] max-h-[500px] bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 overflow-hidden shadow-2xl group mx-auto">
          
          {/* Background Grid - Crystal Clear */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${activePhase === 'kinetic' ? 'opacity-100' : 'opacity-50'}`}>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]" />
            {activePhase === 'kinetic' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 animate-pulse" />
            )}
          </div>

          {/* Axis Labels - All 4 Sides */}
          <div className="absolute inset-0 pointer-events-none">
            {/* X-axis: Left = Internal/Psychological, Right = External/Operational */}
            <div className="absolute top-3 left-3 text-[10px] md:text-xs font-black tracking-widest text-black/50 uppercase bg-white/60 px-2 py-1 rounded backdrop-blur-sm">Internal / Psychological</div>
            <div className="absolute top-3 right-3 text-[10px] md:text-xs font-black tracking-widest text-black/50 uppercase bg-white/60 px-2 py-1 rounded backdrop-blur-sm">External / Operational</div>
            
            {/* Y-axis: Top = Self Discovery, Bottom = Team Execution */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-black tracking-widest text-black/50 uppercase bg-white/60 px-2 py-1 rounded backdrop-blur-sm">Self Discovery</div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-black tracking-widest text-black/50 uppercase bg-white/60 px-2 py-1 rounded backdrop-blur-sm">Team Execution</div>
            
            {/* Axis Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/10" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-black/10" />
          </div>

          {/* Plot Points */}
          <div className="absolute inset-8 md:inset-16">
            <AnimatePresence>
              {filteredAssessments.map((item, index) => {
                const isFlow = item.name === "Flow Circuit";
                const isActive = activePhase === 'kinetic';
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      left: `${item.x}%`,
                      top: `${100 - item.y}%`,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: index * 0.1 
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                    onClick={() => setSelectedItem(item)}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative group/node">
                            {/* Node Circle */}
                            <div className={`
                              w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 backdrop-blur-md transition-all duration-300
                              ${isFlow ? 'bg-primary text-primary-foreground scale-125 z-20 ring-4 ring-primary/20' : 'bg-white text-black hover:scale-110 hover:bg-gray-50'}
                              ${isActive && !isFlow ? 'opacity-40 grayscale' : 'opacity-100'}
                            `}>
                              <span className="font-bold text-lg md:text-xl">{item.name[0]}</span>
                              
                              {/* Pulse Effect for Flow */}
                              {isFlow && (
                                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                              )}
                            </div>

                            {/* Label */}
                            <div className={`
                              absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm border border-black/5
                              ${isFlow ? 'bg-black text-white' : 'bg-white/80 text-black backdrop-blur-sm'}
                            `}>
                              {item.name}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] p-4 bg-black/90 text-white border-none">
                          <p className="font-bold mb-1">{item.name}</p>
                          <p className="text-xs opacity-80">{item.focus}</p>
                          <div className="mt-2 text-xs font-mono text-primary-foreground bg-primary/20 px-2 py-1 rounded inline-block">
                            Val: {item.validity}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Kinetic Connections */}
            {activePhase === 'kinetic' && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.8" />
                  </linearGradient>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
                  </marker>
                </defs>
                {filteredAssessments.filter(a => a.name !== "Flow Circuit").map((item, i) => (
                  <motion.path
                    key={`line-${i}`}
                    d={`M ${item.x}% ${100 - item.y}% L 90% 10%`}
                    stroke="url(#flowGradient)"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "easeInOut" }}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Mobile List View (Visible only on small screens) */}
      <div className="md:hidden px-4 space-y-4">
        <h3 className="font-bold text-lg">Assessment Breakdown</h3>
        {filteredAssessments.map((item) => (
          <Card key={item.name} className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-black/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${item.name === "Flow Circuit" ? "bg-primary text-white" : "bg-gray-100 text-black"}`}>
                {item.name[0]}
              </div>
              <div>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.validity}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
              Details <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Detail Modal / Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-[500px]"
          >
            <Card className="p-6 shadow-2xl border-primary/20 bg-white/95 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 hover:bg-black/5"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${selectedItem.name === "Flow Circuit" ? "bg-primary text-white" : "bg-gray-100 text-black"}`}>
                    {selectedItem.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{selectedItem.focus}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl border border-black/5">
                  <p className="text-lg font-medium leading-relaxed">
                    "{selectedItem.narrative}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Research Standing</span>
                    <span className={`font-mono font-bold ${selectedItem.validity.includes("Pending") ? "text-gray-500" : selectedItem.validity.includes("High") ? "text-green-600" : "text-yellow-600"}`}>
                      {selectedItem.validity}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Best For</span>
                    <span className="font-medium">{selectedItem.name === "Flow Circuit" ? "Team Velocity" : "Self Awareness"}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Research Standing is our general, qualitative characterization of each tool's published
                  literature — not a precise validity coefficient. See <span className="font-medium">/science</span> for
                  The Flow Circuit's own current validation status.
                </p>

                <p className="text-sm text-muted-foreground">
                  {selectedItem.description}
                </p>

                <Button className="w-full font-bold text-md h-12 rounded-xl shadow-lg hover:shadow-xl transition-all" asChild>
                  <a href={selectedItem.link} target="_blank" rel="noopener noreferrer">
                    {selectedItem.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop for Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
