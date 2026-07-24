import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Activity, Filter, Anchor, ArrowRight, RefreshCw } from "lucide-react";

const questions = [
  {
    id: 1,
    text: "When a new project starts, what is your first instinct?",
    options: [
      { text: "Brainstorm a million possibilities.", role: "Spark" },
      { text: "Get everyone excited and on board.", role: "Amplifier" },
      { text: "Ask 'how will this actually work?'", role: "Filter" },
      { text: "Start making a to-do list.", role: "Anchor" },
    ],
  },
  {
    id: 2,
    text: "What frustrates you most in meetings?",
    options: [
      { text: "People shooting down ideas too early.", role: "Spark" },
      { text: "Low energy and silence.", role: "Amplifier" },
      { text: "Vague plans with no details.", role: "Filter" },
      { text: "Changing the plan every 5 minutes.", role: "Anchor" },
    ],
  },
  {
    id: 3,
    text: "How do you prefer to communicate?",
    options: [
      { text: "Fast, messy, and visual.", role: "Spark" },
      { text: "Phone calls or face-to-face.", role: "Amplifier" },
      { text: "Detailed emails or docs.", role: "Filter" },
      { text: "Clear instructions and deadlines.", role: "Anchor" },
    ],
  },
  {
    id: 4,
    text: "What is your superpower?",
    options: [
      { text: "Seeing the future.", role: "Spark" },
      { text: "Connecting people.", role: "Amplifier" },
      { text: "Spotting the risks.", role: "Filter" },
      { text: "Getting it done.", role: "Anchor" },
    ],
  },
];

const roleDetails = {
  Spark: {
    icon: Zap,
    color: "text-red-500",
    bg: "bg-red-500/10",
    title: "The Spark",
    desc: "You are the ignition. You see what's possible before anyone else. Your job is to start the fire, not keep it burning.",
  },
  Amplifier: {
    icon: Activity,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    title: "The Amplifier",
    desc: "You are the connection. You take the spark and make it loud. Your job is to get buy-in and remove social friction.",
  },
  Filter: {
    icon: Filter,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "The Filter",
    desc: "You are the logic. You turn chaos into order. Your job is to stress-test the idea and make it workable.",
  },
  Anchor: {
    icon: Anchor,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "The Anchor",
    desc: "You are the reality. You turn plans into results. Your job is to execute with precision and finish the race.",
  },
};

export default function RoleQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ Spark: 0, Amplifier: 0, Filter: 0, Anchor: 0 });
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (role: string) => {
    const newScores = { ...scores, [role]: scores[role] + 1 };
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const winner = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
      setResult(winner);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScores({ Spark: 0, Amplifier: 0, Filter: 0, Anchor: 0 });
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-xl border-black/5 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        
        <CardContent className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                    {questions[currentQuestion].text}
                  </h3>
                </div>

                <div className="grid gap-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 px-6 justify-start text-left text-lg hover:bg-black hover:text-white transition-all border-black/10"
                      onClick={() => handleAnswer(option.role)}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${roleDetails[result as keyof typeof roleDetails].bg}`}>
                  {(() => {
                    const Icon = roleDetails[result as keyof typeof roleDetails].icon;
                    return <Icon className={`w-12 h-12 ${roleDetails[result as keyof typeof roleDetails].color}`} />;
                  })()}
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-bold">
                    You are a <span className={roleDetails[result as keyof typeof roleDetails].color}>{roleDetails[result as keyof typeof roleDetails].title}</span>
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto">
                    {roleDetails[result as keyof typeof roleDetails].desc}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" className="text-lg font-bold px-8 h-14 rounded-full shadow-lg">
                    Get My Full Report <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="ghost" onClick={resetQuiz} className="text-muted-foreground">
                    <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
