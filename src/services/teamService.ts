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
export const createTeam = async (teamData: { name: string; short_code: string; logo_url?: string; country: string }): Promise<ApiResponse<Team>> => {
  return await baseService.create<Team>('teams', teamData);
};

// Update a team
export const updateTeam = async (
  id: number,
  teamData: { name: string; short_code: string; logo_url?: string; country: string }
): Promise<ApiResponse<Team>> => {
  return await baseService.update<Team>('teams', id, teamData);
};

// Delete a team
export const deleteTeam = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('teams', id);
};