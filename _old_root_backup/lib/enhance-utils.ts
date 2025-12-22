// 카드 강화 유틸리티

import { Card } from './types';
import { getGameState, updateCard, spendTokens } from './game-state';

/**
 * 강화 비용 계산
 * 레벨 × 50 토큰
 */
export function getEnhanceCost(level: number): number {
    return level * 50;
}

/**
 * 강화 시 능력치 상승량 계산
 */
export function getEnhanceBonus(card: Card): number {
    const currentPower = card.stats?.totalPower || 0;
    // 현재 전투력의 10% 상승
    return Math.floor(currentPower * 0.1);
}

/**
 * 카드 강화 (토큰 사용)
 */
export function enhanceCard(cardId: string): { success: boolean; message: string; card?: Card } {
    const state = getGameState();
    const card = state.inventory.find(c => c.id === cardId);

    if (!card) {
        return { success: false, message: '카드를 찾을 수 없습니다.' };
    }

    const cost = getEnhanceCost(card.level);
    const spendResult = spendTokens(cost);

    if (!spendResult.success) {
        return { success: false, message: '토큰이 부족합니다.' };
    }

    // 최대 레벨 체크
    if (card.level && card.level >= 10) {
        return { success: false, message: '이미 최대 레벨입니다.' };
    }

    // 능력치 상승
    const bonus = getEnhanceBonus(card);
    const newLevel = (card.level || 1) + 1;

    const updatedCard: Card = {
        ...card,
        level: newLevel,
        stats: card.stats ? {
            ...card.stats,
            totalPower: card.stats.totalPower + bonus
        } : card.stats
    };

    // 카드 업데이트
    updateCard(cardId, updatedCard);

    return {
        success: true,
        message: `강화 성공! 레벨 ${newLevel}로 상승했습니다.`,
        card: updatedCard
    };
}

/**
 * 경험치로 카드 강화
 */
export function enhanceCardWithExp(cardId: string, expAmount: number): {
    success: boolean;
    message: string;
    card?: Card;
} {
    const state = getGameState();
    const card = state.inventory.find(c => c.id === cardId);

    if (!card) {
        return { success: false, message: '카드를 찾을 수 없습니다.' };
    }

    const currentExp = card.experience || 0;
    const newExp = currentExp + expAmount;
    const newLevel = Math.floor(newExp / 100) + 1;

    if (newLevel > 10) {
        return { success: false, message: '최대 레벨을 초과할 수 없습니다.' };
    }

    const updatedCard: Card = {
        ...card,
        experience: newExp,
        level: newLevel
    };

    updateCard(cardId, updatedCard);

    return {
        success: true,
        message: `경험치 ${expAmount} 획득!`,
        card: updatedCard
    };
}
