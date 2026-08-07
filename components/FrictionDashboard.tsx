import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, Users, Clock, AlertTriangle, ArrowRight } from "lucide-react";

export default function FrictionDashboard() {
  const [teamSize, setTeamSize] = useState(10);
  const [avgSalary, setAvgSalary] = useState(120000);
  const [frictionHours, setFrictionHours] = useState(5); // Hours wasted per person per week
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Calculation: (Salary / 2080 hours) * frictionHours * 52 weeks * teamSize
    const hourlyRate = avgSalary / 2080;
    const annualCost = hourlyRate * frictionHours * 52 * teamSize;
    setTotalCost(Math.round(annualCost));
  }, [teamSize, avgSalary, frictionHours]);

  const data = [
    { name: "Meeting Waste", value: totalCost * 0.45, color: "#ef4444" }, // 45%
    { name: "Misaligned Handoffs", value: totalCost * 0.35, color: "#eab308" }, // 35%
    { name: "Rework & Errors", value: totalCost * 0.20, color: "#a855f7" }, // 20%
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls Section */}
        <Card className="bg-white/80 backdrop-blur-xl border-black/5 shadow-xl h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Friction Calculator
            </CardTitle>
            <p className="text-muted-foreground">
              Adjust the sliders to estimate the annual cost of "invisible friction" in your team.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Team Size Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Team Size
                </label>
                <span className="text-2xl font-mono font-bold">{teamSize}</span>
              </div>
              <Slider
                value={[teamSize]}
                onValueChange={(val) => setTeamSize(val[0])}
                min={5}
                max={100}
                step={1}
                className="py-4"
              />
            </div>

            {/* Salary Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" /> Avg. Salary
                </label>
                <span className="text-2xl font-mono font-bold">{formatCurrency(avgSalary)}</span>
              </div>
              <Slider
                value={[avgSalary]}
                onValueChange={(val) => setAvgSalary(val[0])}
                min={50000}
                max={300000}
                step={5000}
                className="py-4"
              />
            </div>

            {/* Friction Hours Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" /> Wasted Hours / Week
                </label>
                <span className="text-2xl font-mono font-bold">{frictionHours} hrs</span>
              </div>
              <Slider
                value={[frictionHours]}
                onValueChange={(val) => setFrictionHours(val[0])}
                min={1}
                max={20}
                step={1}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                *Includes useless meetings, waiting for approvals, and clarifying vague instructions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Section */}
        <Card className="bg-black text-white border-none shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
          <CardContent className="relative z-10 p-8 flex flex-col justify-between h-full">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-lg font-medium text-gray-400 uppercase tracking-widest">Annual Friction Cost</h3>
              <motion.div
                key={totalCost}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl md:text-6xl font-bold text-red-500 font-mono tracking-tighter"
              >
                {formatCurrency(totalCost)}
              </motion.div>
            </div>

            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-xs text-gray-500 uppercase font-bold">Burn Rate</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {data.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
              <p className="text-[11px] text-gray-500 pt-1">
                Illustrative split based on common patterns we see in role-misaligned teams —
                not measured from your specific team's data. The total above is calculated
                directly from your inputs.
              </p>
            </div>

            <Button className="w-full mt-8 bg-white text-black hover:bg-gray-200 font-bold h-12 text-lg">
              Stop The Bleeding <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
