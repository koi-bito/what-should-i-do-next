"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface Team {
  id: string;
  name: string;
  role: string;
}

interface TeamMember {
  userId: string;
  role: string;
  displayName: string;
  email: string;
}

interface TeamDashboardStats {
  userId: string;
  displayName: string;
  email: string;
  queriesPastWeek: number;
}

interface TeamGoal {
  id: string;
  title: string;
  description: string | null;
  priority: number;
}

export default function TeamsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: teamsRes, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await apiClient.get("/teams");
      return res.data as { data: Team[] };
    },
  });

  const { data: teamDetails } = useQuery({
    queryKey: ["teams", selectedTeam],
    queryFn: async () => {
      const res = await apiClient.get(`/teams/${selectedTeam}`);
      return res.data as { id: string; name: string; members: TeamMember[] };
    },
    enabled: !!selectedTeam,
  });

  const { data: teamDashboard } = useQuery({
    queryKey: ["teams", selectedTeam, "dashboard"],
    queryFn: async () => {
      const res = await apiClient.get(`/teams/${selectedTeam}/dashboard`);
      return res.data as { data: TeamDashboardStats[] };
    },
    enabled: !!selectedTeam,
  });

  const { data: teamGoals } = useQuery({
    queryKey: ["teams", selectedTeam, "goals"],
    queryFn: async () => {
      const res = await apiClient.get(`/teams/${selectedTeam}/goals`);
      return res.data as { data: TeamGoal[] };
    },
    enabled: !!selectedTeam,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiClient.post("/teams", { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setIsCreating(false);
      setNewTeamName("");
      toast({ title: "Team created!", type: "success" });
    },
    onError: () => {
      toast({ title: "Failed to create team", type: "error" });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiClient.post(`/teams/${selectedTeam}/invites`, { email, role: "member" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", selectedTeam] });
      setInviteEmail("");
      toast({ title: "Member invited!", type: "success" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Failed to invite member", 
        description: err.response?.data?.error?.message || "An error occurred",
        type: "error" 
      });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiClient.post(`/teams/${selectedTeam}/goals`, { title });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", selectedTeam, "goals"] });
      toast({ title: "Team goal created!", type: "success" });
    },
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      createTeamMutation.mutate(newTeamName.trim());
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteMemberMutation.mutate(inviteEmail.trim());
    }
  };

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-surface rounded w-3/4"></div></div>;
  }

  const teams = teamsRes?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your team and view manager dashboards.</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="btn-primary shadow-glow-primary">
            Create Team
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTeam} className="card p-6 shadow-card-primary bg-surface border border-border">
          <h2 className="text-lg font-semibold mb-4">Create a New Team</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Engineering Team"
              className="input-primary flex-1 bg-background"
              required
            />
            <button type="submit" disabled={createTeamMutation.isPending} className="btn-primary">
              {createTeamMutation.isPending ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {teams.length === 0 && !isCreating ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">You are not part of any teams yet.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Team List Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedTeam === team.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface hover:bg-surface-hover text-foreground border border-border"
              }`}
            >
              <div className="font-semibold">{team.name}</div>
              <div className="text-xs opacity-80">{team.role}</div>
            </button>
          ))}
        </div>

        {/* Team Detail Area */}
        {selectedTeam && teamDetails && (
          <div className="md:col-span-3 space-y-6">
            <div className="card p-6 border border-border bg-surface">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{teamDetails.name}</h2>
                <span className="badge-primary">
                  {teams.find(t => t.id === selectedTeam)?.role}
                </span>
              </div>

              {/* Manager Dashboard Stats */}
              {(teams.find(t => t.id === selectedTeam)?.role === "owner" || teams.find(t => t.id === selectedTeam)?.role === "manager") && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Manager Dashboard (Past 7 Days)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamDashboard?.data.map((stat) => (
                      <div key={stat.userId} className="p-4 rounded-lg bg-background border border-border flex flex-col justify-between">
                        <div>
                          <div className="font-medium text-sm">{stat.displayName || stat.email}</div>
                          <div className="text-xs text-muted-foreground">{stat.email}</div>
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-bold text-primary">{stat.queriesPastWeek}</span>
                          <span className="text-xs text-muted-foreground ml-1">queries completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members List */}
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 mt-8">Team Members</h3>
              <div className="space-y-3 mb-6">
                {teamDetails.members.map((member) => (
                  <div key={member.userId} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <div className="font-medium text-sm">{member.displayName || member.email}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-surface-hover capitalize">{member.role}</span>
                  </div>
                ))}
              </div>

              {/* Team Goals */}
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 mt-8">Team Goals</h3>
              <div className="space-y-3 mb-6">
                {teamGoals?.data.map((goal) => (
                  <div key={goal.id} className="p-3 rounded-lg bg-background border border-border">
                    <div className="font-medium text-sm">{goal.title}</div>
                  </div>
                ))}
                {teamGoals?.data.length === 0 && (
                  <div className="text-sm text-muted-foreground p-3">No team goals set.</div>
                )}
                {(teams.find(t => t.id === selectedTeam)?.role === "owner" || teams.find(t => t.id === selectedTeam)?.role === "manager") && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as any).goalTitle.value;
                    if (input.trim()) {
                      createGoalMutation.mutate(input.trim());
                      (e.target as HTMLFormElement).reset();
                    }
                  }} className="flex gap-2 mt-2">
                    <input name="goalTitle" type="text" placeholder="New team goal..." className="input-primary flex-1 text-sm bg-background" required />
                    <button type="submit" disabled={createGoalMutation.isPending} className="btn-primary text-sm">Add</button>
                  </form>
                )}
              </div>

              {/* Invite Form */}
              {(teams.find(t => t.id === selectedTeam)?.role === "owner" || teams.find(t => t.id === selectedTeam)?.role === "manager") && (
                <form onSubmit={handleInvite} className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Invite new member</h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="input-primary flex-1 bg-background text-sm"
                      required
                    />
                    <button type="submit" disabled={inviteMemberMutation.isPending} className="btn-primary text-sm py-2">
                      {inviteMemberMutation.isPending ? "Inviting..." : "Invite"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Note: User must already be signed up for this MVP version.</p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
