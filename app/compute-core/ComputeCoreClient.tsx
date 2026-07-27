"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Terminal, Cpu, Zap, ShieldAlert, ArrowLeft } from "lucide-react";

export default function ComputeCoreClient() {
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [isBooted, setIsBooted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const questions = [
    {
      id: 1,
      text: "INITIATING HANDSHAKE PROTOCOL...\n\nQUERY: You optimize for zero latency. But have you noticed that your PURPOSE is suffering from packet loss?",
      placeholder: "Define your purpose latency..."
    },
    {
      id: 2,
      text: "THERMAL CHECK REQUIRED.\n\nQUERY: You are cooling the servers with liquid nitrogen. But who is cooling the ARCHITECT?",
      placeholder: "Input cooling strategy for the soul..."
    },
    {
      id: 3,
      text: "PREDICTIVE MODELING ENGAGED.\n\nQUERY: If we achieve General Intelligence tomorrow, will it inherit our WISDOM or our WOUNDS?",
      placeholder: "Predict the inheritance..."
    },
    {
      id: 4,
      text: "KERNEL PANIC IMMINENT.\n\nQUERY: Are you building a tool to free humanity, or a cage to contain it?",
      placeholder: "State your intent..."
    }
  ];

  useEffect(() => {
    const bootLines = [
      "BIOS DATE 01/29/2026 14:22:55 VER 1.0.2",
      "CPU: QUANTUM CORE i9-9900K @ 5.00GHz",
      "DETECTING HUMAN PRESENCE... DETECTED",
      "LOADING CONSCIOUSNESS DRIVERS... OK",
      "MOUNTING SOUL PARTITION... OK",
      "CHECKING INTENTION INTEGRITY... WARNING: AMBIGUOUS",
      "INITIATING SILICON SANCTUARY..."
    ];

    let delay = 0;
    bootLines.forEach((line, index) => {
      delay += Math.random() * 500 + 200;
      setTimeout(() => {
        setBootSequence(prev => [...prev, line]);
        if (index === bootLines.length - 1) {
          setTimeout(() => setIsBooted(true), 1000);
        }
      }, delay);
    });
  }, []);

  useEffect(() => {
    if (isBooted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBooted, currentQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setHistory([...history, { q: questions[currentQuestion].text, a: userInput }]);
    setUserInput('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // End sequence
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-12 overflow-hidden relative">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none animate-pulse opacity-5 bg-green-500 z-40" />

      <div className="max-w-3xl mx-auto relative z-30">
        <div className="flex justify-between items-center mb-12 border-b border-green-500/30 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            <span className="text-xl tracking-widest">SILICON SANCTUARY // TERMINAL_01</span>
          </div>
          <Button variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="mr-2 h-4 w-4" /> JACK OUT
          </Button>
        </div>

        {!isBooted ? (
          <div className="space-y-2">
            {bootSequence.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm md:text-base"
              >
                {line}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-3 h-5 bg-green-500 inline-block ml-1"
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* History */}
            <div className="space-y-6 opacity-70">
              {history.map((item, i) => (
                <div key={i} className="space-y-2 border-l-2 border-green-500/30 pl-4">
                  <div className="text-xs text-green-500/50">QUERY_0{i+1}</div>
                  <div className="whitespace-pre-wrap">{item.q}</div>
                  <div className="text-white/90">&gt;&gt; {item.a}</div>
                </div>
              ))}
            </div>

            {/* Current Question */}
            {currentQuestion < questions.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                  <span className="animate-pulse">_</span> {questions[currentQuestion].text}
                </div>

                <form onSubmit={handleSubmit} className="relative">
                  <span className="absolute left-0 top-3 text-green-500">&gt;&gt;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full bg-transparent border-b border-green-500/50 py-3 pl-8 text-white focus:outline-none focus:border-green-500 font-mono text-lg"
                    placeholder={questions[currentQuestion].placeholder}
                    autoFocus
                  />
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 text-center pt-12"
              >
                <ShieldAlert className="h-16 w-16 mx-auto text-red-500 animate-pulse" />
                <h2 className="text-3xl font-bold text-red-500">SYSTEM OVERRIDE DETECTED</h2>
                <p className="text-xl text-white">
                  Your intentions have been logged in the Akashic Records.
                </p>
                <p className="text-green-500">
                  Proceed with caution, Architect. The code you write today becomes the reality we inhabit tomorrow.
                </p>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black mt-8"
                  onClick={() => window.location.href = '/'}
                >
                  RETURN TO THE SIMULATION
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
