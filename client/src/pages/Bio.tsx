import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Globe, Award, Zap, Heart, ExternalLink } from "lucide-react";
import { bioContent } from "@/content/bio_content";
import BlogBridge from '@/components/BlogBridge';

export default function Bio() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/DcgleuTmuJOvbbhl.png" 
          alt="Bio Dynamo Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="container mx-auto px-4 py-24 space-y-24 relative z-10">
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Tony Greenberg
            </h1>
            <p className="text-2xl text-muted-foreground font-light">
              Architect of the Invisible.
            </p>
            <div className="prose prose-lg prose-invert">
              <p>
                Tony Greenberg doesn't just build companies; he builds the <strong>operating systems</strong> that run them.
              </p>
              <p>
                As the founder of RampRate, he has saved Fortune 500 companies billions of dollars. But his true legacy isn't in the data center—it's in the <strong>human center</strong>.
              </p>
              <p>
                He believes that the greatest inefficiency in the world isn't server latency; it's <strong>human friction</strong>.
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="gap-2" onClick={() => window.open('https://www.linkedin.com/in/tonygreenberg/', '_blank')}>
                <Linkedin className="h-5 w-5" /> LinkedIn
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => window.open('https://tonygreenberg.com', '_blank')}>
                <Globe className="h-5 w-5" /> Website
              </Button>
            </div>
          </div>
          
          {/* Image Placeholder - Replace with actual headshot if available */}
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-primary/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/eZeNGKGQdgplwDcz.png" 
              alt="Tony Greenberg Vision" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8 z-20">
              <p className="text-sm font-mono text-primary uppercase tracking-widest mb-2">The Vision</p>
              <p className="text-2xl font-bold">"We are boiling the human out of the machine."</p>
            </div>
          </div>
        </div>

        {/* Impact Soul Section */}
        <section className="space-y-12">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Impact Soul</h2>
            <p className="text-xl text-muted-foreground">
              Profit is a byproduct of purpose.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Legacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  From transforming the digital supply chain to redefining social impact, Tony's career is a testament to the power of <strong>disruptive altruism</strong>.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  He operates as a high-voltage <strong>Spark/Amplifier</strong>, igniting movements and connecting the disconnected nodes of the global grid.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Believing that "communities drive asset value," he focuses on building ecosystems where every participant thrives.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The "Why" */}
        <section className="bg-primary/5 rounded-3xl p-12 border border-primary/10 backdrop-blur-sm text-center">
          <h2 className="text-3xl font-bold mb-6">Why This Matters Now</h2>
          <div className="prose prose-xl prose-invert mx-auto max-w-3xl">
            <p>
              "We are standing at the precipice of the AI age. If we do not understand our own 'source code'—our human operating system—we will be overwritten by the synthetic one."
            </p>
            <p className="font-bold text-primary">
              — Tony Greenberg
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
            <Button size="lg" className="text-lg h-14" onClick={() => window.open('https://tonygreenberg.com', '_blank')}>
              <ExternalLink className="mr-2 h-5 w-5" />
              Access Source Code
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14" onClick={() => window.open('https://clariceabelardi.com', '_blank')}>
              <Heart className="mr-2 h-5 w-5 text-pink-500" />
              Meet The Muse
            </Button>
          </div>
        </section>

        <BlogBridge pageKey="bio" />
      </div>
    </div>
  );
}