import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as matchService from "@/services/matchService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userName, setUserName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [customScore, setCustomScore] = useState({ home: "", away: "" });
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [voteInput, setVoteInput] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<"home" | "draw" | "away" | null>(null);
  const [isScoreVoteDialogOpen, setIsScoreVoteDialogOpen] = useState(false);
  const [selectedScorePrediction, setSelectedScorePrediction] = useState<any>(null);
  const [scoreVoteInput, setScoreVoteInput] = useState("");

  const matchIdNum = matchId ? parseInt(matchId) : 0;

  // Fetch match details with teams and league
  const { data: match, isLoading: matchLoading, error: matchError } = useQuery({
    queryKey: ["match", matchIdNum],
    queryFn: async () => {
      try {
        const response = await matchService.getMatchById(matchIdNum);
        if (!response.success) throw new Error(response.error);
        return response.data;
      } catch (error) {
        console.error('Error fetching match:', error);
        throw error;
      }
    },
  });

  // Fetch match vote counts (actual vote counts)
  const { data: voteCounts, isLoading: voteCountsLoading, error: voteCountsError } = useQuery({
    queryKey: ["voteCounts", matchIdNum],
    queryFn: async () => {
      const response = await matchService.getMatchVoteCounts(matchIdNum);
      if (!response.success) {
        console.error('Vote counts fetch error:', response.error);
        // Return default vote counts if not found or error
        return { 
          match_id: matchIdNum,
          home_votes: 0,
          draw_votes: 0,
          away_votes: 0,
          total_votes: 0,
          home_percentage: 0,
          draw_percentage: 0,
          away_percentage: 0,
          user_votes: { home: 0, draw: 0, away: 0, total: 0 },
          admin_votes: { home: 0, draw: 0, away: 0, total: 0 }
        };
      }
      return response.data;
    },
  });

  // Fetch score predictions
  const { data: scorePredictions } = useQuery({
    queryKey: ["scorePredictions", matchIdNum],
    queryFn: async () => {
      const response = await matchService.getScorePredictions(matchIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data || [];
    },
  });

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ["comments", matchIdNum],
    queryFn: async () => {
      const response = await matchService.getComments(matchIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data || [];
    },
  });

  // Admin vote count mutation (for admin vote counts)
  const voteCountMutation = useMutation({
    mutationFn: async (voteData: { home_votes: number; draw_votes: number; away_votes: number }) => {
      const response = await matchService.updateAdminVoteCounts(matchIdNum, voteData);
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voteCounts", matchIdNum] });
      toast.success("Votes updated successfully!");
      setIsVoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update vote counts");
    },
  });

  // Score prediction mutation
  const scoreMutation = useMutation({
    mutationFn: async ({ home_score, away_score }: { home_score: number; away_score: number }) => {
      const response = await matchService.updateScorePrediction(matchIdNum, {
        home_score,
        away_score
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorePredictions", matchIdNum] });
      setCustomScore({ home: "", away: "" });
      toast.success("Score prediction recorded!");
      setIsScoreDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record score prediction");
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!userName.trim() || !commentText.trim()) {
        throw new Error("Please fill in both name and comment");
      }
      
      const response = await matchService.createComment(matchIdNum, {
        user_id: 1, // Placeholder
        comment_text: `${userName}: ${commentText}`,
      });
      
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", matchIdNum] });
      setCommentText("");
      toast.success("Comment posted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  // Score prediction vote count mutation
  const scoreVoteMutation = useMutation({
    mutationFn: async ({ score_pred_id, home_score, away_score, vote_count }: { score_pred_id?: number; home_score: number; away_score: number; vote_count: number }) => {
      const response = await matchService.updateScorePrediction(matchIdNum, {
        score_pred_id,
        home_score,
        away_score,
        vote_count
      });
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorePredictions", matchIdNum] });
      toast.success("Score prediction votes updated!");
      setIsScoreVoteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update score prediction votes");
    },
  });

  const handleVoteSubmit = () => {
    if (!voteInput || !selectedOutcome) return;
    
    const voteCount = parseInt(voteInput);
    if (isNaN(voteCount) || voteCount <= 0) {
      toast.error("Please enter a valid vote count");
      return;
    }
    
    // Get current admin vote counts from the combined data with safe access
    const currentAdminHomeVotes = voteCounts?.admin_votes?.home ?? 0;
    const currentAdminDrawVotes = voteCounts?.admin_votes?.draw ?? 0;
    const currentAdminAwayVotes = voteCounts?.admin_votes?.away ?? 0;
    
    // Update admin vote counts based on selection
    let newHomeVotes = currentAdminHomeVotes;
    let newDrawVotes = currentAdminDrawVotes;
    let newAwayVotes = currentAdminAwayVotes;
    
    if (selectedOutcome === "home") {
      newHomeVotes += voteCount;
    } else if (selectedOutcome === "draw") {
      newDrawVotes += voteCount;
    } else {
      newAwayVotes += voteCount;
    }
    
    // Update admin vote counts only
    voteCountMutation.mutate({
      home_votes: newHomeVotes,
      draw_votes: newDrawVotes,
      away_votes: newAwayVotes
    });
  };

  const handleScoreSubmit = () => {
    if (customScore.home && customScore.away) {
      scoreMutation.mutate({
        home_score: parseInt(customScore.home),
        away_score: parseInt(customScore.away),
      });
    }
  };

  const openVoteDialog = (outcome: "home" | "draw" | "away") => {
    setSelectedOutcome(outcome);
    setVoteInput("");
    setIsVoteDialogOpen(true);
  };

  const openScoreVoteDialog = (prediction: any) => {
    setSelectedScorePrediction(prediction);
    setScoreVoteInput("");
    setIsScoreVoteDialogOpen(true);
  };

  const handleScoreVoteSubmit = () => {
    if (!selectedScorePrediction) {
      return;
    }
    
    // Validate that all required fields are filled
    if (!selectedScorePrediction.home_score && selectedScorePrediction.home_score !== 0) {
      toast.error("Home score is required");
      return;
    }
    
    if (!selectedScorePrediction.away_score && selectedScorePrediction.away_score !== 0) {
      toast.error("Away score is required");
      return;
    }
    
    if (!scoreVoteInput) {
      toast.error("Vote count is required");
      return;
    }
    
    const inputVoteCount = parseInt(scoreVoteInput);
    if (isNaN(inputVoteCount) || inputVoteCount <= 0) {
      toast.error("Please enter a valid vote count");
      return;
    }
    
    // Add the new votes to existing vote count (handle potential undefined values)
    const existingVoteCount = selectedScorePrediction.vote_count || 0;
    const newVoteCount = existingVoteCount + inputVoteCount;
    
    // Update the score prediction with new values and vote count
    scoreVoteMutation.mutate({
      score_pred_id: selectedScorePrediction.score_pred_id,
      home_score: selectedScorePrediction.home_score,
      away_score: selectedScorePrediction.away_score,
      vote_count: newVoteCount
    });
    
    setIsScoreVoteDialogOpen(false);
  };

  if (matchLoading || voteCountsLoading) return <div className="p-8">Loading...</div>;
  
  if (matchError) {
    console.error('Match error:', matchError);
    return <div className="p-8 text-red-500">Error loading match: {matchError instanceof Error ? matchError.message : 'Unknown error'}</div>;
  }
  
  if (!match) return <div className="p-8">Match not found</div>;
  
  if (voteCountsError) {
    console.error('Vote counts error:', voteCountsError);
  }

  // Use vote counts for display with API-calculated percentages
  const homeVotes = voteCounts?.home_votes || 0;
  const drawVotes = voteCounts?.draw_votes || 0;
  const awayVotes = voteCounts?.away_votes || 0;
  const totalVotes = voteCounts?.total_votes || (homeVotes + drawVotes + awayVotes);
  
  // Use API-calculated percentages if available, otherwise calculate from counts
  const homePercent = voteCounts?.home_percentage !== undefined 
    ? voteCounts.home_percentage 
    : (totalVotes > 0 ? Math.round((homeVotes / totalVotes) * 100) : 0);
  const drawPercent = voteCounts?.draw_percentage !== undefined 
    ? voteCounts.draw_percentage 
    : (totalVotes > 0 ? Math.round((drawVotes / totalVotes) * 100) : 0);
  const awayPercent = voteCounts?.away_percentage !== undefined 
    ? voteCounts.away_percentage 
    : (totalVotes > 0 ? Math.round((awayVotes / totalVotes) * 100) : 0);

  const totalScorePredictions = scorePredictions?.reduce((sum, pred) => sum + pred.vote_count, 0) || 0;

  const getPredictionType = (homeScore: number, awayScore: number) => {
    if (homeScore > awayScore) return { label: "Home", color: "text-green-500" };
    if (awayScore > homeScore) return { label: "Away", color: "text-red-500" };
    return { label: "Draw", color: "text-blue-500" };
  };

  // Determine if draw should be shown
  const showDraw = match.allow_draw !== false;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to matches
        </Button>

        {/* League badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {match.leagues?.name}
          </span>
        </div>

        {/* Match header */}
        <div className="flex items-center justify-center gap-8 py-8">
          <div className="text-center space-y-2">
            <div className="w-24 h-24 mx-auto bg-card rounded-lg p-4 flex items-center justify-center">
              {match.home_team?.logo_url ? (
                <img src={match.home_team.logo_url} alt={match.home_team.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-2xl font-bold">{match.home_team?.short_code}</div>
              )}
            </div>
            <div className="font-semibold text-lg">{match.home_team?.name}</div>
            <div className="text-sm text-muted-foreground">Home</div>
          </div>

          <div className="text-4xl font-bold text-muted-foreground">VS</div>

          <div className="text-center space-y-2">
            <div className="w-24 h-24 mx-auto bg-card rounded-lg p-4 flex items-center justify-center">
              {match.away_team?.logo_url ? (
                <img src={match.away_team.logo_url} alt={match.away_team.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-2xl font-bold">{match.away_team?.short_code}</div>
              )}
            </div>
            <div className="font-semibold text-lg">{match.away_team?.name}</div>
            <div className="text-sm text-muted-foreground">Away</div>
          </div>
        </div>

        {/* Match details */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div>📅 {new Date(match.match_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
          <div>🕐 {match.match_time}</div>
          <div>📍 {match.venue}</div>
        </div>

        {/* Voting section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cast Your Vote</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {totalVotes.toLocaleString()} total votes
            </div>
          </div>

          {/* Voting cards */}
          <div className={showDraw ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-4"}>
            <div 
              className="border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() => openVoteDialog("home")}
            >
              <div className="font-bold text-green-500">{match.home_team?.short_code}</div>
              <div className="text-2xl font-bold mt-2">{homePercent}%</div>
              <div className="text-sm text-muted-foreground">{homeVotes.toLocaleString()} votes</div>
              <div className="text-xs text-muted-foreground mt-1">Click to vote</div>
            </div>
            
            {showDraw && (
              <div 
                className="border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors bg-white"
                onClick={() => openVoteDialog("draw")}
              >
                <div className="font-bold text-black">Draw</div>
                <div className="text-2xl font-bold mt-2 text-black">{drawPercent}%</div>
                <div className="text-sm text-black/70">{drawVotes.toLocaleString()} votes</div>
                <div className="text-xs text-black/70 mt-1">Click to vote</div>
              </div>
            )}
            
            <div 
              className="border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() => openVoteDialog("away")}
            >
              <div className="font-bold text-blue-500">{match.away_team?.short_code}</div>
              <div className="text-2xl font-bold mt-2">{awayPercent}%</div>
              <div className="text-sm text-muted-foreground">{awayVotes.toLocaleString()} votes</div>
              <div className="text-xs text-muted-foreground mt-1">Click to vote</div>
            </div>
          </div>

          {/* Vote Dialog */}
          <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedOutcome === "home" && `Vote for ${match.home_team?.short_code}`}
                  {selectedOutcome === "draw" && "Vote for Draw"}
                  {selectedOutcome === "away" && `Vote for ${match.away_team?.short_code}`}
                </DialogTitle>
                <DialogDescription>
                  Enter the number of votes you want to add
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Current votes: {
                      selectedOutcome === "home" ? homeVotes.toLocaleString() : 
                      selectedOutcome === "draw" ? drawVotes.toLocaleString() : 
                      awayVotes.toLocaleString()
                    }
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter vote count (e.g., 5000)"
                    value={voteInput}
                    onChange={(e) => setVoteInput(e.target.value)}
                    className="mt-2"
                    min="1"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Current distribution: Home {homeVotes.toLocaleString()} ({homePercent}%), Draw {drawVotes.toLocaleString()} ({drawPercent}%), Away {awayVotes.toLocaleString()} ({awayPercent}%)
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsVoteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleVoteSubmit}
                    disabled={!voteInput || isNaN(parseInt(voteInput)) || parseInt(voteInput) <= 0}
                  >
                    Add Votes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Progress bar - hidden when draw is not allowed */}
          {showDraw && (
            <div className="space-y-2">
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-green-500" style={{ width: `${homePercent}%` }} />
                <div className="bg-white" style={{ width: `${drawPercent}%` }} />
                <div className="bg-blue-500" style={{ width: `${awayPercent}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{match.home_team?.short_code}</span>
                <span>Draw</span>
                <span>{match.away_team?.short_code}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Score predictions */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">⚽ Score Predictions</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {totalScorePredictions} votes
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Select your predicted final score</p>

          {/* Dialog Trigger for Score Prediction */}
          <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
            <DialogTrigger asChild>
              <div 
                className="cursor-pointer border rounded-lg p-4 hover:bg-accent transition-colors"
                onClick={() => setIsScoreDialogOpen(true)}
              >
                <p className="text-center text-muted-foreground">Click to predict the score</p>
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
                    <div className="font-medium">{match.home_team?.short_code}</div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={customScore.home}
                      onChange={(e) => setCustomScore({ ...customScore, home: e.target.value })}
                      className="w-20 text-center text-2xl"
                      min="0"
                    />
                  </div>
                  <div className="text-3xl font-bold">-</div>
                  <div className="text-center">
                    <div className="font-medium">{match.away_team?.short_code}</div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={customScore.away}
                      onChange={(e) => setCustomScore({ ...customScore, away: e.target.value })}
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
                <DialogTitle>
                  Update Score Prediction
                </DialogTitle>
                <DialogDescription>
                  Add votes to this score prediction
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="font-medium">{match.home_team?.short_code}</div>
                    <Input
                      type="number"
                      placeholder="Home score"
                      value={selectedScorePrediction?.home_score ?? ""}
                      onChange={(e) => setSelectedScorePrediction({...selectedScorePrediction, home_score: e.target.value === "" ? "" : parseInt(e.target.value)})}
                      className="w-20 text-center text-2xl mt-2"
                      min="0"
                      required
                    />
                  </div>
                  <div className="text-3xl font-bold">-</div>
                  <div className="text-center">
                    <div className="font-medium">{match.away_team?.short_code}</div>
                    <Input
                      type="number"
                      placeholder="Away score"
                      value={selectedScorePrediction?.away_score ?? ""}
                      onChange={(e) => setSelectedScorePrediction({...selectedScorePrediction, away_score: e.target.value === "" ? "" : parseInt(e.target.value)})}
                      className="w-20 text-center text-2xl mt-2"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Current Votes: {selectedScorePrediction?.vote_count?.toLocaleString() || 0}
                  </label>
                  <Input
                    type="number"
                    placeholder="Add votes (e.g., 5000)"
                    value={scoreVoteInput}
                    onChange={(e) => setScoreVoteInput(e.target.value)}
                    className="mt-2"
                    min="1"
                    required
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Note: Votes will be added to the current count
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsScoreVoteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleScoreVoteSubmit}
                    disabled={!selectedScorePrediction?.home_score && selectedScorePrediction?.home_score !== 0 || 
                              !selectedScorePrediction?.away_score && selectedScorePrediction?.away_score !== 0 ||
                              !scoreVoteInput || isNaN(parseInt(scoreVoteInput)) || parseInt(scoreVoteInput) <= 0}
                  >
                    Add Votes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Score prediction list */}
          <div className="space-y-2">
           
            {scorePredictions?.map((pred, idx) => {
              const percent = totalScorePredictions > 0 ? Math.round((pred.vote_count / totalScorePredictions) * 100) : 0;
              const predType = getPredictionType(pred.home_score, pred.away_score);
               {/* i want to add  user vote dialog when click this card show input dialog */}
              return (
                <div 
                  key={pred.score_pred_id} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => openScoreVoteDialog(pred)}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold">{match.home_team?.short_code}</span>
                    <span className="text-2xl font-bold">{pred.home_score}</span>
                    <span className="text-muted-foreground">VS</span>
                    <span className="text-2xl font-bold">{pred.away_score}</span>
                    <span className="font-bold">{match.away_team?.short_code}</span>
                  </div>
                  <div className={`ml-auto text-sm font-medium px-3 py-1 rounded-full ${predType.color} bg-current/10`}>
                    {predType.label}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{percent}%</div>
                    <div className="text-xs text-muted-foreground">{pred.vote_count.toLocaleString()} votes</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Discussion */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Discussion</h2>
            <span className="text-sm text-muted-foreground">({comments?.length || 0} comments)</span>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <Textarea
              placeholder="Share your prediction or thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{commentText.length}/500 characters</span>
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!userName.trim() || !commentText.trim()}
                className="gap-2"
              >
                Post Comment
              </Button>
            </div>
          </div>

          {comments && comments.length > 0 ? (
            <div className="space-y-3 pt-4">
              {comments.map((comment) => (
                <div key={comment.comment_id} className="p-4 rounded-lg bg-card border">
                  <p className="text-sm">{comment.comment_text}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}