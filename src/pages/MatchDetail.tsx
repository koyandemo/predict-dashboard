import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMatchById,
  getMatchVotes,
  getScoreOptionsPredictions,
} from "@/apiConfig/match.api";
import { UserRoleEnum } from "@/types/user.type";
import { getAllUsers } from "@/apiConfig/user.api";
import { getMatchComments } from "@/apiConfig/comment.api";
import MatchHeader from "./_components/matchDetail/MatchHeader";
import VotingPanel from "./_components/matchDetail/VotingPanel";
import ScorePredictionCard from "./_components/matchDetail/ScorePredictionCard";
import CommentsSection from "./_components/matchDetail/CommentsSection";

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<any[]>([]);

  const matchIdNum = matchId ? parseInt(matchId) : 0;

  useEffect(() => {
    const fetchSeedUsers = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await getAllUsers({
          role: UserRoleEnum.SEED,
          page: 1,
          limit: 100,
        });
        if (response.success && response.data) {
          setUsers(response.data?.data);
        }
      } catch (error) {}
    };

    const timer = setTimeout(() => {
      fetchSeedUsers();
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const {
    data: match,
    isLoading: matchLoading,
    error: matchError,
  } = useQuery({
    queryKey: ["match", matchIdNum],
    queryFn: async () => {
      const response = await getMatchById(matchIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const {
    data: voteCounts,
    isLoading: voteCountsLoading,
    error: voteCountsError,
  } = useQuery({
    queryKey: ["match-votes", matchIdNum],
    queryFn: async () => {
      const response = await getMatchVotes(matchIdNum);
      if (!response.success) {
        return {
          match_id: matchIdNum,
          home_votes: 0,
          draw_votes: 0,
          away_votes: 0,
          total_votes: 0,
          home_percentage: 0,
          draw_percentage: 0,
          away_percentage: 0,
          u_votes: { home: 0, draw: 0, away: 0, total: 0 },
          uu_votes: { home: 0, draw: 0, away: 0, total: 0 },
        };
      }
      return response.data;
    },
  });

  const { data: scorePredictions } = useQuery({
    queryKey: ["scorePredictions", matchIdNum],
    queryFn: async () => {
      const response = await getScoreOptionsPredictions(matchIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data?.predictions || [];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", matchIdNum],
    queryFn: async () => {
      const response = await getMatchComments(matchIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data?.data || [];
    },
  });

  if (matchLoading || voteCountsLoading)
    return <div className="p-8">Loading...</div>;

  if (matchError) {
    return (
      <div className="p-8 text-red-500">
        Error loading match:{" "}
        {matchError instanceof Error ? matchError.message : "Unknown error"}
      </div>
    );
  }

  if (!match) return <div className="p-8">Match not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to matches
        </Button>

        <MatchHeader match={match} />

        <VotingPanel
          matchId={matchIdNum}
          match={match}
          voteCounts={voteCounts}
        />

        <ScorePredictionCard
          matchId={matchIdNum}
          match={match}
          scorePredictions={scorePredictions}
        />

        <CommentsSection
          matchId={matchIdNum}
          match={match}
          comments={comments}
          users={users}
        />
      </div>
    </div>
  );
}
