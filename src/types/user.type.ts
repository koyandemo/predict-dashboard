export enum UserRoleEnum {
  "ALL" = "ALL",
  "ADMIN" = "ADMIN",
  "USER" = "USER",
  "SEED" = "SEED",
}
export interface UserT {
  id: number;
  name: string;
  email: string;
  provider: "email" | "google" | string;
  password?: string;
  role: UserRoleEnum;
  avatar_url?: string | "";
  avatar_bg_color?: string | "";
  created_at: Date;
  updated_at: Date;
  team_id: number;
}

export interface LoginUserResT {
  token: string;
  user: UserT;
}

export interface UserFilterT  {
  role?:UserRoleEnum;
  provider?: "email" | "google" | string;
  search?: string;
  page: number;
  limit:number;
}