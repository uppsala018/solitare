export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          cash_balance: number;
          gems: number;
          lightning_tokens: number;
          level: number;
          xp: number;
          xp_to_next_level: number;
          royals_tier: boolean;
          royals_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          theme: string;
          prize_pool: number;
          entry_fee: number;
          max_players: number;
          current_players: number;
          ends_at: string;
          multiplier: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>;
      };
      tournament_entries: {
        Row: {
          id: string;
          tournament_id: string;
          user_id: string;
          score: number;
          rank: number | null;
          prize_won: number;
          entered_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tournament_entries']['Row'], 'id' | 'entered_at'>;
        Update: Partial<Database['public']['Tables']['tournament_entries']['Insert']>;
      };
      daily_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_type: string;
          mission_description: string;
          target: number;
          progress: number;
          reward_tokens: number;
          completed: boolean;
          reset_date: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_missions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['daily_missions']['Insert']>;
      };
      card_collections: {
        Row: {
          id: string;
          user_id: string;
          set_name: string;
          cards_collected: number;
          cards_total: number;
          completed: boolean;
          prize_won: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['card_collections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['card_collections']['Insert']>;
      };
      daily_bonus_claims: {
        Row: {
          id: string;
          user_id: string;
          claimed_at: string;
          tokens_awarded: number;
          streak_day: number;
        };
        Insert: Omit<Database['public']['Tables']['daily_bonus_claims']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['daily_bonus_claims']['Insert']>;
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          tournament_id: string | null;
          score: number;
          moves: number;
          time_remaining: number;
          completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['game_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['game_sessions']['Insert']>;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Tournament = Database['public']['Tables']['tournaments']['Row'];
export type TournamentEntry = Database['public']['Tables']['tournament_entries']['Row'];
export type DailyMission = Database['public']['Tables']['daily_missions']['Row'];
export type CardCollection = Database['public']['Tables']['card_collections']['Row'];
export type DailyBonusClaim = Database['public']['Tables']['daily_bonus_claims']['Row'];
export type GameSession = Database['public']['Tables']['game_sessions']['Row'];
