import { UserFilterT, UserT } from "@/types/user.type";
import { apiConfig } from "./apiConfig";

export const getAllUsers = async (filter: UserFilterT) => {
  const res = await apiConfig.get("/users", { params: filter });
  return res?.data;
};

export const createUser = async (
  data: Omit<UserT, "id" | "created_at" | "updated_at">
) => {
  const res = await apiConfig.post("/users/key", { ...data });
  return res?.data;
};

export const updateUser = async (
  data: Omit<UserT, "created_at" | "updated_at">
) => {
  const res = await apiConfig.put(`/users/${data.id}/key`, { ...data });
  return res?.data;
};

export const deleteUser = async (id: number) => {
  const res = await apiConfig.delete(`/users/${id}/key`);
  return res?.data;
};
