/**
 * 전투 로직 유틸리티
 * 
 * 전투 판정, 타입 상성, 승부 계산 등의 핵심 로직
 */

import { Card, AIType } from './types';
import { BattleJudgment, TYPE_ADVANTAGE } from './battle-types';

// ============================================
// 타입 상성 체크
// ============================================

/**
 * 타입 상성 확인
 * @returns 'card1' | 'card2' | 'draw'
 */
export function checkTypeAdvantage(
    type1: AIType,
    type2: AIType
): 'card1' | 'card2' | 'draw' {
    if (type1 === type2) return 'draw';

    // EFFICIENCY > CREATIVITY
    if (type1 === 'EFFICIENCY' && type2 === 'CREATIVITY') return 'card1';
    if (type1 === 'CREATIVITY' && type2 === 'EFFICIENCY') return 'card2';

    // CREATIVITY > FUNCTION
    if (type1 === 'CREATIVITY' && type2 === 'FUNCTION') return 'card1';
    if (type1 === 'FUNCTION' && type2 === 'CREATIVITY') return 'card2';

    // FUNCTION > EFFICIENCY
    if (type1 === 'FUNCTION' && type2 === 'EFFICIENCY') return 'card1';
    if (type1 === 'EFFICIENCY' && type2 === 'FUNCTION') return 'card2';

    return 'draw';
}

// ============================================
// 세부 전투력 계산
// ============================================

/**
 * 카드의 세부 전투력 계산 (해당 타입 스탯)
 */
export function getDetailPower(card: Card): number {
    if (!card.type || !card.stats) return 0;

    switch (card.type) {
        case 'EFFICIENCY':
            return card.stats.efficiency || 0;
        case 'CREATIVITY':
            return card.stats.creativity || 0;
        case 'FUNCTION':
            return card.stats.function || 0;
        default:
            return 0;
    }
}

// ============================================
// 전투 판정
// ============================================

/**
 * 두 카드 간 전투 판정
 * 
 * 우선순위:
 * 1. 타입 상성
 * 2. 세부 전투력 (해당 타입 스탯)
 * 3. 총 전투력
 */
export function judgeBattle(
    playerCard: Card,
    opponentCard: Card
): BattleJudgment {
    const judgment: BattleJudgment = {
        typeAdvantage: 'none',
        detailPower: {
            player: getDetailPower(playerCard),
            opponent: getDetailPower(opponentCard),
        },
        totalPower: {
            player: playerCard.stats?.totalPower || 0,
            opponent: opponentCard.stats?.totalPower || 0,
        },
        finalVerdict: 'draw',
        verdictReason: 'draw',
    };

    // 1. 타입 상성 체크
    if (playerCard.type && opponentCard.type) {
        const typeResult = checkTypeAdvantage(playerCard.type, opponentCard.type);

        if (typeResult === 'card1') {
            judgment.typeAdvantage = 'player';
            judgment.finalVerdict = 'player';
            judgment.verdictReason = 'type';
            return judgment;
        } else if (typeResult === 'card2') {
            judgment.typeAdvantage = 'opponent';
            judgment.finalVerdict = 'opponent';
            judgment.verdictReason = 'type';
            return judgment;
        }
    }

    // 2. 세부 전투력 비교
    if (judgment.detailPower.player > judgment.detailPower.opponent) {
        judgment.finalVerdict = 'player';
        judgment.verdictReason = 'detail';
        return judgment;
    } else if (judgment.detailPower.player < judgment.detailPower.opponent) {
        judgment.finalVerdict = 'opponent';
        judgment.verdictReason = 'detail';
        return judgment;
    }

    // 3. 총 전투력 비교
    if (judgment.totalPower.player > judgment.totalPower.opponent) {
        judgment.finalVerdict = 'player';
        judgment.verdictReason = 'total';
        return judgment;
    } else if (judgment.totalPower.player < judgment.totalPower.opponent) {
        judgment.finalVerdict = 'opponent';
        judgment.verdictReason = 'total';
        return judgment;
    }

    // 4. 무승부
    return judgment;
}

// ============================================
// 승리 이유 텍스트
// ============================================

/**
 * 승리 이유를 한글로 변환
 */
export function getVerdictReasonText(reason: BattleJudgment['verdictReason']): string {
    switch (reason) {
        case 'type':
            return '타입 상성';
        case 'detail':
            return '세부 전투력';
        case 'total':
            return '총 전투력';
        case 'draw':
            return '무승부';
        default:
            return '알 수 없음';
    }
}

// ============================================
// 3선승 체크
// ============================================

/**
 * 3선승 달성 여부 확인
 */
export function checkBestOfFiveWinner(
    playerWins: number,
    opponentWins: number
): 'player' | 'opponent' | null {
    if (playerWins >= 3) return 'player';
    if (opponentWins >= 3) return 'opponent';
    return null;
}

// ============================================
// 보상 계산
// ============================================

/**
 * 전투 보상 계산
 */
export function calculateBattleRewards(
    mode: '1-card' | '5-card-a' | '5-card-b',
    winner: 'player' | 'opponent' | 'draw',
    difficulty: 'easy' | 'normal' | 'hard' = 'normal',
    isPvP: boolean = false
) {
    if (winner !== 'player') {
        return {
            coins: 0,
            tokens: 0,
            experience: 10, // 패배 시에도 소량의 경험치
            cards: [],
        };
    }

    // 기본 보상
    let baseCoins = 100;
    let baseTokens = 10;
    let baseExp = 50;

    // 모드별 배율
    const modeMultiplier = {
        '1-card': 1.0,
        '5-card-a': 1.5,
        '5-card-b': 2.0,
    };

    // 난이도별 배율
    const difficultyMultiplier = {
        easy: 0.8,
        normal: 1.0,
        hard: 1.5,
    };

    // PvP 보너스
    const pvpMultiplier = isPvP ? 1.5 : 1.0;

    const totalMultiplier =
        modeMultiplier[mode] *
        difficultyMultiplier[difficulty] *
        pvpMultiplier;

    return {
        coins: Math.floor(baseCoins * totalMultiplier),
        tokens: Math.floor(baseTokens * totalMultiplier),
        experience: Math.floor(baseExp * totalMultiplier),
        cards: [], // 카드 보상은 별도 로직
    };
}
