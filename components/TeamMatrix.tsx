import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Role, getRoleColor } from "@/lib/surveyData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: Role;
  score: number;
}

interface TeamMatrixProps {
  members: TeamMember[];
}

export default function TeamMatrix({ members }: TeamMatrixProps) {
  const matrixRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!matrixRef.current) return;
    
    const canvas = await html2canvas(matrixRef.current, {
      backgroundColor: "#000000",
      scale: 2
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("Team_Energy_Matrix.pdf");
  };

  // Helper to position members on the grid based on their role
  // In a real app, this would use actual X/Y coordinates from the assessment scores
  // For now, we map roles to specific quadrants/zones
  const getPosition = (role: Role, index: number) => {
    // Add some random jitter so dots don't overlap perfectly
    const jitter = (index % 5) * 5; 
    
    switch (role) {
      case "Spark": // High Innovation, High Intuition (Top Right)
        return { top: `${20 + jitter}%`, right: `${20 + jitter}%` };
      case "Amplifier": // High Innovation, High Logic (Top Left)
        return { top: `${20 + jitter}%`, left: `${20 + jitter}%` };
      case "Filter": // High Execution, High Logic (Bottom Left)
        return { bottom: `${20 + jitter}%`, left: `${20 + jitter}%` };
      case "Ground": // High Execution, High Intuition (Bottom Right)
        return { bottom: `${20 + jitter}%`, right: `${20 + jitter}%` };
      case "Conductor": // Balanced Center
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      default:
        return { top: "50%", left: "50%" };
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold uppercase flex items-center gap-2 text-white">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span> 
          Energy Matrix
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-white/20 hover:bg-white/10 text-white"
          onClick={downloadPDF}
        >
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </CardHeader>
      <CardContent className="relative h-[400px] w-full p-6" ref={matrixRef}>
        
        {/* Grid Background */}
        <div className="absolute inset-0 m-6 border border-white/10 rounded-lg bg-black/20">
          {/* Axes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10"></div>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10"></div>
          
          {/* Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 uppercase tracking-widest">Innovation</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 uppercase tracking-widest">Execution</div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-gray-500 uppercase tracking-widest">Logic</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-xs font-bold text-gray-500 uppercase tracking-widest">Intuition</div>
        </div>

        {/* Team Members */}
        {members.map((member, index) => (
          <TooltipProvider key={member.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  className={`absolute w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-125 transition-transform z-10 ${getRoleColor(member.role).replace("text-", "bg-")}`}
                  style={getPosition(member.role, index)}
                >
                  <span className="text-black font-bold text-xs">{member.name.charAt(0)}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="bg-black border-white/20 text-white">
                <p className="font-bold">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role} • {member.score}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

      </CardContent>
    </Card>
  );
}
