import { LoginUserResT } from "@/types/user.type";
import { apiConfig } from "./apiConfig";

export const postLogin = async (
  email: string,
  password: string
): Promise<{ data: LoginUserResT }> => {
  const res = await apiConfig.post("/users/login", { email, password });
  return res?.data;
};
