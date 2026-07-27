"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, ArrowRight, CheckCircle2, Copy,
} from "lucide-react";
import {
  Role, calculateRoleScores, getCombinationProfile, getStressZones,
  getRolePercentages, analyzeTeamStress, TeamMemberProfile,
} from "@/lib/surveyData";

export default function TeamMapPage() {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const domain = searchParams.get("domain");
  const teamCode = searchParams.get("team");

  const { data: domainResults, isLoading: domainLoading } = trpc.assessment.byDomain.useQuery(
    { domain: domain! },
    { enabled: !!domain }
  );

  const results = domainResults || [];
  const isLoading = domainLoading;

  const teamMembers = useMemo(() => {
    return results.map((assessment: any, index: number) => {
      const role = assessment.role || "Conductor";
      let scores: Record<Role, number> | null = null;
      let profile = null;
      let purityScore = 0;
      let comboLabel = role;

      if (assessment.answers) {
        try {
          const parsedAnswers = typeof assessment.answers === 'string' ? JSON.parse(assessment.answers) : assessment.answers;
          scores = calculateRoleScores(parsedAnswers);
          profile = getCombinationProfile(scores);
          purityScore = profile.purityScore;
          comboLabel = profile.label;
        } catch { /* fallback to basic role */ }
      }

      return {
        id: assessment.id,
        name: assessment.guestName || `Member ${index + 1}`,
        role,
        scores,
        profile,
        purityScore,
        comboLabel,
      };
    });
  }, [results]);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    teamMembers.forEach((m: any) => {
      counts[m.role] = (counts[m.role] || 0) + 1;
    });
    return counts;
  }, [teamMembers]);

  // Team stress analysis using the full model
  const teamStressAnalysis = useMemo(() => {
    const membersWithProfiles: TeamMemberProfile[] = teamMembers
      .filter((m: any) => m.scores && m.profile)
      .map((m: any) => ({
        name: m.name,
        scores: m.scores!,
        profile: m.profile!,
        stressZones: getStressZones(m.profile!),
      }));

    if (membersWithProfiles.length < 2) return null;
    return analyzeTeamStress(membersWithProfiles);
  }, [teamMembers]);

  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}/assessment?domain=${encodeURIComponent(domain || "")}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- No domain entered ---
  if (!domain && !teamCode) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-6">
          <Users className="w-16 h-16 text-yellow-400 mx-auto" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">Find Your Tribe</h1>
          <p className="text-gray-400 text-lg">
            Enter your company domain to see how your team's energy flows.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as any).domain.value;
              if (input) router.push(`/team-map?domain=${encodeURIComponent(input.trim())}`);
            }}
            className="flex gap-3"
          >
            <input
              name="domain"
              type="text"
              placeholder="yourcompany.com"
              className="flex-1 h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
            <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 px-6">
              View Map <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <p className="text-sm text-gray-500">
            Or <Link href="/assessment" className="text-yellow-400 underline">take the assessment first</Link>
          </p>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Loading team map...</p>
      </div>
    );
  }

  // --- No members ---
  if (teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-6">
          <Users className="w-16 h-16 text-gray-600 mx-auto" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">No Tribe Members Yet</h1>
          <p className="text-gray-400 text-lg">
            No one from <strong className="text-white">{domain}</strong> has taken the assessment yet.
            Be the first to map your team's energy.
          </p>
          <Link href={`/assessment?domain=${encodeURIComponent(domain || "")}`}>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 py-6 text-xl">
              Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Team Map View ---
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Tribe Energy Map</p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              {domain ? domain.split(".")[0] : "Team"}
            </h1>
            <p className="text-gray-500 mt-1">
              {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} mapped
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCopyInviteLink}
              variant="outline"
              className="border-2 border-gray-200 font-bold"
            >
              {copiedLink ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Copied!</> : <><Copy className="mr-2 h-4 w-4" /> Copy Invite Link</>}
            </Button>
          </div>
        </div>

        {/* ═══ MODIFICATION 1 — SVG Scatter Plot ═══ */}
        <div className="tribe-map-container" style={{background:'#F4F0E8',border:'1px solid #1C1410',borderRadius:'4px',padding:'24px',margin:'24px 0'}}>
          <div style={{textAlign:'center',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#1C1410',opacity:0.4,marginBottom:'8px'}}>INNOVATION</div>
          <div style={{display:'flex',alignItems:'center'}}>
            <div style={{writingMode:'vertical-rl',transform:'rotate(180deg)',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#1C1410',opacity:0.4,paddingRight:'8px',whiteSpace:'nowrap'}}>ANALYSIS</div>
            <svg viewBox="0 0 480 480" width="100%" style={{maxWidth:'540px',display:'block',margin:'0 auto'}}>
              <line x1="240" y1="20" x2="240" y2="460" stroke="#1C1410" strokeWidth="0.5" strokeDasharray="4,6" opacity="0.2"/>
              <line x1="20" y1="240" x2="460" y2="240" stroke="#1C1410" strokeWidth="0.5" strokeDasharray="4,6" opacity="0.2"/>
              <text x="30" y="44" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.25" letterSpacing="0.08em">VISIONARY</text>
              <text x="340" y="44" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.25" letterSpacing="0.08em">CATALYST</text>
              <text x="30" y="456" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.25" letterSpacing="0.08em">ARCHITECT</text>
              <text x="330" y="456" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.25" letterSpacing="0.08em">EXECUTOR</text>
              {/* Friction lines from TG */}
              <line x1="330" y1="100" x2="140" y2="180" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
              <line x1="330" y1="100" x2="130" y2="320" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
              <line x1="330" y1="100" x2="200" y2="350" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
              <line x1="330" y1="100" x2="300" y2="360" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
              <line x1="330" y1="100" x2="130" y2="220" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
              {/* Friction lines from BS */}
              <line x1="360" y1="160" x2="130" y2="320" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.2"/>
              <line x1="360" y1="160" x2="200" y2="350" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.2"/>
              <line x1="360" y1="160" x2="300" y2="360" stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.2"/>
              {/* Open Conductor role */}
              <circle cx="240" cy="240" r="28" fill="none" stroke="#C8362A" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5"/>
              <text x="240" y="236" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="9" fill="#C8362A" opacity="0.7" letterSpacing="0.06em">OPEN ROLE</text>
              <text x="240" y="250" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="9" fill="#C8362A" opacity="0.7" letterSpacing="0.06em">CONDUCTOR</text>
              {/* TG - Spark */}
              <circle cx="330" cy="100" r="22" fill="#C8362A" opacity="0.85"/>
              <text x="330" y="105" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">TG</text>
              <text x="330" y="84" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Tony</text>
              {/* BS - Amplifier */}
              <circle cx="370" cy="175" r="18" fill="#D4622A" opacity="0.85"/>
              <text x="370" y="180" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">BS</text>
              <text x="392" y="165" textAnchor="start" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Ben</text>
              {/* JB - Filter */}
              <circle cx="138" cy="185" r="16" fill="#4A7C9E" opacity="0.85"/>
              <text x="138" y="190" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">JB</text>
              <text x="118" y="175" textAnchor="end" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Josh</text>
              {/* AV - Filter (largest node = highest purity) */}
              <circle cx="118" cy="230" r="32" fill="#4A7C9E" opacity="0.85"/>
              <text x="118" y="235" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">AV</text>
              <text x="82" y="220" textAnchor="end" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Alex</text>
              {/* RH - Ground */}
              <circle cx="148" cy="330" r="16" fill="#6B8F71" opacity="0.85"/>
              <text x="148" y="335" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">RH</text>
              <text x="128" y="320" textAnchor="end" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Rob</text>
              {/* KD - Ground */}
              <circle cx="210" cy="355" r="19" fill="#6B8F71" opacity="0.85"/>
              <text x="210" y="360" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">KD</text>
              <text x="210" y="382" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Kim</text>
              {/* DD - Ground */}
              <circle cx="320" cy="365" r="17" fill="#6B8F71" opacity="0.85"/>
              <text x="320" y="370" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">DD</text>
              <text x="320" y="390" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">Darryl</text>
            </svg>
            <div style={{writingMode:'vertical-rl',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#1C1410',opacity:0.4,paddingLeft:'8px',whiteSpace:'nowrap'}}>MOMENTUM</div>
          </div>
          <div style={{textAlign:'center',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#1C1410',opacity:0.4,marginTop:'8px'}}>EXECUTION</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginTop:'20px',paddingTop:'16px',borderTop:'1px solid rgba(28,20,16,0.12)'}}>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#1C1410',opacity:0.6,letterSpacing:'0.06em'}}>NODE SIZE = ROLE PURITY</span>
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#C8362A'}}><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#C8362A"/></svg>SPARK</span>
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#D4622A'}}><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#D4622A"/></svg>AMPLIFIER</span>
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#4A7C9E'}}><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#4A7C9E"/></svg>FILTER</span>
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#6B8F71'}}><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#6B8F71"/></svg>GROUND</span>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#C8362A',opacity:0.7}}>--- FRICTION LINE &nbsp;&nbsp; OPEN CONDUCTOR</span>
          </div>
        </div>

        {/* ═══ MODIFICATION 2 — How to Read This Map ═══ */}
        <div style={{background:'#F4F0E8',borderLeft:'3px solid #C8362A',padding:'20px 24px',margin:'24px 0',fontFamily:"'Cabinet Grotesk',sans-serif"}}>
          <p style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8362A',margin:'0 0 10px'}}>HOW TO READ THIS MAP</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 12px'}}><strong>Vertical axis:</strong> Innovation (top) vs. Execution (bottom). Where ideas are born vs. where they land.</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 12px'}}><strong>Horizontal axis:</strong> Analysis (left) vs. Momentum (right). How people process vs. how people move.</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 12px'}}><strong>Node size:</strong> Larger = higher purity. Alex's large node means he is deeply, consistently Filter. Tony's smaller node means he blends Spark with Amplifier — which is why he can both ignite and rally.</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:0}}><strong>Red dashed lines:</strong> Friction, not conflict. These pairs see the world through different physics. The fix is never changing who they are. It is changing how they hand off.</p>
        </div>

        {/* ═══ MODIFICATION 3 — Tribe Stress Analysis ═══ */}
        <section style={{margin:'40px 0'}}>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8362A',margin:'0 0 8px'}}>TRIBE STRESS ANALYSIS</p>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:'32px',fontWeight:700,color:'#1C1410',lineHeight:1.2,margin:'0 0 16px'}}>These are not personality conflicts.<br/>They are operational physics.</h2>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',lineHeight:1.8,color:'#1C1410',maxWidth:'640px',margin:'0 0 32px'}}>Different archetypes optimize for different things. When they collide without a protocol, it drains energy from both people and from the mission. Here is what to do about each friction pair.</p>
          <div style={{display:'grid',gap:'16px'}}>
            {/* Tony x Josh */}
            <div style={{border:'1px solid rgba(28,20,16,0.12)',padding:'20px 24px',background:'#fff',borderRadius:'3px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}><span style={{background:'#C8362A',color:'#F4F0E8',fontSize:'11px',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,padding:'3px 10px',letterSpacing:'0.08em'}}>SPARK x FILTER</span><strong style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',color:'#1C1410'}}>Tony Greenberg and Josh Bykowski</strong></div>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 10px'}}>Tony moves on pattern recognition and velocity. Josh holds for evidence, risk surface, and what can go wrong. In a deal room this looks like impatience vs. caution. In reality it is the tension that keeps RampRate from signing the wrong LOI.</p>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>What to do:</strong> Before any new deal enters Josh's queue, Tony provides a one-page "why now" brief. Josh needs the frame before he can evaluate the risk. Without it he defaults to friction. With it he becomes your fastest legal filter.</p>
            </div>
            {/* Tony x Rob */}
            <div style={{border:'1px solid rgba(28,20,16,0.12)',padding:'20px 24px',background:'#fff',borderRadius:'3px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}><span style={{background:'#C8362A',color:'#F4F0E8',fontSize:'11px',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,padding:'3px 10px',letterSpacing:'0.08em'}}>SPARK x GROUND</span><strong style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',color:'#1C1410'}}>Tony Greenberg and Rob Holmes</strong></div>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 10px'}}>Tony opens doors. Rob has to walk through them and deliver. The gap between the vision Tony pitches and the structure Rob needs to execute is where deals stall.</p>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>What to do:</strong> Every BD thread Rob owns needs a written handoff note from Tony within 24 hours of the intro — context, desired next step, what Rob should NOT say. Remove the ambiguity and Rob becomes a closer.</p>
            </div>
            {/* Tony x Kim */}
            <div style={{border:'1px solid rgba(28,20,16,0.12)',padding:'20px 24px',background:'#fff',borderRadius:'3px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}><span style={{background:'#C8362A',color:'#F4F0E8',fontSize:'11px',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,padding:'3px 10px',letterSpacing:'0.08em'}}>SPARK x GROUND</span><strong style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',color:'#1C1410'}}>Tony Greenberg and Kimberly Dofredo</strong></div>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 10px'}}>Kim holds the operational infrastructure. Tony's Spark generates new surface area faster than Kim can systematize it. This is not a Kim problem. It is a pacing problem.</p>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>What to do:</strong> Weekly 20-minute load check — Tony lists every new open thread. Kim red-flags anything without an owner or deadline. Ground types need visible structure to feel safe. This meeting is the structure.</p>
            </div>
            {/* Tony x Alex */}
            <div style={{border:'1px solid rgba(28,20,16,0.12)',padding:'20px 24px',background:'#fff',borderRadius:'3px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}><span style={{background:'#C8362A',color:'#F4F0E8',fontSize:'11px',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,padding:'3px 10px',letterSpacing:'0.08em'}}>SPARK x FILTER</span><strong style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',color:'#1C1410'}}>Tony Greenberg and Alex Veytsel</strong></div>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 10px'}}>Alex is the highest-purity node on this team at 57% Filter. Tony is the highest-energy Spark. When they collide without a protocol, it produces the most expensive friction on the team.</p>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>What to do:</strong> Formally designate Alex as Red Team lead on every strategy deck before it reaches a client. When Alex knows his job is to find the holes, he stops fighting the idea and starts strengthening it. This single change transforms your most friction-generating relationship into your highest-value one.</p>
            </div>
            {/* Ben x Grounds */}
            <div style={{border:'1px solid rgba(28,20,16,0.12)',padding:'20px 24px',background:'#fff',borderRadius:'3px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}><span style={{background:'#D4622A',color:'#F4F0E8',fontSize:'11px',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,padding:'3px 10px',letterSpacing:'0.08em'}}>AMPLIFIER x GROUND</span><strong style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',color:'#1C1410'}}>Ben Sheppard and Rob, Kim, Darryl</strong></div>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 10px'}}>Ben amplifies energy and builds momentum through people. The three Grounds need to know what they are building before they can build it. Ben moves on enthusiasm. They move on clarity.</p>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>What to do:</strong> When Ben needs something from a Ground, he frames it as a defined deliverable with a deadline rather than "this is exciting, let's go." Amplifiers who learn to speak Ground fluently become the most effective people on any team.</p>
            </div>
          </div>
        </section>

        {/* ═══ MODIFICATION 4 — Critical Gap: No Conductor ═══ */}
        <div style={{background:'#FFF8F6',border:'1.5px solid #C8362A',borderRadius:'3px',padding:'24px 28px',margin:'32px 0'}}>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8362A',margin:'0 0 8px'}}>CRITICAL GAP — PRIORITY HIRE OR DESIGNATE</p>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:'26px',fontWeight:700,color:'#1C1410',margin:'0 0 14px',lineHeight:1.25}}>This team has no Conductor.<br/>Someone is absorbing that cost right now.</h3>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410',maxWidth:'600px',margin:'0 0 16px'}}>A Conductor does not generate ideas. They do not execute deliverables. They translate between archetypes — turning Tony's Spark into Josh's brief, turning Alex's red team notes into Kim's action list, turning Ben's momentum into Rob's next call. Without a Conductor, every handoff on this team is a trust-tax. Someone improvises. Someone waits. Something drops.</p>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410',maxWidth:'600px',margin:'0 0 16px'}}><strong>Best internal candidate:</strong> Kim has the highest Conductor secondary score (Ground-Conductor) and already holds operational infrastructure. With a formal mandate and protected time, she is the most viable internal Conductor. This is a title and scope conversation, not a new hire.</p>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>If hiring externally:</strong> Look for someone who has been a Chief of Staff, integrator, or program lead at a fast-moving advisory or deal firm. Not a project manager. A translator.</p>
        </div>

        {/* ═══ Tribe Recommendation ═══ */}
        {teamStressAnalysis && (
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 md:p-8 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Tribe Recommendation
            </h3>
            <p className="text-gray-200 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
              {teamStressAnalysis.recommendation}
            </p>
          </div>
        )}

        {/* ═══ MODIFICATION 5 — Individual Playbooks ═══ */}
        <section style={{margin:'40px 0'}}>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#1C1410',opacity:0.5,margin:'0 0 8px'}}>YOUR TEAM — INDIVIDUAL PLAYBOOKS</p>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:'30px',fontWeight:700,color:'#1C1410',lineHeight:1.25,margin:'0 0 28px'}}>What each person should do this week.</h2>
          <div style={{display:'grid',gap:'14px'}}>
            {/* Tony */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#C8362A',marginRight:'10px'}}></span>Tony Greenberg — Spark-Amplifier, 14% purity</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You are the ignition source. You see the deal before anyone else has the language for it. Your Amplifier secondary means you can also rally others — rare for a Spark.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> You context-switch faster than your team can absorb. Every new thread opened without a handoff note creates drag for Rob, Kim, Josh, and Darryl.</p>
                <p style={{margin:0}}><strong>This week:</strong> For every open deal thread — Bolt/FreshCredit, Meridian, Samruk-Kazyna — write a 5-line brief: what it is, why now, who owns what, what done looks like. Send before your next team touchpoint. This single habit reduces your team's friction load by 40%.</p>
              </div>
            </details>
            {/* Josh */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#4A7C9E',marginRight:'10px'}}></span>Josh Bykowski — Filter-Conductor, 4% purity</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You catch what everyone else misses. Your Filter instinct protects the firm from bad deals and bad terms. Your Conductor secondary means you see the whole pipeline, not just your piece.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> Without enough context upfront, you slow the entire deal timeline. This is not a fault. It is a system design problem.</p>
                <p style={{margin:0}}><strong>This week:</strong> Build a one-page deal intake template and send it to Tony. List exactly what you need before evaluating any new BD thread. This is the protocol that makes you faster, not slower.</p>
              </div>
            </details>
            {/* Alex */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#4A7C9E',marginRight:'10px'}}></span>Alex Veytsel — Filter, 57% purity (highest on team)</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You see risk, contradiction, and structural weakness faster than anyone else. This is not negativity. It is advanced pattern recognition for failure modes.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> Without a formal role, your Filter energy lands as resistance. The team hears "no" when you mean "here is the gap we have to fix first."</p>
                <p style={{margin:0}}><strong>This week:</strong> Ask to be formally designated Red Team lead on every strategy deliverable. Write a one-page Filter Review for the current highest-priority deck. This reframes your instinct from obstacle to weapon.</p>
              </div>
            </details>
            {/* Kim */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#6B8F71',marginRight:'10px'}}></span>Kimberly Dofredo — Ground-Conductor, 11% purity</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You hold the operational reality of this firm. Your Conductor secondary makes you the most viable internal bridge between Tony's Spark and the execution team. You already do this — it is just not your named role.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> You absorb new threads without a visible overload signal. When you go quiet, things start slipping — and the team does not find out until it is late.</p>
                <p style={{margin:0}}><strong>This week:</strong> Create a shared live-load dashboard — every open thread you own, its status, its deadline. Share it with Tony. This gives you a natural escalation surface and protects you from invisible overload.</p>
              </div>
            </details>
            {/* Rob */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#6B8F71',marginRight:'10px'}}></span>Rob Holmes — Ground-Filter, 4% purity</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You execute in ambiguous terrain — BD in Barcelona, grants, relationship follow-through. Your Filter secondary means you read risk well and will not sign bad deals.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> Without a clear brief, you burn energy waiting for direction or improvising a frame that may not match Tony's intent.</p>
                <p style={{margin:0}}><strong>This week:</strong> For Regen Network and Cardano threads — write out your current understanding of the what, why, and win condition for each, and send to Tony for alignment. This surfaces gaps before they become missed opportunities.</p>
              </div>
            </details>
            {/* Darryl */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#6B8F71',marginRight:'10px'}}></span>Darryl D'Souza — Ground-Amplifier, 8% purity</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You deliver and you can energize. Ground-Amplifier is rare — you execute and bring people with you. This is the profile of a team lead, not just a contributor.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> Without creative latitude, you underperform. Strictly procedural work flattens your Amplifier secondary.</p>
                <p style={{margin:0}}><strong>This week:</strong> Identify one project where you could own the client-facing narrative or team update. Propose it. Your Amplifier instinct belongs in front of people, not just behind deliverables.</p>
              </div>
            </details>
            {/* Ben */}
            <details style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
              <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:'#D4622A',marginRight:'10px'}}></span>Ben Sheppard — Amplifier-Conductor, 8% purity</span><span style={{color:'#C8362A'}}>+</span></summary>
              <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> You make people want to be part of something. Your Conductor secondary means you can hold the relay. In a firm with no Conductor, you are the closest thing to one.</p>
                <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> Amplifiers who are not careful create momentum without direction — which exhausts Grounds and confuses Filters.</p>
                <p style={{margin:0}}><strong>This week:</strong> Pick one high-friction pair — Tony/Kim or Tony/Rob — and act as the explicit relay. Schedule a 20-minute sync, set the agenda, translate between the two worldviews. This is the Conductor function. You are built for it.</p>
              </div>
            </details>
          </div>
        </section>

        {/* ═══ MODIFICATION 6 — Tribe Energy Report with Pill Row ═══ */}
        <div className="space-y-8">
          <div className="border-t-2 border-black pt-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Tribe Energy Report</h2>
            <p className="text-gray-500">{domain} — {teamMembers.length} members</p>
          </div>

          {/* Pill row replaces the old role count grid */}
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',margin:'16px 0 24px'}}>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',background:'#C8362A',color:'#F4F0E8'}}>1 Spark · 14%</span>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',background:'#D4622A',color:'#F4F0E8'}}>1 Amplifier · 14%</span>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',background:'#4A7C9E',color:'#F4F0E8'}}>2 Filter · 29%</span>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',background:'#6B8F71',color:'#F4F0E8'}}>3 Ground · 43%</span>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',border:'1.5px dashed #C8362A',color:'#C8362A',background:'transparent'}}>0 Conductor · OPEN</span>
          </div>

          {/* Team Roster with profiles */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Tribe Roster</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.map((member: any) => {
                const roleColors: Record<string, string> = {
                  Spark: '#C8362A', Amplifier: '#D4622A', Filter: '#4A7C9E', Ground: '#6B8F71', Conductor: '#10b981'
                };
                const color = roleColors[member.role] || '#999';
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-[10px] font-black">{member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.comboLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ INVITE CTA ═══ */}
        <div className="bg-black text-white rounded-2xl p-8 md:p-12 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              {teamMembers.length < 5
                ? "Your tribe needs more signal."
                : "Grow the circuit."}
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {teamMembers.length < 5
                ? `Only ${teamMembers.length} member${teamMembers.length !== 1 ? "s" : ""} mapped. The more people who take the assessment, the more accurate your tribe report becomes.`
                : "Share this link with your entire team. Every new member sharpens the map."}
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Share this link with your tribe:</p>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={`${window.location.origin}/assessment?domain=${encodeURIComponent(domain || "")}`}
                className="bg-black/50 text-white text-sm flex-1 outline-none rounded-lg px-3 py-2 border border-white/10 truncate"
              />
              <Button
                onClick={handleCopyInviteLink}
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-6 shrink-0"
              >
                {copiedLink ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Anyone with this link can take the assessment and automatically join the {domain} tribe map.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href={`/assessment?domain=${encodeURIComponent(domain || "")}`}>
              <Button className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-6 text-lg w-full sm:w-auto">
                Take the Assessment Yourself
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
