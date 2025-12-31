'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gameStorage, GameState } from '@/lib/game-storage';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
    updateCoins as firebaseUpdateCoins,
    updateTokens as firebaseUpdateTokens,
    updateExpAndLevel as firebaseUpdateExpAndLevel
} from '@/lib/firebase-db';
import { generateCardByRarity } from '@/lib/card-generation-system';
import { addCardToInventory } from '@/lib/inventory-system';
import type { Card, Rarity } from '@/lib/types';
import { useNotification } from '@/context/NotificationContext';
import { useFirebase } from '@/components/FirebaseProvider';
import { addNotification } from '@/components/NotificationCenter';
import {
    syncSubscriptionsWithFirebase,
    migrateLegacySubscriptions
} from '@/lib/faction-subscription-utils';
import { migrateLegacyGameState } from '@/lib/game-state';
import { migrateLegacySlots } from '@/lib/generation-utils';

interface UserContextType {
    coins: number;
    tokens: number;
    level: number;
    experience: number;
    loading: boolean;
    inventory: Card[];
    addCoins: (amount: number) => Promise<number>;
    addTokens: (amount: number) => Promise<number>;
    addExperience: (amount: number) => Promise<{ level: number; experience: number; leveledUp: boolean }>;
    refreshData: () => Promise<void>;
    isAdmin: boolean;
    user: any;
    starterPackAvailable: boolean;
    claimStarterPack: () => Promise<Card[]>;
    hideStarterPack: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user } = useFirebase();
    const { profile, reload: reloadProfile, loading: profileLoading } = useUserProfile();

    const [coins, setCoins] = useState<number>(0);
    const [tokens, setTokens] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [experience, setExperience] = useState<number>(0);
    const [inventory, setInventory] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [starterPackAvailable, setStarterPackAvailable] = useState(false);


    // Initial mount check to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const prevUserRef = React.useRef<string | null>(null);

    // Reset state and clear storage when user logs out or changes
    useEffect(() => {
        if (!mounted) return;

        const currentUid = user?.uid || null;
        const prevUid = prevUserRef.current;

        // If user changed (logged out or switched)
        if (prevUid !== currentUid) {
            console.log(`[Auth] User changed from ${prevUid} to ${currentUid}`);

            // If we had a previous user, clear their local session state
            if (prevUid) {
                console.log(`[Auth] Clearing session for previous user: ${prevUid}`);
                gameStorage.clearState(prevUid);
            }

            // Reset UI state
            setLoading(true);
            setCoins(0);
            setTokens(0);
            setLevel(1);
            setExperience(0);
        }

        // Update ref
        prevUserRef.current = currentUid;


        // Sync subscriptions from Firebase if user is logged in
        if (user?.uid) {
            // 마이그레이션 우선 실행 (게스트 데이터 -> 유저 데이터)
            const runMigration = async () => {
                try {
                    console.log(`[Auth] User logged in: ${user.uid}. Starting migration check...`);

                    // 순차적으로 마이그레이션 진행
                    migrateLegacyGameState(user.uid);
                    migrateLegacySlots(user.uid);
                    await migrateLegacySubscriptions(user.uid);

                    console.log(`[Auth] Migration check completed for ${user.uid}`);

                    // 마이그레이션 후 Firebase 동기화
                    await syncSubscriptionsWithFirebase(user.uid);

                    // 프로필 및 데이터 리프레시
                    refreshData();
                } catch (err) {
                    console.error("[Auth] Migration or Sync failed:", err);
                }
            };

            runMigration();
        }

        // Data will be reloaded by the profile sync or refreshData effect
    }, [mounted, user?.uid]);

    // Sync state from Firebase profile
    useEffect(() => {
        if (mounted && profile) {
            setCoins(profile.coins);
            setTokens(profile.tokens);
            setLevel(profile.level);
            setExperience(profile.exp);

            // Load inventory separately since it's not in profile
            gameStorage.getCards(user?.uid).then((cards: any[]) => {
                setInventory(cards || []);
            }).catch(console.error);

            setLoading(false);
        }
    }, [mounted, profile, user?.uid]);

    const checkFeatureUnlocks = (newLevel: number) => {
        if (newLevel === 3) {
            addNotification({
                type: 'levelup',
                title: '연구소 잠금 해제!',
                message: '이제 연구소에서 AI 기술을 연구하여 카드를 강화할 수 있습니다.',
                icon: '🧪'
            });
        }
        if (newLevel === 5) {
            addNotification({
                type: 'levelup',
                title: 'PVP 아레나 잠금 해제!',
                message: '다른 플레이어와 실력을 겨뤄보세요! 아레나가 개방되었습니다.',
                icon: '⚔️'
            });
        }
        if (newLevel === 10) {
            addNotification({
                type: 'levelup',
                title: '랭크전 시작 가능!',
                message: '진정한 실력자를 가리는 랭크전에 참여하여 명예를 드높이세요!',
                icon: '🏆'
            });
        }

        // General Level Up Notification
        addNotification({
            type: 'levelup',
            title: `레벨 업! Lv.${newLevel}`,
            message: `축하합니다! 레벨 ${newLevel}이 되었습니다. 더 강력한 카드를 생성할 수 있습니다.`,
            icon: '🆙'
        });
    };

    const refreshData = useCallback(async () => {
        if (!mounted) return;

        if (profile) {
            await reloadProfile();
            // Check inventory from profile or context?
            // Profile context usually syncs to local state, so check local state in useEffect or here?
            // Actually reloadProfile updates 'profile' object.
            // Let's assume profile has inventory or we check loaded state.
            // gameStorage.loadGameState gives full state.
            // But if profile exists, we trust profile.
            // Let's check if inventory is empty in the profile-based flow too.
            // Ideally inventory is loaded.
        } else {
            setLoading(true);
            try {
                const state = await gameStorage.loadGameState(user?.uid);
                setCoins(state.coins || 0);
                setTokens(state.tokens || 0);
                setLevel(state.level || 1);
                setLevel(state.level || 1);
                setExperience(state.experience || 0);
                setInventory(state.inventory || []);

                // Starter Pack Check
                if ((!state.inventory || state.inventory.length === 0) && !state.hasReceivedStarterPack) {
                    setStarterPackAvailable(true);
                }
            } catch (err) {
                console.error("Failed to load state:", err);
            } finally {
                setLoading(false);
            }
        }
    }, [mounted, profile, reloadProfile, user?.uid]);

    // Initial load for non-logged-in users or when profile load completes as null
    useEffect(() => {
        if (mounted && !profileLoading && !profile) {
            refreshData();
        }
    }, [mounted, profileLoading, profile, refreshData]);

    const addCoinsByContext = async (amount: number) => {
        if (!mounted) return coins;

        if (profile) {
            await firebaseUpdateCoins(amount, user?.uid);
            await reloadProfile();
            return coins + amount;
        } else {
            try {
                const newCoins = await gameStorage.addCoins(amount, user?.uid);
                setCoins(newCoins);
                return newCoins;
            } catch (err) {
                console.error("Failed to add coins:", err);
                return coins;
            }
        }
    };

    const addTokensByContext = async (amount: number) => {
        if (!mounted) return tokens;

        if (profile) {
            await firebaseUpdateTokens(amount, user?.uid);
            await reloadProfile();
            return tokens + amount;
        } else {
            try {
                const newTokens = await gameStorage.addTokens(amount, user?.uid);
                setTokens(newTokens);
                return newTokens;
            } catch (err) {
                console.error("Failed to add tokens:", err);
                return tokens;
            }
        }
    };

    const addExperienceByContext = async (amount: number) => {
        if (profile) {
            // Replicate Level Up Logic locally to calculate new state to send to Firebase
            // Logic mirrored from game-storage.ts
            let currentExp = experience + amount;
            let currentLevel = level;
            let leveledUp = false;

            while (currentExp >= currentLevel * 100) {
                currentExp -= currentLevel * 100;
                currentLevel++;
                leveledUp = true;
            }

            // Apply limits if any (game-storage has Math.max(1), Math.max(0))
            currentLevel = Math.max(1, currentLevel);
            currentExp = Math.max(0, currentExp);

            await firebaseUpdateExpAndLevel(currentExp, currentLevel, user?.uid);
            await reloadProfile();

            // Trigger Notification for Feature Unlocks (Firebase Mode)
            if (leveledUp) {
                checkFeatureUnlocks(currentLevel);
            }

            return { level: currentLevel, experience: currentExp, leveledUp };
        } else {
            const result = await gameStorage.addExperience(amount, user?.uid);

            // Check for local storage level up
            if (result.leveledUp) {
                checkFeatureUnlocks(result.level);
            }

            setLevel(result.level);
            setExperience(result.experience);
            return result;
        }
    };



    const hideStarterPack = () => setStarterPackAvailable(false);

    const claimStarterPack = async (): Promise<Card[]> => {
        if (!mounted) return [];

        const uid = user?.uid;
        if (!uid) {
            addNotification({
                type: 'error',
                title: '오류 발생',
                message: '로그인 정보를 찾을 수 없습니다.',
                icon: '⚠️'
            });
            return [];
        }

        setLoading(true);
        try {
            console.log("Claiming Starter Pack for:", uid);

            // 1. Add Coins
            await addCoinsByContext(1000);

            // 2. Generate Cards
            const newCards: Card[] = [];

            // 1 Rare Card
            const rareCard = generateCardByRarity('rare');
            if (rareCard) newCards.push(rareCard);

            // 4 Common Cards
            for (let i = 0; i < 4; i++) {
                const commonCard = generateCardByRarity('common');
                if (commonCard) newCards.push(commonCard);
            }

            console.log("Generated starter cards:", newCards.length);

            // 3. Add to Inventory
            for (const card of newCards) {
                card.ownerId = uid;
                await addCardToInventory(card, uid);
            }

            // 4. Update Flag in GameState
            const currentState = await gameStorage.loadGameState(uid);
            currentState.hasReceivedStarterPack = true;
            await gameStorage.saveGameState(currentState, uid);
            console.log("Starter pack flag check marked.");

            // 5. Notify
            addNotification({
                type: 'reward',
                title: '스타터팩 지급 완료!',
                message: '1000 코인과 카드 5장을 획득했습니다.',
                icon: '🎁'
            });

            // 6. Finish
            // setStarterPackAvailable(false); 

            // Refresh to update UI
            await refreshData();
            console.log("Data refreshed successfully.");

            return newCards;

        } catch (error) {
            console.error("Failed to claim starter pack:", error);
            addNotification({
                type: 'error',
                title: '오류 발생',
                message: '스타터팩 지급 중 문제가 발생했습니다. 관리자에게 문의해주세요.',
                icon: '⚠️'
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider
            value={{
                coins,
                tokens,
                level,
                experience,
                loading,
                inventory,
                addCoins: addCoinsByContext,
                addTokens: addTokensByContext,
                addExperience: addExperienceByContext,
                refreshData,
                isAdmin,
                user,
                starterPackAvailable,
                claimStarterPack,
                hideStarterPack
            }}
        >
            {children}
            {/* Modal for Starter Pack could be here or handled by layout */}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
