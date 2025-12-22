export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'battle_win' | 'unit_claim' | 'card_fusion' | 'faction_win';
    target: number;
    current: number;
    reward: {
        coins?: number;
        cards?: number;
    };
    completed: boolean;
    claimed: boolean;
}

export interface DailyMissions {
    date: string; // YYYY-MM-DD
    missions: Mission[];
}
