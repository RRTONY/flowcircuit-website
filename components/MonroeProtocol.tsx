import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Brain, Activity, Waves } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

export default function MonroeProtocol() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [showScience, setShowScience] = useState(false);

  const focusLevels = [
    { level: "Focus 10", title: "Mind Awake / Body Asleep", desc: "The foundational state. The body is deeply relaxed, but the mind is hyper-alert. This is where the Spark ignites without the resistance of physical fatigue." },
    { level: "Focus 12", title: "Expanded Awareness", desc: "The state of 'High Creativity.' The mind expands beyond the physical limits. This is the playground of the Amplifier." },
    { level: "Focus 15", title: "No Time", desc: "The state of 'No Time.' Past, present, and future are accessible simultaneously. This is where the Conductor sees the entire timeline at once." },
    { level: "Focus 21", title: "The Bridge", desc: "The edge of the physical reality system. The connection point between the known (Ground) and the unknown (Spark)." },
  ];

  const quizQuestions = [
    {
      q: "When you have a great idea, what happens to your body?",
      options: [
        { text: "I forget I have a body. I'm just pure thought.", result: "Focus 12" },
        { text: "I get an adrenaline rush and need to move.", result: "Focus 10" },
        { text: "I feel a deep sense of calm and knowing.", result: "Focus 21" }
      ]
    },
    {
      q: "How do you perceive time during deep work?",
      options: [
        { text: "It disappears completely. 5 hours feels like 5 minutes.", result: "Focus 15" },
        { text: "I am hyper-aware of every second.", result: "Focus 10" },
        { text: "Time feels elastic; I can stretch it.", result: "Focus 12" }
      ]
    }
  ];

  const handleQuizComplete = (result: string) => {
    setQuizResult(result);
    setShowQuiz(false);
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">The Monroe Protocol</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Before we build the team, we must build the mind. We utilize the foundational tools of the Monroe Institute to prime the nervous system for high-voltage flow.
        </p>
        <Button variant="link" onClick={() => setShowScience(!showScience)} className="text-primary">
          {showScience ? "Hide Science" : "View the Neuroscience of Frequency"}
        </Button>
      </div>

      <AnimatePresence>
        {showScience && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid md:grid-cols-3 gap-4 overflow-hidden"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Waves className="h-4 w-4"/> Frequency Following Response</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                The brain naturally synchronizes its dominant wave frequency to an external rhythm (binaural beats). We use this to mechanically induce flow states.
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4"/> Gamma Synchronization</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                High-performance teaming correlates with Gamma waves (40Hz+). This state binds disparate information into a coherent whole—the "Aha!" moment.
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4"/> Hemi-Sync®</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Synchronizing the left (logic) and right (creative) hemispheres allows the "Spark" and "Filter" to operate simultaneously without conflict.
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8">
        {/* The Gateway Affirmation & Audio */}
        <Card className="bg-card/50 backdrop-blur border-primary/20 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              The Gateway Affirmation
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsPlaying(!isPlaying)}
                className={isPlaying ? "animate-pulse border-primary text-primary" : ""}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-6">
            <div className="prose prose-invert italic text-muted-foreground">
              <p>
                "I am more than my physical body. Because I am more than physical matter, I can perceive that which is greater than the physical world."
              </p>
              <p>
                "Therefore, I deeply desire to Expand, to Experience; to Know, to Understand; to Control, to Use such greater energies and energy systems as may be beneficial and constructive to me and to those who follow me."
              </p>
            </div>
            
            {isPlaying && (
              <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Volume2 className="h-5 w-5 text-primary animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-primary">Playing: Focus 10 Frequency (Pink Noise)</div>
                  <div className="h-1 bg-primary/20 mt-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 30, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* The Ladder of Flow & Assessment */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">The Ladder of Flow</h3>
            {!quizResult && (
              <Button variant="ghost" size="sm" onClick={() => setShowQuiz(true)}>
                Find Your Focus Level
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {showQuiz ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border p-6 rounded-xl space-y-4"
              >
                <h4 className="font-bold">Quick Assessment</h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{quizQuestions[0].q}</p>
                  <div className="grid gap-2">
                    {quizQuestions[0].options.map((opt, i) => (
                      <Button key={i} variant="outline" className="justify-start text-left h-auto py-2" onClick={() => handleQuizComplete(opt.result)}>
                        {opt.text}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : quizResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary p-6 rounded-xl text-center space-y-2"
              >
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Your Natural State</div>
                <div className="text-3xl font-bold text-primary">{quizResult}</div>
                <p className="text-sm">You naturally operate in this frequency. Use the audio to anchor it.</p>
                <Button variant="ghost" size="sm" onClick={() => setQuizResult(null)}>Reset</Button>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {focusLevels.map((focus, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/10 border border-border/50 hover:bg-primary/5 transition-colors cursor-default group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-primary group-hover:scale-110 transition-transform">{focus.level}</span>
                      <span className="text-sm font-semibold">{focus.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{focus.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
