export interface LeagueT {
    id:number;
    name: string;
    country: string;
    slug: string;
    logo_url?: string;
    sort_order?: number;
  }
  
  
  export interface LeagueResponseT {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }