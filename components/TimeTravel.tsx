import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Clock, History, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Role, getRoleColor } from "@/lib/surveyData";

interface TeamMember {
  id: string;
  name: string;
  role: Role;
  score: number;
  joinDate?: string; // Optional for now, would be real in production
}

interface TimeTravelProps {
  members: TeamMember[];
}

export default function TimeTravel({ members }: TimeTravelProps) {
  // Simulate a timeline based on member count
  // In a real app, this would filter members by their actual joinDate
  const [timeIndex, setTimeIndex] = useState(members.length);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeMembers = members.slice(0, timeIndex);
  
  // Calculate dominant energy at this point in time
  const getDominantEnergy = () => {
    if (activeMembers.length === 0) return "None";
    const counts = activeMembers.reduce((acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const dominantEnergy = getDominantEnergy();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex(prev => {
          if (prev >= members.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, members.length]);

  const togglePlay = () => {
    if (timeIndex >= members.length) {
      setTimeIndex(1); // Restart
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-2"><History className="w-4 h-4" /> Temporal Analysis</span>
          <span className="text-white bg-white/10 px-2 py-1 rounded text-xs">
            {activeMembers.length} / {members.length} Members
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 rounded-full border-white/20 hover:bg-white/10"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </Button>
          <Slider 
            value={[timeIndex]} 
            max={members.length} 
            min={1} 
            step={1} 
            onValueChange={(val) => setTimeIndex(val[0])}
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded border border-white/5">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Dominant Energy</div>
            <div className={`text-lg font-black ${dominantEnergy !== "None" ? getRoleColor(dominantEnergy as Role) : "text-gray-500"}`}>
              {dominantEnergy}
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded border border-white/5">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Team Velocity</div>
            <div className="text-lg font-black text-white">
              {Math.round(activeMembers.length * 12.5)}%
            </div>
          </div>
        </div>

        <div className="h-24 flex items-end gap-1 border-b border-white/10 pb-1 px-1">
          {activeMembers.map((m, i) => (
            <motion.div
              key={m.id}
              layoutId={m.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${m.score}%`, opacity: 1 }}
              className={`flex-1 rounded-t-sm ${getRoleColor(m.role).replace("text-", "bg-")} opacity-80 hover:opacity-100 transition-opacity`}
              title={`${m.name} (${m.role})`}
            />
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
