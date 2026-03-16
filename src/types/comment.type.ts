import { UserT } from "./user.type";

export interface CommentT {
  id: number;
  match_id: number;
  user_id: number;
  user: UserT;
  text: string;
  timestamp: string;
  likes: number;
  dis_likes: number;
  reply_count: number;
  is_replay: boolean;
  parent_id: number;
  has_user_liked: boolean;
}
