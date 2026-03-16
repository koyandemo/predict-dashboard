import { apiConfig } from "./apiConfig";

export interface AdminWinnerVoteData {
  id: number;
  league_season_id: number;
  team_id: number;
  user_id: number;
  vote_count: number;
  team: {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WinnerVoteStats {
  team_id: number;
  team_name: string;
  team_logo: string;
  user_votes: number;
  admin_votes: number;
  total_votes: number;
}

export interface LeagueSeasonVotesResponse {
  league_season: any;
  votes: WinnerVoteStats[];
}

export const getLeagueSeasonVotes = async (leagueSeasonId: number) => {
  const res = await apiConfig.get(
    `/winner-votes/league-season/${leagueSeasonId}`
  );
  return res?.data;
};

export const createAdminVote = async (data: {
  league_season_id: number;
  team_id: number;
  user_id: number;
  vote_count: number;
}) => {
  const res = await apiConfig.post(`/winner-votes/admin/vote`, data);
  return res?.data;
};

export const updateAdminVote = async (
  voteId: number,
  data: { vote_count?: number; team_id?: number }
) => {
  const res = await apiConfig.put(
    `/winner-votes/admin/vote/${voteId}`,
    data
  );
  return res?.data;
};

export const deleteAdminVote = async (voteId: number) => {
  const res = await apiConfig.delete(
    `/winner-votes/admin/vote/${voteId}`
  );
  return res?.data;
};