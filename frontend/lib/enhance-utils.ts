// 카드 강화 유틸리티 - 10장 소모 시스템

import { Card } from './types';

/**
 * 10장 소모 강화 시스템
 * - 같은 카드 10장을 소모하여 1장을 레벨업
 * - 토큰 비용 추가
 */

/**
 * 강화 비용 계산 (토큰)
 * 등급과 레벨에 따라 증가 (100 ~ 9,900)
 */
export function getEnhanceCost(level: number, rarity: string = 'common', discountPercentage: number = 0): number {
    const rarityMultipliers: Record<string, number> = {
        common: 1,
        rare: 3,
        epic: 10,
        legendary: 30,
        unique: 60,
        commander: 100
    };

    const multiplier = rarityMultipliers[rarity] || 1;

    // Base Calculation: (100 * Multiplier) + (Level * 10 * Multiplier)
    // Common Lv.1: 100 + 10 = 110
    // Unique Lv.1: 6000 + 600 = 6600
    // Unique Lv.9: 6000 + 5400 = 11400 (Max 9900 cap logic below)

    let baseCost = 100 * multiplier;
    let levelCost = level * 10 * multiplier;

    let totalCost = baseCost + levelCost;

    // Cap at 9900
    if (totalCost > 9900) totalCost = 9900;

    return Math.floor(totalCost * (1 - discountPercentage / 100));
}

/**
 * 강화 가능 여부 확인
 */
export function canEnhance(
    targetCard: Card,
    materialCards: Card[],
    tokenBalance: number,
    masteryLevel: number = 0
): {
    can: boolean;
    reason?: string;
} {
    if (!targetCard || materialCards.length === 0) {
        return { can: false, reason: '강화할 카드와 재료 카드를 선택해주세요.' };
    }

    // 최대 강화 레벨 체크 (숙달 2레벨당 +1 상한 돌파)
    const baseMaxLevel = 10;
    const bonusMaxLevel = Math.floor(masteryLevel / 2);
    const currentMaxLevel = baseMaxLevel + bonusMaxLevel;

    if ((targetCard.level || 1) >= currentMaxLevel) {
        return { can: false, reason: `현재 최대 강화 레벨(${currentMaxLevel})에 도달했습니다.` };
    }

    // 재료 카드 개수 체크
    if (materialCards.length !== 10) {
        return { can: false, reason: '재료 카드가 10장 필요합니다.' };
    }

    // 대상 카드가 재료에 포함되어 있는지 확인
    if (materialCards.some(card => card.id === targetCard.id)) {
        return { can: false, reason: '강화 대상 카드는 재료로 사용할 수 없습니다.' };
    }

    // 토큰 체크
    if (tokenBalance < getEnhanceCost(targetCard.level || 1, targetCard.rarity || 'common')) {
        return { can: false, reason: '토큰이 부족합니다.' };
    }

    return { can: true };
}

/**
 * 강화 시 스탯 증가량 계산
 * Mastery 레벨에 따라 높은 수치(+3)가 나올 확률이 증가함
 */
export function calculateEnhancedStats(card: Card, masteryLevel: number = 0): Card['stats'] {
    // Mastery 레벨에 따른 +3 가중치 계산 (Lv.0: 15% ~ Lv.9: 55%)
    const p3 = 0.15 + (masteryLevel * 0.044); // 레벨당 약 4.4% 증가
    const p2 = 0.35 - (masteryLevel * 0.01);  // 레벨당 1%씩 미세 조절
    // p1 = 1 - p3 - p2 (나머지)

    const getRandomStatInc = () => {
        const rand = Math.random();
        if (rand < p3) return 3;
        if (rand < p3 + p2) return 2;
        return 1;
    };

    const incEfficiency = getRandomStatInc();
    const incCreativity = getRandomStatInc();
    const incFunction = getRandomStatInc();

    const newEfficiency = (card.stats.efficiency || 0) + incEfficiency;
    const newCreativity = (card.stats.creativity || 0) + incCreativity;
    const newFunction = (card.stats.function || 0) + incFunction;

    const calculatedTotalPower = newEfficiency + newCreativity + newFunction;

    return {
        ...card.stats,
        efficiency: newEfficiency,
        creativity: newCreativity,
        function: newFunction,
        totalPower: calculatedTotalPower
    };
}

/**
 * 카드 강화 실행
 */
export function enhanceCard(
    targetCard: Card,
    materialCards: Card[],
    masteryLevel: number = 0
): Card {
    const newLevel = (targetCard.level || 1) + 1;
    // Mastery 레벨을 전달하여 가중치 적용된 스탯 계산
    const newStats = calculateEnhancedStats(targetCard, masteryLevel);

    return {
        ...targetCard,
        level: newLevel,
        stats: newStats,
        experience: 0
    };
}

/**
 * 강화 미리보기
 */
export function getEnhancePreview(card: Card, masteryLevel: number = 0): {
    currentLevel: number;
    nextLevel: number;
    currentStats: Card['stats'];
    nextStats: Card['stats'];
    cost: number;
    materialsNeeded: number;
} {
    return {
        currentLevel: card.level,
        nextLevel: card.level + 1,
        currentStats: card.stats,
        nextStats: calculateEnhancedStats(card, masteryLevel),
        nextStats: calculateEnhancedStats(card, masteryLevel),
        cost: getEnhanceCost(card.level || 1, card.rarity || 'common'),
        materialsNeeded: 10
        materialsNeeded: 10
    };
}

/**
 * 재료 카드 검증
 */
export function validateMaterialCards(
    targetCard: Card,
    materialCards: Card[]
): { valid: boolean; invalidCards: Card[]; reason?: string } {
    const invalidCards: Card[] = [];

    // 대상 카드가 재료에 포함되어 있는지 확인
    if (materialCards.some(card => card.id === targetCard.id)) {
        return {
            valid: false,
            invalidCards: [],
            reason: '강화 대상 카드는 재료로 사용할 수 없습니다.'
        };
    }

    // 같은 등급(Rarity)인지 확인 (templateId 체크 제거)
    materialCards.forEach(card => {
        if (card.rarity !== targetCard.rarity) {
            invalidCards.push(card);
        }
    });

    if (invalidCards.length > 0) {
        return {
            valid: false,
            invalidCards,
            reason: '같은 등급의 카드만 재료로 사용할 수 있습니다.'
        };
    }

    return { valid: true, invalidCards: [] };
}

/**
 * 강화 성공률 계산
 * 기본 성공률: 100% -> 90% (레벨 1->2) ~ 점차 감소
 * 숙달 스탯 보너스 합산
 */
export function getEnhanceSuccessRate(
    targetCard: Card,
    materialCards: Card[],
    masteryBonusPercentage: number = 0
): number {
    const currentLevel = targetCard.level || 1;

    // 기본 성공률 (레벨이 높을수록 실패 확률 증가)
    // Lv 1: 100%, Lv 2: 95%, Lv 3: 90%, ... Lv 9: 60%
    let baseRate = 100 - (currentLevel - 1) * 5;

    // 숙달 연구 보너스 적용
    const totalRate = Math.min(baseRate + masteryBonusPercentage, 100);

    return totalRate;
}
