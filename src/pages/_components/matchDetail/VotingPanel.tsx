import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAdminMatchVotes } from "@/apiConfig/match.api";

interface VoteCounts {
  home_votes: number;
  draw_votes: number;
  away_votes: number;
  total_votes: number;
  home_percentage: number;
  draw_percentage: number;
  away_percentage: number;
  uu_votes: { home: number; draw: number; away: number; total: number };
}

interface VotingPanelProps {
  matchId: number;
  match: {
    home_team: { name: string };
    away_team: { name: string };
    allow_draw?: boolean;
  };
  voteCounts?: VoteCounts;
}

export default function VotingPanel({
  matchId,
  match,
  voteCounts,
}: VotingPanelProps) {
  const queryClient = useQueryClient();
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [voteInput, setVoteInput] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<
    "home" | "draw" | "away" | null
  >(null);

  const showDraw = match.allow_draw !== false;

  const homeVotes = voteCounts?.home_votes || 0;
  const drawVotes = voteCounts?.draw_votes || 0;
  const awayVotes = voteCounts?.away_votes || 0;
  const totalVotes =
    voteCounts?.total_votes || homeVotes + drawVotes + awayVotes;

  const homePercent =
    voteCounts?.home_percentage !== undefined
      ? parseFloat(voteCounts.home_percentage.toFixed(2))
      : totalVotes > 0
      ? Math.round((homeVotes / totalVotes) * 10000) / 100
      : 0;
  const drawPercent =
    voteCounts?.draw_percentage !== undefined
      ? parseFloat(voteCounts.draw_percentage.toFixed(2))
      : totalVotes > 0
      ? Math.round((drawVotes / totalVotes) * 10000) / 100
      : 0;
  const awayPercent =
    voteCounts?.away_percentage !== undefined
      ? parseFloat(voteCounts.away_percentage.toFixed(2))
      : totalVotes > 0
      ? Math.round((awayVotes / totalVotes) * 10000) / 100
      : 0;

  const matchVoteMutation = useMutation({
    mutationFn: async (voteData: {
      home_votes: number;
      draw_votes: number;
      away_votes: number;
    }) => {
      const response = await postAdminMatchVotes(matchId, voteData);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["match-votes", matchId] });
      await queryClient.refetchQueries({ queryKey: ["match-votes", matchId] });
      toast.success("Votes updated successfully!");
      setVoteInput("");
      setSelectedOutcome(null);
      setIsVoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update vote counts");
    },
  });

  const openVoteDialog = (outcome: "home" | "draw" | "away") => {
    setSelectedOutcome(outcome);
    const currentVotes =
      outcome === "home"
        ? voteCounts?.uu_votes?.home ?? 0
        : outcome === "draw"
        ? voteCounts?.uu_votes?.draw ?? 0
        : voteCounts?.uu_votes?.away ?? 0;
    setVoteInput(currentVotes.toString());
    setIsVoteDialogOpen(true);
  };

  const handleVoteSubmit = () => {
    if (!voteInput || !selectedOutcome) return;

    const voteCount = parseInt(voteInput);
    if (isNaN(voteCount) || voteCount < 0) {
      toast.error("Please enter a valid vote count");
      return;
    }

    const currentAdminHomeVotes = voteCounts?.uu_votes?.home ?? 0;
    const currentAdminDrawVotes = voteCounts?.uu_votes?.draw ?? 0;
    const currentAdminAwayVotes = voteCounts?.uu_votes?.away ?? 0;

    let newHomeVotes = currentAdminHomeVotes;
    let newDrawVotes = currentAdminDrawVotes;
    let newAwayVotes = currentAdminAwayVotes;

    if (selectedOutcome === "home") newHomeVotes = voteCount;
    else if (selectedOutcome === "draw") newDrawVotes = voteCount;
    else newAwayVotes = voteCount;

    matchVoteMutation.mutate({
      home_votes: newHomeVotes,
      draw_votes: newDrawVotes,
      away_votes: newAwayVotes,
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cast Your Vote</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {totalVotes.toLocaleString()} total votes
        </div>
      </div>

      <div
        className={
          showDraw ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-4"
        }
      >
        <div
          className="border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
          onClick={() => openVoteDialog("home")}
        >
          <div className="font-bold text-green-500">{match.home_team.name}</div>
          <div className="text-2xl font-bold mt-2">{homePercent}%</div>
          <div className="text-sm text-muted-foreground">
            {homeVotes.toLocaleString()} votes
          </div>
          <div className="text-xs text-muted-foreground mt-1">Click to vote</div>
        </div>

        {showDraw && (
          <div
            className="border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors bg-white"
            onClick={() => openVoteDialog("draw")}
          >
            <div className="font-bold text-black">Draw</div>
            <div className="text-2xl font-bold mt-2 text-black">{drawPercent}%</div>
            <div className="text-sm text-black/70">
              {drawVotes.toLocaleString()} votes
            </div>
            <div className="text-xs text-black/70 mt-1">Click to vote</div>
          </div>
        )}

        <div
          className="border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
          onClick={() => openVoteDialog("away")}
        >
          <div className="font-bold text-blue-500">{match.away_team.name}</div>
          <div className="text-2xl font-bold mt-2">{awayPercent}%</div>
          <div className="text-sm text-muted-foreground">
            {awayVotes.toLocaleString()} votes
          </div>
          <div className="text-xs text-muted-foreground mt-1">Click to vote</div>
        </div>
      </div>

      {/* Vote Dialog */}
      <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedOutcome === "home" && `Vote for ${match.home_team.name}`}
              {selectedOutcome === "draw" && "Vote for Draw"}
              {selectedOutcome === "away" && `Vote for ${match.away_team.name}`}
            </DialogTitle>
            <DialogDescription>
              Enter the total number of votes (will replace current votes)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Current admin votes:{" "}
                {selectedOutcome === "home"
                  ? (voteCounts?.uu_votes?.home ?? 0).toLocaleString()
                  : selectedOutcome === "draw"
                  ? (voteCounts?.uu_votes?.draw ?? 0).toLocaleString()
                  : (voteCounts?.uu_votes?.away ?? 0).toLocaleString()}
              </label>
              <Input
                type="number"
                placeholder="Enter vote count (e.g., 5000)"
                value={voteInput}
                onChange={(e) => setVoteInput(e.target.value)}
                className="mt-2"
                min="0"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Current distribution: Home {homeVotes.toLocaleString()} (
              {homePercent}%), Draw {drawVotes.toLocaleString()} ({drawPercent}
              %), Away {awayVotes.toLocaleString()} ({awayPercent}%)
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsVoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleVoteSubmit}
                disabled={
                  !voteInput ||
                  isNaN(parseInt(voteInput)) ||
                  parseInt(voteInput) < 0
                }
              >
                Update Votes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress bar */}
      {showDraw && (
        <div className="space-y-2">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-green-500" style={{ width: `${homePercent}%` }} />
            <div className="bg-white" style={{ width: `${drawPercent}%` }} />
            <div className="bg-blue-500" style={{ width: `${awayPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{match.home_team.name}</span>
            <span>Draw</span>
            <span>{match.away_team.name}</span>
          </div>
        </div>
      )}
    </Card>
  );
}