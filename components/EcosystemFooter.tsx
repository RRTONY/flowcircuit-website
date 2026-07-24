import { Globe, Zap, Heart, Droplets, Brain, ExternalLink } from "lucide-react";

const ECOSYSTEM = [
  {
    name: "The Flow Circuit",
    tagline: "Map your team's energy",
    url: "/",
    icon: Zap,
    color: "#f59e0b",
    internal: true,
  },
  {
    name: "ImpactSoul",
    tagline: "Profit meets purpose",
    url: "https://impactsoul.is",
    icon: Heart,
    color: "#ec4899",
    internal: false,
  },
  {
    name: "TrueSelf / SoulPrint",
    tagline: "Decode your soul's blueprint",
    url: "https://soulprint.trueself.io",
    icon: Brain,
    color: "#8b5cf6",
    internal: false,
  },
  {
    name: "RampRate",
    tagline: "Infrastructure intelligence",
    url: "https://ramprate.com",
    icon: Globe,
    color: "#3b82f6",
    internal: false,
  },
  {
    name: "Holy Water by AG",
    tagline: "Sacred hydration, tokenized",
    url: "https://tonygreenberg.com",
    icon: Droplets,
    color: "#06b6d4",
    internal: false,
  },
];

export default function EcosystemFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        {/* Ecosystem Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-2">
            The Greenberg Ecosystem
          </p>
          <p className="text-sm text-white/50 max-w-lg mx-auto">
            Five portals. One mission. Help humans find themselves before the machines do it for them.
          </p>
        </div>

        {/* Ecosystem Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {ECOSYSTEM.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target={site.internal ? "_self" : "_blank"}
              rel={site.internal ? undefined : "noopener noreferrer"}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all hover:bg-white/5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${site.color}20` }}
              >
                <site.icon className="w-5 h-5" style={{ color: site.color }} />
              </div>
              <span className="text-xs font-bold text-white/80 text-center leading-tight">
                {site.name}
              </span>
              <span className="text-[10px] text-white/40 text-center leading-tight">
                {site.tagline}
              </span>
              {!site.internal && (
                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/40" />
              )}
            </a>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Tony Greenberg. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/tonygreenberg/" target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              LinkedIn
            </a>
            <a href="https://tonygreenberg.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Blog
            </a>
            <a href="https://clariceabelardi.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              The Muse
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
