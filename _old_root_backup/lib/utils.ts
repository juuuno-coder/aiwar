// 게임 유틸리티 함수들

import { Rarity, Stats } from './types';
import gameBalanceData from '@/data/game-balance.json';

// 랜덤 숫자 생성 (min ~ max 사이)
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 등급별 확률에 따라 랜덤 등급 선택
export function getRandomRarity(weights: { common: number; rare: number; epic: number; legendary: number }): Rarity {
    const total = weights.common + weights.rare + weights.epic + weights.legendary;
    const random = Math.random() * total;

    let cumulative = 0;

    cumulative += weights.common;
    if (random < cumulative) return 'common';

    cumulative += weights.rare;
    if (random < cumulative) return 'rare';

    cumulative += weights.epic;
    if (random < cumulative) return 'epic';

    return 'legendary';
}

// 등급에 따른 랜덤 능력치 생성
export function generateRandomStats(rarity: Rarity): Stats {
    const ranges = gameBalanceData.statRanges[rarity];

    const creativity = randomInt(ranges.creativity.min, ranges.creativity.max);
    const accuracy = randomInt(ranges.accuracy.min, ranges.accuracy.max);
    const speed = randomInt(ranges.speed.min, ranges.speed.max);
    const stability = randomInt(ranges.stability.min, ranges.stability.max);
    const ethics = randomInt(ranges.ethics.min, ranges.ethics.max);

    const totalPower = creativity + accuracy + speed + stability + ethics;

    return {
        creativity,
        accuracy,
        speed,
        stability,
        ethics,
        totalPower,
    };
}

// 시간 포맷팅 (분 단위 → "00:00" 형식)
export function formatTime(minutes: number): string {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 남은 시간 계산 (밀리초 → 분)
export function getRemainingMinutes(targetTime: Date): number {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    return Math.max(0, diff / 1000 / 60);
}

// UUID 생성
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 랜덤 카드 생성
export function generateCard() {
    const rarity = getRandomRarity({
        common: 60,
        rare: 30,
        epic: 8,
        legendary: 2,
    });

    const stats = generateRandomStats(rarity);

    return {
        id: generateId(),
        templateId: `generated-${generateId()}`,
        ownerId: 'user-001',
        level: 1,
        experience: 0,
        stats,
        acquiredAt: new Date(),
        isLocked: false,
    };
}

// 로컬 스토리지 헬퍼
export const storage = {
    get<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue;

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set(key: string, value: unknown): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },
};

/**
 * 5전 3선승제 전투 시뮬레이션
 * 각 라운드에서 카드 전투력의 끝자리 숫자가 높은 쪽이 승리
 */
export function simulate5RoundBattle(playerCards: any[], enemyCards: any[]) {
    const rounds = [];
    let playerWins = 0;
    let enemyWins = 0;

    // 5라운드 진행
    for (let i = 0; i < 5; i++) {
        const playerCard = playerCards[i];
        const enemyCard = enemyCards[i];

        const playerPower = playerCard.power || playerCard.stats?.totalPower || 0;
        const enemyPower = enemyCard.power || enemyCard.stats?.totalPower || 0;

        // 끝자리 숫자 추출
        const playerLastDigit = playerPower % 10;
        const enemyLastDigit = enemyPower % 10;

        // 승자 결정
        let winner: 'player' | 'enemy' | 'draw';
        if (playerLastDigit > enemyLastDigit) {
            winner = 'player';
            playerWins++;
        } else if (enemyLastDigit > playerLastDigit) {
            winner = 'enemy';
            enemyWins++;
        } else {
            // 끝자리가 같으면 전체 전투력 비교
            if (playerPower > enemyPower) {
                winner = 'player';
                playerWins++;
            } else if (enemyPower > playerPower) {
                winner = 'enemy';
                enemyWins++;
            } else {
                winner = 'draw';
            }
        }

        rounds.push({
            roundNumber: i + 1,
            playerCard,
            enemyCard,
            playerPower,
            enemyPower,
            playerLastDigit,
            enemyLastDigit,
            winner
        });

        // 3승 달성 시 조기 종료
        if (playerWins === 3 || enemyWins === 3) {
            break;
        }
    }

    // 최종 승자 결정
    const finalWinner = playerWins > enemyWins ? 'player' : 'enemy';

    // 보상 계산
    const baseCoins = 300;
    const baseExp = 50;
    const coins = finalWinner === 'player' ? baseCoins : Math.floor(baseCoins * 0.3);
    const experience = finalWinner === 'player' ? baseExp : Math.floor(baseExp * 0.3);

    return {
        rounds,
        playerWins,
        enemyWins,
        finalWinner,
        rewards: {
            coins,
            experience,
            cards: finalWinner === 'player' && Math.random() < 0.1 ? [generateCard()] : []
        }
    };
}
