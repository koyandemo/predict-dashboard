import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userName, setUserName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [customScore, setCustomScore] = useState({ home: "", away: "" });

  const matchIdNum = matchId ? parseInt(matchId) : 0;

  // Fetch match details with teams and league
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ["match", matchIdNum],
    queryFn: async () => {
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*, leagues(name), home_team:teams!matches_home_team_id_fkey(name, logo_url, short_code), away_team:teams!matches_away_team_id_fkey(name, logo_url, short_code)")
        .eq("match_id", matchIdNum)
        .single();
      
      if (matchError) throw matchError;
      return matchData;
    },
  });

  // Fetch match outcomes
  const { data: outcomes } = useQuery({
    queryKey: ["outcomes", matchIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_outcomes")
        .select("*")
        .eq("match_id", matchIdNum)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data || { home_win_prob: 0, draw_prob: 0, away_win_prob: 0 };
    },
  });

  // Fetch score predictions
  const { data: scorePredictions } = useQuery({
    queryKey: ["scorePredictions", matchIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("score_predictions")
        .select("*")
        .eq("match_id", matchIdNum)
        .order("vote_count", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ["comments", matchIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("match_id", matchIdNum)
        .order("timestamp", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (voteType: "home" | "draw" | "away") => {
      const currentOutcome = outcomes || { home_win_prob: 33, draw_prob: 33, away_win_prob: 33 };
      
      // Increment the voted option
      const updates = {
        home_win_prob: currentOutcome.home_win_prob + (voteType === "home" ? 1 : 0),
        draw_prob: currentOutcome.draw_prob + (voteType === "draw" ? 1 : 0),
        away_win_prob: currentOutcome.away_win_prob + (voteType === "away" ? 1 : 0),
      };

      // Check if outcome exists
      const { data: existing } = await supabase
        .from("match_outcomes")
        .select("outcome_id")
        .eq("match_id", matchIdNum)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("match_outcomes")
          .update(updates)
          .eq("match_id", matchIdNum);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("match_outcomes")
          .insert({ match_id: matchIdNum, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outcomes", matchIdNum] });
      toast.success("Vote recorded!");
    },
  });

  // Score prediction mutation
  const scoreMutation = useMutation({
    mutationFn: async ({ home, away }: { home: number; away: number }) => {
      // Check if prediction exists
      const { data: existing } = await supabase
        .from("score_predictions")
        .select("*")
        .eq("match_id", matchIdNum)
        .eq("home_score", home)
        .eq("away_score", away)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("score_predictions")
          .update({ vote_count: existing.vote_count + 1 })
          .eq("score_pred_id", existing.score_pred_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("score_predictions")
          .insert({ match_id: matchIdNum, home_score: home, away_score: away, vote_count: 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorePredictions", matchIdNum] });
      setCustomScore({ home: "", away: "" });
      toast.success("Score prediction recorded!");
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!userName.trim() || !commentText.trim()) {
        throw new Error("Please fill in both name and comment");
      }
      
      const { error } = await supabase
        .from("comments")
        .insert({
          match_id: matchIdNum,
          user_id: 1, // Placeholder
          comment_text: `${userName}: ${commentText}`,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", matchIdNum] });
      setCommentText("");
      toast.success("Comment posted!");
    },
  });

  if (matchLoading) return <div className="p-8">Loading...</div>;
  if (!match) return <div className="p-8">Match not found</div>;

  const totalVotes = (outcomes?.home_win_prob || 0) + (outcomes?.draw_prob || 0) + (outcomes?.away_win_prob || 0);
  const homePercent = totalVotes > 0 ? Math.round((outcomes?.home_win_prob || 0) / totalVotes * 100) : 33;
  const drawPercent = totalVotes > 0 ? Math.round((outcomes?.draw_prob || 0) / totalVotes * 100) : 33;
  const awayPercent = totalVotes > 0 ? Math.round((outcomes?.away_win_prob || 0) / totalVotes * 100) : 34;

  const totalScorePredictions = scorePredictions?.reduce((sum, pred) => sum + pred.vote_count, 0) || 0;

  const getPredictionType = (homeScore: number, awayScore: number) => {
    if (homeScore > awayScore) return { label: "Home", color: "text-green-500" };
    if (awayScore > homeScore) return { label: "Away", color: "text-red-500" };
    return { label: "Draw", color: "text-blue-500" };
  };

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
              {totalVotes} votes
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-green-500/10 hover:border-green-500"
              onClick={() => voteMutation.mutate("home")}
            >
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                {match.home_team?.logo_url ? (
                  <img src={match.home_team.logo_url} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-sm font-bold">{match.home_team?.short_code}</span>
                )}
              </div>
              <div className="text-xs font-medium">{match.home_team?.short_code}</div>
              <div className="text-2xl font-bold text-green-500">{homePercent}%</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-muted"
              onClick={() => voteMutation.mutate("draw")}
            >
              <div className="text-sm font-medium text-muted-foreground">Draw</div>
              <div className="text-2xl font-bold">{drawPercent}%</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-blue-500/10 hover:border-blue-500"
              onClick={() => voteMutation.mutate("away")}
            >
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                {match.away_team?.logo_url ? (
                  <img src={match.away_team.logo_url} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-sm font-bold">{match.away_team?.short_code}</span>
                )}
              </div>
              <div className="text-xs font-medium">{match.away_team?.short_code}</div>
              <div className="text-2xl font-bold text-blue-500">{awayPercent}%</div>
            </Button>
          </div>

          {/* Progress bar */}
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-green-500" style={{ width: `${homePercent}%` }} />
            <div className="bg-muted" style={{ width: `${drawPercent}%` }} />
            <div className="bg-blue-500" style={{ width: `${awayPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{match.home_team?.short_code}</span>
            <span>Draw</span>
            <span>{match.away_team?.short_code}</span>
          </div>
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

          {/* Add custom score */}
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Home"
              value={customScore.home}
              onChange={(e) => setCustomScore({ ...customScore, home: e.target.value })}
              className="w-20"
            />
            <span className="font-bold">VS</span>
            <Input
              type="number"
              placeholder="Away"
              value={customScore.away}
              onChange={(e) => setCustomScore({ ...customScore, away: e.target.value })}
              className="w-20"
            />
            <Button
              onClick={() => {
                if (customScore.home && customScore.away) {
                  scoreMutation.mutate({
                    home: parseInt(customScore.home),
                    away: parseInt(customScore.away),
                  });
                }
              }}
              disabled={!customScore.home || !customScore.away}
            >
              Submit
            </Button>
          </div>

          {/* Score prediction list */}
          <div className="space-y-2">
            {scorePredictions?.map((pred, idx) => {
              const percent = totalScorePredictions > 0 ? Math.round((pred.vote_count / totalScorePredictions) * 100) : 0;
              const predType = getPredictionType(pred.home_score, pred.away_score);
              
              return (
                <div key={pred.score_pred_id} className="flex items-center gap-4 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors">
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
