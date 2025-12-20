import { League, Team } from "../interfaces";
import { BaseService, ApiResponse } from "./BaseService";

// Create instance of BaseService
const baseService = new BaseService();

// Get all leagues
export const getAllLeagues = async (): Promise<ApiResponse<League[]>> => {
  return await baseService.getAll<League>('leagues');
};

// Get a specific league by ID
export const getLeagueById = async (id: number): Promise<ApiResponse<League>> => {
  return await baseService.getById<League>('leagues', id);
};

// Create a new league
export const createLeague = async (leagueData: { name: string; country: string; logo_url?: string; sort_order?: number }): Promise<ApiResponse<League>> => {
  return await baseService.create<League>('leagues', leagueData);
};

// Update a league
export const updateLeague = async (
  id: number,
  leagueData: { name: string; country: string; logo_url?: string; sort_order?: number }
): Promise<ApiResponse<League>> => {
  return await baseService.update<League>('leagues', id, leagueData);
};

// Delete a league
export const deleteLeague = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('leagues', id);
};

// Team CRUD Operations

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

// Delete a team
export const deleteTeam = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('teams', id);
};

// Get count of leagues
export const getLeaguesCount = async (): Promise<number> => {
  try {
    const result = await baseService.getAll<League>('leagues');
    return result.success && result.data ? result.data.length : 0;
  } catch (error) {
    console.error("Error fetching leagues count:", error);
    return 0;
  }
};

// Get count of teams
export const getTeamsCount = async (): Promise<number> => {
  try {
    const result = await baseService.getAll<Team>('teams');
    return result.success && result.data ? result.data.length : 0;
  } catch (error) {
    console.error("Error fetching teams count:", error);
    return 0;
  }
};