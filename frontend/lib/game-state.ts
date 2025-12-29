// 통합 게임 상태 관리 시스템

import { Card } from './types';
import { CommanderResearch } from './research-system';

// 이벤트 시스템 정의
export type GameStateEventType =
    | 'STATE_UPDATED'
    | 'TOKENS_UPDATED'
    | 'INVENTORY_UPDATED'
    | 'LEVEL_UP'
    | 'MISSION_UPDATED'
    | 'FACTION_UNLOCKED';

type GameStateListener = (state: GameState) => void;

const listeners: Record<string, GameStateListener[]> = {};

/**
 * 상태 변경 이벤트 구독
 */
export function onGameStateChange(event: GameStateEventType, callback: GameStateListener): () => void {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(callback);

    // 구독 해제 함수 반환
    return () => {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
}

/**
 * 상태 변경 이벤트 알림
 */
export function emitGameStateChange(event: GameStateEventType, state: GameState) {
    if (listeners[event]) {
        listeners[event].forEach(callback => callback(state));
    }
    // 전체 상태 변경 이벤트도 항상 트리거
    if (event !== 'STATE_UPDATED' && listeners['STATE_UPDATED']) {
        listeners['STATE_UPDATED'].forEach(callback => callback(state));
    }
}

export interface AutoGenerationTimer {
    factionId: string;
    lastGenerated: number;
    interval: number;
    enabled: boolean;
}

export interface GameState {
    // 플레이어 정보
    userId: string;
    nickname: string;
    level: number;
    experience: number;
    tokens: number;
    coins: number; // Added coins field
    commanderMastery: number; // Global proficiency level (0-100)

    // 카드
    inventory: Card[];
    cards?: Card[]; // Alias for inventory (for compatibility)

    // 진행도
    unlockedFactions: string[];
    storyProgress: {
        currentChapter: number;
        completedMissions: string[];
        claimedRewards: string[];
    };

    // 통계
    stats: {
        totalBattles: number;
        wins: number;
        losses: number;
        winStreak: number;
        currentStreak: number;
        pvpMatches: number;
        cardsEnhanced: number;
        cardsFused: number;
    };

    // 업적 및 미션
    completedAchievements: string[];
    dailyMissions: {
        id: string;
        progress: number;
        completed: boolean;
        claimed: boolean;
    }[];

    // 타이머
    lastFactionGeneration: Record<string, number>;
    lastDailyReset: number;
    timers?: {
        autoGeneration: AutoGenerationTimer[];
        lastMissionCheck: number;
        lastAchievementCheck: number;
    };

    // 슬롯 시스템
    slots?: Array<{
        slotIndex: number;
        factionId: string | null;
        placedAt: number;
        lastCollectedAt?: number;
    }>;

    // 유니크 유닛 시스템
    uniqueUnit?: {
        isGenerating: boolean;
        startTime: number;
        endTime: number;
        category: string | null;
        claimed: boolean;
    };

    // 연구 시스템
    research?: CommanderResearch;

    // 생성 시간
    createdAt: number;
    lastSaved: number;
}

export function createDefaultGameState(userId: string, nickname: string): GameState {
    return {
        userId,
        nickname,
        level: 1,
        experience: 0,
        tokens: 1000, // 초기 토큰 (프리미엄 재화)
        coins: 5000,  // 초기 코인 (기본 재화)
        commanderMastery: 0, // 초기 숙련도
        inventory: [],
        cards: [], // Alias for inventory
        unlockedFactions: ['gemini'], // 기본 군단
        storyProgress: {
            currentChapter: 1,
            completedMissions: [],
            claimedRewards: []
        },
        stats: {
            totalBattles: 0,
            wins: 0,
            losses: 0,
            winStreak: 0,
            currentStreak: 0,
            pvpMatches: 0,
            cardsEnhanced: 0,
            cardsFused: 0
        },
        completedAchievements: [],
        dailyMissions: [],
        lastFactionGeneration: {},
        lastDailyReset: Date.now(),
        createdAt: Date.now(),
        lastSaved: Date.now()
    };
}

/**
 * 게임 상태 가져오기
 */
export function getGameState(): GameState {
    if (typeof window === 'undefined') {
        return createDefaultGameState('guest', '게스트');
    }

    const data = localStorage.getItem('game-state');

    if (!data) {
        // 기존 데이터 마이그레이션
        const coins = localStorage.getItem('userCoins');
        const cards = localStorage.getItem('userCards');

        const defaultState = createDefaultGameState('guest', '게스트');

        if (coins) {
            defaultState.tokens = JSON.parse(coins);
        }

        if (cards) {
            defaultState.inventory = JSON.parse(cards);
        }

        saveGameState(defaultState);
        return defaultState;
    }

    return JSON.parse(data);
}

/**
 * 게임 상태 저장
 */
export function saveGameState(state: GameState): void {
    if (typeof window === 'undefined') return;

    state.lastSaved = Date.now();
    localStorage.setItem('game-state', JSON.stringify(state));

    // 하위 호환성을 위해 일부 데이터 별도 저장
    localStorage.setItem('userCoins', JSON.stringify(state.tokens));
    localStorage.setItem('userCards', JSON.stringify(state.inventory));

    // 이 함수에서는 이벤트를 발생시키지 않음 (순환 호출 방지 및 세부 제어)
}

/**
 * 게임 상태 부분 업데이트
 */
export function updateGameState(updates: Partial<GameState>): GameState {
    const currentState = getGameState();
    const newState = { ...currentState, ...updates };
    saveGameState(newState);
    emitGameStateChange('STATE_UPDATED', newState);
    return newState;
}

/**
 * 토큰 추가
 */
export function addTokens(amount: number): GameState {
    const state = getGameState();
    state.tokens += amount;
    saveGameState(state);
    emitGameStateChange('TOKENS_UPDATED', state);
    return state;
}

/**
 * 토큰 차감
 */
export function spendTokens(amount: number): { success: boolean; state?: GameState } {
    const state = getGameState();

    if (state.tokens < amount) {
        return { success: false };
    }

    state.tokens -= amount;
    saveGameState(state);
    emitGameStateChange('TOKENS_UPDATED', state);
    return { success: true, state };
}

/**
 * 경험치 추가 및 레벨업 체크
 */
export function addExperience(amount: number): {
    state: GameState;
    leveledUp: boolean;
    newLevel?: number;
    rewards?: { coins: number; cards: number };
} {
    const state = getGameState();
    const oldLevel = state.level;

    state.experience += amount;

    // 레벨 계산 (100 경험치당 1레벨)
    const newLevel = Math.floor(state.experience / 100) + 1;

    const leveledUp = newLevel > oldLevel;
    let rewards;

    if (leveledUp) {
        state.level = newLevel;

        // 레벨업 보상
        rewards = {
            coins: newLevel * 100,
            cards: newLevel % 5 === 0 ? 1 : 0
        };

        state.coins += rewards.coins;  // 코인 보상을 코인에 추가
        emitGameStateChange('LEVEL_UP', state);
    } else {
        emitGameStateChange('STATE_UPDATED', state); // 경험치 변경 알림
    }

    saveGameState(state);

    return { state, leveledUp, newLevel: leveledUp ? newLevel : undefined, rewards };
}

/**
 * 카드 추가
 */
export function addCard(card: Card): GameState {
    const state = getGameState();
    state.inventory.push(card);
    saveGameState(state);
    emitGameStateChange('INVENTORY_UPDATED', state);
    return state;
}

/**
 * 카드 제거
 */
export function removeCard(cardId: string): GameState {
    const state = getGameState();
    state.inventory = state.inventory.filter(c => c.id !== cardId);
    saveGameState(state);
    emitGameStateChange('INVENTORY_UPDATED', state);
    return state;
}

/**
 * 카드 업데이트
 */
export function updateCard(cardId: string, updates: Partial<Card>): GameState {
    const state = getGameState();
    const cardIndex = state.inventory.findIndex(c => c.id === cardId);

    if (cardIndex !== -1) {
        state.inventory[cardIndex] = { ...state.inventory[cardIndex], ...updates };
        saveGameState(state);
        emitGameStateChange('INVENTORY_UPDATED', state);
    }

    return state;
}

/**
 * 대전 결과 기록
 */
export function recordBattleResult(won: boolean): GameState {
    const state = getGameState();

    state.stats.totalBattles++;

    if (won) {
        state.stats.wins++;
        state.stats.currentStreak++;

        if (state.stats.currentStreak > state.stats.winStreak) {
            state.stats.winStreak = state.stats.currentStreak;
        }
    } else {
        state.stats.losses++;
        state.stats.currentStreak = 0;
    }

    saveGameState(state);
    emitGameStateChange('STATE_UPDATED', state);
    return state;
}

/**
 * 군단 활성화
 */
export function unlockFaction(factionId: string): GameState {
    const state = getGameState();

    if (!state.unlockedFactions.includes(factionId)) {
        state.unlockedFactions.push(factionId);
        saveGameState(state);
        emitGameStateChange('FACTION_UNLOCKED', state);
    }
    return state;
}

/**
 * 미션 완료 체크
 */
export function completeMission(missionId: string): GameState {
    const state = getGameState();

    if (!state.storyProgress.completedMissions.includes(missionId)) {
        state.storyProgress.completedMissions.push(missionId);
        saveGameState(state);
        emitGameStateChange('MISSION_UPDATED', state);
    }

    return state;
}

/**
 * 업적 달성
 */
export function completeAchievement(achievementId: string): GameState {
    const state = getGameState();

    if (!state.completedAchievements.includes(achievementId)) {
        state.completedAchievements.push(achievementId);
        saveGameState(state);
        emitGameStateChange('STATE_UPDATED', state);
    }

    return state;
}

/**
 * 일일 미션 리셋 체크
 */
export function checkDailyReset(): GameState {
    const state = getGameState();
    const now = Date.now();
    const lastReset = new Date(state.lastDailyReset);
    const today = new Date(now);

    // 날짜가 바뀌었으면 리셋
    if (lastReset.getDate() !== today.getDate()) {
        state.dailyMissions = [];
        state.lastDailyReset = now;
        saveGameState(state);
        emitGameStateChange('STATE_UPDATED', state);
    }

    return state;
}

/**
 * 게임 리셋
 */
export function resetGame(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('game-state');
    localStorage.removeItem('userCoins');
    localStorage.removeItem('userCards');

    // 초기화 이벤트는 별도로 처리하거나 페이지 새로고침 권장
}
