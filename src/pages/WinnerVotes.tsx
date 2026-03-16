"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Plus,
  TrendingUp,
  Users,
  Award,
  Pencil,
  Trash2,
  ShieldAlert,
  BarChart3,
  Flame,
} from "lucide-react";
import { apiConfig } from "@/apiConfig/apiConfig";
import { toast } from "sonner";
import { FIFA_WORLD_CUP_LEAGUE_SEASON_ID } from "@/lib/utils";
import { AdminWinnerVoteData, createAdminVote, deleteAdminVote, getLeagueSeasonVotes, updateAdminVote, WinnerVoteStats } from "@/apiConfig/winnerVote.api";

export default function AdminWinnerVotesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<AdminWinnerVoteData | null>(
    null
  );
  const [formData, setFormData] = useState({
    league_season_id: FIFA_WORLD_CUP_LEAGUE_SEASON_ID,
    team_id: 0,
    user_id: 1,
    vote_count: 0,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["winnerVotes", FIFA_WORLD_CUP_LEAGUE_SEASON_ID],
    queryFn: () => getLeagueSeasonVotes(FIFA_WORLD_CUP_LEAGUE_SEASON_ID),
  });

  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await apiConfig.get("/teams");
      return res.data?.data || [];
    },
  });

  const createVoteMutation = useMutation({
    mutationFn: (data: typeof formData) => createAdminVote(data),
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success("Admin vote created!");
        queryClient.invalidateQueries({ queryKey: ["winnerVotes"] });
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.error || "Failed to create vote");
      }
    },
  });

  const updateVoteMutation = useMutation({
    mutationFn: ({ voteId, data }: { voteId: number; data: any }) =>
      updateAdminVote(voteId, data),
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success("Vote updated!");
        queryClient.invalidateQueries({ queryKey: ["winnerVotes"] });
        setIsEditDialogOpen(false);
        setSelectedVote(null);
        resetForm();
      } else {
        toast.error(response.error || "Failed to update vote");
      }
    },
  });

  const deleteVoteMutation = useMutation({
    mutationFn: (voteId: number) => deleteAdminVote(voteId),
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success("Vote deleted.");
        queryClient.invalidateQueries({ queryKey: ["winnerVotes"] });
      } else {
        toast.error(response.error || "Failed to delete vote");
      }
    },
  });

  /* ── HANDLERS ── */
  const resetForm = () =>
    setFormData({
      league_season_id: FIFA_WORLD_CUP_LEAGUE_SEASON_ID,
      team_id: 0,
      user_id: 1,
      vote_count: 0,
    });

  const handleCreateVote = () => {
    if (!formData.team_id) {
      toast.error("Please select a team");
      return;
    }
    createVoteMutation.mutate(formData);
  };

  const handleUpdateVote = () => {
    if (!selectedVote) return;
    updateVoteMutation.mutate({
      voteId: selectedVote.id,
      data: { vote_count: formData.vote_count, team_id: formData.team_id },
    });
  };

  const handleDeleteVote = (voteId: number) => {
    if (confirm("Delete this expert vote?")) deleteVoteMutation.mutate(voteId);
  };

  const handleEditVote = (vote: AdminWinnerVoteData) => {
    setSelectedVote(vote);
    setFormData({
      league_season_id: vote.league_season_id,
      team_id: vote.team_id,
      user_id: vote.user_id,
      vote_count: vote.vote_count,
    });
    setIsEditDialogOpen(true);
  };

  /* ── COMPUTED ── */
  const votes: WinnerVoteStats[] = statsData?.data?.votes || [];
  const totalUserVotes = votes.reduce((s, v) => s + v.user_votes, 0);
  const totalAdminVotes = votes.reduce((s, v) => s + v.admin_votes, 0);
  const totalVotes = votes.reduce((s, v) => s + v.total_votes, 0);
  const topTeam = votes[0];

  /* ── RENDER ── */
  return (
    <div className="adm-root min-h-screen">
      <style>{styles}</style>

      {/* ── PAGE HEADER ── */}
      <header className="adm-header">
        <div className="adm-header-noise" />
        <div className="adm-header-inner container mx-auto px-6 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="adm-eyebrow">Admin Panel · World Cup 2026</p>
              <h1 className="adm-title">
                <Trophy className="adm-title-icon" />
                Vote Management
              </h1>
              <p className="adm-subtitle">
                Manage expert weights &amp; monitor prediction statistics
              </p>
            </div>

            {/* Create CTA */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <button className="adm-cta-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expert Vote
                </button>
              </DialogTrigger>
              <DialogContent className="adm-dialog">
                <DialogHeader>
                  <DialogTitle className="adm-dialog-title">
                    Create Expert Vote
                  </DialogTitle>
                  <DialogDescription className="adm-dialog-desc">
                    Assign weighted votes to boost a team's prediction score
                  </DialogDescription>
                </DialogHeader>
                <VoteForm
                  formData={formData}
                  setFormData={setFormData}
                  teamsData={teamsData}
                />
                <DialogFooter className="gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="adm-btn-cancel"
                  >
                    Cancel
                  </Button>
                  <button
                    className="adm-cta-btn adm-cta-btn--sm"
                    onClick={handleCreateVote}
                    disabled={createVoteMutation.isPending}
                  >
                    {createVoteMutation.isPending ? "Creating…" : "Create Vote"}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* ── STAT CARDS ── */}
        <div className="adm-stat-grid">
          <StatCard
            label="Teams"
            value={votes.length}
            sub="with active votes"
            icon={<Trophy className="adm-stat-icon" />}
            color="gold"
          />
          <StatCard
            label="Fan Votes"
            value={totalUserVotes.toLocaleString()}
            sub="from regular users"
            icon={<Users className="adm-stat-icon" />}
            color="blue"
          />
          <StatCard
            label="Expert Votes"
            value={totalAdminVotes.toLocaleString()}
            sub="admin weighted"
            icon={<Award className="adm-stat-icon" />}
            color="purple"
          />
          <StatCard
            label="Total Votes"
            value={totalVotes.toLocaleString()}
            sub="combined predictions"
            icon={<TrendingUp className="adm-stat-icon" />}
            color="green"
          />
        </div>

        {/* ── LEADERBOARD TABLE ── */}
        <section className="adm-table-card">
          <div className="adm-table-header">
            <div>
              <h2 className="adm-section-title">
                <BarChart3 className="h-5 w-5 mr-2 text-[var(--a-gold)]" />
                Vote Breakdown by Team
              </h2>
              <p className="adm-section-sub">
                Fan vs. expert split — sorted by total votes
              </p>
            </div>
            {topTeam && (
              <div className="adm-leader-chip">
                <Flame className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
                <span>
                  Leading: <strong>{topTeam.team_name}</strong>
                </span>
              </div>
            )}
          </div>

          {statsLoading ? (
            <div className="adm-empty">
              <div className="adm-spinner" />
              <p>Loading statistics…</p>
            </div>
          ) : votes.length === 0 ? (
            <div className="adm-empty">
              <ShieldAlert className="h-10 w-10 text-[var(--a-muted)] mb-3" />
              <p>No votes yet. Add an expert vote to get started.</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th className="text-right">Fan Votes</th>
                    <th className="text-right">Expert Votes</th>
                    <th className="text-right">Total</th>
                    <th>Share</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote, i) => {
                    const pct =
                      totalVotes > 0
                        ? ((vote.total_votes / totalVotes) * 100).toFixed(1)
                        : "0";
                    const medal =
                      i === 0
                        ? "🥇"
                        : i === 1
                        ? "🥈"
                        : i === 2
                        ? "🥉"
                        : `#${i + 1}`;

                    return (
                      <tr
                        key={vote.team_id}
                        className={i < 3 ? "adm-row--podium" : ""}
                      >
                        <td>
                          <span className="adm-medal">{medal}</span>
                        </td>
                        <td>
                          <span className="adm-team-name">
                            {vote.team_name}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="adm-votes adm-votes--fan">
                            {vote.user_votes.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="adm-votes adm-votes--expert">
                            {vote.admin_votes.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="adm-votes adm-votes--total">
                            {vote.total_votes.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="adm-bar-wrap">
                            <div className="adm-bar-track">
                              <div
                                className="adm-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="adm-bar-pct">{pct}%</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="adm-actions">
                            <button
                              className="adm-icon-btn adm-icon-btn--edit"
                              onClick={() =>
                                handleEditVote({
                                  id: vote.team_id,
                                  league_season_id:
                                    FIFA_WORLD_CUP_LEAGUE_SEASON_ID,
                                  team_id: vote.team_id,
                                  user_id: 1,
                                  vote_count: vote.admin_votes,
                                } as AdminWinnerVoteData)
                              }
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="adm-icon-btn adm-icon-btn--delete"
                              onClick={() => handleDeleteVote(vote.team_id)}
                              title="Delete"
                              disabled={deleteVoteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="adm-dialog">
          <DialogHeader>
            <DialogTitle className="adm-dialog-title">
              Edit Expert Vote
            </DialogTitle>
            <DialogDescription className="adm-dialog-desc">
              Update the vote weight or team assignment
            </DialogDescription>
          </DialogHeader>
          <VoteForm
            formData={formData}
            setFormData={setFormData}
            teamsData={teamsData}
          />
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="adm-btn-cancel"
            >
              Cancel
            </Button>
            <button
              className="adm-cta-btn adm-cta-btn--sm"
              onClick={handleUpdateVote}
              disabled={updateVoteMutation.isPending}
            >
              {updateVoteMutation.isPending ? "Updating…" : "Update Vote"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: "gold" | "blue" | "purple" | "green";
}) {
  return (
    <div className={`adm-stat-card adm-stat-card--${color}`}>
      <div className="adm-stat-icon-wrap">{icon}</div>
      <div>
        <p className="adm-stat-label">{label}</p>
        <p className="adm-stat-value">{value}</p>
        <p className="adm-stat-sub">{sub}</p>
      </div>
    </div>
  );
}

function VoteForm({
  formData,
  setFormData,
  teamsData,
}: {
  formData: any;
  setFormData: (d: any) => void;
  teamsData: any[];
}) {
  return (
    <div className="space-y-5 py-4">
      <div className="adm-field">
        <Label className="adm-label">Team *</Label>
        <Select
          value={formData.team_id ? formData.team_id.toString() : ""}
          onValueChange={(v) =>
            setFormData({ ...formData, team_id: parseInt(v) })
          }
        >
          <SelectTrigger className="adm-select-trigger">
            <SelectValue placeholder="Select a team…" />
          </SelectTrigger>
          <SelectContent className="adm-select-content">
            {(teamsData || []).map((team: any) => (
              <SelectItem
                key={team.id}
                value={team.id.toString()}
                className="adm-select-item"
              >
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="adm-field">
        <Label className="adm-label">Vote Weight *</Label>
        <Input
          type="number"
          min="0"
          value={formData.vote_count}
          onChange={(e) =>
            setFormData({
              ...formData,
              vote_count: parseInt(e.target.value) || 0,
            })
          }
          className="adm-input"
        />
        <p className="adm-hint">
          Number of votes to assign (e.g., 10, 50, 100)
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --a-bg:       #080f0a;
    --a-bg2:      #0d1810;
    --a-surface:  #111c14;
    --a-border:   #1e2e22;
    --a-gold:     #d4a017;
    --a-gold-l:   #f0c94a;
    --a-green:    #2ecc71;
    --a-blue:     #4a9eff;
    --a-purple:   #b07fff;
    --a-text:     #e8f0ea;
    --a-muted:    #6b8070;
    --a-surface2: #162219;
  }

  .adm-root {
    background: var(--a-bg);
    color: var(--a-text);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── HEADER ── */
  .adm-header {
    position: relative;
    background:
      radial-gradient(ellipse 80% 55% at 30% 0%, #1a4a2a 0%, transparent 65%),
      linear-gradient(180deg, #0b1c10 0%, var(--a-bg) 100%);
    border-bottom: 1px solid var(--a-border);
    overflow: hidden;
  }
  .adm-header-noise {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
  }
  .adm-eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--a-gold);
    font-weight: 500;
    margin-bottom: 0.35rem;
  }
  .adm-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    letter-spacing: 0.05em;
    line-height: 1;
    color: var(--a-text);
    display: flex; align-items: center; gap: 0.6rem;
  }
  .adm-title-icon {
    width: 1em; height: 1em;
    color: var(--a-gold);
    filter: drop-shadow(0 0 8px rgba(212,160,23,0.5));
  }
  .adm-subtitle {
    font-size: 0.9rem;
    color: var(--a-muted);
    margin-top: 0.4rem;
  }

  /* ── CTA BUTTON ── */
  .adm-cta-btn {
    display: inline-flex; align-items: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    background: var(--a-gold);
    color: #080f0a;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.4rem;
    cursor: pointer;
    transition: filter 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .adm-cta-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .adm-cta-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .adm-cta-btn--sm { padding: 0.5rem 1.1rem; font-size: 0.82rem; }

  /* ── STAT GRID ── */
  .adm-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  .adm-stat-card {
    background: var(--a-surface);
    border: 1px solid var(--a-border);
    border-radius: 12px;
    padding: 1.1rem 1.25rem;
    display: flex; align-items: center; gap: 1rem;
    transition: border-color 0.2s;
  }
  .adm-stat-card:hover { border-color: rgba(212,160,23,0.25); }
  .adm-stat-icon-wrap {
    width: 42px; height: 42px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .adm-stat-card--gold .adm-stat-icon-wrap  { background: rgba(212,160,23,0.12); }
  .adm-stat-card--blue .adm-stat-icon-wrap  { background: rgba(74,158,255,0.12); }
  .adm-stat-card--purple .adm-stat-icon-wrap{ background: rgba(176,127,255,0.12); }
  .adm-stat-card--green .adm-stat-icon-wrap { background: rgba(46,204,113,0.12); }
  .adm-stat-card--gold .adm-stat-icon   { color: var(--a-gold); }
  .adm-stat-card--blue .adm-stat-icon   { color: var(--a-blue); }
  .adm-stat-card--purple .adm-stat-icon { color: var(--a-purple); }
  .adm-stat-card--green .adm-stat-icon  { color: var(--a-green); }
  .adm-stat-icon { width: 20px; height: 20px; }
  .adm-stat-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--a-muted);
  }
  .adm-stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 0.04em;
    line-height: 1.1;
    color: var(--a-text);
  }
  .adm-stat-sub { font-size: 0.7rem; color: var(--a-muted); margin-top: 1px; }

  /* ── TABLE CARD ── */
  .adm-table-card {
    background: var(--a-surface);
    border: 1px solid var(--a-border);
    border-radius: 14px;
    overflow: hidden;
  }
  .adm-table-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 0.75rem;
    padding: 1.4rem 1.5rem 1rem;
    border-bottom: 1px solid var(--a-border);
  }
  .adm-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.35rem;
    letter-spacing: 0.06em;
    color: var(--a-text);
    display: flex; align-items: center;
  }
  .adm-section-sub { font-size: 0.78rem; color: var(--a-muted); margin-top: 2px; }
  .adm-leader-chip {
    display: inline-flex; align-items: center;
    font-size: 0.75rem;
    background: rgba(255,160,30,0.1);
    border: 1px solid rgba(255,160,30,0.2);
    color: #ffb84a;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* ── TABLE ── */
  .adm-table-wrap { overflow-x: auto; }
  .adm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .adm-table thead tr {
    border-bottom: 1px solid var(--a-border);
  }
  .adm-table th {
    padding: 0.75rem 1rem;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--a-muted);
    font-weight: 600;
    white-space: nowrap;
  }
  .adm-table td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(30,46,34,0.6);
    vertical-align: middle;
    white-space: nowrap;
  }
  .adm-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-row--podium { background: rgba(212,160,23,0.03); }

  .adm-medal {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 0.95rem;
    color: var(--a-muted);
  }
  .adm-team-name { font-weight: 600; color: var(--a-text); }
  .adm-votes { font-weight: 600; }
  .adm-votes--fan    { color: var(--a-blue); }
  .adm-votes--expert { color: var(--a-purple); }
  .adm-votes--total  { color: var(--a-green); }

  /* progress bar */
  .adm-bar-wrap { display: flex; align-items: center; gap: 0.6rem; min-width: 140px; }
  .adm-bar-track {
    flex: 1; height: 5px;
    background: rgba(255,255,255,0.06);
    border-radius: 999px; overflow: hidden;
  }
  .adm-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #1a4a2a, var(--a-green));
    border-radius: 999px;
    transition: width 0.4s ease;
  }
  .adm-bar-pct {
    font-size: 0.75rem; font-weight: 600;
    color: var(--a-gold-l);
    min-width: 2.5rem; text-align: right;
  }

  /* action buttons */
  .adm-actions { display: flex; justify-content: flex-end; gap: 0.4rem; }
  .adm-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 6px;
    border: 1px solid var(--a-border);
    background: transparent;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .adm-icon-btn--edit  { color: var(--a-muted); }
  .adm-icon-btn--edit:hover  { background: rgba(74,158,255,0.12); border-color: rgba(74,158,255,0.3); color: var(--a-blue); }
  .adm-icon-btn--delete { color: var(--a-muted); }
  .adm-icon-btn--delete:hover { background: rgba(231,76,60,0.12); border-color: rgba(231,76,60,0.3); color: #ff6b5b; }
  .adm-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* empty / loading */
  .adm-empty {
    display: flex; flex-direction: column; align-items: center;
    padding: 3.5rem 1rem; color: var(--a-muted); gap: 0.5rem;
  }
  .adm-spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--a-border);
    border-top-color: var(--a-gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 0.75rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DIALOG ── */
  .adm-dialog {
    background: var(--a-surface) !important;
    border: 1px solid var(--a-border) !important;
    color: var(--a-text) !important;
  }
  .adm-dialog-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    letter-spacing: 0.06em;
    color: var(--a-text);
  }
  .adm-dialog-desc { color: var(--a-muted); font-size: 0.85rem; }

  /* form fields */
  .adm-field { display: flex; flex-direction: column; gap: 0.4rem; }
  .adm-label { font-size: 0.8rem; font-weight: 600; color: var(--a-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .adm-input {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid var(--a-border) !important;
    color: var(--a-text) !important;
    border-radius: 7px;
  }
  .adm-input:focus { border-color: var(--a-gold) !important; outline: none; }
  .adm-hint { font-size: 0.72rem; color: var(--a-muted); }

  .adm-select-trigger {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid var(--a-border) !important;
    color: var(--a-text) !important;
    border-radius: 7px;
  }
  .adm-select-content {
    background: var(--a-surface2) !important;
    border: 1px solid var(--a-border) !important;
    color: var(--a-text) !important;
  }
  .adm-select-item:hover { background: rgba(212,160,23,0.1) !important; }

  .adm-btn-cancel {
    background: transparent !important;
    color: var(--a-muted) !important;
    border: 1px solid var(--a-border) !important;
  }

  @media (max-width: 640px) {
    .adm-stat-grid { grid-template-columns: 1fr 1fr; }
    .adm-bar-wrap  { min-width: 90px; }
  }
`;
