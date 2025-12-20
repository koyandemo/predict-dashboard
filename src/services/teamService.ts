import { Team } from "../interfaces";
import { BaseService, ApiResponse } from "./BaseService";

// Create instance of BaseService
const baseService = new BaseService();

// Get all teams
export const getAllTeams = async (): Promise<ApiResponse<Team[]>> => {
  return await baseService.getAll<Team>('teams');
};

// Get a specific team by ID
export const getTeamById = async (id: number): Promise<ApiResponse<Team>> => {
  return await baseService.getById<Team>('teams', id);
};

// Create a new team
export const createTeam = async (teamData: { name: string; short_code: string; logo_url?: string; country: string; team_type?: 'club' | 'country'; league_id?: number; venue?: string }): Promise<ApiResponse<Team>> => {
  return await baseService.create<Team>('teams', teamData);
};

// Update a team
export const updateTeam = async (
  id: number,
  teamData: { name: string; short_code: string; logo_url?: string; country: string; team_type?: 'club' | 'country'; league_id?: number; venue?: string }
): Promise<ApiResponse<Team>> => {
  return await baseService.update<Team>('teams', id, teamData);
};

// Batch update teams
export const batchUpdateTeams = async (
  teamsData: Array<{ id: number; venue?: string }>
): Promise<ApiResponse<Team[]>> => {
  // For now, we'll update teams individually
  // In a production environment, you might want to implement a proper batch update endpoint
  const results = [];
  for (const team of teamsData) {
    const result = await baseService.update<Team>('teams', team.id, { venue: team.venue });
    if (result.success) {
      results.push(result.data);
    }
  }
  return { success: true, data: results };
};

// Delete a team
export const deleteTeam = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('teams', id);
};