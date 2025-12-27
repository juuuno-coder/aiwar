// 카드 강화 유틸리티 - 10장 소모 시스템

import { Card } from './types';

/**
 * 10장 소모 강화 시스템
 * - 같은 카드 10장을 소모하여 1장을 레벨업
 * - 토큰 비용 추가
 */

/**
 * 강화 비용 계산 (토큰)
 * 레벨에 따라 증가
 */
export function getEnhanceCost(level: number, discountMultiplier: number = 0): number {
    const baseCost = level * 50;
    return Math.floor(baseCost * (1 - discountMultiplier));
}

/**
 * 강화 가능 여부 확인
 */
export function canEnhance(
    targetCard: Card,
    materialCards: Card[],
    userTokens: number
): { canEnhance: boolean; reason?: string } {
    // 최대 레벨 체크
    if (targetCard.level >= 10) {
        return { canEnhance: false, reason: '이미 최대 레벨입니다.' };
    }

    // 재료 카드 개수 체크
    if (materialCards.length !== 10) {
        return { canEnhance: false, reason: '재료 카드가 10장 필요합니다.' };
    }

    // 같은 카드인지 확인 (templateId 기준)
    const targetTemplateId = targetCard.templateId;
    const allSameCard = materialCards.every(card => card.templateId === targetTemplateId);

    if (!allSameCard) {
        return { canEnhance: false, reason: '같은 종류의 카드만 재료로 사용할 수 있습니다.' };
    }

    // 토큰 체크
    const cost = getEnhanceCost(targetCard.level);
    if (userTokens < cost) {
        return { canEnhance: false, reason: `토큰이 부족합니다. (필요: ${cost})` };
    }

    return { canEnhance: true };
}

/**
 * 강화 시 스탯 증가량 계산
 * 레벨업 시 주요 스탯 (효율, 창의력, 기능) 각각 +1~3 랜덤 증가
 */
export function calculateEnhancedStats(card: Card): Card['stats'] {
    // 3개 스탯 각각 +1 ~ +3 랜덤 증가
    const incEfficiency = Math.floor(Math.random() * 3) + 1;
    const incCreativity = Math.floor(Math.random() * 3) + 1;
    const incFunction = Math.floor(Math.random() * 3) + 1;

    const newEfficiency = (card.stats.efficiency || 0) + incEfficiency;
    const newCreativity = (card.stats.creativity || 0) + incCreativity;
    const newFunction = (card.stats.function || 0) + incFunction;

    // Recalculate Total Power based on new stats
    const calculatedTotalPower = newEfficiency + newCreativity + newFunction;

    return {
        efficiency: newEfficiency,
        creativity: newCreativity,
        function: newFunction,

        // Legacy stats support (maintain existing values)
        accuracy: card.stats.accuracy || 0,
        speed: card.stats.speed || 0,
        stability: card.stats.stability || 0,
        ethics: card.stats.ethics || 0,

        // Use calculated total power
        totalPower: calculatedTotalPower > 0 ? calculatedTotalPower : (card.stats.totalPower + 3), // Fallback

        cost: card.stats.cost
    };
}

/**
 * 카드 강화 실행
 */
export function enhanceCard(
    targetCard: Card,
    materialCards: Card[]
): Card {
    const newLevel = targetCard.level + 1;
    const newStats = calculateEnhancedStats(targetCard);

    return {
        ...targetCard,
        level: newLevel,
        stats: newStats,
        experience: 0 // 경험치 초기화
    };
}

/**
 * 강화 미리보기
 */
export function getEnhancePreview(card: Card): {
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
        nextStats: calculateEnhancedStats(card),
        cost: getEnhanceCost(card.level),
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

    // 같은 templateId인지 확인
    materialCards.forEach(card => {
        if (card.templateId !== targetCard.templateId) {
            invalidCards.push(card);
        }
    });

    if (invalidCards.length > 0) {
        return {
            valid: false,
            invalidCards,
            reason: '같은 종류의 카드만 재료로 사용할 수 있습니다.'
        };
    }

    return { valid: true, invalidCards: [] };
}

/**
 * 강화 성공률 계산 (항상 100%, 하지만 확장 가능)
 */
export function getEnhanceSuccessRate(targetCard: Card, materialCards: Card[]): number {
    // 기본 100% 성공
    let baseRate = 100;

    // 재료 카드의 평균 레벨이 높으면 보너스 (미래 확장용)
    const avgLevel = materialCards.reduce((sum, card) => sum + card.level, 0) / materialCards.length;
    const levelBonus = Math.min(avgLevel * 0.5, 5); // 최대 +5%

    return Math.min(baseRate + levelBonus, 100);
}
