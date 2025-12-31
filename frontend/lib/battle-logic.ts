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

    // 5. 전군 지휘 보너스 (리더십 연구 반영 - 1레벨당 2% 고정 상승)
    let leadershipRank = 0;
    try {
        const { gameStorage } = require('./game-storage');
        const state = gameStorage.getGameState();
        if (state.research?.stats?.leadership) {
            leadershipRank = state.research.stats.leadership.currentLevel;
        }
    } catch (e) { }

    if (leadershipRank > 0) {
        const boost = leadershipRank * 0.02; // Lv.1: 2%, Lv.5: 10%, Lv.9: 18% (보너스 캡 20%)
        const finalBoost = leadershipRank >= 9 ? 0.20 : boost;
        judgment.totalPower.player = Math.floor(judgment.totalPower.player * (1 + finalBoost));
    }

    // 6. 무승부
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

type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'unique' | 'commander';

import { gameStorage } from './game-storage';
import { getResearchBonus } from './research-system';

/**
 * 전투 보상 계산
 */
export async function calculateBattleRewards(
    mode: '1-card' | '5-card-a' | '5-card-b',
    winner: 'player' | 'opponent' | 'draw',
    rarity: Rarity = 'common',
    difficulty: 'easy' | 'normal' | 'hard' = 'normal',
    isPvP: boolean = false
) {
    if (winner !== 'player') {
        return {
            coins: 10,
            tokens: 0,
            experience: 10,
            cards: [],
        };
    }

    // 기본 보상 (새로운 능력치 범위 40-100 및 0코인 시작 정책에 맞춰 상향)
    let baseCoins = 250;
    let baseTokens = 15;
    let baseExp = 75;

    // 등급별 보상 차등 (카드의 등급에 따라 추가 보상)
    const rarityBonus: Record<Rarity, number> = {
        common: 1.0,
        rare: 1.2,
        epic: 1.5,
        legendary: 2.0,
        unique: 3.0,
        commander: 5.0,
    };

    const rarityMult = rarityBonus[rarity] || 1.0;

    // 모드별 배율
    const modeMultiplier = {
        '1-card': 1.0,
        '5-card-a': 1.8,
        '5-card-b': 2.5,
    };

    // 난이도별 배율
    const difficultyMultiplier = {
        easy: 1.0,
        normal: 1.2,
        hard: 1.8,
    };

    // PvP 보너스
    const pvpMultiplier = isPvP ? 1.5 : 1.0;

    // 연구 보너스 (행운 - 기획안 정의 수치 반영)
    let fortuneBonusPercent = 0;
    try {
        const state = await gameStorage.loadGameState();
        if (state.research?.stats?.fortune) {
            const level = state.research.stats.fortune.currentLevel;
            fortuneBonusPercent = getResearchBonus('fortune', level);
        }
    } catch (e) {
        console.warn('Failed to load fortune research bonus', e);
    }

    const totalMultiplier =
        modeMultiplier[mode] *
        difficultyMultiplier[difficulty] *
        pvpMultiplier *
        rarityMult;

    const researchMultiplier = 1 + (fortuneBonusPercent / 100);

    const finalCoins = Math.floor(baseCoins * totalMultiplier * researchMultiplier);
    const finalTokens = Math.floor(baseTokens * totalMultiplier * researchMultiplier);
    const finalExp = Math.floor(baseExp * totalMultiplier * researchMultiplier);

    return {
        coins: finalCoins,
        tokens: finalTokens,
        experience: finalExp,
        cards: [],
        bonuses: fortuneBonusPercent > 0 ? {
            multiplier: fortuneBonusPercent / 100,
            coins: Math.floor(baseCoins * totalMultiplier * (fortuneBonusPercent / 100))
        } : undefined
    };
}
