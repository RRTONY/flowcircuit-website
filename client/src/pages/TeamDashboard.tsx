import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Activity, AlertTriangle, Link as LinkIcon, Plus, Settings, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FrictionCalculator from "@/components/FrictionCalculator";
import { Role, getRoleColor } from "@/lib/surveyData";
import TeamMatrix from "@/components/TeamMatrix";
import HeadToHead from "@/components/HeadToHead";
import TimeTravel from "@/components/TimeTravel";
import HiringGuide from "@/components/HiringGuide";
import SlackConnect from "@/components/SlackConnect";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface TeamMember {
  id: string;
  name: string;
  role: Role;
  score: number;
}

export default function TeamDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: myTeams, isLoading: teamsLoading, refetch: refetchTeams } = trpc.team.myTeams.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const activeTeamId = selectedTeamId ?? myTeams?.[0]?.id ?? null;

  const { data: teamDetail } = trpc.team.getById.useQuery(
    { id: activeTeamId! },
    { enabled: !!activeTeamId }
  );

  const { data: teamAssessments, isLoading: membersLoading } = trpc.team.members.useQuery(
    { teamId: activeTeamId! },
    { enabled: !!activeTeamId }
  );

  const createTeam = trpc.team.create.useMutation({
    onSuccess: (team) => {
      if (team) setSelectedTeamId(team.id);
      refetchTeams();
      setCreateDialogOpen(false);
      setNewTeamName("");
    },
  });

  const teamMembers: TeamMember[] = useMemo(() => {
    if (!teamAssessments) return [];
    return teamAssessments.map((a: any) => ({
      id: String(a.id),
      name: a.guestName ?? "Anonymous",
      role: (a.role as Role) ?? "Spark",
      score: a.score ?? 0,
    }));
  }, [teamAssessments]);

  const totalMembers = teamMembers.length;
  const roleCounts = teamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRolePercentage = (role: string) => {
    return totalMembers > 0 ? Math.round(((roleCounts[role] || 0) / totalMembers) * 100) : 0;
  };

  const missingRoles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"].filter(
    role => !roleCounts[role]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 space-y-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center">
          Circuit Command
        </h1>
        <p className="text-gray-400 text-lg text-center max-w-xl">
          Sign in to create your team, invite members, and visualize your collective operational physics.
        </p>
        <Button
          className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 text-lg"
          onClick={() => { window.location.href = getLoginUrl(); }}
        >
          Sign In to Continue
        </Button>
      </div>
    );
  }

  if (!teamsLoading && (!myTeams || myTeams.length === 0)) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Circuit Command
          </h1>
          <p className="text-gray-400 text-xl max-w-xl">
            Create your first team to start mapping your organization's operational physics.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full space-y-4">
          <Label className="text-gray-300">Team Name</Label>
          <Input
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="e.g. RampRate Leadership"
            className="bg-black/50 border-white/20 text-white h-12"
          />
          <Button
            className="w-full bg-white text-black hover:bg-gray-200 font-bold h-12"
            disabled={!newTeamName.trim() || createTeam.isPending}
            onClick={() => createTeam.mutate({ name: newTeamName.trim() })}
          >
            {createTeam.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Circuit Command
            </h1>
            <p className="text-gray-400 text-lg">
              {teamDetail?.name ?? "Team Architecture & Health Monitoring"}
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            {myTeams && myTeams.length > 1 && (
              <select
                value={activeTeamId ?? ""}
                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm"
              >
                {myTeams.map((t: any) => (
                  <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
                ))}
              </select>
            )}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Plus className="mr-2 w-4 h-4" /> New Team
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Create a New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Team name"
                    className="bg-black/50 border-white/20 text-white"
                  />
                  <Button
                    className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                    disabled={!newTeamName.trim() || createTeam.isPending}
                    onClick={() => createTeam.mutate({ name: newTeamName.trim() })}
                  >
                    {createTeam.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold" 
              onClick={() => window.location.href = `/manager-guidebook?team=${teamDetail?.code ?? ""}`}
            >
              <LinkIcon className="mr-2 w-4 h-4" /> Invite Team
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => window.location.href = `/team-settings?team=${activeTeamId}`}
            >
              <Settings className="mr-2 w-4 h-4" /> Settings
            </Button>
          </div>
        </div>

        {membersLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <Users className="w-16 h-16 mx-auto text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-400">No Team Members Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Use the "Invite Team" button to generate a link. Share it with your staff so they can take the assessment and appear here automatically.
            </p>
            <Button 
              className="bg-white text-black hover:bg-gray-200 font-bold"
              onClick={() => window.location.href = `/manager-guidebook?team=${teamDetail?.code ?? ""}`}
            >
              <LinkIcon className="mr-2 w-4 h-4" /> Get Invite Link
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <TeamMatrix members={teamMembers} />
              <TimeTravel members={teamMembers} />
              
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold uppercase flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-yellow-400" /> Role Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Spark", "Amplifier", "Filter", "Ground", "Conductor"].map((role) => (
                      <div key={role} className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-gray-300">
                          <span>{role}</span>
                          <span>{getRolePercentage(role)}%</span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getRolePercentage(role)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${getRoleColor(role as Role).replace("text-", "bg-")}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {missingRoles.length > 0 && (
                    <div className="mt-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-400 uppercase text-xs">Critical Circuit Breaks</h4>
                        <p className="text-xs text-red-200 mt-1">
                          Missing <strong>{missingRoles.join(", ")}</strong> energy creates friction.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold uppercase text-white">Team Roster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getRoleColor(member.role).replace("text-", "bg-")} text-black`}>
                            {member.role[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white">{member.name}</div>
                            <div className="text-xs text-gray-400">{member.role} - {member.score}% Fit</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <FrictionCalculator />
              <HeadToHead members={teamMembers} />
              <HiringGuide members={teamMembers} />
              <SlackConnect teamId={activeTeamId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
