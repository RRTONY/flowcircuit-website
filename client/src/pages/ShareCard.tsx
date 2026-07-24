import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";

const ROLE_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  Spark: { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245,158,11,0.3)" },
  Amplifier: { primary: "#3b82f6", secondary: "#60a5fa", glow: "rgba(59,130,246,0.3)" },
  Filter: { primary: "#8b5cf6", secondary: "#a78bfa", glow: "rgba(139,92,246,0.3)" },
  Ground: { primary: "#10b981", secondary: "#34d399", glow: "rgba(16,185,129,0.3)" },
  Conductor: { primary: "#ec4899", secondary: "#f472b6", glow: "rgba(236,72,153,0.3)" },
};

const ROLE_SYMBOLS: Record<string, string> = {
  Spark: "⚡",
  Amplifier: "📡",
  Filter: "🔬",
  Ground: "🏗️",
  Conductor: "🎼",
};

export default function ShareCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: results } = trpc.assessment.myResults.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const assessment = results?.[0];
  const primaryRole = assessment?.role?.split("-")[0] || "Spark";
  const secondaryRole = assessment?.role?.includes("-") ? assessment.role.split("-")[1] : "";
  const purity = assessment?.score || 0;
  const userName = user?.name || "Anonymous Explorer";
  const colors = ROLE_COLORS[primaryRole] || ROLE_COLORS.Spark;

  useEffect(() => {
    if (!canvasRef.current || !assessment) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0a0a0a");
    bgGrad.addColorStop(0.5, "#111111");
    bgGrad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Sacred geometry pattern (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(W / 2, H / 2);
      ctx.lineTo(W / 2 + Math.cos(angle) * 400, H / 2 + Math.sin(angle) * 400);
      ctx.stroke();
    }
    // Concentric circles
    for (let r = 80; r < 400; r += 60) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glow circle behind role
    const glowGrad = ctx.createRadialGradient(W / 2, 240, 0, W / 2, 240, 200);
    glowGrad.addColorStop(0, colors.glow);
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 40, W, 400);

    // Role symbol
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.fillText(ROLE_SYMBOLS[primaryRole] || "⚡", W / 2, 200);

    // Primary role name
    ctx.font = "bold 72px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = colors.primary;
    ctx.fillText(primaryRole.toUpperCase(), W / 2, 300);

    // Secondary role
    if (secondaryRole) {
      ctx.font = "24px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`with ${secondaryRole} tendencies`, W / 2, 340);
    }

    // Purity bar
    const barX = W / 2 - 150;
    const barY = 370;
    const barW = 300;
    const barH = 8;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();
    const purityGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    purityGrad.addColorStop(0, colors.primary);
    purityGrad.addColorStop(1, colors.secondary);
    ctx.fillStyle = purityGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * (purity / 100), barH, 4);
    ctx.fill();

    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(`${purity}% Purity Score`, W / 2, 405);

    // User name
    ctx.font = "20px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(userName, W / 2, 460);

    // Bottom branding
    ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText("THE FLOW CIRCUIT", W / 2, 560);
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("theflowcircuit.com  •  Find Your Frequency", W / 2, 585);

    // Border
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, W - 8, H - 8, 12);
    ctx.stroke();

    setImageUrl(canvas.toDataURL("image/png"));
  }, [assessment, primaryRole, secondaryRole, purity, userName, colors]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = `flow-circuit-${primaryRole.toLowerCase()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success("Card downloaded!");
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share?role=${primaryRole}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && imageUrl) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], `flow-circuit-${primaryRole.toLowerCase()}.png`, { type: "image/png" });
        await navigator.share({
          title: `I'm a ${primaryRole} on The Flow Circuit`,
          text: `I just discovered my natural operational energy. I'm a ${primaryRole}${secondaryRole ? `-${secondaryRole}` : ""}. What are you?`,
          url: `${window.location.origin}/assessment`,
          files: [file],
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isAuthenticated || !assessment) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-black">Your Card Awaits</h1>
          <p className="text-white/50">
            Take the Flow Circuit Assessment first, then come back to generate
            your shareable results card.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              Take the Assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tight">Your Flow Card</h1>
          <p className="text-white/50">
            Share your energy DNA with the world. Post it on LinkedIn, send it to your team,
            or just save it as a reminder of who you really are.
          </p>
        </div>

        {/* Canvas Card */}
        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 max-w-[600px] w-full">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ aspectRatio: "1200/630" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleDownload} size="lg" className="gap-2 bg-white text-black hover:bg-gray-200">
            <Download className="w-5 h-5" /> Download PNG
          </Button>
          <Button onClick={handleShare} size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
            <Share2 className="w-5 h-5" /> Share
          </Button>
          <Button onClick={handleCopyLink} size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        {/* Suggested caption */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">
            Suggested LinkedIn Caption
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            Just discovered I'm a <strong className="text-white">{primaryRole}</strong> on The Flow Circuit
            {secondaryRole ? ` with ${secondaryRole} tendencies` : ""}.
            {purity >= 80
              ? " My purity score is off the charts — this is my natural operating system."
              : " Understanding my operational energy changes how I show up in teams."}
            {" "}What's your energy DNA? 👉 theflowcircuit.com
          </p>
        </div>
      </div>
    </div>
  );
}
