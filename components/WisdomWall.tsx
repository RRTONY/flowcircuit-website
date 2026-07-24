import { motion } from "framer-motion";
import { Quote, AlertTriangle } from "lucide-react";

const satireTestimonials = [
  {
    quote: "If I had this framework, I wouldn't have had to buy Twitter to fix it. I would have just fired the Anchors.",
    author: "Elon Musk",
    role: "Chief Troll Officer",
    verified: false
  },
  {
    quote: "A house divided against itself cannot stand, but a house with too many Sparks will burn down before lunch.",
    author: "Abraham Lincoln",
    role: "Vampire Hunter / President",
    verified: false
  },
  {
    quote: "E=mc² is cute, but Flow = (Innovation x Focus) / Friction is the real theory of relativity.",
    author: "Albert Einstein",
    role: "Patent Clerk",
    verified: false
  }
];

export default function WisdomWall() {
  return (
    <section className="py-24 bg-white text-black border-t-4 border-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
            The Wisdom Wall
          </h2>
          <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto">
            What the greats <span className="bg-gray-200 px-2">would have said</span> if they'd had the framework.
          </p>
        </div>

        {/* The Satire (Unapproved) */}
        <div className="grid md:grid-cols-3 gap-8">
          {satireTestimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-2 border-dashed border-gray-300 p-8 relative opacity-80 hover:opacity-100 transition-opacity"
            >
              <AlertTriangle className="w-8 h-8 text-yellow-500 absolute top-4 right-4" />
              <div className="relative z-10">
                <p className="text-lg font-medium italic leading-relaxed mb-6 text-gray-600">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t-2 border-gray-100 pt-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-bold uppercase text-sm text-gray-800">{t.author}</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 text-xs font-mono text-gray-400 uppercase tracking-widest">
          * These people did not actually say these things. But they should have.
        </div>

      </div>
    </section>
  );
}
