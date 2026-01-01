// 통합 저장소 유틸리티 (Firebase + localStorage)
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { storage } from './utils';
import {
    loadUserProfile,
    saveUserProfile,
    updateCoins,
    updateTokens,
    updateExpAndLevel
} from './firebase-db';
import { isFirebaseConfigured } from './firebase';
import { CommanderResearch, ResearchCategory, ResearchProgress, createInitialResearchState } from './research-system';
import { BattleMode, getBattleModeConfig } from './battle-modes';


/**
 * 게임 상태 인터페이스
 */
export interface GameState {
    coins: number;
    tokens: number;
    level: number;
    experience: number;
    inventory: any[];
    unlockedFactions: string[];
    slots: any[];
    equipment: any[];
    research?: CommanderResearch;
    decks: any[];
    stageProgress?: any;
    lastBackup?: string;
    username?: string; // Player username for PVP
    nickname: string; // Commander nickname
    hasReceivedStarterPack?: boolean; // Track if player received starter pack

    // Stats for PVP
    stats?: {
        rating: number;
        wins: number;
        losses: number;
    };

    // 신규 시스템 데이터
    subscriptions: { factionId: string; nextPaymentAt: number; isActive: boolean }[];
    uniqueApplications: {
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        materialCardIds: string[];
        status: 'pending' | 'approved' | 'rejected' | 'completed';
        createdAt: number;
        completedAt?: number;
    }[];
}

/**
 * 에러 로그 인터페이스
 */
interface ErrorLog {
    timestamp: string;
    message: string;
    stack?: string;
    metadata?: any;
}

/**
 * 통합 저장소 클래스 (Safety System Enhanced)
 * Firebase를 우선 사용하고, 없으면 localStorage 사용
 * 데이터 검증, 자동 백업, 에러 로깅 포함
 */
class UnifiedStorage {
    private useFirebase: boolean;
    private errorLogs: ErrorLog[] = [];
    private readonly MAX_LOGS = 50;

    constructor() {
        this.useFirebase = isFirebaseConfigured;
    }

    /**
     * UID 기반 저장 키 생성
     */
    private getStorageKey(uid?: string): string {
        if (!uid) return 'gameState_guest';
        return `gameState_${uid}`;
    }

    /**
     * 에러 로깅 시스템
     */
    private logError(message: string, error: any, metadata?: any) {
        const errorLog: ErrorLog = {
            timestamp: new Date().toISOString(),
            message,
            stack: error instanceof Error ? error.stack : String(error),
            metadata
        };

        this.errorLogs.unshift(errorLog);
        if (this.errorLogs.length > this.MAX_LOGS) {
            this.errorLogs.pop();
        }

        // 로컬 스토리지에 에러 로그 저장 (디버깅용)
        try {
            localStorage.setItem('gameErrorLogs', JSON.stringify(this.errorLogs));
        } catch (e) {
            console.warn('Failed to save error logs:', e);
        }

        console.error(`[SafetySystem] ${message}`, error);
    }

    /**
     * 데이터 유효성 검사 및 자동 수정 (Self-Healing)
     */
    private validateState(state: Partial<GameState>): Partial<GameState> {
        const validated = { ...state };

        // 1. 숫자 데이터 음수 방지
        if (validated.coins !== undefined) validated.coins = Math.max(0, validated.coins);
        if (validated.tokens !== undefined) validated.tokens = Math.max(0, validated.tokens);
        if (validated.experience !== undefined) validated.experience = Math.max(0, validated.experience);
        if (validated.level !== undefined) validated.level = Math.max(1, validated.level); // 최소 레벨 1

        // 2. 배열 데이터 타입 보장
        if (validated.inventory && !Array.isArray(validated.inventory)) validated.inventory = [];
        if (validated.unlockedFactions && !Array.isArray(validated.unlockedFactions)) validated.unlockedFactions = [];
        if (validated.slots && !Array.isArray(validated.slots)) validated.slots = [];
        if (validated.equipment && !Array.isArray(validated.equipment)) validated.equipment = [];
        if (validated.decks && !Array.isArray(validated.decks)) validated.decks = [];

        return validated;
    }

    /**
     * 자동 백업 시스템 (3-slot rotation)
     */
    private backupToLocalStorage(state: GameState, uid?: string) {
        try {
            const key = this.getStorageKey(uid);
            const backupSlots = [`${key}_backup_1`, `${key}_backup_2`, `${key}_backup_3`];
            const lastBackupIndexKey = `${key}_lastBackupIndex`;
            const lastBackupIndex = parseInt(localStorage.getItem(lastBackupIndexKey) || '0', 10);
            const nextIndex = (lastBackupIndex + 1) % 3;

            const backupData = {
                timestamp: new Date().toISOString(),
                state
            };

            localStorage.setItem(backupSlots[nextIndex], JSON.stringify(backupData));
            localStorage.setItem(lastBackupIndexKey, nextIndex.toString());

            // console.log(`[SafetySystem] Backup created in slot ${backupSlots[nextIndex]}`);
        } catch (error) {
            console.warn('Backup failed:', error);
        }
    }

    /**
     * 로컬 상태 초기화 (로그아웃 시 호출)
     */
    public clearState(uid?: string) {
        try {
            const key = this.getStorageKey(uid);
            localStorage.removeItem(key); // Main state

            // Clear backups
            localStorage.removeItem(`${key}_backup_1`);
            localStorage.removeItem(`${key}_backup_2`);
            localStorage.removeItem(`${key}_backup_3`);
            localStorage.removeItem(`${key}_lastBackupIndex`);

            // Clear legacy/related keys if it's the main guest key
            if (key === 'game-state') {
                localStorage.removeItem('userCoins');
                localStorage.removeItem('userCards');
                localStorage.removeItem('game-state-v1');
            }

            // Clear logs
            localStorage.removeItem('gameErrorLogs');

            console.log(`[GameStorage] State cleared for user: ${uid || 'guest'}`);
        } catch (error) {
            console.error('Failed to clear state:', error);
        }
    }

    /**
     * 모든 세션 데이터 강제 초기화 (계정 전환/로그아웃 시 안전장치)
     */
    public clearAllSessionData() {
        try {
            // 1. 게스트/기본 데이터 삭제
            this.clearState();

            // 2. 모든 localStorage 키를 순회하며 게임 관련 데이터 삭제 (와일드카드 처리)
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.startsWith('game-state') ||
                    key.startsWith('inventory_') ||
                    key.startsWith('userCoins') ||
                    key.startsWith('userCards') ||
                    key.startsWith('tutorial_') ||
                    key.startsWith('generation_slots')
                )) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

            console.log(`[GameStorage] All session data cleared (${keysToRemove.length} keys)`);
        } catch (error) {
            console.error('Failed to clear ALL session data:', error);
        }
    }


    /**
     * 데이터 무결성 체크 (로드 시)
     */
    private checkIntegrity(state: any): boolean {
        // 필수 필드 존재 여부 확인
        const requiredFields = ['coins', 'tokens', 'level']; // 최소한의 필드
        const missingFields = requiredFields.filter(field => state[field] === undefined);

        if (missingFields.length > 0) {
            this.logError('Integrity check failed: missing fields', missingFields);
            return false;
        }
        return true;
    }

    /**
     * 게임 상태 로드
     */
    async loadGameState(uid?: string): Promise<GameState> {
        let loadedState: Partial<GameState> = {};

        // 기본 상태 정의
        const defaultState: GameState = {
            coins: 0,
            tokens: 100,
            level: 1,
            experience: 0,
            inventory: [],
            unlockedFactions: [],
            slots: [],
            equipment: [],
            decks: [],
            research: undefined,
            subscriptions: [],
            nickname: '지휘관',
            uniqueApplications: [],
        };

        if (this.useFirebase) {
            try {
                const profile = await loadUserProfile(uid);
                if (profile) {
                    // Firebase에서 로드 성공
                    const storageKey = this.getStorageKey(uid);
                    const localState = storage.get<Partial<GameState>>(storageKey, {});
                    // Check if inventory needs initialization (Starter Deck)
                    let inventory = localState.inventory || [];
                    if (inventory.length === 0) {
                        // Inject Starter Deck logic placeholder if needed
                    }

                    loadedState = {
                        coins: profile.coins,
                        tokens: profile.tokens,
                        level: profile.level,
                        experience: profile.exp,
                        inventory: inventory,
                        unlockedFactions: localState.unlockedFactions || [],
                        slots: localState.slots || [],
                        equipment: localState.equipment || [],
                        research: localState.research,
                        decks: localState.decks || []
                    };
                }
            } catch (error) {
                this.logError('Firebase load failed, falling back to localStorage', error);
            }
        }

        // Firebase 로드 실패했거나 미사용 시 localStorage 확인
        if (Object.keys(loadedState).length === 0) {
            const storageKey = this.getStorageKey(uid);
            loadedState = storage.get(storageKey, defaultState);
        }

        // 데이터 검증 및 복구
        if (!this.checkIntegrity(loadedState)) {
            console.warn('[SafetySystem] Data integrity warning. Attempting self-healing...');
            // 여기서 백업 복구 로직 등을 추가할 수 있음 (현재는 validateState로 기본값 보장)
        }

        const finalState = { ...defaultState, ...this.validateState(loadedState) } as GameState;
        return finalState;
    }

    /**
     * 게임 상태 저장
     */
    async saveGameState(state: Partial<GameState>, uid?: string): Promise<void> {
        try {
            // 1. 데이터 검증
            const validatedStateUpdate = this.validateState(state);

            // 2. 현재 상태와 병합하여 전체 상태 구성 (백업용)
            const storageKey = this.getStorageKey(uid);
            const currentState = storage.get(storageKey, {});
            const newState = { ...currentState, ...validatedStateUpdate };

            // 3. localStorage 저장 (Primary Save)
            storage.set(storageKey, newState);

            // 4. 자동 백업 실행 (중요 변경사항일 때만 하거나 주기적으로 할 수 있으나, 여기선 저장 시마다 수행 안전하게)
            // 성능 이슈가 있다면 debounce 처리 필요. 현재는 안전 우선.
            this.backupToLocalStorage(newState as GameState, uid);

            // 5. Firebase 저장
            if (this.useFirebase) {
                try {
                    const profileUpdate: any = {};
                    if (validatedStateUpdate.coins !== undefined) profileUpdate.coins = validatedStateUpdate.coins;
                    if (validatedStateUpdate.tokens !== undefined) profileUpdate.tokens = validatedStateUpdate.tokens;
                    if (validatedStateUpdate.level !== undefined) profileUpdate.level = validatedStateUpdate.level;
                    if (validatedStateUpdate.experience !== undefined) profileUpdate.exp = validatedStateUpdate.experience;

                    // [NEW] PVP Stats Sync
                    if (validatedStateUpdate.stats) {
                        if (validatedStateUpdate.stats.rating !== undefined) profileUpdate.rating = validatedStateUpdate.stats.rating;
                        if (validatedStateUpdate.stats.wins !== undefined) profileUpdate.wins = validatedStateUpdate.stats.wins;
                        if (validatedStateUpdate.stats.losses !== undefined) profileUpdate.losses = validatedStateUpdate.stats.losses;
                    }

                    if (Object.keys(profileUpdate).length > 0) {
                        await saveUserProfile(profileUpdate, uid);
                    }
                } catch (error) {
                    this.logError('Firebase save failed', error);
                }
            }
        } catch (error) {
            this.logError('Critical: Save Game State Failed', error);
        }
    }

    /**
     * 코인 추가/차감
     */
    async addCoins(amount: number, uid?: string): Promise<number> {
        const state = await this.loadGameState(uid);
        const newCoins = Math.max(0, state.coins + amount); // validateState에서도 체크하지만 이중 안전장치

        // Firebase 업데이트
        if (this.useFirebase && amount !== 0) {
            try {
                await updateCoins(amount, uid);
            } catch (error) {
                this.logError('Firebase coin update failed', error);
            }
        }

        // localStorage 업데이트
        await this.saveGameState({ coins: newCoins }, uid);
        return newCoins;
    }

    /**
     * 토큰 추가/차감
     */
    async addTokens(amount: number, uid?: string): Promise<number> {
        const state = await this.loadGameState(uid);
        const newTokens = Math.max(0, state.tokens + amount);

        // Firebase 업데이트
        if (this.useFirebase && amount !== 0) {
            try {
                await updateTokens(amount, uid);
            } catch (error) {
                this.logError('Firebase token update failed', error);
            }
        }

        // localStorage 업데이트
        await this.saveGameState({ tokens: newTokens }, uid);
        return newTokens;
    }

    /**
     * 경험치 추가 및 레벨업 처리
     */
    async addExperience(amount: number, uid?: string): Promise<{ level: number; experience: number; leveledUp: boolean }> {
        const state = await this.loadGameState(uid);
        let { level, experience } = state;

        experience += amount;
        let leveledUp = false;

        // 레벨업 체크
        while (experience >= level * 100) {
            experience -= level * 100;
            level++;
            leveledUp = true;
        }

        // 100레벨 제한 등 추가 밸런싱 가능
        level = Math.max(1, level);
        experience = Math.max(0, experience);

        // Firebase 업데이트
        if (this.useFirebase) {
            try {
                await updateExpAndLevel(experience, level, uid);
            } catch (error) {
                this.logError('Firebase exp update failed', error);
            }
        }

        // localStorage 업데이트 (중요 이벤트이므로 즉시 백업됨)
        await this.saveGameState({ level, experience }, uid);

        return { level, experience, leveledUp };
    }

    /**
     * 코인으로 구매 (충분한 코인이 있는지 확인)
     */
    async purchaseWithCoins(cost: number, uid?: string): Promise<boolean> {
        const state = await this.loadGameState(uid);
        if (state.coins < cost) {
            return false;
        }

        await this.addCoins(-cost, uid);
        return true;
    }

    /**
     * 토큰으로 구매
     */
    async purchaseWithTokens(cost: number, uid?: string): Promise<boolean> {
        const state = await this.loadGameState(uid);
        if (state.tokens < cost) {
            return false;
        }

        await this.addTokens(-cost, uid);
        return true;
    }

    /**
     * 인벤토리에 카드 추가
     */
    async addCardToInventory(card: any, uid?: string): Promise<void> {
        const state = await this.loadGameState(uid);
        const inventory = [...(state.inventory || []), card];
        await this.saveGameState({ inventory }, uid);
    }

    /**
     * 팩션 개방
     */
    async unlockFaction(factionId: string, uid?: string): Promise<void> {
        const state = await this.loadGameState(uid);
        const unlockedFactions = [...(state.unlockedFactions || [])];
        if (!unlockedFactions.includes(factionId)) {
            unlockedFactions.push(factionId);
            await this.saveGameState({ unlockedFactions }, uid);
        }
    }

    /**
     * 카드 목록 조회
     */
    async getCards(uid?: string): Promise<any[]> {
        const state = await this.loadGameState(uid);
        return state.inventory || [];
    }

    /**
     * 장비 목록 조회
     */
    async getEquipment(uid?: string): Promise<any[]> {
        const state = await this.loadGameState(uid);
        return state.equipment || [];
    }

    /**
     * 장비 추가
     */
    async addEquipment(equipment: any, uid?: string): Promise<void> {
        const state = await this.loadGameState(uid);
        const currentEquipment = state.equipment || [];
        await this.saveGameState({ equipment: [...currentEquipment, equipment] }, uid);
    }

    /**
     * 카드 업데이트
     */
    async updateCard(cardId: string, updates: any, uid?: string): Promise<void> {
        const state = await this.loadGameState(uid);
        const inventory = state.inventory || [];
        const index = inventory.findIndex((c: any) => c.id === cardId);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...updates };
            await this.saveGameState({ inventory }, uid);
        }
    }

    /**
     * 장비 업데이트
     */
    async updateEquipment(equipment: any, uid?: string): Promise<void> {
        const state = await this.loadGameState(uid);
        const currentEquipment = state.equipment || [];
        const index = currentEquipment.findIndex((e: any) => e.id === equipment.id);
        if (index !== -1) {
            currentEquipment[index] = equipment;
            await this.saveGameState({ equipment: currentEquipment }, uid);
        }
    }

    /**
     * 카드 삭제
     */
    async deleteCard(cardId: string, uid?: string): Promise<void> {
        const state = await this.loadGameState(uid);
        const inventory = state.inventory || [];
        const newInventory = inventory.filter((c: any) => c.id !== cardId);
        await this.saveGameState({ inventory: newInventory }, uid);
    }

    /**
     * 레벨 조회
     */
    async getLevel(uid?: string): Promise<number> {
        const state = await this.loadGameState(uid);
        return state.level || 1;
    }

    /**
     * 경험치 조회
     */
    async getExperience(uid?: string): Promise<number> {
        const state = await this.loadGameState(uid);
        return state.experience || 0;
    }

    /**
     * 덱 조회 (카드 객체 반환)
     */
    async getDeck(deckId: string, uid?: string): Promise<any[]> {
        const state = await this.loadGameState(uid);
        const decks = state.decks || [];
        const deck = decks.find((d: any) => d.id === deckId);
        if (!deck) return [];

        const inventory = state.inventory || [];
        return deck.cardIds
            .map((id: string) => inventory.find((c: any) => c.id === id))
            .filter((c: any) => c !== undefined);
    }

    /**
     * 활성 덱 카드 조회
     */
    async getActiveDeckCards(uid?: string): Promise<any[]> {
        const state = await this.loadGameState(uid);
        const decks = state.decks || [];
        const activeDeck = decks.find((d: any) => d.isActive);

        if (!activeDeck) {
            // 활성 덱이 없으면 인벤토리 상위 5개 반환 (임시)
            const inventory = state.inventory || [];
            return inventory.slice(0, 5);
        }

        const inventory = state.inventory || [];
        return activeDeck.cardIds
            .map((id: string) => inventory.find((c: any) => c.id === id))
            .filter((c: any) => c !== undefined);
    }

    /**
     * 전투 통계 조회 (스텁)
     */
    async getBattleStats(): Promise<{ victories: number; defeats: number }> {
        // This is a stub implementation - battle stats are not currently tracked
        return { victories: 0, defeats: 0 };
    }

    /**
     * 전투 입장 조건 확인 (Ante)
     */
    async checkAnteRequirement(mode: BattleMode): Promise<{ allowed: boolean; reason?: string }> {
        const state = await this.loadGameState();
        const config = getBattleModeConfig(mode);

        if (!config.ante) return { allowed: true };

        const inventory = state.inventory || [];

        // Count expendable cards (Not protected: Level <= 1)
        // User requested: "Enhanced cards are not lost" => Level > 1 is protected.
        const expendableCards = inventory.filter((c: any) => c.level <= 1 && !c.isLocked);

        if (expendableCards.length < config.ante.requiredCount) {
            return {
                allowed: false,
                reason: `Not enough expendable cards for Ante. Required: ${config.ante.requiredCount}, Available: ${expendableCards.length}`
            };
        }

        return { allowed: true };
    }

    /**
     * 전투 결과 처리 (Ante System)
     */
    async processBattleResult(
        mode: BattleMode,
        isVictory: boolean,
        enemyDeck: any[] // Source for capturing cards
    ): Promise<{ lostCards: any[]; gainedCards: any[]; message: string }> {
        const state = await this.loadGameState();
        const config = getBattleModeConfig(mode);
        const ante = config.ante;

        if (!ante) return { lostCards: [], gainedCards: [], message: 'No Ante Rules' };

        let lostCards: any[] = [];
        let gainedCards: any[] = [];
        let message = '';

        if (isVictory) {
            // Victory: Gain Reward
            if (ante.winRewardType === 'card' && enemyDeck.length > 0) {
                // Capture 1 random card from enemy deck
                const target = enemyDeck[Math.floor(Math.random() * enemyDeck.length)];

                // Create a copy for player
                // NOTE: We need a way to generate a unique ID. Using timestamp for now.
                const newCard = {
                    ...target,
                    id: `${target.id.split('_')[0]}_captured_${Date.now()}`,
                    ownerId: 'player', // Assign to player
                    acquiredAt: new Date(),
                    isLocked: false,
                    level: 1, // Reset level? Or keep? Let's reset to 1 (Card Capture typically gives base)
                    experience: 0
                };

                await this.addCardToInventory(newCard);
                gainedCards.push(newCard);
                message = `Captured ${newCard.name}!`;
            } else if (ante.winRewardType === 'token') {
                // Arena Token Reward (Placeholder)
                await this.addTokens(10);
                message = 'Earned 10 Arena Tokens!';
            }
        } else {
            // Defeat: Lose Cards
            const inventory = state.inventory || [];

            // Filter candidates: Level 1, Not Locked
            let candidates = inventory.filter((c: any) => c.level <= 1 && !c.isLocked);
            let cardsToRemove: any[] = [];

            // Priority Removal
            // 1. Common, 2. Rare... based on priority list
            for (const rarity of ante.lossRarityPriority) {
                if (cardsToRemove.length >= ante.lossCount) break;

                const pool = candidates.filter((c: any) => c.rarity === rarity);
                // Shuffle pool? Or just take first? Random is better.
                // Simple shuffle
                const shuffled = pool.sort(() => 0.5 - Math.random());

                const needed = ante.lossCount - cardsToRemove.length;
                const taking = shuffled.slice(0, needed);

                cardsToRemove = [...cardsToRemove, ...taking];

                // Remove taken from candidates to avoid double counting (though rarity check prevents it)
            }

            // If still need more and priority list exhausted? 
            // The requirement implies strictly following priority. 
            // But if user says "Lose 5 Commons", usually implying strict cost.
            // If we ran out of Commons, do we take Rares?
            // User said: "If common cards run out, rare cards are consumed."
            // My priority loop [common, rare] handles this sequentially.

            // Execute Removal
            if (cardsToRemove.length > 0) {
                const removeIds = cardsToRemove.map(c => c.id);
                const newInventory = inventory.filter((c: any) => !removeIds.includes(c.id));
                await this.saveGameState({ inventory: newInventory });
                lostCards = cardsToRemove;
                message = `Lost ${lostCards.length} cards in defeat.`;
            } else {
                message = 'No expendable cards lost (Protected).'; // Should be prevented by checkAnteRequirement
            }
        }

        return { lostCards, gainedCards, message };
    }

    /**
     * 스테이지 클리어 보상 수령 (연구 효과 적용)
     */
    async claimStageRewards(
        baseRewards: { coins: number; exp: number; tokens?: number },
        isFirstClear: boolean
    ): Promise<{ coins: number; exp: number; tokens: number; bonuses: { coins: number; exp: number; tokens: number }; leveledUp: boolean }> {
        const state = await this.loadGameState();

        // 1. 연구 보너스 계산 (행운)
        let bonusMultiplier = 0;
        if (state.research?.stats?.fortune) {
            const { getResearchBonus } = await import('./research-system');
            bonusMultiplier = getResearchBonus('fortune', state.research.stats.fortune.currentLevel) / 100;
        }

        // 반복 클리어 시 기본 보상 감소 (50%) - First Clear는 100%
        const repeatPenalty = isFirstClear ? 1 : 0.5;

        // 최종 보상 계산
        const finalCoins = Math.floor(baseRewards.coins * repeatPenalty * (1 + bonusMultiplier));
        const finalExp = Math.floor(baseRewards.exp * repeatPenalty * (1 + bonusMultiplier));
        const finalTokens = Math.floor((baseRewards.tokens || 0) * repeatPenalty * (1 + bonusMultiplier));

        // 보너스 수치 (UI 표시용)
        const bonuses = {
            coins: Math.floor(baseRewards.coins * repeatPenalty * bonusMultiplier),
            exp: Math.floor(baseRewards.exp * repeatPenalty * bonusMultiplier),
            tokens: Math.floor((baseRewards.tokens || 0) * repeatPenalty * bonusMultiplier)
        };

        // 저장
        await this.addCoins(finalCoins);
        await this.addTokens(finalTokens);
        const { leveledUp } = await this.addExperience(finalExp);

        return { coins: finalCoins, exp: finalExp, tokens: finalTokens, bonuses, leveledUp };
    }

    /**
     * 연구 상태 업데이트 (New)
     */
    async updateResearchState(
        categoryId: ResearchCategory,
        update: Partial<ResearchProgress>
    ): Promise<CommanderResearch> {
        const state = await this.loadGameState();
        const research = state.research || createInitialResearchState();

        const currentStat = research.stats[categoryId];
        research.stats[categoryId] = {
            ...currentStat,
            ...update
        };

        // Note: Research point deduction logic is assumed to be handled by caller or separate method for now.
        // If we want to save total points, we should update usage here:
        // research.totalResearchPoints = ... (passed in or calculated)

        await this.saveGameState({ research });
        return research;
    }
}

// 싱글톤 인스턴스
export const gameStorage = new UnifiedStorage();
