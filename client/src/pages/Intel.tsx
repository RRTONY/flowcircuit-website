import { motion } from 'framer-motion';
import { ArrowUpRight, Cpu, Brain, Globe, Zap, Database, Users, Briefcase, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Intel() {
  const assessmentNews = [
    {
      id: 101,
      title: "Employees Can't Be Summed Up by a Personality Test",
      author: "Harvard Business Review",
      source: "HBR.org",
      date: "August 19, 2015",
      icon: <Brain className="h-6 w-6 text-primary" />,
      summary: "Why traditional personality tests fail in the workplace: they measure 'who you are' (identity) rather than 'how you work' (operations). The Flow Circuit solves this by focusing on energy handoffs, not labels.",
      quote: "These tests identify a black and white version of you... but work is grayscale.",
      link: "https://hbr.org/2015/08/employees-cant-be-summed-up-by-a-personality-test",
      tags: ["HBR", "Critique", "Workplace"]
    },
    {
      id: 102,
      title: "The End of the Job Description: Hiring for Flow",
      author: "Josh Bersin",
      source: "Bersin Academy",
      date: "February 12, 2025",
      icon: <Briefcase className="h-6 w-6 text-secondary" />,
      summary: "Static job descriptions are obsolete. The future of hiring is about 'Role Fluidity'—matching candidates to the dynamic needs of the team circuit. Hiring for 'Spark' or 'Ground' predicts success better than hiring for 'Senior Manager'.",
      quote: "We are moving from a hierarchy of titles to a network of capabilities.",
      link: "https://joshbersin.com/",
      tags: ["Hiring", "Future of Work", "Talent"]
    },
    {
      id: 103,
      title: "Orchestrating the Hybrid Workforce",
      author: "McKinsey & Company",
      source: "McKinsey Quarterly",
      date: "November 15, 2024",
      icon: <Users className="h-6 w-6 text-accent" />,
      summary: "Hybrid work fails when it's uncoordinated. Successful teams use 'Asynchronous Orchestration'—clear protocols for when to collaborate (Spark/Amplifier) and when to execute alone (Filter/Ground).",
      quote: "The office is no longer a place; it's a synchronization event.",
      link: "https://www.mckinsey.com/",
      tags: ["Hybrid Work", "Orchestration", "Management"]
    },
    {
      id: 104,
      title: "When AI Becomes the Manager",
      author: "Wired Magazine",
      source: "Wired",
      date: "January 05, 2026",
      icon: <Bot className="h-6 w-6 text-red-500" />,
      summary: "AI agents are now capable of 'Algorithmic Management'—assigning tasks based on real-time flow data. The Flow Circuit provides the logic layer for these agents, ensuring they optimize for human energy, not just machine efficiency.",
      quote: "The best boss of 2030 might be a bot that knows you're a 'Spark' and protects your calendar from 'Ground' work.",
      link: "https://www.wired.com/",
      tags: ["AI", "Automation", "Management"]
    },
    {
      id: 105,
      title: "That 'Personal ROI' Question Is Destroying Your Best People",
      author: "Andy Molinsky",
      source: "Forbes",
      date: "January 26, 2026",
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      summary: "Managers are obsessed with ROI, but they measure it wrong. Real ROI comes from aligning people with their natural 'Flow Role'—maximizing their strengths rather than fixing their weaknesses.",
      quote: "You should be evaluating whether your team members are in roles that maximize their strengths.",
      link: "https://www.forbes.com/sites/andymolinsky/2026/01/26/that-personal-roi-question-is-destroying-your-best-people/",
      tags: ["Forbes", "ROI", "Strengths"]
    }
  ];

  const articles = [
    {
      id: 1,
      title: "The Bitter Lesson",
      author: "Rich Sutton",
      source: "Incomplete Ideas",
      date: "March 13, 2019",
      icon: <Cpu className="h-6 w-6 text-red-500" />,
      summary: "The biggest lesson that can be read from 70 years of AI research is that general methods that leverage computation are ultimately the most effective, and by a large margin. We have to learn the bitter lesson that building in how we think we think does not work in the long run.",
      quote: "The actual contents of minds are tremendously complex; we should stop trying to find simple ways to think about the contents of minds... and instead build tools that can find them for us.",
      link: "http://www.incompleteideas.net/IncIdeas/BitterLesson.html",
      tags: ["Compute", "AI History", "Scale"]
    },
    {
      id: 2,
      title: "Moore's Law for Everything",
      author: "Sam Altman",
      source: "OpenAI Blog",
      date: "March 16, 2021",
      icon: <Database className="h-6 w-6 text-blue-500" />,
      summary: "A great technological revolution is taking place. The technological progress we make in the next 100 years will be far larger than all we have made since we first controlled fire and invented the wheel. As AI lowers the cost of goods and services, we will see a phenomenal liberation of human potential.",
      quote: "It is a moral imperative to realize this future, and we have to be aggressive about it. We need to design a system that embraces this technological future and taxes assets rather than labor.",
      link: "https://moores.samaltman.com/",
      tags: ["Economics", "Abundance", "Future"]
    },
    {
      id: 3,
      title: "The Techno-Optimist Manifesto",
      author: "Marc Andreessen",
      source: "a16z",
      date: "October 16, 2023",
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      summary: "We believe that there is no material problem – whether created by nature or by technology – that cannot be solved with more technology. We believe that the human population can easily grow to 50 billion or more, and then far beyond that as we ultimately settle other planets.",
      quote: "We believe that intelligence is the ultimate engine of progress. We believe that we are poised for an intelligence explosion that will expand our capabilities by orders of magnitude.",
      link: "https://a16z.com/the-techno-optimist-manifesto/",
      tags: ["Philosophy", "Growth", "Acceleration"]
    },
    {
      id: 4,
      title: "Mirrorworld",
      author: "Kevin Kelly",
      source: "Wired",
      date: "February 12, 2019",
      icon: <Globe className="h-6 w-6 text-green-500" />,
      summary: "We are building a 1-to-1 map of almost unimaginable scope. When it's complete, our physical reality will merge with the digital universe. The Mirrorworld doesn't just reflect the world; it contextualizes it, giving us a god-like perspective on our own existence.",
      quote: "The Mirrorworld will be the third great platform, after the web and social media. It will be the platform where the digital and physical worlds finally converge.",
      link: "https://www.wired.com/story/mirrorworld-ar-next-big-tech-platform/",
      tags: ["AR", "Digital Twin", "Spatial Computing"]
    },
    {
      id: 5,
      title: "Every Life is on Fire",
      author: "Jeremy England",
      source: "Quanta Magazine",
      date: "January 22, 2014",
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      summary: "Life does not violate the second law of thermodynamics; it is a manifestation of it. Matter self-organizes into life-like structures specifically to dissipate heat more efficiently. Intelligence is just a thermodynamic process of prediction and adaptation.",
      quote: "You start with a random clump of atoms, and if you shine light on it for long enough, it should not be so surprising that you get a plant.",
      link: "https://www.quantamagazine.org/a-new-thermodynamics-theory-of-the-origin-of-life-20140122/",
      tags: ["Physics", "Thermodynamics", "Origin of Life"]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-16 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            MISSION CRITICAL INTEL
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The signal in the noise. Foundational texts that bridge the gap between silicon and soul, compute and consciousness.
          </p>
        </motion.div>

        {/* Assessment Intelligence Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Assessments in the News</h2>
            <p className="text-muted-foreground">Why the market is waking up to the "Human OS" problem.</p>
          </div>
          <div className="grid gap-8 max-w-5xl mx-auto">
            {assessmentNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-secondary/5 backdrop-blur-sm border border-secondary/20 rounded-xl p-8 hover:border-secondary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ArrowUpRight className="h-6 w-6 text-secondary" />
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {article.icon}
                    </div>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-mono text-secondary">{article.source}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>

                    <h2 className="text-2xl font-bold group-hover:text-secondary transition-colors duration-300">
                      {article.title}
                    </h2>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>

                    <blockquote className="border-l-2 border-secondary/30 pl-4 italic text-foreground/80 my-4">
                      "{article.quote}"
                    </blockquote>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                      <div className="flex gap-2">
                        {article.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-mono uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300"
                        onClick={() => window.open(article.link, '_blank')}
                      >
                        Read Source
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Foundational Intelligence</h2>
          <p className="text-muted-foreground">The deep code of compute and consciousness.</p>
        </div>

        <div className="grid gap-8 max-w-5xl mx-auto">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <ArrowUpRight className="h-6 w-6 text-primary" />
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {article.icon}
                  </div>
                </div>

                <div className="flex-grow space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono text-primary">{article.source}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>

                  <h2 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                    {article.title}
                  </h2>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {article.summary}
                  </p>

                  <blockquote className="border-l-2 border-primary/30 pl-4 italic text-foreground/80 my-4">
                    "{article.quote}"
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex gap-2">
                      {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      onClick={() => window.open(article.link, '_blank')}
                    >
                      Read Source
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
