export interface UserT {
    id: number;
    name: string;
    email: string;
    provider: "email"|"google"|string;
    password?: string;
    role: "ADMIN" | "USER" |"SEED";
    avatar_url?: string | "";
    avatar_bg_color?: string | "";
    created_at: Date;
    updated_at: Date;
    team_id: number;
  }

export interface LoginUserResT {
    token:string;
    user:UserT;
  }  