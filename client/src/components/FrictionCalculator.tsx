import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, AlertTriangle } from "lucide-react";

export default function FrictionCalculator() {
  const [teamSize, setTeamSize] = useState(10);
  const [avgSalary, setAvgSalary] = useState(120000);
  const [meetingHours, setMeetingHours] = useState(15); // Hours per week per person
  const [frictionLevel, setFrictionLevel] = useState(30); // Percentage of time wasted due to misalignment

  // Calculations
  const totalPayroll = teamSize * avgSalary;
  const hourlyRate = avgSalary / 2080; // 40 hours * 52 weeks
  const weeklyMeetingCost = teamSize * hourlyRate * meetingHours;
  const annualMeetingCost = weeklyMeetingCost * 50; // 50 working weeks
  
  // The Cost of Friction:
  // Friction applies to ALL collaboration time (meetings + async comms).
  // Let's assume collaboration is 50% of work for knowledge workers.
  // Friction % is the efficiency loss on that collaboration time.
  const collaborationFactor = 0.5;
  const annualFrictionCost = totalPayroll * collaborationFactor * (frictionLevel / 100);

  return (
    <Card className="bg-black border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="text-2xl font-black uppercase text-yellow-400 flex items-center gap-2">
          <DollarSign className="w-6 h-6" /> The Cost of Misalignment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-400">Team Size</Label>
            <Input 
              type="number" 
              value={teamSize} 
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="bg-white/5 border-white/20 text-white font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Avg. Annual Salary ($)</Label>
            <Input 
              type="number" 
              value={avgSalary} 
              onChange={(e) => setAvgSalary(Number(e.target.value))}
              className="bg-white/5 border-white/20 text-white font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <Label className="text-gray-400">Estimated Friction (Misalignment %)</Label>
            <span className="text-yellow-400 font-bold">{frictionLevel}%</span>
          </div>
          <Slider 
            value={[frictionLevel]} 
            onValueChange={(val) => setFrictionLevel(val[0])} 
            max={100} 
            step={5}
            className="py-4"
          />
          <p className="text-xs text-gray-500">
            *Based on typical "Circuit Breaks" (e.g., Spark ideas dying in Filter review, Ground waiting for clear specs).
          </p>
        </div>

        {/* Results */}
        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6 text-center space-y-2">
          <h3 className="text-gray-400 uppercase tracking-widest text-sm">Annual Wasted Capital</h3>
          <motion.div 
            key={annualFrictionCost}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-red-500"
          >
            ${annualFrictionCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-red-300 text-sm mt-2">
            <TrendingDown className="w-4 h-4" />
            <span>That's {Math.round((annualFrictionCost / totalPayroll) * 100)}% of your total payroll burned.</span>
          </div>
        </div>

        <Button className="w-full bg-yellow-400 text-black font-bold hover:bg-white h-12 text-lg">
          Stop the Bleeding
        </Button>

      </CardContent>
    </Card>
  );
}
