import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Zap, Shield, AlertTriangle, Compass } from "lucide-react";

interface FlowReportProps {
  role: "Spark" | "Amplifier" | "Filter" | "Ground";
  score: number;
  userName?: string;
}

export default function PersonalFlowReport({ role, score, userName = "Innovator" }: FlowReportProps) {
  const roleData = {
    Spark: {
      superpower: "Ignition & Vision",
      kryptonite: "Details & Routine",
      trigger: "Blank Whiteboards & Big Problems",
      description: "You are the match that starts the fire. You see what others miss, but you burn out if forced to maintain the flame.",
      survivalGuide: "How to survive a room full of Filters (without exploding)."
    },
    Amplifier: {
      superpower: "Translation & Momentum",
      kryptonite: "Silence & Isolation",
      trigger: "Connecting People & Ideas",
      description: "You are the bridge. You take the Spark's raw fire and turn it into a torch that others can carry.",
      survivalGuide: "How to survive a stalled project (and get it moving again)."
    },
    Filter: {
      superpower: "Refinement & Risk Detection",
      kryptonite: "Vague Promises & Hype",
      trigger: "Optimizing & Debugging",
      description: "You are the shield. You don't kill ideas; you stress-test them so they survive in the real world.",
      survivalGuide: "How to survive a chaotic Spark (without saying 'I told you so')."
    },
    Ground: {
      superpower: "Execution & Reality",
      kryptonite: "Constant Change & Chaos",
      trigger: "Clear Plans & Finished Lists",
      description: "You are the anchor. While others dream, you build. You turn 'what if' into 'what is'.",
      survivalGuide: "How to survive a pivot-happy team (and keep the lights on)."
    }
  };

  const data = roleData[role];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Your Flow Profile: <span className="text-primary">{role}</span></h2>
        <p className="text-xl text-muted-foreground">
          {userName}, you operate at <span className="text-primary font-bold">{score}%</span> {role} energy.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Superpower Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Your Superpower
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-2">{data.superpower}</h3>
            <p className="text-muted-foreground">{data.description}</p>
          </CardContent>
        </Card>

        {/* Kryptonite Card */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Your Kryptonite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-2">{data.kryptonite}</h3>
            <p className="text-muted-foreground">
              Avoid environments that force you into this zone for too long. It drains your battery.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* The Survival Guide Teaser */}
      <Card className="bg-background border-primary/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Compass className="h-32 w-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Friction Navigation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-xl font-bold">Recommended Reading: "{data.survivalGuide}"</h3>
          <p className="text-muted-foreground">
            Learn the specific language to use when dealing with your "Opposite Role" to turn conflict into collaboration.
          </p>
          <div className="flex gap-4 pt-4">
            <Button className="w-full md:w-auto gap-2">
              <Download className="h-4 w-4" />
              Download Full Report
            </Button>
            <Button variant="outline" className="w-full md:w-auto gap-2">
              <Share2 className="h-4 w-4" />
              Share with Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
