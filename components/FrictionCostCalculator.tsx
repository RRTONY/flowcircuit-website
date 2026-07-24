import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { DollarSign, Clock, Users, AlertTriangle } from 'lucide-react';

export default function FrictionCostCalculator() {
  const [teamSize, setTeamSize] = useState(10);
  const [avgSalary, setAvgSalary] = useState(120000);
  const [meetingHours, setMeetingHours] = useState(15);
  const [frictionLevel, setFrictionLevel] = useState(30); // Percentage of time wasted due to friction

  const calculateCost = () => {
    const hourlyRate = avgSalary / 2080; // 40 hours * 52 weeks
    const weeklyTeamCost = hourlyRate * teamSize * 40;
    const annualTeamCost = weeklyTeamCost * 52;
    
    // Cost of friction: (Team Size * Hourly Rate * Meeting Hours * Friction %) * 52 weeks
    // Assuming friction mainly manifests in meetings and handoffs
    const weeklyFrictionCost = (teamSize * hourlyRate * meetingHours) * (frictionLevel / 100);
    const annualFrictionCost = weeklyFrictionCost * 52;

    return {
      annualFrictionCost: Math.round(annualFrictionCost),
      percentOfPayroll: Math.round((annualFrictionCost / annualTeamCost) * 100)
    };
  };

  const { annualFrictionCost, percentOfPayroll } = calculateCost();

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/30 backdrop-blur-md border-white/10 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          The Cost of Friction
        </CardTitle>
        <CardDescription className="text-lg">
          Calculate how much misaligned energy is costing your organization annually.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid md:grid-cols-2 gap-12 p-8">
        {/* Inputs */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-lg font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Team Size
              </Label>
              <span className="text-xl font-bold text-primary">{teamSize}</span>
            </div>
            <Slider 
              value={[teamSize]} 
              onValueChange={(v) => setTeamSize(v[0])} 
              min={2} 
              max={100} 
              step={1}
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" /> Avg. Annual Salary
              </Label>
              <span className="text-xl font-bold text-green-500">${avgSalary.toLocaleString()}</span>
            </div>
            <Slider 
              value={[avgSalary]} 
              onValueChange={(v) => setAvgSalary(v[0])} 
              min={50000} 
              max={300000} 
              step={5000}
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Weekly Meeting Hours
              </Label>
              <span className="text-xl font-bold text-blue-500">{meetingHours} hrs</span>
            </div>
            <Slider 
              value={[meetingHours]} 
              onValueChange={(v) => setMeetingHours(v[0])} 
              min={1} 
              max={40} 
              step={1}
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-lg font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" /> Friction Level
              </Label>
              <span className="text-xl font-bold text-orange-500">{frictionLevel}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Percentage of meeting time wasted on circular debates, misunderstandings, and re-explaining.</p>
            <Slider 
              value={[frictionLevel]} 
              onValueChange={(v) => setFrictionLevel(v[0])} 
              min={0} 
              max={100} 
              step={5}
              className="py-4"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center items-center space-y-8 bg-black/20 rounded-2xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent animate-pulse" />
          
          <div className="text-center relative z-10">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Annual Loss</h3>
            <motion.div 
              key={annualFrictionCost}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600"
            >
              ${annualFrictionCost.toLocaleString()}
            </motion.div>
          </div>

          <div className="text-center relative z-10">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Payroll Wasted</h3>
            <div className="text-3xl font-bold text-white">
              {percentOfPayroll}%
            </div>
          </div>

          <div className="w-full pt-4 relative z-10">
            <Button className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse">
              Stop The Bleeding
            </Button>
            <p className="text-xs text-center mt-4 text-muted-foreground">
              *Based on standard operational efficiency models.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
