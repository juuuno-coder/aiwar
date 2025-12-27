// 특수능력 시스템

import { Card, AIType } from './types';

export interface SpecialAbility {
    id: string;
    name: string;
    description: string;
    passive?: string;
    type: 'active' | 'passive';
}

export interface BattleContext {
    card: Card;
    opponentCard: Card;
    isAttacker: boolean;
    roundNumber: number;
    teamCards?: Card[];
}

/**
 * 특수능력 효과 계산
 */
export function applyAbilityEffect(
    basePower: number,
    ability: SpecialAbility | undefined,
    context: BattleContext
): number {
    if (!ability) return basePower;

    let modifiedPower = basePower;

    switch (ability.id) {
        // 모델 능력들
        case 'multimodal-master':
            // 모든 타입 상성에서 +20% 보너스
            if (context.card.type && context.opponentCard.type && hasTypeAdvantage(context.card.type, context.opponentCard.type)) {
                modifiedPower *= 1.2;
            }
            break;

        case 'conversation-master':
            // 창의 타입 카드와 함께 사용 시 +25%
            if (context.teamCards?.some(c => c.type === 'CREATIVITY')) {
                modifiedPower *= 1.25;
            }
            break;

        case 'art-soul':
            // 창의 능력치 +30%
            if (context.card.type === 'CREATIVITY') {
                modifiedPower *= 1.3;
            }
            break;

        case 'constitutional-ai':
            // 효율 타입 상성에서 +35%
            if (context.card.type === 'EFFICIENCY' && context.opponentCard.type &&
                hasTypeAdvantage(context.card.type, context.opponentCard.type)) {
                modifiedPower *= 1.35;
            }
            break;

        case 'realtime-analysis':
            // 기능 타입 상성에서 +30%
            if (context.card.type === 'COST' && context.opponentCard.type &&
                hasTypeAdvantage(context.card.type, context.opponentCard.type)) {
                modifiedPower *= 1.3;
            }
            break;

        // 영웅 능력들
        case 'fast-thinking':
            // 속성 보너스 +10%
            modifiedPower *= 1.1;
            break;

        case 'multimodal-boost':
            // 모든 능력치 +8%
            modifiedPower *= 1.08;
            break;

        case 'deep-reasoning':
            // 효율 능력치 +15%
            if (context.card.type === 'EFFICIENCY') {
                modifiedPower *= 1.15;
            }
            break;

        default:
            break;
    }

    return Math.floor(modifiedPower);
}

/**
 * 패시브 효과 적용
 */
export function applyPassiveEffects(
    cards: Card[],
    context: { roundNumber: number; isVictory?: boolean }
): {
    teamBonus: number;
    extraReward: number;
    specialEffects: string[];
} {
    let teamBonus = 0;
    let extraReward = 0;
    const specialEffects: string[] = [];

    cards.forEach(card => {
        if (!card.specialSkill) return;

        switch (card.specialSkill.name) {
            case 'multimodal-master':
                // 팀 전체 전투력 +5%
                teamBonus += 0.05;
                break;

            case 'art-soul':
                // 전투 승리 시 추가 보상 +20%
                if (context.isVictory) {
                    extraReward += 0.2;
                }
                break;

            case 'conversation-master':
                // 라운드 시작 시 10% 확률로 추가 드로우
                if (context.roundNumber === 1 && Math.random() < 0.1) {
                    specialEffects.push('추가 카드 드로우!');
                }
                break;

            case 'realtime-analysis':
                // 첫 라운드 자동 승리 10% 확률
                if (context.roundNumber === 1 && Math.random() < 0.1) {
                    specialEffects.push('첫 라운드 자동 승리!');
                }
                break;

            default:
                break;
        }
    });

    return { teamBonus, extraReward, specialEffects };
}

/**
 * 타입 상성 확인 (type-system.ts에서 가져와야 하지만 여기서 간단히 구현)
 */
function hasTypeAdvantage(attackerType: AIType, defenderType: AIType): boolean {
    const advantages: Record<string, AIType> = {
        EFFICIENCY: 'FUNCTION',
        FUNCTION: 'CREATIVITY',
        CREATIVITY: 'EFFICIENCY',
        COST: 'FUNCTION'
    };

    return advantages[attackerType] === defenderType;
}

/**
 * 능력 설명 텍스트 생성
 */
export function getAbilityDescription(ability: SpecialAbility): string {
    let description = `⚡ ${ability.name}\n${ability.description}`;

    if (ability.passive) {
        description += `\n💫 패시브: ${ability.passive}`;
    }

    return description;
}
