// 카드 타입 자동 결정 유틸리티

import { AIType, Stats } from './types';

/**
 * 능력치를 기반으로 카드 타입 자동 결정
 * 가장 높은 능력치에 따라 타입이 결정됨
 */
export function determineCardType(stats: Stats): AIType {
    const efficiency = stats.efficiency || 0;
    const creativity = stats.creativity || 0;
    const func = stats.function || 0;

    // 가장 높은 능력치 찾기
    if (efficiency >= creativity && efficiency >= func) {
        return 'EFFICIENCY';
    } else if (creativity >= efficiency && creativity >= func) {
        return 'CREATIVITY';
    } else {
        return 'COST'; // function이 가장 높음
    }
}

/**
 * 랜덤 능력치 생성 (3가지)
 */
export function generateRandomStats(baseValue: number = 30): Stats {
    const efficiency = baseValue + Math.floor(Math.random() * 40);
    const creativity = baseValue + Math.floor(Math.random() * 40);
    const func = baseValue + Math.floor(Math.random() * 40);

    return {
        efficiency,
        creativity,
        function: func,
        totalPower: efficiency + creativity + func
    };
}
