import { MatchWithDetails, ScorePrediction, Comment } from "../interfaces";
import { BaseService, ApiResponse } from "./BaseService";

// Create instance of BaseService
const baseService = new BaseService();

// Get all matches with optional filtering
export const getAllMatches = async (filters?: {
  league_id?: number;
  date?: string;
  status?: string;
}): Promise<ApiResponse<MatchWithDetails[]>> => {
  const queryParams: Record<string, string | number> = {};
  if (filters?.league_id) queryParams.league_id = filters.league_id;
  if (filters?.date) queryParams.date = filters.date;
  if (filters?.status) queryParams.status = filters.status;
  
  return await baseService.getByQuery<MatchWithDetails>('matches', queryParams);
};

// Get a specific match by ID with related data
export const getMatchById = async (id: number): Promise<ApiResponse<MatchWithDetails>> => {
  return await baseService.getById<MatchWithDetails>('matches', id);
};

// Create a new match
export const createMatch = async (matchData: {
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_time: string;
  venue?: string;
  status?: 'scheduled' | 'live' | 'finished' | 'postponed';
  allow_draw?: boolean;
  match_timezone?: string;
  big_match?: boolean;
  derby?: boolean;
  match_type?: 'Normal' | 'Final' | 'Semi-Final' | 'Quarter-Final';
  published?: boolean;
}): Promise<ApiResponse<MatchWithDetails>> => {
  return await baseService.create<MatchWithDetails>('matches', matchData);
};

// Update a match
export const updateMatch = async (
  id: number,
  matchData: {
    league_id?: number;
    home_team_id?: number;
    away_team_id?: number;
    match_date?: string;
    match_time?: string;
    venue?: string;
    status?: 'scheduled' | 'live' | 'finished' | 'postponed';
    allow_draw?: boolean;
    match_timezone?: string;
    big_match?: boolean;
    derby?: boolean;
    match_type?: 'Normal' | 'Final' | 'Semi-Final' | 'Quarter-Final';
    published?: boolean;
  }
): Promise<ApiResponse<MatchWithDetails>> => {
  return await baseService.update<MatchWithDetails>('matches', id, matchData);
};

// Delete a match
export const deleteMatch = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('matches', id);
};

// Get score predictions
export const getScorePredictions = async (matchId: number): Promise<ApiResponse<ScorePrediction[]>> => {
  return await baseService.getByQuery<ScorePrediction>(`matches/${matchId}/predictions`);
};

// Create or update score prediction
export const updateScorePrediction = async (
  matchId: number,
  predictionData: {
    score_pred_id?: number;
    home_score: number;
    away_score: number;
    vote_count?: number;
  }
): Promise<ApiResponse<ScorePrediction>> => {
  try {
    // Always use the admin endpoint for the admin panel
    // If vote_count is provided, use it; otherwise default to 0 for new predictions
    const requestData = {
      score_pred_id: predictionData.score_pred_id,
      home_score: predictionData.home_score,
      away_score: predictionData.away_score,
      vote_count: predictionData.vote_count !== undefined ? predictionData.vote_count : 0
    };
    
    // For admin endpoints, we don't need to send authentication headers
    const result = await baseService.create<ScorePrediction>(
      `matches/${matchId}/predictions/admin-vote-count`, 
      requestData
    );
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update score prediction",
    };
  }
};

// Get comments
export const getComments = async (matchId: number): Promise<ApiResponse<Comment[]>> => {
  return await baseService.getByQuery<Comment>(`matches/${matchId}/comments`);
};

// Create comment
export const createComment = async (
  matchId: number,
  commentData: {
    user_id: number;
    comment_text: string;
  }
): Promise<ApiResponse<Comment>> => {
  return await baseService.create<Comment>(`matches/${matchId}/comments`, commentData);
};

// Get match vote counts (actual vote counts)
export const getMatchVoteCounts = async (matchId: number): Promise<ApiResponse<any>> => {
  try {
    const result = await baseService.getById<any>(`matches/${matchId}/vote-counts`, '');
    return result;
  } catch (error) {
    console.error("Error fetching match vote counts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch match vote counts",
    };
  }
};

// Update match vote counts (actual vote counts)
export const updateMatchVoteCounts = async (
  matchId: number,
  voteData: {
    home_votes: number;
    draw_votes: number;
    away_votes: number;
  }
): Promise<ApiResponse<any>> => {
  try {
    const result = await baseService.create<any>(`matches/${matchId}/vote-counts`, voteData);
    return result;
  } catch (error) {
    console.error("Error updating match vote counts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update match vote counts",
    };
  }
};

// Update admin vote counts
export const updateAdminVoteCounts = async (
  matchId: number,
  voteData: {
    home_votes: number;
    draw_votes: number;
    away_votes: number;
  }
): Promise<ApiResponse<any>> => {
  try {
    // For admin endpoints, we don't need to send authentication headers
    const result = await baseService.create<any>(
      `matches/${matchId}/admin-vote-counts`, 
      voteData
    );
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update admin vote counts",
    };
  }
};

// Get count of matches
export const getMatchesCount = async (): Promise<number> => {
  try {
    const result = await baseService.getAll<MatchWithDetails>('matches');
    return result.success && result.data ? result.data.length : 0;
  } catch (error) {
    console.error("Error fetching matches count:", error);
    return 0;
  }
};