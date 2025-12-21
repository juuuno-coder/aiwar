// 업적 타입 정의

export type AchievementType = 
    | 'first_win'
    | 'win_streak_3'
    | 'win_streak_5'
    | 'win_streak_10'
    | 'collect_faction'
    | 'legendary_card'
    | 'story_chapter'
    | 'total_battles'
    | 'total_fusions'
    | 'total_units';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    type: AchievementType;
    target: number;
    current: number;
    completed: boolean;
    claimed: boolean;
    reward: {
        coins?: number;
        title?: string;
    };
    icon: string;
}

export interface UserAchievements {
    achievements: Achievement[];
    stats: {
        totalWins: number;
        currentWinStreak: number;
        maxWinStreak: number;
        totalBattles: number;
        totalFusions: number;
        totalUnits: number;
        collectedFactions: string[];
        hasLegendary: boolean;
        completedChapters: string[];
    };
}
