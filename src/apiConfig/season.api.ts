import { apiConfig } from "./apiConfig";

export const getAllSeasons = async () => {
  const res = await apiConfig.get("/seasons");
  return res?.data;
};


