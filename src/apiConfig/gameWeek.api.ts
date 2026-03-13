import { apiConfig } from "./apiConfig";

export const getAllGameWeeks = async () => {
  const res = await apiConfig.get("/gameWeeks");
  return res?.data;
};


