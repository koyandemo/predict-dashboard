import { LeagueT } from "@/types/league.type";
import { apiConfig } from "./apiConfig";

export const getAllLeagues = async () => {
  const res = await apiConfig.get("/leagues");
  return res?.data;
};

export const postLeague = async (data: Omit<LeagueT, "id">) => {
  const res = await apiConfig.post("/leagues/key", { ...data });
  return res?.data;
};

export const putLeague = async (id: number, data: LeagueT) => {
  const res = await apiConfig.put(`/leagues/${id}/key`, { ...data });
  return res?.data;
};

export const deleteLeague = async (id: number) => {
    const res = await apiConfig.delete(`/leagues/${id}/key`);
    return res?.data;
}
