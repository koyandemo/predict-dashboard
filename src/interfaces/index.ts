/**
 * Entity interfaces for the football prediction admin panel
 * Following SOLID principles:
 * - Interface Segregation Principle: Specific interfaces for each entity
 * - Dependency Inversion Principle: Components depend on abstractions
 */

// Base entity interface
export interface BaseEntity {
  created_at?: string;
  updated_at?: string;
}

// League entity
export interface League extends BaseEntity {
  league_id?: number;
  name: string;
  country: string;
  slug: string;
  logo_url?: string;
}

// Team entity
export interface Team extends BaseEntity {
  team_id?: number;
  name: string;
  short_code: string;
  logo_url?: string;
  country: string;
  team_type?: 'club' | 'country';
}

// Match entity
export interface Match extends BaseEntity {
  match_id?: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  home_score?: number;
  away_score?: number;
  allow_draw?: boolean;
  match_timezone?: string;
  big_match?: boolean;
  derby?: boolean;
  match_type?: 'Normal' | 'Final' | 'Semi-Final' | 'Quarter-Final';
  published?: boolean;
}

// Match with details
export interface MatchWithDetails extends Match {
  home_team?: {
    name: string;
    logo_url: string;
    short_code: string;
  };
  away_team?: {
    name: string;
    logo_url: string;
    short_code: string;
  };
  leagues?: {
    name: string;
  };
}

// Match Vote Count entity
export interface MatchVoteCount extends BaseEntity {
  vote_id?: number;
  match_id: number;
  home_votes: number;
  draw_votes: number;
  away_votes: number;
  total_votes: number;
  home_percentage?: number;
  draw_percentage?: number;
  away_percentage?: number;
}

// Score Prediction entity
export interface ScorePrediction extends BaseEntity {
  score_pred_id?: number;
  match_id: number;
  home_score: number;
  away_score: number;
  vote_count: number;
  user_type?: 'user' | 'admin'; // New field to distinguish between user and admin votes
}

// User entity
export interface User extends BaseEntity {
  user_id?: number;
  name: string;
  email: string;
  provider: 'google' | 'facebook' | 'twitter' | 'email';
  password?: string;
  type: 'user' | 'admin' | 'seed';
  avatar_url?: string;
  avatar_bg_color?: string;
}

// Comment entity
export interface Comment extends BaseEntity {
  comment_id?: number;
  match_id: number;
  user_id: number;
  comment_text: string;
  timestamp: string;
}