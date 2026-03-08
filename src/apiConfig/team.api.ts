import { apiConfig } from "./apiConfig";
import { TeamT } from "@/types/team.type";

export const getAllTeams = async () => {
  const res = await apiConfig.get("/teams");
  return res?.data;
};

export const postTeam = async (data: Omit<TeamT, "id">) => {
  const res = await apiConfig.post("/teams/key", { ...data });
  return res?.data;
};

export const putTeam = async (id: number, data: TeamT) => {
  const res = await apiConfig.put(`/teams/${id}/key`, { ...data });
  return res?.data;
};

export const deleteTeam = async (id: number) => {
    const res = await apiConfig.delete(`/teams/${id}/key`);
    return res?.data;
}
