import { apiConfig } from "./apiConfig";

export const postLogin = async (email: string, password: string) => {
  const res = await apiConfig.post("/users/login", { email, password });
  return res?.data;
};
