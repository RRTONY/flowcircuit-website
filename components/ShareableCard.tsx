import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { Role, CombinationProfile } from "@/lib/surveyData";

type RolePercentageItem = { role: Role; score: number; percentage: number };

const ROLE_COLORS: Record<Role, string> = {
  Spark: "#f59e0b",
  Amplifier: "#ef4444",
  Filter: "#8b5cf6",
  Ground: "#2563eb",
  Conductor: "#10b981",
};

interface ShareableCardProps {
  name: string;
  comboProfile: CombinationProfile;
  rolePercentages: RolePercentageItem[];
  dominantRole: Role;
}

export default function ShareableCard({ name, comboProfile, rolePercentages, dominantRole }: ShareableCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0a0a0a");
    grad.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Accent bar at top
    const accentColor = ROLE_COLORS[dominantRole];
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, W, 6);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Logo / Brand
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("THE FLOW CIRCUIT", 60, 50);

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
    ctx.fillText(name || "Your Results", 60, 120);

    // Combo Profile Label
    ctx.fillStyle = accentColor;
    ctx.font = "900 64px system-ui, -apple-system, sans-serif";
    ctx.fillText(comboProfile.label.toUpperCase(), 60, 200);

    // Purity badge
    const purityText = comboProfile.purityScore > 70
      ? "HIGHLY CONCENTRATED"
      : comboProfile.purityScore > 40
      ? "MODERATELY FOCUSED"
      : "VERSATILE BLEND";
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    const badgeWidth = ctx.measureText(purityText).width + 30;
    roundRect(ctx, 60, 220, badgeWidth, 32, 16);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.fillText(purityText, 75, 241);

    // Purity score
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(`Purity: ${comboProfile.purityScore}/100`, 60 + badgeWidth + 16, 241);

    // Role bars
    const barStartY = 290;
    const barHeight = 36;
    const barGap = 12;
    const barMaxWidth = 500;
    const barX = 60;

    rolePercentages.forEach((item, idx) => {
      const y = barStartY + idx * (barHeight + barGap);
      const color = ROLE_COLORS[item.role];
      const barWidth = (item.percentage / 100) * barMaxWidth;

      // Bar background
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, barX, y, barMaxWidth, barHeight, 6);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = color;
      roundRect(ctx, barX, y, Math.max(barWidth, 4), barHeight, 6);
      ctx.fill();

      // Role name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(item.role.toUpperCase(), barX + barMaxWidth + 20, y + 16);

      // Percentage
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${item.percentage}%`, barX + barMaxWidth + 20, y + barHeight - 2);
    });

    // Radar visualization (right side)
    const centerX = 900;
    const centerY = 340;
    const radius = 160;
    const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

    // Draw radar grid
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * radius;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw radar axes
    roles.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      ctx.stroke();
    });

    // Draw radar shape
    ctx.beginPath();
    ctx.fillStyle = accentColor + "30";
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    const maxScore = Math.max(...rolePercentages.map(r => r.percentage));
    roles.forEach((role: Role, i: number) => {
      const pct = rolePercentages.find(r => r.role === role)?.percentage || 0;
      const r = (pct / Math.max(maxScore, 50)) * radius * 0.85;
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Role labels on radar
    roles.forEach((role: Role, i: number) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const labelR = radius + 28;
      const x = centerX + Math.cos(angle) * labelR;
      const y = centerY + Math.sin(angle) * labelR;
      ctx.fillStyle = ROLE_COLORS[role];
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(role.toUpperCase(), x, y);
    });
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

    // Bottom tagline
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText("flowcircuit.manus.space  •  Take the Assessment  •  Find Your Tribe", 60, H - 30);

    // Copyright
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("© 2000-2026 Tony Greenberg & RampRate", W - 60, H - 30);
    ctx.textAlign = "start";
  }, [name, comboProfile, rolePercentages, dominantRole]);

  const handleDownload = useCallback(() => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `flow-circuit-${(name || "results").toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [drawCard, name]);

  const handleShare = useCallback(async () => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "flow-circuit-results.png", { type: "image/png" });
        const shareData = {
          title: `My Flow Circuit: ${comboProfile.label}`,
          text: `I'm a ${comboProfile.label} on The Flow Circuit — ${rolePercentages[0]?.percentage}% ${dominantRole}. Take the assessment to find your role.`,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      // Fallback: download
      handleDownload();
    } catch {
      handleDownload();
    }
  }, [drawCard, comboProfile, rolePercentages, dominantRole, handleDownload]);

  // Draw on mount
  const canvasCallbackRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node) {
        (canvasRef as any).current = node;
        setTimeout(drawCard, 100);
      }
    },
    [drawCard]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
        <canvas
          ref={canvasCallbackRef}
          className="w-full h-auto"
          style={{ aspectRatio: "1200/630" }}
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={handleShare}
          className="flex-1 bg-black text-white hover:bg-gray-800 font-bold py-5"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share to Social
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1 border-2 border-gray-200 font-bold py-5"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Image
        </Button>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
