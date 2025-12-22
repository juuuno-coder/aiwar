// 랭킹 시스템 유틸리티

import { RankingEntry, Season, SeasonReward } from './ranking-types';
import { getPvPStats } from './pvp-utils';

/**
 * 현재 시즌 정보 가져오기
 */
export function getCurrentSeason(): Season {
    const now = Date.now();
    const seasonStart = new Date('2025-12-01').getTime();
    const seasonEnd = new Date('2025-12-31').getTime();

    return {
        id: 'season-1',
        name: '시즌 1: AI 대전의 시작',
        startDate: seasonStart,
        endDate: seasonEnd,
        status: now < seasonStart ? 'upcoming' : now > seasonEnd ? 'ended' : 'active',
        rewards: [
            {
                rankRange: [1, 1],
                coins: 10000,
                cards: 10,
                title: '🏆 그랜드 마스터'
            },
            {
                rankRange: [2, 3],
                coins: 7000,
                cards: 7,
                title: '💎 마스터'
            },
            {
                rankRange: [4, 10],
                coins: 5000,
                cards: 5,
                title: '⭐ 다이아몬드'
            },
            {
                rankRange: [11, 50],
                coins: 3000,
                cards: 3,
                title: '🔷 플래티넘'
            },
            {
                rankRange: [51, 100],
                coins: 2000,
                cards: 2,
                title: '🔶 골드'
            }
        ]
    };
}

/**
 * 모든 시즌 목록 가져오기
 */
export function getAllSeasons(): Season[] {
    return [
        getCurrentSeason(),
        {
            id: 'season-2',
            name: '시즌 2: AI 군단의 부상',
            startDate: new Date('2026-01-01').getTime(),
            endDate: new Date('2026-01-31').getTime(),
            status: 'upcoming',
            rewards: []
        }
    ];
}

/**
 * 시뮬레이션용 랭킹 데이터 생성
 */
export function generateMockRankings(playerRating: number): RankingEntry[] {
    const rankings: RankingEntry[] = [];

    // 플레이어 순위 계산 (레이팅 기반)
    const playerRank = Math.max(1, Math.floor((2000 - playerRating) / 10) + 1);

    // 상위 100명 생성
    for (let i = 1; i <= 100; i++) {
        const isPlayer = i === playerRank;
        const baseRating = 2000 - (i - 1) * 10;
        const rating = isPlayer ? playerRating : baseRating + Math.floor(Math.random() * 10);

        const totalMatches = 50 + Math.floor(Math.random() * 200);
        const winRate = 40 + Math.floor(Math.random() * 40);
        const wins = Math.floor(totalMatches * winRate / 100);
        const losses = totalMatches - wins;

        rankings.push({
            rank: i,
            playerId: isPlayer ? 'player' : `ai-${i}`,
            playerName: isPlayer ? '나' : `플레이어 ${1000 + i}`,
            level: Math.max(1, Math.floor(rating / 100)),
            rating,
            wins,
            losses,
            winRate,
            highestRating: rating + Math.floor(Math.random() * 100)
        });
    }

    return rankings;
}

/**
 * 내 순위 찾기
 */
export function findMyRank(rankings: RankingEntry[]): RankingEntry | null {
    return rankings.find(entry => entry.playerId === 'player') || null;
}

/**
 * 순위별 보상 찾기
 */
export function getRewardForRank(rank: number, season: Season): SeasonReward | null {
    for (const reward of season.rewards) {
        if (rank >= reward.rankRange[0] && rank <= reward.rankRange[1]) {
            return reward;
        }
    }
    return null;
}

/**
 * 랭킹 티어 계산
 */
export function getRankTier(rating: number): {
    tier: string;
    color: string;
    icon: string;
} {
    if (rating >= 2000) {
        return { tier: '그랜드 마스터', color: 'text-yellow-400', icon: '🏆' };
    } else if (rating >= 1800) {
        return { tier: '마스터', color: 'text-purple-400', icon: '💎' };
    } else if (rating >= 1600) {
        return { tier: '다이아몬드', color: 'text-blue-400', icon: '⭐' };
    } else if (rating >= 1400) {
        return { tier: '플래티넘', color: 'text-cyan-400', icon: '🔷' };
    } else if (rating >= 1200) {
        return { tier: '골드', color: 'text-yellow-600', icon: '🔶' };
    } else if (rating >= 1000) {
        return { tier: '실버', color: 'text-gray-400', icon: '⚪' };
    } else {
        return { tier: '브론즈', color: 'text-orange-600', icon: '🟤' };
    }
}

/**
 * 다음 티어까지 필요한 레이팅
 */
export function getRatingToNextTier(currentRating: number): number {
    const tiers = [1000, 1200, 1400, 1600, 1800, 2000];

    for (const tier of tiers) {
        if (currentRating < tier) {
            return tier - currentRating;
        }
    }

    return 0; // 이미 최고 티어
}

/**
 * 랭킹 데이터 저장
 */
export function saveRankings(rankings: RankingEntry[]): void {
    localStorage.setItem('rankings', JSON.stringify(rankings));
}

/**
 * 랭킹 데이터 로드
 */
export function loadRankings(): RankingEntry[] {
    const data = localStorage.getItem('rankings');
    if (data) {
        return JSON.parse(data);
    }

    // 초기 데이터 생성
    const stats = getPvPStats();
    const rankings = generateMockRankings(stats.currentRating);
    saveRankings(rankings);
    return rankings;
}

/**
 * 랭킹 업데이트 (레이팅 변경 시)
 */
export function updateRankings(newRating: number): void {
    const rankings = generateMockRankings(newRating);
    saveRankings(rankings);
}
