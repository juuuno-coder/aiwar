// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    username: string;
                    nickname: string | null;
                    level: number;
                    experience: number;
                    tokens: number;
                    created_at: string;
                    last_login: string;
                };
                Insert: {
                    id?: string;
                    username: string;
                    nickname?: string | null;
                    level?: number;
                    experience?: number;
                    tokens?: number;
                };
                Update: {
                    username?: string;
                    nickname?: string | null;
                    level?: number;
                    experience?: number;
                    tokens?: number;
                    last_login?: string;
                };
            };
            user_stats: {
                Row: {
                    user_id: string;
                    total_battles: number;
                    wins: number;
                    losses: number;
                    win_streak: number;
                    max_win_streak: number;
                    current_streak: number;
                    pvp_rating: number;
                    rank: number | null;
                    cards_enhanced: number;
                    pvp_matches: number;
                    updated_at: string;
                };
            };
            daily_rankings: {
                Row: {
                    id: string;
                    rank: number;
                    user_id: string;
                    username: string;
                    nickname: string | null;
                    pvp_rating: number;
                    wins: number;
                    level: number;
                    ranking_date: string;
                    updated_at: string;
                };
            };
        };
    };
}
