// 전투 특수능력 시스템

import { Card } from './types';

export interface BattleContext {
    deck: Card[];
    opponent: Card;
    roundNumber?: number;
}

export interface AbilityEffect {
    bonus: number;
    description: string;
    activated: boolean;
}

/**
 * 특수능력 보너스 계산
 */
export function calculateAbilityBonus(
    card: Card,
    context: BattleContext
): AbilityEffect {
    if (!card.specialSkill) {
        return { bonus: 0, description: '', activated: false };
    }

    const basePower = (card.stats.efficiency || 0) + (card.stats.creativity || 0) + (card.stats.function || 0);
    let bonus = 0;
    let description = '';

    switch (card.specialSkill.name) {
        case 'quick-thinking': // 빠른 사고 (GPT-4 Turbo)
            bonus = Math.floor(basePower * 0.1);
            description = `빠른 사고: +${bonus} (기본 능력치의 10%)`;
            break;

        case 'multimodal-master': // 멀티모달 마스터 (제미나이)
            const typeBonus = Math.floor(basePower * 0.2);
            const teamBonus = Math.floor(
                context.deck.reduce((sum, c) =>
                    sum + ((c.stats.efficiency || 0) + (c.stats.creativity || 0) + (c.stats.function || 0)), 0
                ) * 0.05
            );
            bonus = typeBonus + teamBonus;
            description = `멀티모달 마스터: +${bonus} (타입 상성 +20%, 팀 +5%)`;
            break;

        case 'conversation-master': // 대화의 달인 (ChatGPT)
            const creativityCards = context.deck.filter(c => c.type === 'CREATIVITY').length;
            if (creativityCards > 0) {
                bonus = Math.floor(basePower * 0.25);
                description = `대화의 달인: +${bonus} (창의 타입 시너지 +25%)`;
            }
            break;

        case 'art-soul': // 예술의 혼 (미드저니)
            bonus = Math.floor((card.stats.creativity || 0) * 0.3);
            description = `예술의 혼: +${bonus} (창의 능력치 +30%)`;
            break;

        case 'brutal-truth': // 충격적인 진실 (Grok)
            const opponentBase = context.opponent ?
                ((context.opponent.stats.efficiency || 0) + (context.opponent.stats.creativity || 0) + (context.opponent.stats.function || 0)) : 0;

            if (opponentBase > basePower) {
                bonus = Math.floor(basePower * 0.2);
                description = `충격적인 진실: +${bonus} (약자 멸시 +20%)`;
            }
            break;

        case 'ethical-alignment': // 윤리적 정렬 (Claude)
            const sameTypeCount = context.deck.filter(c => c.type === card.type).length;
            if (sameTypeCount > 0) {
                bonus = Math.floor(basePower * (sameTypeCount * 0.05));
                description = `윤리적 정렬: +${bonus} (동료 시너지 +${sameTypeCount * 5}%)`;
            }
            break;

        default:
            break;
    }

    return {
        bonus,
        description,
        activated: bonus > 0
    };
}

/**
 * 모델 보너스 계산
 */
export function calculateCommanderBonus(deck: Card[]): number {
    // isCommander property doesn't exist on Card type, returning 0 for now
    return 0;

    // Original logic commented out:
    // const commander = deck.find(c => c.isCommander);
    // if (!commander) return 0;
    // const totalPower = deck.reduce((sum, c) =>
    //     sum + ((c.stats.efficiency || 0) + (c.stats.creativity || 0) + (c.stats.function || 0)), 0
    // );
}

/**
 * 타입 시너지 계산
 */
export function calculateTypeSynergy(cards: Card[]): number {
    const typeCounts = {
        EFFICIENCY: 0,
        CREATIVITY: 0,
        COST: 0
    };

    cards.forEach(card => {
        if (card.type) {
            typeCounts[card.type]++;
        }
    });

    // 같은 타입이 3장 이상이면 보너스
    let bonus = 0;
    Object.values(typeCounts).forEach(count => {
        if (count >= 3) {
            bonus += 10; // 10% 보너스
        }
    });

    return bonus;
}

/**
 * 전투력 계산 (모든 보너스 포함)
 */
export function calculateTotalPower(
    card: Card,
    context: BattleContext
): {
    basePower: number;
    abilityBonus: number;
    commanderBonus: number;
    synergyBonus: number;
    totalPower: number;
    effects: string[];
} {
    const basePower = (card.stats.efficiency || 0) + (card.stats.creativity || 0) + (card.stats.function || 0);

    // 특수능력 보너스
    const abilityEffect = calculateAbilityBonus(card, context);
    const abilityBonus = abilityEffect.bonus;

    // 모델 보너스
    const commanderBonus = calculateCommanderBonus(context.deck);

    // 타입 시너지 보너스
    const synergyPercent = calculateTypeSynergy(context.deck);
    const synergyBonus = Math.floor(basePower * (synergyPercent / 100));

    // 총 전투력
    const totalPower = basePower + abilityBonus + commanderBonus + synergyBonus;

    // 효과 설명
    const effects: string[] = [];
    if (abilityEffect.activated) {
        effects.push(abilityEffect.description);
    }
    if (commanderBonus > 0) {
        effects.push(`모델 보너스: +${commanderBonus}`);
    }
    if (synergyBonus > 0) {
        effects.push(`타입 시너지: +${synergyBonus}`);
    }

    return {
        basePower,
        abilityBonus,
        commanderBonus,
        synergyBonus,
        totalPower,
        effects
    };
}

/**
 * 승리 보상 보너스 계산
 */
export function calculateRewardBonus(winnerDeck: Card[]): number {
    // 미드저니가 있으면 보상 +20%
    const hasMidjourney = winnerDeck.some(c =>
        c.specialSkill?.name === 'art-soul'
    );

    return hasMidjourney ? 1.2 : 1.0;
}
