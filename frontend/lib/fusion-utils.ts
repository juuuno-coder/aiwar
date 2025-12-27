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
export function getFusionCost(rarity: Rarity): number {
    const costs: Record<Rarity, number> = {
        common: 100,
        rare: 200,
        epic: 500,
        legendary: 1000,
        unique: 2000,
        commander: 0 // 군단장은 합성 불가
    };
    return costs[rarity] || 0;
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

    // 모두 같은 등급인지 확인
    const firstRarity = materialCards[0].rarity;
    const allSameRarity = materialCards.every(card => card.rarity === firstRarity);

    if (!allSameRarity) {
        return { canFuse: false, reason: '같은 등급의 카드만 합성할 수 있습니다.' };
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
 */
export function fuseCards(
    materialCards: Card[],
    userId: string
): Card {
    const nextRarity = getNextRarity(materialCards[0].rarity!)!;
    const newStats = calculateFusedStats(materialCards);

    // 타입 결정 (다수결)
    const typeCounts: Record<string, number> = { EFFICIENCY: 0, CREATIVITY: 0, FUNCTION: 0 };
    materialCards.forEach(c => {
        if (c.type) typeCounts[c.type as string] = (typeCounts[c.type as string] || 0) + 1;
    });

    // 가장 많은 타입 찾기
    let winnerType: any = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);

    // 타입이 없거나 레거시인 경우 첫번째 카드 기준
    if (!materialCards.some(c => c.type)) {
        // Fallback logic if types are undefined
        // Actually reroll logic sets type. If undefined, we can default to one based on stats or random.
        winnerType = 'EFFICIENCY';
    }

    // 재료 카드 중 가장 높은 레벨 선택
    const maxLevel = Math.max(...materialCards.map(c => c.level));

    // 새 카드 생성
    const fusedCard: Card = {
        id: generateId(),
        templateId: materialCards[0].templateId, // 첫 번째 카드의 템플릿 사용
        name: materialCards[0].name,
        ownerId: userId,
        level: Math.max(1, maxLevel - 1), // 레벨은 재료 중 최고 -1 (최소 1)
        experience: 0,
        stats: newStats,
        rarity: nextRarity,
        acquiredAt: new Date(),
        isLocked: false,
        type: winnerType as 'EFFICIENCY' | 'CREATIVITY' | 'FUNCTION',
        specialSkill: materialCards[0].specialSkill // 스킬 계승
    };

    return fusedCard;
}

/**
 * 합성 미리보기
 */
export function getFusionPreview(materialCards: Card[]): {
    currentRarity: Rarity;
    nextRarity: Rarity | null;
    currentAvgStats: Card['stats'];
    nextStats: Card['stats'];
    cost: number;
    successRate: number;
} {
    const currentRarity = materialCards[0].rarity!;
    const nextRarity = getNextRarity(currentRarity);

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
        successRate: 100 // 항상 100% 성공
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
