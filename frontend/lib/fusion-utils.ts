// 카드 합성 유틸리티 - 3장 소모 시스템

import { Card, Rarity } from './types';
import { generateId } from './utils';

/**
 * 등급 진행 순서
 * common → rare → epic → legendary → unique → commander
 */
const RARITY_PROGRESSION: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'unique', 'commander'];

/**
 * 다음 등급 가져오기
 */
export function getNextRarity(currentRarity: Rarity): Rarity | null {
    const currentIndex = RARITY_PROGRESSION.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex === RARITY_PROGRESSION.length - 1) {
        return null; // 최고 등급이거나 잘못된 등급
    }
    return RARITY_PROGRESSION[currentIndex + 1];
}

/**
 * 합성 비용 계산 (토큰)
 */
export function getFusionCost(rarity: Rarity, discountPercentage: number = 0): number {
    const costs: Record<Rarity, number> = {
        common: 500,
        rare: 2000,
        epic: 5000,
        legendary: 9900, // Max Cost for getting Unique
        unique: 0, // Cannot fuse Unique
        commander: 0 // 군단장은 합성 불가
    };
    const baseCost = costs[rarity] || 0;
    return Math.floor(baseCost * (1 - discountPercentage / 100));
}

/**
 * 합성 가능 여부 확인
 */
export function canFuse(
    materialCards: Card[],
    userTokens: number
): { canFuse: boolean; reason?: string; nextRarity?: Rarity } {
    // 재료 카드 개수 체크
    if (materialCards.length !== 3) {
        return { canFuse: false, reason: '재료 카드가 3장 필요합니다.' };
    }

    // 강화되지 않은 카드만 합성 가능 (레벨 1)
    const hasEnhancedCard = materialCards.some(card => card.level && card.level > 1);
    if (hasEnhancedCard) {
        return { canFuse: false, reason: '강화되지 않은 카드(레벨 1)만 합성할 수 있습니다.' };
    }

    // 모두 같은 등급인지 확인
    const firstRarity = materialCards[0].rarity;
    const allSameRarity = materialCards.every(card => card.rarity === firstRarity);

    if (!allSameRarity) {
        return { canFuse: false, reason: '같은 등급의 카드만 합성할 수 있습니다.' };
    }

    // 유니크/군단장 등급은 합성 불가
    if (firstRarity === 'unique' || firstRarity === 'commander') {
        return { canFuse: false, reason: '유니크/군단장 등급은 합성 재료로 사용할 수 없습니다.' };
    }

    // 다음 등급 확인
    const nextRarity = getNextRarity(firstRarity!);
    if (!nextRarity) {
        return { canFuse: false, reason: '이미 최고 등급입니다.' };
    }

    // 합성 제한: 전설 등급까지만 생성 가능 (결과물이 유니크 이상이면 불가)
    if (nextRarity === 'unique' || nextRarity === 'commander') {
        return {
            canFuse: false,
            reason: '합성으로는 전설 등급까지만 획득 가능합니다. 유니크 제작은 [유니크 생성] 메뉴를 이용해주세요.'
        };
    }

    // 토큰 체크
    const cost = getFusionCost(firstRarity!);
    if (userTokens < cost) {
        return { canFuse: false, reason: `토큰이 부족합니다. (필요: ${cost})` };
    }

    return { canFuse: true, nextRarity };
}

/**
 * 합성 시 스탯 계산
 * 재료 카드 3장의 평균 스탯 + 등급 보너스
 */
export function calculateFusedStats(materialCards: Card[]): Card['stats'] {
    // 평균 스탯 계산 (New & Legacy)
    const count = materialCards.length;
    const avgStats = {
        efficiency: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.efficiency || 0), 0) / count),
        creativity: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.creativity || 0), 0) / count),
        function: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.function || 0), 0) / count),

        // Legacy
        accuracy: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.accuracy || 0), 0) / count),
        speed: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.speed || 0), 0) / count),
        stability: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.stability || 0), 0) / count),
        ethics: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.ethics || 0), 0) / count)
    };

    // 등급 상승 보너스 (20% 증가)
    const multiplier = 1.2;

    const newEfficiency = Math.floor(avgStats.efficiency * multiplier);
    const newCreativity = Math.floor(avgStats.creativity * multiplier);
    const newFunction = Math.floor(avgStats.function * multiplier);

    // Total Power Recalculation
    const newTotalPower = newEfficiency + newCreativity + newFunction;
    const legacyTotalPower = Math.floor(
        (avgStats.creativity + avgStats.accuracy + avgStats.speed +
            avgStats.stability + avgStats.ethics) * multiplier
    );

    return {
        efficiency: newEfficiency,
        creativity: newCreativity,
        function: newFunction,

        accuracy: Math.floor(avgStats.accuracy * multiplier),
        speed: Math.floor(avgStats.speed * multiplier),
        stability: Math.floor(avgStats.stability * multiplier),
        ethics: Math.floor(avgStats.ethics * multiplier),

        totalPower: newTotalPower > 0 ? newTotalPower : legacyTotalPower
    };
}

/**
 * 카드 합성 실행
 * - 스탯은 등급 상한선 내에서 랜덤 생성
 * - 타입(효율/창의/기능)은 랜덤 변경 가능
 */
export function fuseCards(
    materialCards: Card[],
    userId: string
): Card {
    const nextRarity = getNextRarity(materialCards[0].rarity!)!;

    // 등급별 스탯 상한선
    const rarityStatLimits: Record<Rarity, { min: number; max: number }> = {
        common: { min: 5, max: 20 },
        rare: { min: 15, max: 35 },
        epic: { min: 30, max: 55 },
        legendary: { min: 50, max: 80 },
        unique: { min: 70, max: 100 },
        commander: { min: 90, max: 120 }
    };

    const limits = rarityStatLimits[nextRarity];
    const randomStat = () => Math.floor(Math.random() * (limits.max - limits.min + 1)) + limits.min;

    // 랜덤 스탯 생성
    const efficiency = randomStat();
    const creativity = randomStat();
    const functionStat = randomStat();

    const newStats: Card['stats'] = {
        efficiency,
        creativity,
        function: functionStat,
        accuracy: 0,
        speed: 0,
        stability: 0,
        ethics: 0,
        totalPower: efficiency + creativity + functionStat
    };

    // 타입 랜덤 결정 (스탯 기반 50% + 완전 랜덤 50%)
    const types = ['EFFICIENCY', 'CREATIVITY', 'FUNCTION'] as const;
    let newType: 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION';

    if (Math.random() < 0.5) {
        // 50% 확률로 가장 높은 스탯의 타입
        if (efficiency >= creativity && efficiency >= functionStat) {
            newType = 'EFFICIENCY';
        } else if (creativity >= efficiency && creativity >= functionStat) {
            newType = 'CREATIVITY';
        } else {
            newType = 'FUNCTION';
        }
    } else {
        // 50% 확률로 완전 랜덤
        newType = types[Math.floor(Math.random() * types.length)];
    }

    // 새 카드 생성 (레벨 1로 리셋)
    const fusedCard: Card = {
        id: generateId(),
        templateId: materialCards[0].templateId, // 첫 번째 카드의 템플릿 사용
        name: materialCards[0].name,
        ownerId: userId,
        level: 1, // 합성 결과는 항상 레벨 1
        experience: 0,
        stats: newStats,
        rarity: nextRarity,
        acquiredAt: new Date(),
        isLocked: false,
        type: newType,
        specialSkill: materialCards[0].specialSkill // 스킬 계승
    };

    return fusedCard;
}

/**
 * 합성 미리보기
 */
export function getFusionPreview(
    materialCards: Card[],
    masteryBonusPercentage: number = 0
): {
    currentRarity: Rarity;
    nextRarity: Rarity | null;
    currentAvgStats: Card['stats'];
    nextStats: Card['stats'];
    cost: number;
    successRate: number;
} {
    const currentRarity = materialCards[0].rarity!;
    const nextRarity = getNextRarity(currentRarity);

    // 합성 성공률 계산 (등급이 높을수록 실패 확률 증가)
    let baseRate = 100;
    if (currentRarity === 'rare') baseRate = 95;
    if (currentRarity === 'epic') baseRate = 85;
    if (currentRarity === 'legendary') baseRate = 70;

    const successRate = Math.min(baseRate + masteryBonusPercentage, 100);

    const avgStats = {
        efficiency: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.efficiency || 0), 0) / 3),
        creativity: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.creativity || 0), 0) / 3),
        function: Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.function || 0), 0) / 3),
        accuracy: 0, speed: 0, stability: 0, ethics: 0, totalPower: 0
    };

    avgStats.totalPower = avgStats.efficiency + avgStats.creativity + avgStats.function;

    if (avgStats.totalPower === 0) {
        // Fallback for legacy display
        avgStats.creativity = Math.floor(materialCards.reduce((sum, c) => sum + (c.stats.creativity || 0), 0) / 3);
        avgStats.totalPower = avgStats.creativity; // Approximate
    }

    return {
        currentRarity,
        nextRarity,
        currentAvgStats: avgStats,
        nextStats: calculateFusedStats(materialCards),
        cost: getFusionCost(currentRarity),
        successRate
    };
}

/**
 * 등급별 한글 이름
 */
export function getRarityName(rarity: Rarity): string {
    const names: Record<Rarity, string> = {
        common: '일반',
        rare: '희귀',
        epic: '영웅',
        legendary: '전설',
        unique: '유니크',
        commander: '군단장'
    };
    return names[rarity] || rarity;
}

/**
 * 등급별 색상
 */
export function getRarityColor(rarity: Rarity): string {
    const colors: Record<Rarity, string> = {
        common: '#9CA3AF', // gray
        rare: '#3B82F6', // blue
        epic: '#A855F7', // purple
        legendary: '#F59E0B', // amber
        unique: '#EF4444', // red
        commander: '#10B981' // emerald
    };
    return colors[rarity] || '#9CA3AF';
}
