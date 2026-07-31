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
  roleInsights, ROLE_ORDER,
} from "@/lib/surveyData";
import { getInteraction } from "@/lib/interactionMatrix";

// Canonical quadrant position for each role on the Innovation/Execution x Analysis/Momentum
// scatter plot (480x480 viewBox). Multiple members of the same role fan out around this point.
const ROLE_POSITIONS: Record<Role, { x: number; y: number }> = {
  Spark: { x: 350, y: 110 },
  Amplifier: { x: 370, y: 200 },
  Filter: { x: 120, y: 200 },
  Ground: { x: 240, y: 370 },
  Conductor: { x: 240, y: 240 },
};

// Team-neutral (not "you"-directed) explanation of what a missing role costs the team.
const MISSING_ROLE_IMPACT: Record<Role, string> = {
  Spark: "Without a Spark, the team stagnates — no one is generating the raw ideas that everything else builds on.",
  Amplifier: "Without an Amplifier, great ideas die in silence — no one is turning vision into organizational buy-in.",
  Filter: "Without a Filter, the team ships broken products and makes avoidable mistakes — no one is stress-testing the plan.",
  Ground: "Without Ground energy, nothing ships — ideas, momentum, and analysis stay theoretical.",
  Conductor: "Without a Conductor, the relay breaks down — each role operates in isolation and handoffs fail.",
};

const ROLE_HEX: Record<Role, string> = {
  Spark: "#C8362A",
  Amplifier: "#D4622A",
  Filter: "#4A7C9E",
  Ground: "#6B8F71",
  Conductor: "#7B68AE",
};

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

  // Positioned scatter-plot node for every real member -- fans same-role members out
  // around their role's canonical quadrant instead of stacking them exactly on top of each other.
  const scatterNodes = useMemo(() => {
    const seenPerRole: Record<string, number> = {};
    return teamMembers.map((m: any) => {
      const role: Role = ROLE_POSITIONS[m.role as Role] ? m.role : "Conductor";
      const base = ROLE_POSITIONS[role];
      const idx = seenPerRole[role] || 0;
      seenPerRole[role] = idx + 1;
      const angle = (idx * 47 * Math.PI) / 180;
      const spread = idx === 0 ? 0 : 28 + idx * 18;
      const x = Math.max(30, Math.min(450, base.x + spread * Math.cos(angle)));
      const y = Math.max(30, Math.min(450, base.y + spread * Math.sin(angle)));
      const purity = m.purityScore || 20;
      const radius = 14 + Math.min(18, purity / 6);
      const initials = m.name.split(" ").map((n: string) => n[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "?";
      const firstName = m.name.split(" ")[0];
      return { ...m, role, x, y, radius, color: ROLE_HEX[role], initials, firstName };
    });
  }, [teamMembers]);

  // Which roles have zero members on this team right now.
  const missingRoles = useMemo(
    () => ROLE_ORDER.filter((r) => !roleDistribution[r]),
    [roleDistribution]
  );

  // Friction pairs based on each present role's known frictionWith relationships --
  // deduped to one representative pair per distinct role combination so a large team
  // doesn't produce dozens of near-duplicate cards.
  const roleFrictionCards = useMemo(() => {
    const seenPairs = new Set<string>();
    const cards: { roleA: Role; roleB: Role; nameA: string; nameB: string; guide?: ReturnType<typeof getInteraction> }[] = [];
    for (let i = 0; i < scatterNodes.length; i++) {
      for (let j = i + 1; j < scatterNodes.length; j++) {
        const a = scatterNodes[i];
        const b = scatterNodes[j];
        const aInsight = roleInsights[a.role as Role];
        const bInsight = roleInsights[b.role as Role];
        const isFriction = aInsight?.frictionWith.includes(b.role) || bInsight?.frictionWith.includes(a.role);
        if (!isFriction) continue;
        const key = [a.role, b.role].sort().join("-");
        if (seenPairs.has(key)) continue;
        seenPairs.add(key);
        cards.push({
          roleA: a.role, roleB: b.role, nameA: a.name, nameB: b.name,
          guide: getInteraction(a.role, b.role) || getInteraction(b.role, a.role),
        });
      }
    }
    return cards;
  }, [scatterNodes]);

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

        {/* Energy scatter plot -- positions and names are computed from the real team members above */}
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

              {/* Friction lines between real members whose roles are known to clash */}
              {roleFrictionCards.map((card, i) => {
                const a = scatterNodes.find((n: any) => n.role === card.roleA && n.name === card.nameA);
                const b = scatterNodes.find((n: any) => n.role === card.roleB && n.name === card.nameB);
                if (!a || !b) return null;
                return (
                  <line key={`friction-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="#C8362A" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
                );
              })}

              {/* Open/missing roles */}
              {missingRoles.map((role) => {
                const pos = ROLE_POSITIONS[role];
                return (
                  <g key={`open-${role}`}>
                    <circle cx={pos.x} cy={pos.y} r="28" fill="none" stroke="#C8362A" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5"/>
                    <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="9" fill="#C8362A" opacity="0.7" letterSpacing="0.06em">OPEN ROLE</text>
                    <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="9" fill="#C8362A" opacity="0.7" letterSpacing="0.06em">{role.toUpperCase()}</text>
                  </g>
                );
              })}

              {/* Real team member nodes */}
              {scatterNodes.map((node: any) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={node.radius} fill={node.color} opacity="0.85" />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#F4F0E8">{node.initials}</text>
                  <text x={node.x} y={node.y - node.radius - 6} textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontSize="10" fill="#1C1410" opacity="0.7">{node.firstName}</text>
                </g>
              ))}
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
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#7B68AE'}}><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#7B68AE"/></svg>CONDUCTOR</span>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',color:'#C8362A',opacity:0.7}}>--- FRICTION LINE &nbsp;&nbsp; OPEN ROLE</span>
          </div>
        </div>

        {/* ═══ MODIFICATION 2 — How to Read This Map ═══ */}
        <div style={{background:'#F4F0E8',borderLeft:'3px solid #C8362A',padding:'20px 24px',margin:'24px 0',fontFamily:"'Cabinet Grotesk',sans-serif"}}>
          <p style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8362A',margin:'0 0 10px'}}>HOW TO READ THIS MAP</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 12px'}}><strong>Vertical axis:</strong> Innovation (top) vs. Execution (bottom). Where ideas are born vs. where they land.</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 12px'}}><strong>Horizontal axis:</strong> Analysis (left) vs. Momentum (right). How people process vs. how people move.</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 12px'}}><strong>Node size:</strong> Larger = higher purity. A big node means that person is deeply, consistently one role. A smaller node means they blend two roles — which is why they can operate in both worlds.</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:0}}><strong>Red dashed lines:</strong> Friction, not conflict. These pairs see the world through different physics. The fix is never changing who they are. It is changing how they hand off.</p>
        </div>

        {/* Tribe Stress Analysis -- built from the real team's roles and the interaction matrix */}
        {roleFrictionCards.length > 0 && (
          <section style={{margin:'40px 0'}}>
            <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8362A',margin:'0 0 8px'}}>TRIBE STRESS ANALYSIS</p>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:'32px',fontWeight:700,color:'#1C1410',lineHeight:1.2,margin:'0 0 16px'}}>These are not personality conflicts.<br/>They are operational physics.</h2>
            <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',lineHeight:1.8,color:'#1C1410',maxWidth:'640px',margin:'0 0 32px'}}>Different archetypes optimize for different things. When they collide without a protocol, it drains energy from both people and from the mission. Here is what to do about each friction pair.</p>
            <div style={{display:'grid',gap:'16px'}}>
              {roleFrictionCards.map((card, i) => (
                <div key={i} style={{border:'1px solid rgba(28,20,16,0.12)',padding:'20px 24px',background:'#fff',borderRadius:'3px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px',flexWrap:'wrap'}}>
                    <span style={{background:ROLE_HEX[card.roleA],color:'#F4F0E8',fontSize:'11px',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,padding:'3px 10px',letterSpacing:'0.08em'}}>{card.roleA.toUpperCase()} x {card.roleB.toUpperCase()}</span>
                    <strong style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',color:'#1C1410'}}>{card.nameA} and {card.nameB}</strong>
                  </div>
                  <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.75,color:'#1C1410',margin:'0 0 10px'}}>{card.guide?.dynamic || `${card.roleA} and ${card.roleB} see the world through different physics — that's where the friction comes from.`}</p>
                  {card.guide && (
                    <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}>
                      <strong>Do:</strong> {card.guide.do} <strong>Don&apos;t:</strong> {card.guide.dont}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Critical Gap callout -- built from whichever role(s) this real team is actually missing */}
        {missingRoles.map((role) => {
          const candidate = teamMembers.find((m: any) => m.profile?.secondary === role);
          return (
            <div key={role} style={{background:'#FFF8F6',border:'1.5px solid #C8362A',borderRadius:'3px',padding:'24px 28px',margin:'32px 0'}}>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8362A',margin:'0 0 8px'}}>CRITICAL GAP — PRIORITY HIRE OR DESIGNATE</p>
              <h3 style={{fontFamily:"'Fraunces',serif",fontSize:'26px',fontWeight:700,color:'#1C1410',margin:'0 0 14px',lineHeight:1.25}}>This team has no {role}.<br/>Someone is absorbing that cost right now.</h3>
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410',maxWidth:'600px',margin:'0 0 16px'}}>{MISSING_ROLE_IMPACT[role]} Every handoff that role would normally own becomes a trust-tax on the rest of the team. Someone improvises. Someone waits. Something drops.</p>
              {candidate && (
                <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410',maxWidth:'600px',margin:'0 0 16px'}}><strong>Best internal candidate:</strong> {candidate.name} has {role} as a secondary strength. With a formal mandate and protected time, they're the most viable internal {role}. This is a title and scope conversation, not a new hire.</p>
              )}
              <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',lineHeight:1.7,color:'#1C1410',opacity:0.7,margin:0}}><strong>If hiring externally:</strong> Look for someone whose track record matches the {role} pattern above — not just a title match, but the actual behavioral signature.</p>
            </div>
          );
        })}

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

        {/* Individual Playbooks -- one card per real team member, built from their actual role */}
        <section style={{margin:'40px 0'}}>
          <p style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#1C1410',opacity:0.5,margin:'0 0 8px'}}>YOUR TEAM — INDIVIDUAL PLAYBOOKS</p>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:'30px',fontWeight:700,color:'#1C1410',lineHeight:1.25,margin:'0 0 28px'}}>What each person should do this week.</h2>
          <div style={{display:'grid',gap:'14px'}}>
            {teamMembers.map((member: any) => {
              const insight = roleInsights[member.role as Role];
              if (!insight) return null;
              const subtitle = member.purityScore
                ? `${member.comboLabel}, ${Math.round(member.purityScore)}% purity`
                : member.role;
              return (
                <details key={member.id} style={{border:'1px solid rgba(28,20,16,0.15)',borderRadius:'3px',padding:'18px 22px',background:'#fff'}}>
                  <summary style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'16px',fontWeight:700,color:'#1C1410',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                    <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:ROLE_HEX[member.role as Role],marginRight:'10px'}}></span>{member.name} — {subtitle}</span>
                    <span style={{color:'#C8362A'}}>+</span>
                  </summary>
                  <div style={{marginTop:'14px',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'15px',lineHeight:1.8,color:'#1C1410'}}>
                    <p style={{margin:'0 0 10px'}}><strong>Superpower:</strong> {insight.superpower}</p>
                    <p style={{margin:'0 0 10px'}}><strong>Your leak:</strong> {insight.blindSpot}</p>
                    <p style={{margin:0}}><strong>This week:</strong> {insight.growthEdge}</p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* ═══ MODIFICATION 6 — Tribe Energy Report with Pill Row ═══ */}
        <div className="space-y-8">
          <div className="border-t-2 border-black pt-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Tribe Energy Report</h2>
            <p className="text-gray-500">{domain} — {teamMembers.length} members</p>
          </div>

          {/* Pill row -- real counts and percentages for this team */}
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',margin:'16px 0 24px'}}>
            {ROLE_ORDER.map((role) => {
              const count = roleDistribution[role] || 0;
              if (count === 0) {
                return (
                  <span key={role} style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',border:'1.5px dashed #C8362A',color:'#C8362A',background:'transparent'}}>0 {role} · OPEN</span>
                );
              }
              const pct = Math.round((count / teamMembers.length) * 100);
              return (
                <span key={role} style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'13px',padding:'4px 14px',borderRadius:'2px',background:ROLE_HEX[role],color:'#F4F0E8'}}>{count} {role} · {pct}%</span>
              );
            })}
          </div>

          {/* Team Roster with profiles */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Tribe Roster</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.map((member: any) => {
                const color = ROLE_HEX[member.role as Role] || '#999';
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
