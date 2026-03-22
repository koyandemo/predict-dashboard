import { FIFA_WORLD_CUP_LEAGUE_SEASON_ID } from "@/lib/utils";
import { apiConfig } from "./apiConfig";

export const getAllTeamStandings = async () => {
  const res = await apiConfig.get(
    `/team-standings?league_season_id=${FIFA_WORLD_CUP_LEAGUE_SEASON_ID}`
  );
  return res?.data;
};

export const putTeamStandings = async (id: number, data: any) => {
  const res = await apiConfig.put(`/team-standings/${id}`, { ...data });
  return res?.data;
};
