// AI 타입 시스템 유틸리티

import { AIType } from './types';

/**
 * AI 타입 정보
 */
export const AI_TYPE_INFO = {
    EFFICIENCY: {
        name: '효율 (ROCK)',
        nameEn: 'Efficiency',
        icon: '✊',
        color: '#ef4444', // red
        description: '빠른 처리와 정밀한 최적화 (가위 차단)',
        examples: ['GPT-4 Turbo', 'Claude Instant']
    },
    CREATIVITY: {
        name: '창의 (PAPER)',
        nameEn: 'Creativity',
        icon: '✋',
        color: '#3b82f6', // blue
        description: '혁신적인 아이디어와 예술성 (바위 감싸기)',
        examples: ['DALL-E', 'Midjourney', 'GPT-4']
    },
    COST: {
        name: '기능 (SCISSORS)',
        nameEn: 'Function',
        icon: '✌️',
        color: '#f59e0b', // yellow
        description: '날카로운 분석과 경제적 솔루션 (보자기 절단)',
        examples: ['Llama', 'Open Source AI']
    }
} as const;

/**
 * 타입 상성 체크
 * @param attackerType 공격하는 카드의 타입
 * @param defenderType 방어하는 카드의 타입
 * @returns true if attacker has advantage
 */
export function hasTypeAdvantage(attackerType: AIType | undefined, defenderType: AIType | undefined): boolean {
    if (!attackerType || !defenderType) return false;
    const advantages: Record<AIType, AIType> = {
        EFFICIENCY: 'COST',      // 효율성 > 비용
        COST: 'CREATIVITY',      // 비용 > 창의성
        CREATIVITY: 'EFFICIENCY' // 창의성 > 효율성
    };

    return advantages[attackerType] === defenderType;
}

/**
 * 타입 상성 보너스 배율
 */
export const TYPE_ADVANTAGE_MULTIPLIER = 1.3; // 30% 보너스

/**
 * 같은 타입 콤보 보너스 (2장 대결 시)
 */
export const SAME_TYPE_COMBO_BONUS = 0.3;

/**
 * 타입별 랜덤 생성 가중치
 */
export const TYPE_WEIGHTS = {
    EFFICIENCY: 33,
    CREATIVITY: 33,
    COST: 34
};

/**
 * 랜덤 타입 생성
 */
export function getRandomType(): AIType {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [type, weight] of Object.entries(TYPE_WEIGHTS)) {
        cumulative += weight;
        if (random < cumulative) {
            return type as AIType;
        }
    }

    return 'EFFICIENCY';
}

/**
 * 타입 아이콘 가져오기
 */
export function getTypeIcon(type: AIType | undefined): string {
    if (!type) return '❓';
    return AI_TYPE_INFO[type].icon;
}

/**
 * 타입 색상 가져오기
 */
export function getTypeColor(type: AIType | undefined): string {
    if (!type) return '#9ca3af'; // gray-400
    return AI_TYPE_INFO[type].color;
}

/**
 * 타입 이름 가져오기
 */
export function getTypeName(type: AIType | undefined): string {
    if (!type) return 'Unknown';
    return AI_TYPE_INFO[type].name;
}

/**
 * 상성 관계 설명
 */
export function getTypeAdvantageDescription(attackerType: AIType | undefined, defenderType: AIType | undefined): string | null {
    if (!attackerType || !defenderType || !hasTypeAdvantage(attackerType, defenderType)) {
        return null;
    }

    const attacker = AI_TYPE_INFO[attackerType].name;
    const defender = AI_TYPE_INFO[defenderType].name;

    const descriptions: Record<string, string> = {
        'EFFICIENCY-COST': `${attacker}이(가) ${defender}을(를) 압도합니다! (빠른 처리가 비용을 절감)`,
        'COST-CREATIVITY': `${attacker}이(가) ${defender}을(를) 압도합니다! (저렴한 솔루션이 과도한 창의성을 이김)`,
        'CREATIVITY-EFFICIENCY': `${attacker}이(가) ${defender}을(를) 압도합니다! (혁신이 단순 효율을 뛰어넘음)`
    };

    const key = `${attackerType}-${defenderType}`;
    return descriptions[key] || null;
}
