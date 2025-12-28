// 실시간 PvP 타입 정의

import { Card } from './types';
import { BattleMode } from './battle-modes';

export type RealtimeBattleMode = 'sudden-death' | 'tactics' | 'ambush';

export type BattlePhase =
    | 'waiting'      // 상대 대기 중
    | 'selection'    // 카드 선택
    | 'reveal'       // 카드 공개 (타이머)
    | 'ordering'     // 순서 배치
    | 'combat'       // 전투 진행
    | 'deck-select'  // 덱 선택
    | 'battle'       // 전투 진행
    | 'result'       // 결과 화면
    | 'finished';    // 전투 종료

export type BattleActionType =
    | 'select_cards'
    | 'set_order'
    | 'set_hidden_cards'
    | 'ready'
    | 'timeout'
    | 'disconnect';

/**
 * 매칭 큐 엔트리
 */
export interface MatchmakingQueue {
    playerId: string;
    playerName: string;
    playerLevel: number;
    deckPower: number;
    battleMode: RealtimeBattleMode;
    joinedAt: number;
    status: 'waiting' | 'matched';
}

/**
 * 플레이어 전투 상태
 */
export interface PlayerState {
    playerId: string;
    playerName: string;
    playerLevel: number;

    // 카드 관련
    selectedCards: Card[];
    cardOrder: number[];        // [0,1,2,3,4] 순서
    hiddenCards?: Card[];       // Ambush 모드용 (2장)

    // 상태
    ready: boolean;
    wins: number;
    roundResults: ('win' | 'lose' | 'draw')[];

    // 연결 상태
    connected: boolean;
    lastHeartbeat: number;
}

/**
 * 전투 방
 */
export interface BattleRoom {
    roomId: string;
    battleMode: RealtimeBattleMode;
    phase: BattlePhase;

    // 플레이어
    player1: PlayerState;
    player2: PlayerState;

    // 전투 진행
    currentRound: number;
    maxRounds: number;
    winsNeeded: number;

    // 타이머
    phaseStartedAt: number;
    phaseTimeout: number; // seconds

    // 결과
    winner?: string; // playerId
    finished: boolean;

    // 메타
    createdAt: number;
    updatedAt: number;
}

/**
 * 전투 액션
 */
export interface BattleAction {
    playerId: string;
    actionType: BattleActionType;
    timestamp: number;
    data?: any;
}

/**
 * 전투 결과
 */
export interface BattleResult {
    roomId: string;
    winnerId: string;
    loserId: string;
    battleMode: RealtimeBattleMode;
    rounds: number;
    winnerScore: number;
    loserScore: number;
    rewards: {
        winner: {
            coins: number;
            experience: number;
            cardsGained: Card[];
        };
        loser: {
            coins: number;
            experience: number;
            cardsLost: Card[];
        };
    };
    timestamp: number;
}

/**
 * 매칭 결과
 */
export interface MatchResult {
    success: boolean;
    roomId?: string;
    opponentId?: string;
    opponentName?: string;
    message?: string;
}
