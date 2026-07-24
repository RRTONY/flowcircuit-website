import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { surveyQuestions, roleDescriptions, Role, Question } from '@/lib/surveyData';
import { Streamdown } from 'streamdown';
import { motion, AnimatePresence } from 'framer-motion';
import PreFlightProtocol from './PreFlightProtocol';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface SurveyProps {
  onComplete?: (results: { dominantRole: Role; percentages: Record<Role, number> }) => void;
}

export default function Survey({ onComplete }: SurveyProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<Role, number>>({
    Spark: 0,
    Amplifier: 0,
    Filter: 0,
    Ground: 0,
    Conductor: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [showPreFlight, setShowPreFlight] = useState(true);

  // Initialize randomized questions on mount
  useEffect(() => {
    const shuffledQuestions = shuffleArray(surveyQuestions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    setQuestions(shuffledQuestions);
  }, []);

  const handleAnswer = (role: Role, weight: number) => {
    setScores(prev => ({ ...prev, [role]: prev[role] + weight }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResult(true);
      // Calculate final results for callback
      const finalScores = { ...scores, [role]: scores[role] + weight };
      const totalScore = Object.values(finalScores).reduce((a, b) => a + b, 0);
      const percentages = (Object.keys(finalScores) as Role[]).reduce((acc, r) => {
        acc[r] = Math.round((finalScores[r] / totalScore) * 100);
        return acc;
      }, {} as Record<Role, number>);
      const dominantRole = (Object.keys(finalScores) as Role[]).reduce((a, b) => finalScores[a] > finalScores[b] ? a : b);
      
      if (onComplete) {
        onComplete({ dominantRole, percentages });
      }
    }
  };

  const getDominantRole = (): Role => {
    return (Object.keys(scores) as Role[]).reduce((a, b) => scores[a] > scores[b] ? a : b);
  };

  const resetSurvey = () => {
    setScores({ Spark: 0, Amplifier: 0, Filter: 0, Ground: 0, Conductor: 0 });
    setCurrentQuestionIndex(0);
    setShowResult(false);
    // Re-shuffle for next attempt
    const shuffledQuestions = shuffleArray(surveyQuestions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    setQuestions(shuffledQuestions);
  };

  if (showPreFlight) {
    return <PreFlightProtocol onComplete={() => setShowPreFlight(false)} />;
  }

  if (showResult) {
    const dominantRole = getDominantRole();
    const roleInfo = roleDescriptions[dominantRole];
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    // Calculate percentages
    const percentages = (Object.keys(scores) as Role[]).reduce((acc, role) => {
      acc[role] = Math.round((scores[role] / totalScore) * 100);
      return acc;
    }, {} as Record<Role, number>);

    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-md border-primary/20 shadow-2xl shadow-primary/10">
        <CardHeader>
          <CardTitle className="text-4xl text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-bold tracking-tight">
            Your Flow Circuit DNA: {roleInfo.title}
          </CardTitle>
          <p className="text-center text-xl text-muted-foreground mt-2">
            Primary Role: <span className="text-foreground font-semibold">{dominantRole}</span>
            <br/>
            <span className="text-sm opacity-70">Validated by Big Five & Psychological Safety Protocols</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Main Description & Advice */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-background/50 border border-border/50 shadow-inner">
                <h3 className="text-lg font-semibold mb-2 text-primary">The Profile</h3>
                <p className="text-muted-foreground leading-relaxed">{roleInfo.description}</p>
              </div>
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="text-lg font-semibold mb-2 text-primary">Strategic Advice</h3>
                <p className="text-foreground font-medium">{roleInfo.advice}</p>
              </div>
            </div>

            {/* Quadrant Visualization */}
            <div className="relative aspect-square bg-background/30 rounded-full border-2 border-dashed border-muted-foreground/20 p-8 flex items-center justify-center">
              {/* Axis Labels */}
              <div className="absolute top-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Abstract / Future</div>
              <div className="absolute bottom-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Concrete / Present</div>
              <div className="absolute left-4 -rotate-90 text-xs font-bold uppercase tracking-widest text-muted-foreground">Logic / Things</div>
              <div className="absolute right-4 rotate-90 text-xs font-bold uppercase tracking-widest text-muted-foreground">People / Feelings</div>

              {/* Quadrant Content */}
              <div className="grid grid-cols-2 gap-4 w-full h-full">
                <div className={`rounded-tl-full flex items-center justify-center p-4 transition-all duration-500 ${dominantRole === 'Filter' ? 'bg-primary/20 scale-105 shadow-lg shadow-primary/20' : 'bg-muted/10'}`}>
                  <div className="text-center">
                    <div className="font-bold">Filter</div>
                    <div className="text-2xl">{percentages.Filter}%</div>
                  </div>
                </div>
                <div className={`rounded-tr-full flex items-center justify-center p-4 transition-all duration-500 ${dominantRole === 'Spark' ? 'bg-primary/20 scale-105 shadow-lg shadow-primary/20' : 'bg-muted/10'}`}>
                  <div className="text-center">
                    <div className="font-bold">Spark</div>
                    <div className="text-2xl">{percentages.Spark}%</div>
                  </div>
                </div>
                <div className={`rounded-bl-full flex items-center justify-center p-4 transition-all duration-500 ${dominantRole === 'Ground' ? 'bg-primary/20 scale-105 shadow-lg shadow-primary/20' : 'bg-muted/10'}`}>
                  <div className="text-center">
                    <div className="font-bold">Ground</div>
                    <div className="text-2xl">{percentages.Ground}%</div>
                  </div>
                </div>
                <div className={`rounded-br-full flex items-center justify-center p-4 transition-all duration-500 ${dominantRole === 'Amplifier' ? 'bg-primary/20 scale-105 shadow-lg shadow-primary/20' : 'bg-muted/10'}`}>
                  <div className="text-center">
                    <div className="font-bold">Amplifier</div>
                    <div className="text-2xl">{percentages.Amplifier}%</div>
                  </div>
                </div>
              </div>
              
              {/* Conductor Center */}
              <div className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center border-4 border-background z-10 transition-all duration-500 ${dominantRole === 'Conductor' ? 'bg-primary text-primary-foreground scale-110 shadow-xl' : 'bg-muted text-muted-foreground'}`}>
                <div className="text-center text-xs">
                  <div className="font-bold">Conductor</div>
                  <div className="text-lg">{percentages.Conductor}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Detailed Breakdown vs. Population</h3>
            <div className="grid gap-4">
              {(Object.keys(scores) as Role[]).sort((a, b) => scores[b] - scores[a]).map((role) => (
                <div key={role} className="relative overflow-hidden rounded-lg bg-muted/30 p-4 border border-border/50">
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${role === dominantRole ? 'text-primary' : ''}`}>{role}</span>

                    </div>
                    <span className="text-xl font-mono font-bold">{percentages[role]}%</span>
                  </div>
                  {/* Progress Bar Background */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages[role]}%` }}
                    className={`absolute top-0 left-0 h-full opacity-20 ${role === dominantRole ? 'bg-primary' : 'bg-muted-foreground'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Who To Go To Section */}
          <div className="p-6 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
            <h3 className="text-xl font-bold text-secondary mb-2">Your Critical Handoff</h3>
            <div className="text-lg text-foreground max-w-2xl mx-auto">
              <Streamdown>{roleInfo.whoToGoTo}</Streamdown>
            </div>
          </div>

          {/* Communication Guidebook */}
          <div className="p-6 rounded-xl bg-background/50 border border-border/50">
            <h3 className="text-xl font-bold text-center mb-4">Communication Guidebook</h3>
            <div className="prose prose-invert max-w-none">
              <Streamdown>{roleInfo.communicationGuide}</Streamdown>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex gap-4 w-full">
              <Button 
                className="flex-1"
                variant="outline" 
                onClick={() => {
                  const text = `I just discovered my innate innovation role is ${dominantRole} using the Flow Circuit framework. What's yours?`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                }}
              >
                Share on X
              </Button>
              <Button 
                className="flex-1"
                variant="outline"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                }}
              >
                Share on LinkedIn
              </Button>
            </div>
            <Button onClick={resetSurvey} className="w-full py-6 text-lg" variant="ghost">
              Retake Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-md border-primary/20 shadow-2xl shadow-primary/10 min-h-[500px] flex flex-col justify-center">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground font-mono">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground font-mono">
            {Math.round(((currentQuestionIndex) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          />
        </div>
        <CardTitle className="text-2xl text-center pt-8 pb-4 leading-relaxed">
          {questions[currentQuestionIndex].text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid gap-3"
          >
            {questions[currentQuestionIndex].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left justify-start h-auto py-4 px-6 text-lg hover:bg-primary/10 hover:border-primary transition-all duration-200 whitespace-normal"
                onClick={() => handleAnswer(option.role, option.weight)}
              >
                {option.text}
              </Button>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
