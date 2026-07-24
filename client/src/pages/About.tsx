import { motion } from "framer-motion";
import { Streamdown } from 'streamdown';

export default function About() {
  const clients = [
    { name: "Microsoft", logo: "/images/logos/microsoft.png" },
    { name: "Sony", logo: "/images/logos/sony.png" },
    { name: "Intel", logo: "/images/logos/intel.png" },
    { name: "eBay", logo: "/images/logos/ebay.png" },
    { name: "Blizzard", logo: "/images/logos/blizzard.png" },
    { name: "Hearst", logo: "/images/logos/hearst.png" },
    { name: "McKinsey", logo: "/images/logos/mckinsey.png" },
    { name: "Merrill Lynch", logo: "/images/logos/merrill_lynch.png" },
    { name: "MGM", logo: "/images/logos/mgm.png" },
    { name: "Miramax", logo: "/images/logos/miramax.png" },
    { name: "MTV", logo: "/images/logos/mtv.png" },
    { name: "NBC", logo: "/images/logos/nbc.png" },
    { name: "NHL", logo: "/images/logos/nhl.png" },
    { name: "NPR", logo: "/images/logos/npr.png" },
    { name: "Accenture", logo: "/images/logos/accenture.png" },
    { name: "AT&T", logo: "/images/logos/att.png" },
    { name: "SanDisk", logo: "/images/logos/sandisk.png" },
    { name: "Audible", logo: "/images/logos/audible.png" },
    { name: "SiriusXM", logo: "/images/logos/siriusxm.png" },
    { name: "McGraw Hill", logo: "/images/logos/mcgraw_hill.png" },
    { name: "Viacom", logo: "/images/logos/viacom.png" },
    { name: "Nike", logo: "/images/logos/nike.png" },
    { name: "Penske", logo: "/images/logos/penske.png" },
    { name: "Rent.com", logo: "/images/logos/rent.png" },
    { name: "Rodale", logo: "/images/logos/rodale.png" },
    { name: "Shopzilla", logo: "/images/logos/shopzilla.png" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-24 pb-12">
      <div className="container max-w-4xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter glitch-effect"
            data-text="TONY GREENBERG"
          >
            TONY GREENBERG
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground font-light"
          >
            Solving massive problems. Creating products on steroids. Investing in high-impact growth.
          </motion.p>
        </section>

        {/* Bio Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary">The Architect of Impact</h2>
              <p>
                Tony Greenberg has spent decades operating at the intersection of massive scale and deep human connection. From sharing the stage with Ray Kurzweil in 2010 to authoring <em>"Boiling the Human,"</em> Tony has consistently been a voice for integrating technology with consciousness. His work on the <a href="https://tonygreenberg.com/human-os-2-0" className="text-primary hover:underline">recursive nature of human operating systems</a> defines the next era of innovation.
              </p>
              <p>
                He doesn't just advise companies; he transforms them. Working with the world's largest organizations, Tony specializes in taking products and putting them "on steroids"—accelerating growth, impact, and reach beyond conventional limits.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card/50 border border-white/10 backdrop-blur-sm shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-secondary">Core Focus</h3>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">⚡</span>
                  <span><strong>Solving Massive Problems:</strong> Tackling the complex, systemic challenges that scare others away.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">🚀</span>
                  <span><strong>Products on Steroids:</strong> Engineering innovation that scales exponentially, not incrementally.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">🌱</span>
                  <span><strong>High-Impact Investing:</strong> Backing the companies that are building the future we actually want to live in.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Client Logos Section */}
          <div className="mt-24 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
                Collapsing the Timeline
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Preserving the Soul of the Big Idea at Hyper-Speed.
                <br/>
                <span className="text-sm opacity-70">Removing the drag that kills the spark for the world's most powerful engines.</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
              {clients.map((client, i) => (
                <div key={i} className="w-32 h-20 flex items-center justify-center p-2 group relative">
                   <img 
                     src={client.logo} 
                     alt={client.name} 
                     className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-500 filter grayscale group-hover:grayscale-0"
                   />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-white/5">
            <h2 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Impact Soul & The Value of Community
            </h2>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <p className="text-xl leading-relaxed">
                At <strong>Impact Soul</strong>, we operate on a fundamental truth: <strong>Communities drive asset value.</strong>
              </p>
              <p className="text-lg text-muted-foreground">
                In a world of commoditized tech and fleeting attention, the only enduring moat is a deeply aligned community. We believe that when you build for the soul of the community, you unlock value that spreadsheets can't capture but markets always reward.
              </p>
              <p className="text-lg text-muted-foreground">
                This is why I am deeply committed to <strong>Frequency</strong>. It represents the apex of this philosophy—a curated convergence of technology, consciousness, and culture. My mission is to help build that organization and deliver on its promise, ensuring that the "signal" of Frequency amplifies the value of every member and every idea within it.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
