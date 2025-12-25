import { Card, Rarity } from './types';
import { CARD_DATABASE } from '@/data/card-database';

/**
 * 등급별 기본 확률 (가중치)
 */
const BASE_RARITY_WEIGHTS: Record<Rarity, number> = {
    common: 50,      // 50%
    rare: 30,        // 30%
    epic: 15,        // 15%
    legendary: 5,    // 5%
    unique: 0,       // 0% (이벤트 전용)
    commander: 0     // 0% (이벤트 전용)
};

/**
 * 구독 티어별 보너스 (Epic/Legendary 확률 증가)
 */
const TIER_BONUSES: Record<string, { epic: number; legendary: number }> = {
    free: { epic: 0, legendary: 0 },
    pro: { epic: 10, legendary: 5 },      // Epic 25%, Legendary 10%
    ultra: { epic: 15, legendary: 10 }    // Epic 30%, Legendary 15%
};

/**
 * 티어에 따른 등급별 확률 계산
 */
function calculateRarityWeights(tier: string): Record<Rarity, number> {
    const bonus = TIER_BONUSES[tier] || TIER_BONUSES.free;

    // Common과 Rare에서 확률을 빼서 Epic/Legendary에 추가
    const totalBonus = bonus.epic + bonus.legendary;
    const commonReduction = totalBonus * 0.6; // Common에서 60% 차감
    const rareReduction = totalBonus * 0.4;   // Rare에서 40% 차감

    return {
        common: Math.max(0, BASE_RARITY_WEIGHTS.common - commonReduction),
        rare: Math.max(0, BASE_RARITY_WEIGHTS.rare - rareReduction),
        epic: BASE_RARITY_WEIGHTS.epic + bonus.epic,
        legendary: BASE_RARITY_WEIGHTS.legendary + bonus.legendary,
        unique: BASE_RARITY_WEIGHTS.unique,
        commander: BASE_RARITY_WEIGHTS.commander
    };
}

/**
 * 가중치 기반 랜덤 등급 선택
 */
function selectRandomRarity(weights: Record<Rarity, number>): Rarity {
    const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'unique', 'commander'];
    const totalWeight = rarities.reduce((sum, rarity) => sum + weights[rarity], 0);

    let random = Math.random() * totalWeight;

    for (const rarity of rarities) {
        random -= weights[rarity];
        if (random <= 0) {
            return rarity;
        }
    }

    return 'common'; // 폴백
}

/**
 * 특정 등급의 카드 중 랜덤 선택
 */
function selectCardByRarity(rarity: Rarity): Card {
    const cardsOfRarity = CARD_DATABASE.filter(card => card.rarity === rarity);

    if (cardsOfRarity.length === 0) {
        // 해당 등급 카드가 없으면 common으로 폴백
        const commonCards = CARD_DATABASE.filter(card => card.rarity === 'common');
        const template = commonCards[Math.floor(Math.random() * commonCards.length)];
        return createCardFromTemplate(template);
    }

    const template = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    return createCardFromTemplate(template);
}

/**
 * 카드 템플릿에서 실제 카드 인스턴스 생성
 */
function createCardFromTemplate(template: any): Card {
    // 스탯 랜덤 생성 (min~max 범위 내)
    const creativity = Math.floor(Math.random() * (template.baseStats.creativity.max - template.baseStats.creativity.min + 1)) + template.baseStats.creativity.min;
    const accuracy = Math.floor(Math.random() * (template.baseStats.accuracy.max - template.baseStats.accuracy.min + 1)) + template.baseStats.accuracy.min;
    const speed = Math.floor(Math.random() * (template.baseStats.speed.max - template.baseStats.speed.min + 1)) + template.baseStats.speed.min;
    const stability = Math.floor(Math.random() * (template.baseStats.stability.max - template.baseStats.stability.min + 1)) + template.baseStats.stability.min;
    const ethics = Math.floor(Math.random() * (template.baseStats.ethics.max - template.baseStats.ethics.min + 1)) + template.baseStats.ethics.min;

    const stats = {
        creativity,
        accuracy,
        speed,
        stability,
        ethics,
        totalPower: creativity + accuracy + speed + stability + ethics
    };

    const card: Card = {
        id: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: template.id,
        name: template.name,
        ownerId: 'user-001',
        rarity: template.rarity,
        level: 1,
        experience: 0,
        stats,
        acquiredAt: new Date(),
        isLocked: false
    };

    // specialSkill이 있을 때만 추가 (undefined 방지)
    if (template.specialAbility) {
        card.specialSkill = {
            name: template.specialAbility.name,
            description: template.specialAbility.description,
            effect: template.specialAbility.type
        };
    }

    return card;
}

/**
 * 메인 함수: 티어에 따라 랜덤 카드 생성
 */
export function generateRandomCard(tier: string = 'free'): Card {
    const weights = calculateRarityWeights(tier);
    const selectedRarity = selectRandomRarity(weights);
    return selectCardByRarity(selectedRarity);
}

/**
 * 특정 등급의 랜덤 카드 생성 (카드팩용)
 */
export function generateCardByRarity(rarity: Rarity, userId?: string): Card {
    const card = selectCardByRarity(rarity);
    if (userId) {
        card.ownerId = userId;
    }
    return card;
}

/**
 * 등급별 확률 정보 반환 (디버깅/UI용)
 */
export function getRarityProbabilities(tier: string = 'free'): Record<Rarity, number> {
    const weights = calculateRarityWeights(tier);
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

    return {
        common: (weights.common / total) * 100,
        rare: (weights.rare / total) * 100,
        epic: (weights.epic / total) * 100,
        legendary: (weights.legendary / total) * 100,
        unique: (weights.unique / total) * 100,
        commander: (weights.commander / total) * 100
    };
}
