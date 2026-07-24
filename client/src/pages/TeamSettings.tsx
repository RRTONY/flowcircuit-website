import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Upload, Save, CheckCircle2, Image, Hash, Bell, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function TeamSettings() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [weeklyReportEmail, setWeeklyReportEmail] = useState("");
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: teams, isLoading: teamsLoading } = trpc.team.myTeams.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateSettings = trpc.team.updateSettings.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const uploadLogo = trpc.team.uploadLogo.useMutation();

  // Load team data when selected
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      const team = teams[0];
      setSelectedTeamId(team.id);
      setTeamName(team.name);
      setCompanyName(team.companyName || "");
      setSlackWebhookUrl(team.slackWebhookUrl || "");
      setWeeklyReportEmail(team.weeklyReportEmail || "");
      setWeeklyReportEnabled(team.weeklyReportEnabled || false);
      setLogoPreview(team.logoUrl || null);
    }
  }, [teams, selectedTeamId]);

  const handleTeamSelect = (teamId: number) => {
    const team = teams?.find((t) => t.id === teamId);
    if (team) {
      setSelectedTeamId(team.id);
      setTeamName(team.name);
      setCompanyName(team.companyName || "");
      setSlackWebhookUrl(team.slackWebhookUrl || "");
      setWeeklyReportEmail(team.weeklyReportEmail || "");
      setWeeklyReportEnabled(team.weeklyReportEnabled || false);
      setLogoPreview(team.logoUrl || null);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedTeamId) return;

    let logoUrl: string | undefined;

    // Upload logo if changed
    if (logoFile) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(logoFile);
      });
      const result = await uploadLogo.mutateAsync({
        teamId: selectedTeamId,
        fileName: logoFile.name,
        base64Data: base64,
        contentType: logoFile.type,
      });
      logoUrl = result.url;
    }

    updateSettings.mutate({
      teamId: selectedTeamId,
      name: teamName,
      companyName: companyName || undefined,
      slackWebhookUrl: slackWebhookUrl || undefined,
      weeklyReportEnabled,
      weeklyReportEmail: weeklyReportEmail || undefined,
      logoUrl,
    });
  };

  if (authLoading || teamsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Team Settings</h1>
          <p className="text-gray-400 text-lg">Sign in to manage your team settings.</p>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="bg-yellow-400 text-black hover:bg-white font-bold px-8 py-4 text-lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">No Teams Yet</h1>
          <p className="text-gray-400 text-lg">Create a team from the Team Dashboard first.</p>
          <Button
            onClick={() => { window.location.href = "/team-dashboard"; }}
            className="bg-yellow-400 text-black hover:bg-white font-bold"
          >
            Go to Team Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
            <Settings className="w-4 h-4" /> Team Settings
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Configure Your Circuit
          </h1>
        </motion.div>

        {/* Team Selector */}
        {teams.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {teams.map((team) => (
              <Button
                key={team.id}
                variant={selectedTeamId === team.id ? "default" : "outline"}
                onClick={() => handleTeamSelect(team.id)}
                className={selectedTeamId === team.id ? "bg-yellow-400 text-black" : "border-white/20 text-white hover:bg-white/10"}
              >
                {team.name}
              </Button>
            ))}
          </div>
        )}

        {/* Branding */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Image className="w-5 h-5" /> Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Team Name</Label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Company Name</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Company Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                )}
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                  <Upload className="w-4 h-4 text-gray-300" />
                  <span className="text-gray-300 text-sm">Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500">Logo will appear on PDF reports generated for this team.</p>
            </div>
          </CardContent>
        </Card>

        {/* Slack Integration */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Hash className="w-5 h-5" /> Slack Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Slack Webhook URL</Label>
              <Input
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="bg-black/50 border-white/20 text-white"
              />
              <p className="text-xs text-gray-500">
                Get a webhook URL from your Slack workspace settings. You will receive a notification every time a team member completes the assessment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Reports */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Mail className="w-5 h-5" /> Weekly Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeeklyReportEnabled(!weeklyReportEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${weeklyReportEnabled ? "bg-yellow-400" : "bg-white/20"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${weeklyReportEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <Label className="text-gray-300">Send weekly energy shift summary</Label>
            </div>
            {weeklyReportEnabled && (
              <div className="space-y-2">
                <Label className="text-gray-300">Email Address</Label>
                <Input
                  value={weeklyReportEmail}
                  onChange={(e) => setWeeklyReportEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending || uploadLogo.isPending}
          className="w-full bg-yellow-400 text-black hover:bg-white h-14 text-lg font-bold uppercase tracking-widest"
        >
          {saved ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Saved!</span>
          ) : updateSettings.isPending || uploadLogo.isPending ? (
            "Saving..."
          ) : (
            <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Save Settings</span>
          )}
        </Button>
      </div>
    </div>
  );
}
