export type MatchT = {
  id: number;
  kickoff: Date;
  venue: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
  slug: string;
  allow_draw: boolean;
  big_match: boolean;
  derby: boolean;
  type: "NORMAL" | "FINAL" | "SEMIFINAL" | "QUARTERFINAL" | "FRIENDLY";
  home_score: number;
  away_score: number;
  published: boolean;

  home_team_id: number;
  away_team_id: number;
  league_id: number;
};
