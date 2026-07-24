import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) {
      toast.error("Missing Information", {
        description: "Please provide both your email and your core energy role.",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success("Welcome to the Circuit", {
        description: `You've been registered as a ${role}. Check your inbox for your briefing.`,
      });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold">Signal Received</h3>
          <p className="text-muted-foreground">
            Your briefing as a <span className="font-bold text-primary">{role}</span> is on its way.
          </p>
          <Button variant="outline" onClick={() => setIsSuccess(false)} className="mt-4">
            Register Another Team Member
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md border-black/5 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-primary fill-current" />
          Join the Beta Protocol
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get early access to the Flow Circuit assessment and team tools.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">What is your core energy?</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-12 bg-white border-black/10 focus:ring-primary/20">
                <SelectValue placeholder="Select your primary mode..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spark">
                  <span className="font-bold">Spark</span> (Ideation & Vision)
                </SelectItem>
                <SelectItem value="Amplifier">
                  <span className="font-bold">Amplifier</span> (Promotion & Connection)
                </SelectItem>
                <SelectItem value="Filter">
                  <span className="font-bold">Filter</span> (Refinement & Logic)
                </SelectItem>
                <SelectItem value="Ground">
                  <span className="font-bold">Ground</span> (Execution & Details)
                </SelectItem>
                <SelectItem value="Conductor">
                  <span className="font-bold">Conductor</span> (Orchestration & Leadership)
                </SelectItem>
                <SelectItem value="Unsure">
                  I'm not sure yet (Send me the guide)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Where should we send the intel?</label>
            <Input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white border-black/10 focus:ring-primary/20"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-black text-white hover:bg-black/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                Request Access <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground pt-2">
            *We respect the signal-to-noise ratio. No spam, ever.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
