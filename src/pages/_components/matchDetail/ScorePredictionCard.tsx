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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAdminScorePredictions, postScoreOption } from "@/apiConfig/match.api";
import { MatchT, ScorePredictionT } from "@/types/match.type";

interface ScorePredictionCardProps {
  matchId: number;
  match:MatchT;
  scorePredictions?: ScorePredictionT[];
}

const getPredictionType = (homeScore: number, awayScore: number) => {
  if (homeScore > awayScore) return { label: "Home", color: "text-green-500" };
  if (awayScore > homeScore) return { label: "Away", color: "text-red-500" };
  return { label: "Draw", color: "text-blue-500" };
};

export default function ScorePredictionCard({
  matchId,
  match,
  scorePredictions,
}: ScorePredictionCardProps) {
  const queryClient = useQueryClient();
  const [customScore, setCustomScore] = useState({ home: "", away: "" });
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [isScoreVoteDialogOpen, setIsScoreVoteDialogOpen] = useState(false);
  const [selectedScorePrediction, setSelectedScorePrediction] = useState<any>(null);
  const [scoreVoteInput, setScoreVoteInput] = useState("");

  const totalScorePredictions =
    scorePredictions?.reduce((sum, pred) => sum + pred.votes, 0) || 0;

  const scoreMutation = useMutation({
    mutationFn: async ({
      home_score,
      away_score,
    }: {
      home_score: number;
      away_score: number;
    }) => {
      const response = await postScoreOption(matchId, { home_score, away_score });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorePredictions", matchId] });
      setCustomScore({ home: "", away: "" });
      toast.success("Score prediction recorded!");
      setIsScoreDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record score prediction");
    },
  });

  const scoreVoteMutation = useMutation({
    mutationFn: async ({
      home_score,
      away_score,
      vote_count,
    }: {
      home_score: number;
      away_score: number;
      vote_count: number;
    }) => {
      const response = await postAdminScorePredictions(matchId, {
        home_score,
        away_score,
        vote_count,
      });
      if (!response.success) throw new Error(response.error);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["scorePredictions", matchId] });
      await queryClient.refetchQueries({ queryKey: ["scorePredictions", matchId] });
      toast.success("Score prediction votes updated!");
      setScoreVoteInput("");
      setSelectedScorePrediction(null);
      setIsScoreVoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update score prediction votes");
    },
  });

  const handleScoreSubmit = () => {
    if (customScore.home && customScore.away) {
      scoreMutation.mutate({
        home_score: parseInt(customScore.home),
        away_score: parseInt(customScore.away),
      });
    }
  };

  const openScoreVoteDialog = (prediction: any) => {
    setSelectedScorePrediction(prediction);
    const currentAdminVotes = prediction.uu_votes || 0;
    setScoreVoteInput(currentAdminVotes.toString());
    setIsScoreVoteDialogOpen(true);
  };

  const handleScoreVoteSubmit = () => {
    if (!selectedScorePrediction) return;

    if (
      !selectedScorePrediction.home_score &&
      selectedScorePrediction.home_score !== 0
    ) {
      toast.error("Home score is required");
      return;
    }
    if (
      !selectedScorePrediction.away_score &&
      selectedScorePrediction.away_score !== 0
    ) {
      toast.error("Away score is required");
      return;
    }
    if (!scoreVoteInput && scoreVoteInput !== "0") {
      toast.error("Vote count is required");
      return;
    }

    const inputVoteCount = parseInt(scoreVoteInput);
    if (isNaN(inputVoteCount) || inputVoteCount < 0) {
      toast.error("Please enter a valid vote count");
      return;
    }

    scoreVoteMutation.mutate({
      home_score: selectedScorePrediction.home_score,
      away_score: selectedScorePrediction.away_score,
      vote_count: inputVoteCount,
    });

    setIsScoreVoteDialogOpen(false);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">⚽ Score Predictions</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {totalScorePredictions} votes
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Select your predicted final score
      </p>

      {/* Add Score Prediction Dialog */}
      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogTrigger asChild>
          <div
            className="cursor-pointer border rounded-lg p-4 hover:bg-accent transition-colors"
            onClick={() => setIsScoreDialogOpen(true)}
          >
            <p className="text-center text-muted-foreground">
              Click to predict the score
            </p>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Predict the Score</DialogTitle>
            <DialogDescription>
              Enter your predicted final score for this match
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="font-medium">{match.home_team.name}</div>
                <Input
                  type="number"
                  placeholder="0"
                  value={customScore.home}
                  onChange={(e) =>
                    setCustomScore({ ...customScore, home: e.target.value })
                  }
                  className="w-20 text-center text-2xl"
                  min="0"
                />
              </div>
              <div className="text-3xl font-bold">-</div>
              <div className="text-center">
                <div className="font-medium">{match.away_team.name}</div>
                <Input
                  type="number"
                  placeholder="0"
                  value={customScore.away}
                  onChange={(e) =>
                    setCustomScore({ ...customScore, away: e.target.value })
                  }
                  className="w-20 text-center text-2xl"
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsScoreDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleScoreSubmit}
                disabled={!customScore.home || !customScore.away}
              >
                Submit Prediction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Vote Dialog */}
      <Dialog open={isScoreVoteDialogOpen} onOpenChange={setIsScoreVoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Score Prediction</DialogTitle>
            <DialogDescription>
              Set the admin vote count for this score prediction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="font-medium">{match.home_team.name}</div>
                <Input
                  type="number"
                  placeholder="Home score"
                  value={selectedScorePrediction?.home_score ?? ""}
                  onChange={(e) =>
                    setSelectedScorePrediction({
                      ...selectedScorePrediction,
                      home_score:
                        e.target.value === "" ? "" : parseInt(e.target.value),
                    })
                  }
                  className="w-20 text-center text-2xl mt-2"
                  min="0"
                  required
                />
              </div>
              <div className="text-3xl font-bold">-</div>
              <div className="text-center">
                <div className="font-medium">{match.away_team.name}</div>
                <Input
                  type="number"
                  placeholder="Away score"
                  value={selectedScorePrediction?.away_score ?? ""}
                  onChange={(e) =>
                    setSelectedScorePrediction({
                      ...selectedScorePrediction,
                      away_score:
                        e.target.value === "" ? "" : parseInt(e.target.value),
                    })
                  }
                  className="w-20 text-center text-2xl mt-2"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                Current Admin Votes:{" "}
                {selectedScorePrediction?.uu_votes?.toLocaleString() || 0}
              </label>
              <Input
                type="number"
                placeholder="Enter admin vote count (e.g., 5000)"
                value={scoreVoteInput}
                onChange={(e) => setScoreVoteInput(e.target.value)}
                className="mt-2"
                min="0"
                required
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Note: This will replace the current admin vote count
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsScoreVoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScoreVoteSubmit}
                disabled={
                  (!selectedScorePrediction?.home_score &&
                    selectedScorePrediction?.home_score !== 0) ||
                  (!selectedScorePrediction?.away_score &&
                    selectedScorePrediction?.away_score !== 0) ||
                  (!scoreVoteInput && scoreVoteInput !== "0") ||
                  isNaN(parseInt(scoreVoteInput)) ||
                  parseInt(scoreVoteInput) < 0
                }
              >
                Update Votes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Score prediction list */}
      <div className="space-y-2">
        {scorePredictions?.map((pred, idx) => {
          const predType = getPredictionType(pred.home_score, pred.away_score);
          return (
            <div
              key={pred.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => openScoreVoteDialog(pred)}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold">{match.home_team.name}</span>
                <span className="text-2xl font-bold">{pred.home_score}</span>
                <span className="text-muted-foreground">VS</span>
                <span className="text-2xl font-bold">{pred.away_score}</span>
                <span className="font-bold">{match.away_team.name}</span>
              </div>
              <div
                className={`ml-auto text-sm font-medium px-3 py-1 rounded-full ${predType.color} bg-current/10`}
              >
                {predType.label}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{pred.percent}%</div>
                <div className="text-xs text-muted-foreground">
                  {pred.votes.toLocaleString()} votes
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}