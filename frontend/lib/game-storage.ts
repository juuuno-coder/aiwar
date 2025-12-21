// 통합 저장소 유틸리티 (Firebase + localStorage)
import { storage } from './utils';
import {
    loadUserProfile,
    saveUserProfile,
    updateCoins,
    updateTokens,
    updateExpAndLevel
} from './firebase-db';
import { isFirebaseConfigured } from './firebase';
import { CommanderResearch } from './research-system';

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
}

/**
 * 통합 저장소 클래스
 * Firebase를 우선 사용하고, 없으면 localStorage 사용
 */
class UnifiedStorage {
    private useFirebase: boolean;

    constructor() {
        this.useFirebase = isFirebaseConfigured;
    }

    /**
     * 게임 상태 로드
     */
    async loadGameState(): Promise<GameState> {
        if (this.useFirebase) {
            try {
                const profile = await loadUserProfile();
                if (profile) {
                    // Firebase에서 로드 성공
                    const localState = storage.get<Partial<GameState>>('gameState', {});
                    return {
                        coins: profile.coins,
                        tokens: profile.tokens,
                        level: profile.level,
                        experience: profile.exp,
                        inventory: localState.inventory || [],
                        unlockedFactions: localState.unlockedFactions || [],
                        slots: localState.slots || [],
                        equipment: localState.equipment || [],
                        research: localState.research,
                        decks: localState.decks || []
                    };
                }
            } catch (error) {
                console.error('Firebase 로드 실패, localStorage 사용:', error);
            }
        }

        // localStorage 폴백
        return storage.get('gameState', {
            coins: 1000,
            tokens: 100,
            level: 1,
            experience: 0,
            inventory: [],
            unlockedFactions: [],
            slots: [],
            equipment: [],
            decks: []
        });
    }

    /**
     * 게임 상태 저장
     */
    async saveGameState(state: Partial<GameState>): Promise<void> {
        // localStorage에 항상 저장 (백업)
        const currentState = storage.get('gameState', {});
        const newState = { ...currentState, ...state };
        storage.set('gameState', newState);

        // Firebase에도 저장
        if (this.useFirebase) {
            try {
                const profileUpdate: any = {};
                if (state.coins !== undefined) profileUpdate.coins = state.coins;
                if (state.tokens !== undefined) profileUpdate.tokens = state.tokens;
                if (state.level !== undefined) profileUpdate.level = state.level;
                if (state.experience !== undefined) profileUpdate.exp = state.experience;

                if (Object.keys(profileUpdate).length > 0) {
                    await saveUserProfile(profileUpdate);
                }
            } catch (error) {
                console.error('Firebase 저장 실패:', error);
            }
        }
    }

    /**
     * 코인 추가/차감
     */
    async addCoins(amount: number): Promise<number> {
        const state = await this.loadGameState();
        const newCoins = Math.max(0, state.coins + amount);

        // Firebase 업데이트
        if (this.useFirebase && amount !== 0) {
            try {
                await updateCoins(amount);
            } catch (error) {
                console.error('Firebase 코인 업데이트 실패:', error);
            }
        }

        // localStorage 업데이트
        await this.saveGameState({ coins: newCoins });
        return newCoins;
    }

    /**
     * 토큰 추가/차감
     */
    async addTokens(amount: number): Promise<number> {
        const state = await this.loadGameState();
        const newTokens = Math.max(0, state.tokens + amount);

        // Firebase 업데이트
        if (this.useFirebase && amount !== 0) {
            try {
                await updateTokens(amount);
            } catch (error) {
                console.error('Firebase 토큰 업데이트 실패:', error);
            }
        }

        // localStorage 업데이트
        await this.saveGameState({ tokens: newTokens });
        return newTokens;
    }

    /**
     * 경험치 추가 및 레벨업 처리
     */
    async addExperience(amount: number): Promise<{ level: number; experience: number; leveledUp: boolean }> {
        const state = await this.loadGameState();
        let { level, experience } = state;

        experience += amount;
        let leveledUp = false;

        // 레벨업 체크
        while (experience >= level * 100) {
            experience -= level * 100;
            level++;
            leveledUp = true;
        }

        // Firebase 업데이트
        if (this.useFirebase) {
            try {
                await updateExpAndLevel(experience, level);
            } catch (error) {
                console.error('Firebase 경험치 업데이트 실패:', error);
            }
        }

        // localStorage 업데이트
        await this.saveGameState({ level, experience });

        return { level, experience, leveledUp };
    }

    /**
     * 코인으로 구매 (충분한 코인이 있는지 확인)
     */
    async purchaseWithCoins(cost: number): Promise<boolean> {
        const state = await this.loadGameState();
        if (state.coins < cost) {
            return false;
        }

        await this.addCoins(-cost);
        return true;
    }

    /**
     * 토큰으로 구매
     */
    async purchaseWithTokens(cost: number): Promise<boolean> {
        const state = await this.loadGameState();
        if (state.tokens < cost) {
            return false;
        }

        await this.addTokens(-cost);
        return true;
    }

    /**
     * 인벤토리에 카드 추가
     */
    async addCardToInventory(card: any): Promise<void> {
        const state = await this.loadGameState();
        const inventory = [...(state.inventory || []), card];
        await this.saveGameState({ inventory });
    }

    /**
     * 팩션 해금
     */
    async unlockFaction(factionId: string): Promise<void> {
        const state = await this.loadGameState();
        const unlockedFactions = [...(state.unlockedFactions || [])];
        if (!unlockedFactions.includes(factionId)) {
            unlockedFactions.push(factionId);
            await this.saveGameState({ unlockedFactions });
        }
    }

    /**
     * 카드 목록 조회
     */
    async getCards(): Promise<any[]> {
        const state = await this.loadGameState();
        return state.inventory || [];
    }

    /**
     * 장비 목록 조회
     */
    async getEquipment(): Promise<any[]> {
        const state = await this.loadGameState();
        return state.equipment || [];
    }

    /**
     * 장비 추가
     */
    async addEquipment(equipment: any): Promise<void> {
        const state = await this.loadGameState();
        const currentEquipment = state.equipment || [];
        await this.saveGameState({ equipment: [...currentEquipment, equipment] });
    }

    /**
     * 카드 업데이트
     */
    async updateCard(cardId: string, updates: any): Promise<void> {
        const state = await this.loadGameState();
        const inventory = state.inventory || [];
        const index = inventory.findIndex((c: any) => c.id === cardId);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...updates };
            await this.saveGameState({ inventory });
        }
    }

    /**
     * 장비 업데이트
     */
    async updateEquipment(equipment: any): Promise<void> {
        const state = await this.loadGameState();
        const currentEquipment = state.equipment || [];
        const index = currentEquipment.findIndex((e: any) => e.id === equipment.id);
        if (index !== -1) {
            currentEquipment[index] = equipment;
            await this.saveGameState({ equipment: currentEquipment });
        }
    }

    /**
     * 카드 삭제
     */
    async deleteCard(cardId: string): Promise<void> {
        const state = await this.loadGameState();
        const inventory = state.inventory || [];
        const newInventory = inventory.filter((c: any) => c.id !== cardId);
        await this.saveGameState({ inventory: newInventory });
    }

    /**
     * 레벨 조회
     */
    async getLevel(): Promise<number> {
        const state = await this.loadGameState();
        return state.level || 1;
    }

    /**
     * 경험치 조회
     */
    async getExperience(): Promise<number> {
        const state = await this.loadGameState();
        return state.experience || 0;
    }

    /**
     * 덱 조회 (카드 객체 반환)
     */
    async getDeck(deckId: string): Promise<any[]> {
        const state = await this.loadGameState();
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
    async getActiveDeckCards(): Promise<any[]> {
        const state = await this.loadGameState();
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
}

// 싱글톤 인스턴스
export const gameStorage = new UnifiedStorage();
