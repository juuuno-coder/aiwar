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
        rating: number; // Added rating
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

    // 일일 통계 (밸런싱용)
    dailyStats?: {
        aiWinsToday: number;
        aiMatchesToday: number; // [NEW] 트래킹용 매치 횟수
        lastDailyReset: number;
        matchCount: Record<string, number>;
    };
    pvpStats?: {
        wins: number;
        losses: number;
        totalBattles: number;
        rating: number;
        pvpMatches: number;
        finished: boolean;
        createdAt: number;
        winRate: number;
        rank: number;
        isGhost?: boolean;
    };

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
        tokens: 100, // 초기 토큰 (프리미엄 재화)
        coins: 0,  // 초기 코인 (기본 재화)
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
            cardsFused: 0,
            rating: 1000 // Initial rating
        },
        completedAchievements: [],
        dailyMissions: [],
        lastFactionGeneration: {},
        lastDailyReset: Date.now(),
        dailyStats: {
            aiWinsToday: 0,
            aiMatchesToday: 0,
            lastDailyReset: Date.now(),
            matchCount: {}
        },
        pvpStats: {
            wins: 0,
            losses: 0,
            totalBattles: 0,
            rating: 1000,
            pvpMatches: 0,
            finished: false,
            createdAt: Date.now(),
            winRate: 0,
            rank: 0,
            isGhost: false
        },
        createdAt: Date.now(),
        lastSaved: Date.now()
    };
}

/**
 * 게임 상태 가져오기용 키 생성
 */
function getGameStateKey(userId?: string): string {
    if (!userId || userId === 'local-user' || userId === 'guest') {
        return 'game-state'; // Legacy/Guest key
    }
    return `game-state_${userId}`;
}

/**
 * 게임 상태 가져오기
 */
export function getGameState(userId?: string): GameState {
    if (typeof window === 'undefined') {
        return createDefaultGameState(userId || 'guest', '게스트');
    }

    const key = getGameStateKey(userId);
    const data = localStorage.getItem(key);

    if (!data) {
        // 기존 데이터 마이그레이션 (게스트/레거시용)
        if (key === 'game-state') {
            const legacyCoins = localStorage.getItem('userCoins');
            const legacyCards = localStorage.getItem('userCards');

            if (legacyCoins || legacyCards) {
                console.log(`[Migration] Found legacy data for user: ${userId}`);
                // Create a default state first, then apply legacy data
                const state = createDefaultGameState(userId || 'guest', '게스트');

                if (legacyCoins) {
                    const parsedCoins = JSON.parse(legacyCoins);
                    state.coins = Number(parsedCoins) || state.coins; // Map userCoins to coins
                    // Legacy userCoins was sometimes used for tokens, ensure tokens are also set if coins are migrated
                    state.tokens = Number(parsedCoins) || state.tokens; // Assuming userCoins was also tokens
                    localStorage.removeItem('userCoins');
                }

                if (legacyCards) {
                    const parsedCards = JSON.parse(legacyCards);
                    state.inventory = Array.isArray(parsedCards) ? parsedCards : state.inventory; // Map userCards to inventory
                    localStorage.removeItem('userCards');
                }

                saveGameState(state, userId);
                console.log(`[Migration] Legacy data migrated for user: ${userId}`);
                return state; // Return the migrated state
            }
            // If key is 'game-state' but no legacyCoins or legacyCards, return a default guest state
            return createDefaultGameState('guest', '게스트');
        }

        return createDefaultGameState(userId || 'guest', '플레이어');
    }

    return JSON.parse(data);
}

/**
 * [MIGRATION] 레거시/게스트 게임 상태를 유저 데이터로 마이그레이션
 */
export function migrateLegacyGameState(userId: string): void {
    if (typeof window === 'undefined') return;
    if (!userId || userId === 'local-user' || userId === 'guest') return;

    const legacyKey = 'game-state';
    const userKey = `game-state_${userId}`;

    const legacyData = localStorage.getItem(legacyKey);
    if (legacyData) {
        const legacyState = JSON.parse(legacyData);
        const userState = getGameState(userId);

        // [Safety] 유저가 이미 진행 중인 계정이라면 게스트 데이터를 덮어쓰지 않음
        const isNewUser = userState.level <= 1 && userState.experience === 0 && userState.inventory.length === 0;
        const hasLegacyProgress = (legacyState.level || 1) > 1 || (legacyState.inventory || []).length > 0;

        if (isNewUser && hasLegacyProgress) {
            // 유저가 신규이고 게스트 데이터에 진행도가 있는 경우에만 마이그레이션 수행
            const migratedState = {
                ...legacyState,
                userId: userId,
                lastSaved: Date.now()
            };
            saveGameState(migratedState, userId);
            console.log(`[Migration] Migrated legacy guest state to user ${userId}`);
        } else {
            console.log(`[Migration] Skipped migration for ${userId} (User not new or no legacy progress)`);
        }

        // 마이그레이션 수행 여부와 관계없이 세션 정리를 위해 레거시 데이터 삭제 (중복 이전 방지)
        localStorage.removeItem(legacyKey);
        localStorage.removeItem('userCoins');
        localStorage.removeItem('userCards');
        localStorage.removeItem('game-state-v1');
    }
}

/**
 * 게임 상태 저장
 */
export function saveGameState(state: GameState, userId?: string): void {
    if (typeof window === 'undefined') return;

    state.lastSaved = Date.now();
    const key = getGameStateKey(userId || state.userId);
    localStorage.setItem(key, JSON.stringify(state));

    // 하위 호환성을 위해 레거시 키에도 저장 (유저가 지정되지 않았거나 게스트인 경우만)
    if (key === 'game-state') {
        localStorage.setItem('userCoins', JSON.stringify(state.tokens));
        localStorage.setItem('userCards', JSON.stringify(state.inventory));
    }

    // 이 함수에서는 이벤트를 발생시키지 않음 (순환 호출 방지 및 세부 제어)
}

/**
 * 게임 상태 부분 업데이트
 */
export function updateGameState(updates: Partial<GameState>, userId?: string): GameState {
    const currentState = getGameState(userId);
    const newState = { ...currentState, ...updates };
    saveGameState(newState, userId);
    emitGameStateChange('STATE_UPDATED', newState);
    return newState;
}

/**
 * 토큰 추가
 */
export function addTokens(amount: number, userId?: string): GameState {
    const state = getGameState(userId);
    state.tokens += amount;
    saveGameState(state, userId);
    emitGameStateChange('TOKENS_UPDATED', state);
    return state;
}

/**
 * 토큰 차감
 */
export function spendTokens(amount: number, userId?: string): { success: boolean; state?: GameState } {
    const state = getGameState(userId);

    if (state.tokens < amount) {
        return { success: false };
    }

    state.tokens -= amount;
    saveGameState(state, userId);
    emitGameStateChange('TOKENS_UPDATED', state);
    return { success: true, state };
}

/**
 * 경험치 추가 및 레벨업 체크
 */
export function addExperience(amount: number, userId?: string): {
    state: GameState;
    leveledUp: boolean;
    newLevel?: number;
    rewards?: { coins: number; cards: number };
} {
    const state = getGameState(userId);
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

    saveGameState(state, userId);

    return { state, leveledUp, newLevel: leveledUp ? newLevel : undefined, rewards };
}

/**
 * 카드 추가
 */
export function addCard(card: Card, userId?: string): GameState {
    const state = getGameState(userId);
    state.inventory.push(card);
    saveGameState(state, userId);
    emitGameStateChange('INVENTORY_UPDATED', state);
    return state;
}

/**
 * 카드 제거
 */
export function removeCard(cardId: string, userId?: string): GameState {
    const state = getGameState(userId);
    state.inventory = state.inventory.filter(c => c.id !== cardId);
    saveGameState(state, userId);
    emitGameStateChange('INVENTORY_UPDATED', state);
    return state;
}

/**
 * 카드 업데이트
 */
export function updateCard(cardId: string, updates: Partial<Card>, userId?: string): GameState {
    const state = getGameState(userId);
    const cardIndex = state.inventory.findIndex(c => c.id === cardId);

    if (cardIndex !== -1) {
        state.inventory[cardIndex] = { ...state.inventory[cardIndex], ...updates };
        saveGameState(state, userId);
        emitGameStateChange('INVENTORY_UPDATED', state);
    }

    return state;
}

/**
 * 대전 결과 기록
 */
export function recordBattleResult(won: boolean, userId?: string): GameState {
    const state = getGameState(userId);

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

    saveGameState(state, userId);
    emitGameStateChange('STATE_UPDATED', state);
    return state;
}

/**
 * 군단 활성화
 */
export function unlockFaction(factionId: string, userId?: string): GameState {
    const state = getGameState(userId);

    if (!state.unlockedFactions.includes(factionId)) {
        state.unlockedFactions.push(factionId);
        saveGameState(state, userId);
        emitGameStateChange('FACTION_UNLOCKED', state);
    }
    return state;
}

/**
 * 미션 완료 체크
 */
export function completeMission(missionId: string, userId?: string): GameState {
    const state = getGameState(userId);

    if (!state.storyProgress.completedMissions.includes(missionId)) {
        state.storyProgress.completedMissions.push(missionId);
        saveGameState(state, userId);
        emitGameStateChange('MISSION_UPDATED', state);
    }

    return state;
}

/**
 * 업적 달성
 */
export function completeAchievement(achievementId: string, userId?: string): GameState {
    const state = getGameState(userId);

    if (!state.completedAchievements.includes(achievementId)) {
        state.completedAchievements.push(achievementId);
        saveGameState(state, userId);
        emitGameStateChange('STATE_UPDATED', state);
    }

    return state;
}

/**
 * 일일 미션 리셋 체크
 */
export function checkDailyReset(userId?: string): GameState {
    const state = getGameState(userId);
    const now = Date.now();
    const lastReset = new Date(state.lastDailyReset);
    const today = new Date(now);

    // 날짜가 바뀌었으면 리셋
    if (lastReset.getDate() !== today.getDate()) {
        state.dailyMissions = [];
        state.lastDailyReset = now;
        saveGameState(state, userId);
        emitGameStateChange('STATE_UPDATED', state);
    }

    return state;
}

/**
 * 일일 통계 리셋 체크 및 초기화 (오전 6시 기준)
 */
export function checkAndResetDailyStats(userId?: string): GameState {
    const state = getGameState(userId);
    const now = Date.now();

    // 현재 시간 기준 '오늘의 6 AM' 타임스탬프 계산
    const today6AM = new Date(now);
    today6AM.setHours(6, 0, 0, 0);

    // 만약 현재 시간이 오전 6시 이전이라면, 리셋 기준점은 '어제의 6 AM'
    if (now < today6AM.getTime()) {
        today6AM.setDate(today6AM.getDate() - 1);
    }

    const lastReset = state.dailyStats?.lastDailyReset || 0;

    // 마지막 리셋이 기준점(6 AM)보다 이전이라면 초기화
    if (lastReset < today6AM.getTime()) {
        const updatedStats = {
            aiWinsToday: 0,
            aiMatchesToday: 0,
            lastDailyReset: now,
            matchCount: {}
        };

        return updateGameState({ dailyStats: updatedStats }, userId);
    }

    return state;
}

/**
 * 게임 리셋
 */
export function resetGame(userId?: string): void {
    if (typeof window === 'undefined') return;

    const key = getGameStateKey(userId);
    localStorage.removeItem(key);

    if (key === 'game-state') {
        localStorage.removeItem('userCoins');
        localStorage.removeItem('userCards');
    }

    // 초기화 이벤트는 별도로 처리하거나 페이지 새로고침 권장
}
