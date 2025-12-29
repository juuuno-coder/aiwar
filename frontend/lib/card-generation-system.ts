import { generateId } from './utils';
import { Card, Rarity } from './types';
import { CARD_DATABASE } from '@/data/card-database';

/**
 * 등급별 기본 확률 (가중치)
 */
const BASE_RARITY_WEIGHTS: Record<Rarity, number> = {
    common: 60,      // 60% (상향)
    rare: 30,        // 30% (유지)
    epic: 9,         // 9% (하향)
    legendary: 1,    // 1% (대폭 하향)
    unique: 0,       // 0% (이벤트 전용)
    commander: 0     // 0% (이벤트 전용)
};

/**
 * 구독 티어별 보너스 (Epic/Legendary 확률 증가)
 */
const TIER_BONUSES: Record<string, { epic: number; legendary: number }> = {
    free: { epic: 0, legendary: 0 },
    pro: { epic: 3, legendary: 0.5 },      // Epic 12%, Legendary 1.5%
    ultra: { epic: 6, legendary: 2 }       // Epic 15%, Legendary 3%
};

/**
 * 티어에 따른 등급별 확률 계산
 */
/**
 * 군단 효과 인터페이스
 */
export interface FactionEffects {
    timeReduction?: number;
    powerBonus?: number;
    fragmentBonus?: number;
    specialAbility?: string;
}

/**
 * 티어 및 친밀도에 따른 등급별 확률 계산
 */
function calculateRarityWeights(tier: string, affinity: number = 0): Record<Rarity, number> {
    const bonus = TIER_BONUSES[tier] || TIER_BONUSES.free;

    // 지휘관 숙련도(Mastery) 보너스: 숙련도 100 달성 시 Epic +5%, Legendary +2% 추가 확률
    // 기존 개별 친밀도(Affinity) 대신 전역 숙련도(Mastery)를 사용합니다.
    const mastery = affinity; // 파라미터 이름은 하위 호환성을 위해 유지하되 로직은 숙련도로 취급
    const masteryEpicBonus = (mastery / 100) * 5;
    const masteryLegendaryBonus = (mastery / 100) * 2;

    // Common과 Rare에서 확률을 빼서 Epic/Legendary에 추가
    const totalBonus = bonus.epic + bonus.legendary + masteryEpicBonus + masteryLegendaryBonus;
    const commonReduction = totalBonus * 0.6; // Common에서 60% 차감
    const rareReduction = totalBonus * 0.4;   // Rare에서 40% 차감

    return {
        common: Math.max(0, BASE_RARITY_WEIGHTS.common - commonReduction),
        rare: Math.max(0, BASE_RARITY_WEIGHTS.rare - rareReduction),
        epic: BASE_RARITY_WEIGHTS.epic + bonus.epic + masteryEpicBonus,
        legendary: BASE_RARITY_WEIGHTS.legendary + bonus.legendary + masteryLegendaryBonus,
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
 * 특정 등급의 카드 중 랜덤 선택 (군단 효과 적용 가능)
 */
function selectCardByRarity(rarity: Rarity, factionEffects?: FactionEffects, researchBonuses?: ResearchBonuses): Card {
    const cardsOfRarity = CARD_DATABASE.filter(card => card.rarity === rarity);

    if (cardsOfRarity.length === 0) {
        // 해당 등급 카드가 없으면 common으로 폴백
        const commonCards = CARD_DATABASE.filter(card => card.rarity === 'common');
        const template = commonCards[Math.floor(Math.random() * commonCards.length)];
        return createCardFromTemplate(template, factionEffects, researchBonuses);
    }

    const template = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    return createCardFromTemplate(template, factionEffects, researchBonuses);
}

/**
 * 카드 템플릿에서 실제 카드 인스턴스 생성
 */
const RARITY_POWER_RANGES: Record<string, { min: number, max: number }> = {
    common: { min: 40, max: 60 },
    rare: { min: 50, max: 70 },      // Changed from 60~70
    epic: { min: 60, max: 80 },      // Changed from 70~80
    legendary: { min: 70, max: 90 }, // Changed from 80~100
    unique: { min: 80, max: 90 },    // Changed from 80~100
    commander: { min: 80, max: 90 }  // Changed from 80~100
};

export interface ResearchBonuses {
    efficiency?: number; // Level
    creativity?: number; // Level (Insight)
    function?: number;   // Level (Mastery)
}

export function createCardFromTemplate(template: any, factionEffects?: FactionEffects, researchBonuses?: ResearchBonuses): Card {
    const rarity = template.rarity || 'common';
    const powerRange = RARITY_POWER_RANGES[rarity.toLowerCase()] || RARITY_POWER_RANGES.common;

    // 1. 총 전투력 결정 (군단 효과 + 유행 효과 적용)
    // powerBonus가 0.2면 20% 증가
    let totalMultiplier = 1 + (factionEffects?.powerBonus || 0);

    // 유행 효과 적용 (트렌드)
    const { getCurrentTrend, TREND_EFFECTS } = require('./trend-system'); // Dynamic require to avoid cycle if any
    const currentTrend = getCurrentTrend();

    // 만약 이 템플릿의 군단이 현재 유행 중이라면?
    if (template.aiFactionId === currentTrend.id) {
        totalMultiplier += (TREND_EFFECTS.statMultiplier - 1); // 1.2 -> +0.2
    }

    const minPower = Math.floor(powerRange.min * totalMultiplier);
    const maxPower = Math.floor(powerRange.max * totalMultiplier);

    let totalPower = Math.floor(Math.random() * (maxPower - minPower + 1)) + minPower;

    // 2. 3대 스탯 분배 (주 스탯 몰아주기)
    // 2. 3대 스탯 분배 (주 스탯 균형 조정: 40% ~ 60%)
    // 기존 50~80%는 너무 극단적이라는 피드백 반영
    const mainStatRatio = 0.4 + (Math.random() * 0.2); // 0.4 ~ 0.6
    let mainStatValue = Math.floor(totalPower * mainStatRatio);
    let remainingPower = totalPower - mainStatValue;

    // 최소 스탯 보장 (안전장치)
    // 나머지 두 스탯이 최소 5는 되도록 보장
    const minStat = 5;

    // 만약 남은 파워가 너무 적으면 강제 조정
    if (remainingPower < minStat * 2) {
        remainingPower = minStat * 2;
        mainStatValue = totalPower - remainingPower;
    }

    // 나머지 두 스탯 분배
    // 단순히 랜덤으로 나누면 한쪽이 0이 될 수 있으므로, 최소값을 보장하며 분배
    const maxSub1 = remainingPower - minStat;
    const minSub1 = minStat;

    // 범위 내 랜덤
    const subStat1 = Math.floor(Math.random() * (maxSub1 - minSub1 + 1)) + minSub1;
    const subStat2 = remainingPower - subStat1;

    // 3. 메인 속성 결정 (가위/바위/보)
    const types: ('EFFICIENCY' | 'CREATIVITY' | 'FUNCTION')[] = ['EFFICIENCY', 'CREATIVITY', 'FUNCTION'];
    const mainType = types[Math.floor(Math.random() * types.length)];

    let efficiency = 0;
    let creativity = 0;
    let func = 0;

    if (mainType === 'EFFICIENCY') { // 바위
        efficiency = mainStatValue;
        creativity = subStat1;
        func = subStat2;
    } else if (mainType === 'CREATIVITY') { // 보
        creativity = mainStatValue;
        efficiency = subStat1;
        func = subStat2;
        func = mainStatValue;
        efficiency = subStat1;
        creativity = subStat2;
    }

    // Apply Research Bonuses
    // Bonus = (Level - 1) * 3
    if (researchBonuses) {
        if (researchBonuses.efficiency && researchBonuses.efficiency > 1) {
            efficiency += (researchBonuses.efficiency - 1) * 3;
        }
        if (researchBonuses.creativity && researchBonuses.creativity > 1) {
            creativity += (researchBonuses.creativity - 1) * 3;
        }
        if (researchBonuses.function && researchBonuses.function > 1) {
            func += (researchBonuses.function - 1) * 3;
        }
    }

    // Recalculate Total Power after bonuses
    totalPower = efficiency + creativity + func;

    const stats = {
        efficiency,
        creativity,
        function: func,
        totalPower,
        // Legacy stats (set to 0)
        accuracy: 0,
        speed: 0,
        stability: 0,
        ethics: 0
    };

    const card: Card = {
        id: generateId(),
        templateId: template.id,
        name: template.name,
        ownerId: 'player', // Default owner
        level: 1,
        experience: 0,
        stats,
        rarity: rarity as Rarity,
        acquiredAt: new Date(),
        isLocked: false,
        type: mainType
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
export function generateRandomCard(tier: string = 'free', affinity: number = 0, factionEffects?: FactionEffects, researchBonuses?: ResearchBonuses): Card {
    const weights = calculateRarityWeights(tier, affinity);
    const selectedRarity = selectRandomRarity(weights);
    return selectCardByRarity(selectedRarity, factionEffects, researchBonuses);
}

/**
 * 특정 등급의 랜덤 카드 생성 (카드팩용)
 */
export function generateCardByRarity(rarity: Rarity, userId?: string, researchBonuses?: ResearchBonuses): Card {
    const card = selectCardByRarity(rarity, undefined, researchBonuses);
    if (userId) {
        card.ownerId = userId;
    }
    return card;
}

/**
 * 등급별 확률 정보 반환 (디버깅/UI용)
 */
export function getRarityProbabilities(tier: string = 'free', affinity: number = 0): Record<Rarity, number> {
    const weights = calculateRarityWeights(tier, affinity);
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

export function rerollCardStats(card: Card): Card {
    const rarity = card.rarity || 'common';
    const powerRange = RARITY_POWER_RANGES[rarity.toLowerCase()] || RARITY_POWER_RANGES.common;

    // 1. 총 전투력 결정
    const totalPower = Math.floor(Math.random() * (powerRange.max - powerRange.min + 1)) + powerRange.min;

    // 2. 3대 스탯 분배 (주 스탯 균형 조정: 40% ~ 60%)
    const mainStatRatio = 0.4 + (Math.random() * 0.2); // 0.4 ~ 0.6
    let mainStatValue = Math.floor(totalPower * mainStatRatio);
    let remainingPower = totalPower - mainStatValue;

    // 최소 스탯 보장 (안전장치)
    const minStat = 5;

    if (remainingPower < minStat * 2) {
        remainingPower = minStat * 2;
        mainStatValue = totalPower - remainingPower;
    }

    const maxSub1 = remainingPower - minStat;
    const minSub1 = minStat;

    const subStat1 = Math.floor(Math.random() * (maxSub1 - minSub1 + 1)) + minSub1;
    const subStat2 = remainingPower - subStat1;

    // 3. 메인 속성 결정
    const types: ('EFFICIENCY' | 'CREATIVITY' | 'FUNCTION')[] = ['EFFICIENCY', 'CREATIVITY', 'FUNCTION'];
    const mainType = types[Math.floor(Math.random() * types.length)];

    let efficiency = 0, creativity = 0, func = 0;

    if (mainType === 'EFFICIENCY') {
        efficiency = mainStatValue;
        creativity = subStat1;
        func = subStat2;
    } else if (mainType === 'CREATIVITY') {
        creativity = mainStatValue;
        efficiency = subStat1;
        func = subStat2;
    } else {
        func = mainStatValue;
        efficiency = subStat1;
        creativity = subStat2;
    }

    return {
        ...card,
        stats: {
            ...card.stats,
            efficiency,
            creativity,
            function: func,
            totalPower,
            accuracy: 0,
            speed: 0,
            stability: 0,
            ethics: 0
        },
        type: mainType
    };
}
