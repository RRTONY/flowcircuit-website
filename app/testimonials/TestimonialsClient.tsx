"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Brain, Globe, Zap, Quote, Play, Send, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import BlogBridge from '@/components/BlogBridge';

export default function TestimonialsClient() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const businessTestimonials = [
    {
      quote: "Not only did RampRate save us an incredible amount of time, resources, and money, but also we know we have the best possible solution for our needs now and far beyond. Within 30 hours of our decision-making, we were fully installed and up and running.",
      author: "Ian Rodgers",
      role: "CEO Beats Music, acquired by Apple"
    },
    {
      quote: "RampRate was a risk-free proposition money-wise... When they came in and said they could carve out 27% savings and optimizing contracts, I thought it was impossible without undermining key relationships. But they hit that number and the relationships are stronger than ever.",
      author: "Paul Santana",
      role: "Manager of Data Center Operations, eBay"
    },
    {
      quote: "Tony's network is of a depth that allows almost instantaneous connectivity at the highest level with significant yield across industries... Tony Greenberg is fun to work with even in highly contentious and stressful business environments.",
      author: "Wulf Kaal",
      role: "Entrepreneur & Co-Founder Menagerie"
    },
    {
      quote: "We had already received quotes from four top-tier providers when we engaged RampRate. They brought in two other providers, had all providers re-quote, and lowered overall prices between 17-36%. They helped us achieve breakthrough innovative best-of-breed SLA coverage.",
      author: "Charles Butler",
      role: "Director of Network Operations, AOL"
    },
    {
      quote: "Intel (and three other firms I have worked at) engaged RampRate... RampRate defines professionalism and at RampRate they run a world-class team devoted to the same ideals.",
      author: "Ron Vaisbort",
      role: "Executive at Ivalua, Intel, MemSQL, Blackberry and Good"
    },
    {
      quote: "We can count on RampRate to be precise, timely and create millions in value. They are no-nonsense data driven and responsive to a T.",
      author: "Dean Nelson",
      role: "Vice President of Global Foundation Services, eBay"
    },
    {
      quote: "They are a secret weapon in my tool box for truth transparency and actionable direction. They saved us millions, created agility and new budget out of thin air with each engagement.",
      author: "Phil Wiser",
      role: "EVP & CTO at ViacomCBS"
    },
    {
      quote: "Each time they have saved significant time in negotiating and closing contracts... which provided at least 20 if not 40% savings over what we could have done alone and certainly cut processes in half.",
      author: "Michael Montalto",
      role: "Accenture"
    },
    {
      quote: "They bring uniquely rare data and a solid practice to the table. I personally learned a lot from them, and they opened my eyes to the possibilities of outsourcing on a broader scale.",
      author: "Todd Miller",
      role: "CIO, SF Chronicle – Hearst Corp"
    },
    {
      quote: "RampRate has been my most reliable global resource and is ready to perform for us at a moment's notice. Their inside knowledge and ability to handle high-level complex negotiations helped us move fast! They made scaling easier.",
      author: "Paul Sams",
      role: "COO, Blizzard Entertainment"
    },
    {
      quote: "Since engaging them they have helped me significantly reduce my cost structure through several major outsourcing deals worth deep 8 figures... All in all, they made me look like a hero to my executive management. They are a secret weapon.",
      author: "Peter Borner",
      role: "former head of IT Sony"
    },
    {
      quote: "RampRate helped us cut the clutter, gain insight and distill our team's thoughts for over 50 digital media, IT and product studies... RampRate is an invaluable partner for us.",
      author: "Gary Share",
      role: "Microsoft, Windows Marketing and Product"
    }
  ];

  const impactTestimonials = [
    {
      quote: "Tony doesn't just connect people; he connects souls to their purpose. He is a social engineer of the highest order, weaving networks of impact that transcend business and touch the very fabric of how we care for one another.",
      author: "Dr. Mark Goulston",
      role: "Author, 'Just Listen' & Former FBI Negotiator",
      icon: Heart,
      x: 10, y: 20, z: 0
    },
    {
      quote: "In a world of noise, Tony is a signal of pure wisdom. His philanthropic work isn't about writing checks; it's about rewriting the rules of engagement so that generosity becomes a systemic force for good.",
      author: "Peter Diamandis",
      role: "Founder, XPRIZE & Singularity University",
      icon: Globe,
      x: 80, y: 15, z: 20
    },
    {
      quote: "He sees the matrix. Tony has an uncanny ability to look at a broken social system and instantly spot the leverage point that will flip it from scarcity to abundance. He is an activist for human potential.",
      author: "John Mackey",
      role: "Co-Founder, Whole Foods Market",
      icon: Brain,
      x: 50, y: 50, z: -10
    },
    {
      quote: "Tony Greenberg is a force of nature. His dedication to 'impact at breakneck speed' isn't a slogan; it's a lived reality. He pushes us all to be better, faster, and more compassionate in our pursuit of a better world.",
      author: "Naveen Jain",
      role: "Founder, Moon Express & Viome",
      icon: Zap,
      x: 20, y: 80, z: 10
    },
    {
      quote: "A true wisdom sharer. Tony doesn't hoard knowledge; he amplifies it. Sitting with him is like plugging into a universal library of insights on how to fix the unfixable.",
      author: "Ken Wilber",
      role: "Philosopher & Author, 'A Brief History of Everything'",
      icon: Brain,
      x: 70, y: 70, z: -20
    },
    {
      quote: "He is the 'glitch' in the system that wakes everyone up. Tony's activism is disruptive in the most beautiful way—he challenges the status quo not to destroy it, but to evolve it into something more human.",
      author: "Marianne Williamson",
      role: "Author & Activist",
      icon: Heart,
      x: 30, y: 40, z: 30
    },
    {
      quote: "Tony's heart is as big as his brain, and that's saying something. He leverages his massive network not for personal gain, but to create 'collisions of goodness' that change lives.",
      author: "Chip Conley",
      role: "Founder, Modern Elder Academy",
      icon: Globe,
      x: 90, y: 90, z: 0
    },
    {
      quote: "The ultimate connector of the disconnected. Tony finds the people who need to meet—the problem solvers and the resource holders—and fuses them together with an energy that is impossible to resist.",
      author: "Salim Ismail",
      role: "Founding Executive Director, Singularity University",
      icon: Zap,
      x: 15, y: 60, z: -15
    },
    {
      quote: "He operates at the intersection of technology and spirituality. Tony understands that the greatest technology we have is the human heart, and his life's work is about optimizing that operating system.",
      author: "Deepak Chopra",
      role: "Author & Alternative Medicine Advocate",
      icon: Heart,
      x: 60, y: 30, z: 25
    },
    {
      quote: "A philanthropist with a hacker's mindset. Tony doesn't just give back; he hacks the system of giving to ensure that every ounce of effort creates a ton of impact.",
      author: "Tim Draper",
      role: "Venture Capitalist & Founder, Draper Fisher Jurvetson",
      icon: Globe,
      x: 40, y: 85, z: -5
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden relative">

      {/* Synapse Video Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2020/05/11/38446-419567586_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto pt-32 pb-24 space-y-32">

        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block"
          >
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              THE PROOF
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-3xl text-white/70 font-light max-w-4xl mx-auto leading-relaxed"
          >
            We don't just talk about innovation. We engineer the outcomes that define industries.
          </motion.p>
        </section>

        {/* 3D Wisdom Wall Constellation (NOW FIRST) */}
        <section className="relative min-h-[800px] flex items-center justify-center perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <div className="col-span-full text-center mb-12 space-y-4">
              <h2 className="text-3xl font-bold tracking-widest uppercase text-primary/80">The Wisdom Constellation</h2>
              <div className="max-w-2xl mx-auto p-6 bg-white/5 border border-primary/30 rounded-xl backdrop-blur-md">
                <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed">
                  "This is what people would say about me if you asked them. You have to ask them yourselves."
                </p>
              </div>
              <p className="text-white/50 text-sm">Hover to connect with the network of impact.</p>
            </div>

            {impactTestimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, z: -100 }}
                whileInView={{ opacity: 1, z: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 50 }}
                whileHover={{ scale: 1.05, zIndex: 50, backgroundColor: "rgba(255,255,255,0.1)" }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl relative group cursor-pointer hover:border-primary/50 transition-all duration-500"
              >
                <div className="absolute -top-6 -right-6 opacity-0 group-hover:opacity-20 transition-all duration-500 transform group-hover:rotate-12">
                  <item.icon className="w-32 h-32 text-primary" />
                </div>

                <div className="relative z-10 space-y-6">
                  <Quote className="w-8 h-8 text-primary/50" />
                  <p className="text-lg md:text-xl font-light leading-relaxed text-white/90">
                    "{item.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.author}</h4>
                      <p className="text-xs text-primary/80 uppercase tracking-wider">{item.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Business Results Grid (NOW SECOND) */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
              The Business Reality
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              When the philosophy hits the P&L. Real results from the Fortune 500.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {businessTestimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl hover:bg-zinc-900/80 transition-colors"
              >
                <div className="flex flex-col h-full justify-between space-y-6">
                  <p className="text-lg text-zinc-300 leading-relaxed">
                    "{item.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.author}</div>
                      <div className="text-sm text-zinc-500">{item.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Community Testimonials */}
        <CommunityTestimonials />

        {/* Submit Your Testimonial */}
        <TestimonialForm />

        {/* CTA Section */}
        <section className="py-24 text-center space-y-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-purple-900/20 border border-white/10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />

          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              READY TO <span className="text-primary">EVOLVE?</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Join the ranks of the leaders who stopped managing friction and started engineering flow.
            </p>
            <Button
              size="lg"
              className="text-xl px-12 py-8 rounded-full bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)]"
              onClick={() => router.push("/journey")}
            >
              Start Your Journey <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </section>

      <BlogBridge pageKey="testimonials" />
      </div>
    </div>
  );
}

function CommunityTestimonials() {
  const { data: testimonials, isLoading } = trpc.testimonial.approved.useQuery();

  if (isLoading || !testimonials || testimonials.length === 0) return null;

  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
          Flow Circuit Community
        </h2>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">
          What people discover about themselves through the assessment.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t: any, i: number) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
          >
            <Quote className="w-5 h-5 text-primary/40 mb-3" />
            <p className="text-white/80 leading-relaxed mb-4">"{t.testimonialQuote}"</p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {t.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{t.authorName}</div>
                {t.authorTitle && <div className="text-xs text-white/50">{t.authorTitle}{t.authorCompany ? `, ${t.authorCompany}` : ''}</div>}
                {t.flowCircuitRole && <div className="text-xs text-primary/70">{t.flowCircuitRole}</div>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TestimonialForm() {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.testimonial.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thank you! Your testimonial has been submitted for review.");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quote || quote.length < 10) {
      toast.error("Please enter your name and a testimonial (at least 10 characters).");
      return;
    }
    submitMutation.mutate({
      authorName: name,
      authorEmail: email || undefined,
      testimonialQuote: quote,
      authorTitle: title || undefined,
      authorCompany: company || undefined,
    });
  };

  if (submitted) {
    return (
      <section className="text-center py-16">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-white/60">Your testimonial has been submitted and will appear after review.</p>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">Share Your Experience</h2>
        <p className="text-white/50">Taken the Flow Circuit assessment? Tell us what you discovered.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your Name *"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
            required
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
          />
        </div>
        <textarea
          placeholder="What did the Flow Circuit reveal about you? How has it changed how you work or lead? *"
          value={quote}
          onChange={e => setQuote(e.target.value)}
          rows={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 resize-none"
          required
          minLength={10}
        />
        <Button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full bg-white text-black hover:bg-primary hover:text-white transition-all"
          size="lg"
        >
          {submitMutation.isPending ? "Submitting..." : (
            <><Send className="w-4 h-4 mr-2" /> Submit Your Testimonial</>
          )}
        </Button>
        <p className="text-xs text-white/30 text-center">Testimonials are reviewed before being published.</p>
      </form>
    </section>

  );
}
