// import { BaseService, ApiResponse } from "./BaseService";

// export interface AdminWinnerVoteData {
//   id: number;
//   league_season_id: number;
//   team_id: number;
//   user_id: number;
//   vote_count: number;
//   team: {
//     id: number;
//     name: string;
//     slug: string;
//     logo_url: string | null;
//   };
//   user: {
//     id: number;
//     name: string;
//     email: string;
//     role: string;
//   };
//   created_at: string;
//   updated_at: string;
// }

// export interface WinnerVoteStats {
//   team_id: number;
//   team_name: string;
//   team_logo: string;
//   user_votes: number;
//   admin_votes: number;
//   total_votes: number;
// }

// interface LeagueSeasonVotesResponse {
//   league_season: any;
//   votes: WinnerVoteStats[];
// }

// // Create instance of BaseService
// const baseService = new BaseService();

// export const getLeagueSeasonVotes = async (
//   leagueSeasonId: number
// ): Promise<ApiResponse<LeagueSeasonVotesResponse>> => {
//   try {
//     const token = localStorage.getItem("authToken");
//     const response = await fetch(`${baseService["baseUrl"]}/winner-votes/league-season/${leagueSeasonId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
//     }

//     const result: ApiResponse<LeagueSeasonVotesResponse> = await response.json();
//     return result;
//   } catch (error: any) {
//     return {
//       success: false,
//       error: error.message || "Failed to fetch winner votes",
//     };
//   }
// };

// export const createAdminVote = async (data: {
//   league_season_id: number;
//   team_id: number;
//   user_id: number;
//   vote_count: number;
// }): Promise<ApiResponse<AdminWinnerVoteData>> => {
//   return await baseService.create<AdminWinnerVoteData>("winner-votes/admin/vote", data);
// };

// export const updateAdminVote = async (
//   voteId: number,
//   data: { vote_count?: number; team_id?: number }
// ): Promise<ApiResponse<AdminWinnerVoteData>> => {
//   return await baseService.update<AdminWinnerVoteData>("winner-votes/admin/vote", voteId, data);
// };

// export const deleteAdminVote = async (
//   voteId: number
// ): Promise<ApiResponse<void>> => {
//   return await baseService.delete("winner-votes/admin/vote", voteId);
// };
