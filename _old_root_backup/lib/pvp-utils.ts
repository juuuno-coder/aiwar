// PvP 유틸리티 함수

import { PvPPlayer, PvPMatch, PvPRewards, PvPStats, MatchmakingQueue } from './pvp-types';

// ELO 레이팅 계산 상수
const K_FACTOR = 32; // 레이팅 변동 계수
const RATING_DIFFERENCE_THRESHOLD = 400; // 레이팅 차이 임계값

/**
 * ELO 레이팅 기대 승률 계산
 */
function getExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * ELO 레이팅 업데이트
 */
export function updateRating(
    playerRating: number,
    opponentRating: number,
    result: 'win' | 'lose' | 'draw'
): number {
    const expected = getExpectedScore(playerRating, opponentRating);
    const actual = result === 'win' ? 1 : result === 'lose' ? 0 : 0.5;
    const change = Math.round(K_FACTOR * (actual - expected));

    return change;
}

/**
 * 매칭 가능한 상대 찾기 (레벨 및 레이팅 기반)
 */
export function findMatch(
    player: MatchmakingQueue,
    queue: MatchmakingQueue[]
): MatchmakingQueue | null {
    // 레벨 차이 ±3 이내, 레이팅 차이 ±200 이내
    const levelRange = 3;
    const ratingRange = 200;

    const candidates = queue.filter(opponent => {
        if (opponent.playerId === player.playerId) return false;

        const levelDiff = Math.abs(opponent.playerLevel - player.playerLevel);
        const ratingDiff = Math.abs(opponent.playerRating - player.playerRating);

        return levelDiff <= levelRange && ratingDiff <= ratingRange;
    });

    if (candidates.length === 0) return null;

    // 가장 레이팅이 비슷한 상대 선택
    candidates.sort((a, b) => {
        const diffA = Math.abs(a.playerRating - player.playerRating);
        const diffB = Math.abs(b.playerRating - player.playerRating);
        return diffA - diffB;
    });

    return candidates[0];
}

/**
 * PvP 대전 시뮬레이션
 */
export function simulatePvPBattle(
    player1: PvPPlayer,
    player2: PvPPlayer
): { winner: string; player1Power: number; player2Power: number } {
    // 각 플레이어의 총 전투력 계산 (약간의 랜덤 요소 추가)
    const randomFactor1 = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1
    const randomFactor2 = 0.9 + Math.random() * 0.2;

    const player1Power = Math.round(player1.totalPower * randomFactor1);
    const player2Power = Math.round(player2.totalPower * randomFactor2);

    const winner = player1Power > player2Power ? player1.id :
        player2Power > player1Power ? player2.id :
            Math.random() > 0.5 ? player1.id : player2.id; // 동점 시 랜덤

    return { winner, player1Power, player2Power };
}

/**
 * PvP 보상 계산
 */
export function calculatePvPRewards(
    playerLevel: number,
    opponentLevel: number,
    result: 'win' | 'lose' | 'draw',
    ratingChange: number
): PvPRewards {
    let coins = 0;
    let experience = 0;
    const cards: string[] = [];

    if (result === 'win') {
        // 승리 보상
        coins = 500 + (opponentLevel * 50);
        experience = 100 + (opponentLevel * 10);

        // 레이팅 상승 보너스
        if (ratingChange > 20) {
            coins += 200;
            experience += 50;
        }

        // 10% 확률로 보너스 카드
        if (Math.random() < 0.1) {
            cards.push('random'); // 랜덤 카드 플래그
        }
    } else if (result === 'draw') {
        // 무승부 보상
        coins = 200;
        experience = 30;
    } else {
        // 패배 보상 (위로상)
        coins = 100;
        experience = 20;
    }

    return {
        coins,
        experience,
        ratingChange,
        cards: cards.length > 0 ? cards : undefined
    };
}

/**
 * PvP 통계 업데이트
 */
export function updatePvPStats(
    currentStats: PvPStats,
    result: 'win' | 'lose' | 'draw',
    newRating: number
): PvPStats {
    const newStats = { ...currentStats };

    newStats.totalMatches++;

    if (result === 'win') {
        newStats.wins++;
        newStats.currentStreak++;
        if (newStats.currentStreak > newStats.longestWinStreak) {
            newStats.longestWinStreak = newStats.currentStreak;
        }
    } else if (result === 'lose') {
        newStats.losses++;
        newStats.currentStreak = 0;
    } else {
        newStats.draws++;
    }

    newStats.winRate = newStats.totalMatches > 0
        ? Math.round((newStats.wins / newStats.totalMatches) * 100)
        : 0;

    newStats.currentRating = newRating;
    if (newRating > newStats.highestRating) {
        newStats.highestRating = newRating;
    }

    return newStats;
}

/**
 * PvP 통계 초기화
 */
export function initializePvPStats(initialRating: number = 1000): PvPStats {
    return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        currentRating: initialRating,
        highestRating: initialRating,
        currentStreak: 0,
        longestWinStreak: 0
    };
}

/**
 * 대전 기록 저장
 */
export function savePvPHistory(
    matchId: string,
    opponentName: string,
    opponentLevel: number,
    result: 'win' | 'lose' | 'draw',
    ratingChange: number,
    rewards: PvPRewards
): void {
    const history = getPvPHistory();

    history.unshift({
        matchId,
        opponentName,
        opponentLevel,
        result,
        ratingChange,
        rewards,
        timestamp: Date.now()
    });

    // 최대 50개까지만 저장
    if (history.length > 50) {
        history.splice(50);
    }

    localStorage.setItem('pvp-history', JSON.stringify(history));
}

/**
 * 대전 기록 조회
 */
export function getPvPHistory() {
    const data = localStorage.getItem('pvp-history');
    return data ? JSON.parse(data) : [];
}

/**
 * PvP 통계 저장
 */
export function savePvPStats(stats: PvPStats): void {
    localStorage.setItem('pvp-stats', JSON.stringify(stats));
}

/**
 * PvP 통계 조회
 */
export function getPvPStats(): PvPStats {
    const data = localStorage.getItem('pvp-stats');
    return data ? JSON.parse(data) : initializePvPStats();
}
