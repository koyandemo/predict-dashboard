import { apiConfig } from "./apiConfig";
import { MatchT } from "@/types/match.type";

export const getAllMatches = async (filter: any) => {
  const res = await apiConfig.get("/matches", { params: filter });
  return res?.data;
};

export const postMatch = async (data: Omit<MatchT, "id">) => {
  const res = await apiConfig.post("/matches/key", { ...data });
  return res?.data;
};

export const putMatch = async (id: number, data: MatchT) => {
  const res = await apiConfig.put(`/matches/${id}/key`, { ...data });
  return res?.data;
};

export const getMatchById = async (id: number) => {
  const res = await apiConfig.get(`/matches/${id}`);
  return res?.data;
};

export const deleteMatch = async (id: number) => {
  const res = await apiConfig.delete(`/matches/${id}/key`);
  return res?.data;
};

export const getScoreOptionsPredictions = async (matchId: number) => {
  const res = await apiConfig.get(
    `/matches/${matchId}/score-options-predictions`
  );
  return res?.data;
};


export const postScoreOption = async (matchId: number, payload: any) => {
  const res = await apiConfig.post(
    `/matches/${matchId}/score-options/key`,
    payload
  );
  return res?.data;
};

export const putScoreOption = async (matchId: number, payload: any) => {
  const res = await apiConfig.patch(
    `/matches/${matchId}/score-options/key`,
    payload
  );
  return res?.data;
};

export const getMatchVotes = async (matchId: number) => {
  const res = await apiConfig.get(`/matches/${matchId}/admin-match-votes`);
  return res?.data;
};

export const postAdminMatchVotes = async (matchId: number, payload: any) => {
  const res = await apiConfig.post(
    `/matches/${matchId}/update-admin-match-votes`,
    payload
  );
  return res?.data;
};

export const postAdminScorePredictions = async (matchId: number, payload: any) => {
  const res = await apiConfig.post(
    `/matches/${matchId}/update-admin-score-predictions`,
    payload
  );
  return res?.data;
};


// router.post(
//   "/:id/update-admin-score-predictions",
//   updateAdminScorePredictionController
// );

// router.post("/:id/update-admin-match-votes", updateAdminMatchVoteController);
