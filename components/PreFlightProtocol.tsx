import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PreFlightProtocolProps {
  onComplete: () => void;
}

export default function PreFlightProtocol({ onComplete }: PreFlightProtocolProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "PROTOCOL INITIATED",
      text: "We are about to strip the paint off the walls. This is not a corporate personality test. This is a kernel dump of your operating system.",
      action: "Acknowledge"
    },
    {
      title: "DROP THE MASK",
      text: "Do not answer as the person you are paid to be. Do not answer as the person your boss wants you to be. Answer as the person you are when you lose track of time.",
      action: "Disengage Mask"
    },
    {
      title: "INNATE STATE ONLY",
      text: "If you have to 'try' to be it, it's not you. We are looking for your path of least resistance. Your flow state. Your native grain.",
      action: "Access Core"
    },
    {
      title: "WARNING",
      text: "The results may contradict your job title. Good. That is the friction we are here to remove.",
      action: "Begin Scan"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="space-y-8 text-center"
        >
          <h2 className="text-sm md:text-base font-mono text-primary tracking-[0.5em] uppercase mb-8">
            Pre-Flight Sequence {step + 1}/{steps.length}
          </h2>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter glitch-effect" data-text={steps[step].title}>
            {steps[step].title}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
            {steps[step].text}
          </p>

          <div className="pt-12">
            <Button 
              onClick={handleNext}
              size="lg" 
              className="text-lg px-12 py-8 rounded-none border border-primary/50 bg-transparent hover:bg-primary/10 hover:border-primary text-primary transition-all duration-300 font-mono uppercase tracking-widest"
            >
              [{steps[step].action}]
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-transparent to-black"></div>
    </div>
  );
}
