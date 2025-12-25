/**
 * 전투 시스템 타입 정의
 * 
 * 1장 전투, 5장 전투 A (3선승), 5장 전투 B (히든카드) 모드 지원
 */

import { Card } from './types';

// ============================================
// 전투 모드
// ============================================

/**
 * 전투 모드 타입
 * - '1-card': 단판 승부 (1장 선택)
 * - '5-card-a': 3선승제 (출전 순서 중요)
 * - '5-card-b': 3선승제 + 히든카드 (2/4 라운드 2장 대결)
 */
export type BattleMode = '1-card' | '5-card-a' | '5-card-b';

/**
 * 전투 단계
 */
export type BattlePhase =
    | 'card-selection'    // 카드 선택 (5장)
    | 'card-reveal'       // 카드 공개 (10초)
    | 'order-selection'   // 출전 순서 결정 (5장 모드)
    | 'hidden-selection'  // 히든카드 선택 (5장-B)
    | 'battle'            // 전투 진행
    | 'result';           // 결과

// ============================================
// 전투 상태
// ============================================

/**
 * 전투 상태
 */
export interface BattleState {
    // 기본 정보
    battleId: string;
    mode: BattleMode;
    phase: BattlePhase;

    // 참가자
    player: BattleParticipant;
    opponent: BattleParticipant;

    // 타이머
    revealTimer: number; // 카드 공개 타이머 (10초)
    phaseTimer?: number; // 단계별 타이머

    // 전투 진행
    currentRound: number; // 현재 라운드 (1~5)
    maxRounds: number; // 최대 라운드 (1 or 5)

    // 스코어
    scores: {
        player: number;
        opponent: number;
    };

    // 라운드 결과
    roundResults: RoundResult[];

    // 최종 승자
    winner?: 'player' | 'opponent' | 'draw';

    // 보상
    rewards?: BattleRewards;
}

/**
 * 전투 참가자
 */
export interface BattleParticipant {
    id: string;
    name: string;
    level: number;

    // 선택한 카드 (5장)
    selectedCards: Card[];

    // 출전 순서 (5장 모드)
    cardOrder?: number[]; // [0, 1, 2, 3, 4] 순서

    // 히든카드 (5장-B 모드)
    hiddenCards?: {
        round2?: Card; // 2라운드 히든카드
        round4?: Card; // 4라운드 히든카드
    };

    // 현재 라운드 출전 카드
    currentCard?: Card;
}

// ============================================
// 라운드 결과
// ============================================

/**
 * 라운드 결과
 */
export interface RoundResult {
    round: number;

    // 기본 대결
    playerCard: Card;
    opponentCard: Card;

    // 히든카드 대결 (2/4 라운드, 5장-B 모드)
    hiddenBattle?: {
        playerCard: Card;
        opponentCard: Card;
        winner: 'player' | 'opponent' | 'draw';
        reason: string;
    };

    // 최종 승자
    winner: 'player' | 'opponent' | 'draw';
    reason: string; // 승리 이유

    // 판정 상세
    judgment: BattleJudgment;
}

/**
 * 전투 판정
 */
export interface BattleJudgment {
    // 타입 상성
    typeAdvantage: 'player' | 'opponent' | 'none';

    // 세부 전투력
    detailPower: {
        player: number;
        opponent: number;
    };

    // 총 전투력
    totalPower: {
        player: number;
        opponent: number;
    };

    // 최종 판정
    finalVerdict: 'player' | 'opponent' | 'draw';
    verdictReason: 'type' | 'detail' | 'total' | 'draw';
}

// ============================================
// 전투 보상
// ============================================

/**
 * 전투 보상
 */
export interface BattleRewards {
    coins: number;
    tokens: number;
    experience: number;
    cards?: Card[];

    // PvP 전용
    stolenCards?: Card[]; // 카드 따먹기 (5장)
}

// ============================================
// 전투 액션
// ============================================

/**
 * 전투 액션 타입
 */
export type BattleAction =
    | { type: 'SELECT_CARDS'; cards: Card[] }
    | { type: 'SET_ORDER'; order: number[] }
    | { type: 'SELECT_HIDDEN'; round: 2 | 4; card: Card }
    | { type: 'SELECT_BATTLE_CARD'; card: Card }
    | { type: 'NEXT_ROUND' }
    | { type: 'END_BATTLE' };

// ============================================
// 전투 설정
// ============================================

/**
 * 전투 설정
 */
export interface BattleConfig {
    mode: BattleMode;

    // PvE 설정
    stageId?: string;
    difficulty?: 'easy' | 'normal' | 'hard';

    // PvP 설정
    isPvP?: boolean;
    opponentId?: string;

    // 보상 배율
    rewardMultiplier?: number;
}

// ============================================
// AI 전략
// ============================================

/**
 * AI 난이도
 */
export type AIDifficulty = 'easy' | 'normal' | 'hard';

/**
 * AI 전략
 */
export interface AIStrategy {
    difficulty: AIDifficulty;

    // 카드 선택 전략
    selectCards: (availableCards: Card[]) => Card[];

    // 출전 순서 결정 전략
    determineOrder: (myCards: Card[], opponentCards: Card[]) => number[];

    // 히든카드 선택 전략
    selectHiddenCards: (myCards: Card[], opponentCards: Card[]) => {
        round2: Card;
        round4: Card;
    };

    // 1장 전투 카드 선택
    selectBattleCard: (myCards: Card[], opponentCards: Card[]) => Card;
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 카드 타입 상성
 */
export const TYPE_ADVANTAGE: Record<string, string> = {
    'EFFICIENCY': 'CREATIVITY',
    'CREATIVITY': 'FUNCTION',
    'FUNCTION': 'EFFICIENCY',
};

/**
 * 전투 결과 요약
 */
export interface BattleSummary {
    winner: 'player' | 'opponent' | 'draw';
    finalScore: { player: number; opponent: number };
    totalRounds: number;
    mvpCard?: Card; // 최고 활약 카드
    rewards: BattleRewards;
}
