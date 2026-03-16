import { LeagueT } from "./league.type";
import { TeamT } from "./team.type";

export type MatchT = {
  id: number;
  kickoff: string;
  timezone: string;
  venue: string;
  slug: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
  type:
    | "NORMAL"
    | "FINAL"
    | "SEMIFINAL"
    | "QUARTERFINAL"
    | "THIRD_PLACE_PLAYOFF"
    | "ROUND_OF_16"
    | "GROUP_STAGE"
    | "FRIENDLY";
  allow_draw: boolean;
  big_match: boolean;
  derby: boolean;
  aggregate_home_score?: number;
  aggregate_away_score?: number;
  home_score: number;
  away_score: number;
  published: boolean;
  home_team_name: string;
  away_team_name: string;
  home_team_id: number;
  away_team_id: number;
  league_id: number;
  home_team: TeamT;
  away_team: TeamT;
  league: LeagueT;
  group_name?: string;
};

export interface ApiMatchT {
  match_id: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_time: string;
  venue: string;
  status: string;
  slug: string;
  home_score?: number;
  away_score?: number;
  allow_draw: boolean;
  match_timezone: string;
  big_match?: boolean;
  derby?: boolean;
  match_type?: string;
  home_team: {
    name: string;
    logo_url: string;
    short_code: string;
  };
  away_team: {
    name: string;
    logo_url: string;
    short_code: string;
  };
  league: {
    name: string;
    country: string;
  };
}

export type MatchFilterT = {
  league_id?: string | null;
  season_id?: string | null;
  gameweek_id?: string|null;
  status?: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "all";
  type?: string;
  group_name?: string|null;
  published?: boolean;
  from?: string;
  to?: string;
  search?: string;
  page: number;
  limit: number;
};

export interface ApiCommentT {
  comment_id: number;
  match_id: number;
  user_id: string;
  comment_text: string;
  timestamp: string;
  parent_comment_id?: number;
  like_count?: number;
  dislike_count?: number;
  reply_count?: number;
}

export interface ScorePredictionT {
  away_score: number;
  home_score: number;
  id: number;
  percent: number;
  current_user_vote: boolean;
  votes: number;
}

export interface MatchSectionT {
  title: string;
  matches: MatchT[];
}
