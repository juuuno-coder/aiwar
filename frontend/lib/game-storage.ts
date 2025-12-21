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
                        slots: localState.slots || []
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
            slots: []
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
}

// 싱글톤 인스턴스
export const gameStorage = new UnifiedStorage();
