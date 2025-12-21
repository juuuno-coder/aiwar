// 듀얼 전투 시스템 - 5전 3선승제 + 히든 카드

import { Card } from './types';
import { calculateTotalPower } from './battle-abilities';
import { hasTypeAdvantage, TYPE_ADVANTAGE_MULTIPLIER, SAME_TYPE_COMBO_BONUS } from './type-system';

/**
 * 단일 대결 결과
 */
export interface SingleBattleResult {
    playerCard: Card;
    enemyCard: Card;
    playerPower: number;
    enemyPower: number;
    playerBasePower?: number;
    enemyBasePower?: number;
    playerAbilityBonus?: number;
    enemyAbilityBonus?: number;
    playerEffects?: string[];
    enemyEffects?: string[];
    winner: 'player' | 'enemy' | 'draw';
    playerAdvantage: number;
    enemyAdvantage: number;
    hasAdvantage: boolean;
    advantageType?: 'player' | 'enemy';
}

/**
 * 히든 라운드 결과 (라운드 2, 4)
 */
export interface HiddenRoundResult {
    roundNumber: 2 | 4;
    mainBattle: SingleBattleResult;
    hiddenBattle: SingleBattleResult;
    roundWinner: 'player' | 'enemy';
    playerWonMain: boolean;
    playerWonHidden: boolean;
}

/**
 * 일반 라운드 결과 (라운드 1, 3, 5)
 */
export interface NormalRoundResult {
    roundNumber: 1 | 3 | 5;
    battle: SingleBattleResult;
    roundWinner: 'player' | 'enemy';
}

/**
 * 통합 전투 결과 타입
 */
export type BattleResult = HiddenRoundResult | NormalRoundResult;

/**
 * 전체 전투 상태
 */
export interface BattleState {
    playerDeck: Card[]; // 5장
    enemyDeck: Card[]; // 5장
    currentRound: number; // 1-5
    playerWins: number;
    enemyWins: number;
    usedMainIndices: number[]; // 메인으로 사용한 카드 인덱스
}

/**
 * 단일 카드 대결 계산 (능력치 및 타입 상성 적용)
 */
export function calculateSingleBattle(
    playerCard: Card,
    enemyCard: Card,
    playerDeck: Card[], // 능력치 계산을 위해 덱 정보 필요
    enemyDeck: Card[]  // 능력치 계산을 위해 덱 정보 필요
): SingleBattleResult {
    // 특수능력 포함 전투력 계산
    const playerPowerData = calculateTotalPower(playerCard, {
        deck: playerDeck,
        opponent: enemyCard
    });

    const enemyPowerData = calculateTotalPower(enemyCard, {
        deck: enemyDeck,
        opponent: playerCard
    });

    // 타입 상성 적용
    const playerAdvantageMultiplier = hasTypeAdvantage(playerCard.type, enemyCard.type) ? TYPE_ADVANTAGE_MULTIPLIER : 1.0;
    const enemyAdvantageMultiplier = hasTypeAdvantage(enemyCard.type, playerCard.type) ? TYPE_ADVANTAGE_MULTIPLIER : 1.0;

    const finalPlayerPower = Math.floor(playerPowerData.totalPower * playerAdvantageMultiplier);
    const finalEnemyPower = Math.floor(enemyPowerData.totalPower * enemyAdvantageMultiplier);

    // 승자 결정
    let winner: 'player' | 'enemy' | 'draw';
    if (finalPlayerPower > finalEnemyPower) {
        winner = 'player';
    } else if (finalEnemyPower > finalPlayerPower) {
        winner = 'enemy';
    } else {
        winner = 'draw';
    }

    const hasAdvantage = playerAdvantageMultiplier > 1.0 || enemyAdvantageMultiplier > 1.0;
    const advantageType = playerAdvantageMultiplier > 1.0 ? 'player' :
        enemyAdvantageMultiplier > 1.0 ? 'enemy' : undefined;

    return {
        playerCard,
        enemyCard,
        playerPower: finalPlayerPower,
        enemyPower: finalEnemyPower,
        playerBasePower: playerPowerData.basePower,
        enemyBasePower: enemyPowerData.basePower,
        playerAbilityBonus: playerPowerData.abilityBonus,
        enemyAbilityBonus: enemyPowerData.abilityBonus,
        playerEffects: playerPowerData.effects,
        enemyEffects: enemyPowerData.effects,
        winner,
        playerAdvantage: playerAdvantageMultiplier,
        enemyAdvantage: enemyAdvantageMultiplier,
        hasAdvantage,
        advantageType
    };
}

/**
 * 히든 라운드 계산 (라운드 2, 4)
 * 메인 대결 + 히든 대결, 둘 중 하나라도 이기면 라운드 승리
 */
export function calculateHiddenRound(
    state: BattleState,
    playerHiddenCard: Card,
    enemyHiddenCard: Card,
    roundNumber: 2 | 4
): HiddenRoundResult {
    const mainIndex = getMainCardIndex(roundNumber);
    const playerMainCard = state.playerDeck[mainIndex];
    const enemyMainCard = state.enemyDeck[mainIndex];

    // 메인 카드 대결
    const mainBattle = calculateSingleBattle(playerMainCard, enemyMainCard, state.playerDeck, state.enemyDeck);

    // 히든 카드 대결
    const hiddenBattle = calculateSingleBattle(playerHiddenCard, enemyHiddenCard, state.playerDeck, state.enemyDeck);

    // 라운드 승자 결정
    const playerWonMain = mainBattle.winner === 'player';
    const playerWonHidden = hiddenBattle.winner === 'player';

    let roundWinner: 'player' | 'enemy';
    if (playerWonMain && playerWonHidden) {
        roundWinner = 'player';
    } else if (!playerWonMain && !playerWonHidden) {
        roundWinner = 'enemy';
    } else {
        // 1승 1패 시 메인 카드 승자가 라운드 승자
        roundWinner = playerWonMain ? 'player' : 'enemy';
    }

    return {
        roundNumber,
        mainBattle,
        hiddenBattle,
        roundWinner,
        playerWonMain,
        playerWonHidden
    };
}

/**
 * 일반 라운드 계산 (라운드 1, 3, 5)
 */
export function calculateNormalRound(
    state: BattleState,
    roundNumber: 1 | 3 | 5
): NormalRoundResult {
    const mainIndex = getMainCardIndex(roundNumber);
    const playerCard = state.playerDeck[mainIndex];
    const enemyCard = state.enemyDeck[mainIndex];

    const battle = calculateSingleBattle(playerCard, enemyCard, state.playerDeck, state.enemyDeck);

    // draw인 경우 player 승리로 처리
    const roundWinner: 'player' | 'enemy' = battle.winner === 'draw' ? 'player' : battle.winner;

    return {
        roundNumber,
        battle,
        roundWinner
    };
}

/**
 * 히든 카드로 사용 가능한 카드 목록
 */
export function getAvailableHiddenCards(
    deck: Card[],
    currentRound: number,
    usedMainIndices: number[]
): Card[] {
    return deck.filter((card, index) => {
        // 현재 라운드의 메인 카드는 제외
        if (currentRound === 2 && index === 1) return false;
        if (currentRound === 4 && index === 3) return false;

        // 이미 메인으로 사용한 카드는 제외
        if (usedMainIndices.includes(index)) return false;

        return true;
    });
}

/**
 * 라운드가 히든 라운드인지 확인
 */
export function isHiddenRound(roundNumber: number): boolean {
    return roundNumber === 2 || roundNumber === 4;
}

/**
 * 라운드별 메인 카드 인덱스
 */
export function getMainCardIndex(roundNumber: number): number {
    switch (roundNumber) {
        case 1: return 0;
        case 2: return 1;
        case 3: return 2;
        case 4: return 3;
        case 5: return 4;
        default: return 0;
    }
}

/**
 * AI의 히든 카드 선택 (간단한 전략)
 */
export function selectAIHiddenCard(
    availableCards: Card[],
    mainCard: Card,
    isWinning: boolean
): Card {
    if (availableCards.length === 0) {
        return mainCard; // 폴백
    }

    // 같은 타입 우선 (콤보 보너스)
    const sameTypeCards = availableCards.filter(c => c.type === mainCard.type);
    if (sameTypeCards.length > 0) {
        // 가장 강한 카드 선택
        return sameTypeCards.sort((a, b) => b.stats.totalPower - a.stats.totalPower)[0];
    }

    // 지고 있으면 가장 강한 카드
    if (!isWinning) {
        return availableCards.sort((a, b) => b.stats.totalPower - a.stats.totalPower)[0];
    }

    // 이기고 있으면 중간 정도 카드
    const sorted = availableCards.sort((a, b) => b.stats.totalPower - a.stats.totalPower);
    return sorted[Math.floor(sorted.length / 2)];
}

/**
 * 전투 초기화
 */
export function initializeBattle(playerDeck: Card[], enemyDeck: Card[]): BattleState {
    return {
        playerDeck,
        enemyDeck,
        currentRound: 1,
        playerWins: 0,
        enemyWins: 0,
        usedMainIndices: []
    };
}
