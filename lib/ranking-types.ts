// 랭킹 시스템 타입 정의

export interface RankingEntry {
    rank: number;
    playerId: string;
    playerName: string;
    level: number;
    rating: number;
    wins: number;
    losses: number;
    winRate: number;
    highestRating: number;
}

export interface Season {
    id: string;
    name: string;
    startDate: number;
    endDate: number;
    status: 'upcoming' | 'active' | 'ended';
    rewards: SeasonReward[];
}

export interface SeasonReward {
    rankRange: [number, number]; // [시작 순위, 끝 순위]
    coins: number;
    cards: number; // 카드 팩 개수
    title?: string; // 칭호
}

export interface LeaderboardFilter {
    season?: string;
    region?: string;
    minLevel?: number;
}
