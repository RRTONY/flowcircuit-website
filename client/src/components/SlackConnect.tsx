import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SlackConnectProps {
  teamId: number | null;
}

export default function SlackConnect({ teamId }: SlackConnectProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const { data: teamDetail } = trpc.team.getById.useQuery(
    { id: teamId! },
    { enabled: !!teamId }
  );

  useEffect(() => {
    if (teamDetail?.slackWebhookUrl) {
      setWebhookUrl(teamDetail.slackWebhookUrl);
      setIsConnected(true);
    }
  }, [teamDetail]);

  const updateSlack = trpc.team.updateSlack.useMutation({
    onSuccess: () => {
      setIsConnected(!!webhookUrl);
    },
  });

  const handleSave = () => {
    if (!webhookUrl.startsWith("https://hooks.slack.com")) {
      alert("Please enter a valid Slack Webhook URL");
      return;
    }
    if (!teamId) return;
    updateSlack.mutate({ teamId, webhookUrl });
  };

  const handleDisconnect = () => {
    if (!teamId) return;
    updateSlack.mutate({ teamId, webhookUrl: "" });
    setWebhookUrl("");
    setIsConnected(false);
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold uppercase flex items-center gap-2 text-white">
          Slack Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <p className="text-sm text-gray-400">
              Get real-time pings in your team channel whenever a new member completes the assessment.
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Webhook URL</Label>
              <Input 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="bg-black/50 border-white/10 text-white font-mono text-xs"
              />
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!webhookUrl || updateSlack.isPending}
              className="w-full bg-[#E01E5A] hover:bg-[#C1174A] text-white font-bold"
            >
              {updateSlack.isPending ? "Connecting..." : "Connect Slack"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="font-bold text-green-400 text-sm">Connected to Slack</h4>
                <p className="text-xs text-green-200 mt-1">
                  Notifications are active.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="w-full border-white/20 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
