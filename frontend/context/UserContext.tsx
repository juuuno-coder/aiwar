'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gameStorage, GameState } from '@/lib/game-storage';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
    updateCoins as firebaseUpdateCoins,
    updateTokens as firebaseUpdateTokens,
    updateExpAndLevel as firebaseUpdateExpAndLevel,
    saveUserProfile,
    checkAndRechargeTokens // [NEW]
} from '@/lib/firebase-db';
import { generateCardByRarity } from '@/lib/card-generation-system';
import { addCardToInventory, loadInventory, distributeStarterPack } from '@/lib/inventory-system';
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

import { // [NEW]
    CATEGORY_TOKEN_BONUS, // [NEW]
    FACTION_CATEGORY_MAP, // [NEW]
    TIER_MULTIPLIER // [NEW]
} from '@/lib/token-constants'; // [NEW]
import { SubscriptionTier, UserSubscription } from '@/lib/faction-subscription'; // [NEW]
import { UserProfile, fetchUserSubscriptions } from '@/lib/firebase-db'; // [NEW]
import { User } from 'firebase/auth'; // [NEW]

interface UserContextType {
    coins: number;
    tokens: number;
    level: number;
    experience: number;
    loading: boolean;
    inventory: Card[];
    addCoins: (amount: number) => Promise<void>; // Changed return type
    addTokens: (amount: number) => Promise<void>; // Changed return type
    addExperience: (amount: number) => Promise<{ level: number; experience: number; leveledUp: boolean }>;
    refreshData: () => Promise<void>;
    isAdmin: boolean;
    user: User | null; // Changed type
    profile: UserProfile | null; // Added
    starterPackAvailable: boolean;
    claimStarterPack: () => Promise<Card[]>;
    hideStarterPack: () => void;
    consumeTokens: (baseAmount: number, category?: string) => Promise<boolean>; // Added
    subscriptions: UserSubscription[]; // [NEW] Added
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
    const [isClaimingInSession, setIsClaimingInSession] = useState(false);
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]); // [NEW]

    // [Safety] Reset state to prevent data bleed from previous sessions/users
    const resetState = useCallback(() => {
        setCoins(0);
        setTokens(0);
        setLevel(1);
        setExperience(0);
        setInventory([]);
        setStarterPackAvailable(false);
        setSubscriptions([]); // [NEW]
    }, []); // [NEW] Prevents modal from re-popping after click


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
            setSubscriptions([]); // [NEW]
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
        } else if (!loading && !user) {
            // User logged out or no user: Clear state immediately
            resetState();
        }

        // Data will be reloaded by the profile sync or refreshData effect
    }, [mounted, user, resetState, loading]);

    // Sync state from Firebase profile
    useEffect(() => {
        if (mounted && profile && user?.uid) {
            setCoins(profile.coins);
            setTokens(profile.tokens);
            setLevel(profile.level);
            setExperience(profile.exp);

            // [Auto-Healing & Rescue] 
            // 1. 코인 과다 지급 수정 (Level 1은 1,000 코인이 최대)
            if (profile.level === 1 && profile.coins > 1000) {
                const excess = profile.coins - 1000;
                console.log(`[SafetySystem] Healing: Resetting Level 1 coins from ${profile.coins} to 1000`);
                firebaseUpdateCoins(-excess, user.uid).catch(console.error);
                setCoins(1000); // 즉시 UI 반영
                // If coins are healed, it implies the starter pack was effectively received.
                if (!profile.hasReceivedStarterPack) {
                    saveUserProfile({ hasReceivedStarterPack: true }, user.uid).catch(console.error);
                }
            }

            // 2. 인벤토리 긴급 구조 (수령 처리되었으나 카드가 없는 경우)
            // Load inventory and check for gaps
            loadInventory(user.uid).then(async (cards) => {
                const formattedCards = cards.map(c => ({
                    ...c,
                    acquiredAt: (c.acquiredAt && 'toDate' in (c.acquiredAt as any)) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
                })) as Card[];
                setInventory(formattedCards);

                // Emergency Rescue: 이미 수령했는데 카드가 0장인 경우 (Level 1 대상)
                if (profile.level === 1 && profile.hasReceivedStarterPack && formattedCards.length === 0) {
                    console.log("[SafetySystem] Rescue: Found claimed flag but 0 cards. Re-distributing...");
                    const rescuedCards = await distributeStarterPack(user.uid, profile.nickname || '지휘관');
                    if (rescuedCards && rescuedCards.length > 0) {
                        const formattedRescued = rescuedCards.map(c => ({
                            ...c,
                            acquiredAt: new Date()
                        })) as Card[];
                        setInventory(formattedRescued);
                        addNotification({
                            type: 'reward',
                            title: '데이터 복구 완료',
                            message: '유실되었던 스타터팩 카드를 복구했습니다.',
                            icon: '🎁'
                        });
                        setIsClaimingInSession(true); // Don't show modal ever again
                    }
                }

                // [Fix] Starter Pack Check - Only show if NO cards and NOT claimed in session
                // AND tutorial is completed (otherwise TutorialManager handles it)
                const isTutorialCompleted = localStorage.getItem(`tutorial_completed_${user.uid}`);

                if (isTutorialCompleted && !isClaimingInSession && formattedCards.length === 0 && !profile.hasReceivedStarterPack) {
                    setStarterPackAvailable(true);
                    console.log("[SafetySystem] Starter Pack is available (Rescue Mode).");
                } else {
                    setStarterPackAvailable(false);
                }
            }).catch(console.error);

            // [NEW] Load subscriptions
            fetchUserSubscriptions(user.uid).then(setSubscriptions).catch(console.error);

            setLoading(false);
        }
    }, [mounted, profile, user?.uid, isClaimingInSession]);

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
            const inv = await loadInventory(user?.uid);
            const formattedInv = inv.map(c => ({
                ...c,
                acquiredAt: (c.acquiredAt && 'toDate' in c.acquiredAt) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
            })) as Card[];
            setInventory(formattedInv);

            // [Auto Recharge Check]
            if (user?.uid && profile) {
                // TODO: Active Subscriptions fetch from DB
                // 임시: 빈 배열 (구독 기능 완성 시 여기에 fetch 로직 추가 필요)
                // const subscriptions = await fetchUserSubscriptions(user.uid);
                // fetchUserSubscriptions is now imported from firebase-db
                const fetchedSubscriptions = await fetchUserSubscriptions(user.uid); // [NEW]
                setSubscriptions(fetchedSubscriptions); // [NEW]

                const refreshedToken = await checkAndRechargeTokens(user.uid, profile.tokens, profile.lastTokenUpdate, fetchedSubscriptions); // Pass fetchedSubscriptions
                if (refreshedToken !== profile.tokens) {
                    setTokens(refreshedToken);
                }
            }

            // [Fix] Re-enable starter pack check here for robustness
            // BUT only if tutorial is completed (otherwise TutorialManager handles it)
            const isTutorialCompleted = localStorage.getItem(`tutorial_completed_${user?.uid}`);

            if (isTutorialCompleted && !isClaimingInSession && formattedInv.length === 0 && !profile.hasReceivedStarterPack) {
                console.log("[UserContext] refreshData: Triggering Starter Pack (Rescue Mode)");
                setStarterPackAvailable(true);
            }
        } else {
            setLoading(true);
            try {
                const state = await gameStorage.loadGameState(user?.uid);
                setCoins(state.coins || 0);
                setTokens(state.tokens || 0);
                setLevel(state.level || 1);
                setLevel(state.level || 1);
                setExperience(state.experience || 0);
                const inv = await loadInventory(user?.uid);
                const formattedInv = inv.map(c => ({
                    ...c,
                    acquiredAt: (c.acquiredAt && 'toDate' in c.acquiredAt) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
                })) as Card[];
                setInventory(formattedInv);

                // Starter Pack Check
                const hasReceived = !!(state as any).hasReceivedStarterPack;
                if ((!formattedInv || formattedInv.length === 0) && !hasReceived) {
                    setStarterPackAvailable(true);
                }
            } catch (err) {
                console.error("Failed to load state:", err);
            } finally {
                setLoading(false);
            }
        }
    }, [mounted, profile, reloadProfile, user?.uid, isClaimingInSession]);

    // Initial load for non-logged-in users or when profile load completes as null
    useEffect(() => {
        if (mounted && !profileLoading && !profile) {
            refreshData();
        }
    }, [mounted, profileLoading, profile, refreshData]);

    const addCoinsByContext = async (amount: number) => {
        if (!mounted) return; // Changed return type

        if (profile) {
            await firebaseUpdateCoins(amount, user?.uid);
            await reloadProfile();
            // No need to return newCoins, as reloadProfile will update state
        } else {
            try {
                const newCoins = await gameStorage.addCoins(amount, user?.uid);
                setCoins(newCoins);
            } catch (err) {
                console.error("Failed to add coins:", err);
            }
        }
    };

    const addTokensByContext = async (amount: number) => {
        if (!mounted) return; // Changed return type

        if (profile) {
            await firebaseUpdateTokens(amount, user?.uid);
            await reloadProfile();
            // No need to return newTokens, as reloadProfile will update state
        } else {
            try {
                const newTokens = await gameStorage.addTokens(amount, user?.uid);
                setTokens(newTokens);
            } catch (err) {
                console.error("Failed to add tokens:", err);
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

    // [NEW] 토큰 소모 (확률적 페이백 및 할인 적용)
    const consumeTokens = async (baseAmount: number, category: string = 'COMMON'): Promise<boolean> => {
        if (!user || !profile) return false;

        let finalAmount = baseAmount;
        let isPayback = false;
        let paybackAmount = 0;

        // 1. 카테고리별 할인 (VIDEO)
        // 현재 활성 구독을 확인해야 함 (간략화를 위해 로컬 상태나 프로필에서 가져와야 함)
        // 여기서는 MVP로 직접 DB 조회보다는, profile에 subscriptions 필드가 있다고 가정하거나
        // 별도로 구독 정보를 fetch 해오는 로직이 필요함.
        // *성능상* Context에 subscriptions state를 추가하는 게 좋음.
        // 일단은 '오버클럭/페이백' 로직만 구현 (코딩 카테고리 지정 시)

        // 만약 'CODING' 카테고리 작업이라면 페이백 체크
        if (category === 'CODING') {
            const bonus = CATEGORY_TOKEN_BONUS.CODING;
            if (Math.random() < bonus.chance) {
                isPayback = true;
                paybackAmount = Math.floor(finalAmount * bonus.refundRatio);
                // 페이백은 '소모 안 함'이 아니라 '소모 후 환급' 또는 '처음부터 적게 소모'
                // 여기서는 '처음부터 적게 소모'로 처리하여 유저에게 이득감을 줌
                finalAmount -= paybackAmount;
            }
        }

        if (profile.tokens < finalAmount) {
            return false;
        }

        await firebaseUpdateTokens(-finalAmount, user.uid); // Changed order of arguments

        // 로컬 상태 즉시 반영
        setTokens(prev => prev - finalAmount);

        if (isPayback) {
            // 알림 표시 (AlertContext 등을 사용할 수 없으므로 console이나 Toast 로직 필요)
            // 여기서는 값을 return true로 성공 처리만 함.
            // 호출부에서 payback 여부를 알 수 있게 리턴 타입을 {success: boolean, paybacked: number}로 바꾸는 게 좋지만
            // 인터페이스 유지를 위해 일단 진행.
            console.log(`⚡️ CODING OPTIMIZATION! Refunded ${paybackAmount} tokens.`);
        }

        return true;
    };


    const hideStarterPack = () => setStarterPackAvailable(false);

    const claimStarterPack = async (): Promise<Card[]> => {
        if (!mounted) return [];

        const uid = user?.uid;
        if (!user || !starterPackAvailable) return [];

        console.log("Starting starter pack claim process...");
        setStarterPackAvailable(false);
        setIsClaimingInSession(true); // [CRITICAL] Block re-opening immediately

        try {
            const uid = user.uid;

            // 1. 코인 지급 (1000 코인)
            // if profile exists, we use the account-based coin update
            if (profile) {
                await firebaseUpdateCoins(1000, uid);
            } else {
                await addCoinsByContext(1000);
            }
            console.log("1000 coins added to account.");

            // 2. 카드 생성 및 지급 (배치 처리로 변경)
            console.log("Distributing starter cards...");
            const inventoryCards = await distributeStarterPack(uid, profile?.nickname || '지휘관');

            // [FIX] 카드를 인벤토리에 확실히 저장
            if (inventoryCards && inventoryCards.length > 0) {
                const { addCardsToInventory } = await import('@/lib/inventory-system');
                await addCardsToInventory(inventoryCards);
                console.log(`${inventoryCards.length} starter cards saved to inventory.`);
            }

            if (!inventoryCards || inventoryCards.length === 0) {
                throw new Error("Failed to generate starter cards.");
            }

            // Convert InventoryCard to Card (handle Timestamp/Date conversion)
            const newCards = inventoryCards.map(c => ({
                ...c,
                acquiredAt: (c.acquiredAt && 'toDate' in (c.acquiredAt as any)) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
            })) as Card[];

            console.log(`${newCards.length} cards distributed successfully.`);

            // 4. Update Flag
            if (profile) {
                await saveUserProfile({ hasReceivedStarterPack: true }, uid);
                console.log("Firebase profile flag marked.");
            } else {
                const currentState = await gameStorage.loadGameState(uid);
                currentState.hasReceivedStarterPack = true;
                await gameStorage.saveGameState(currentState, uid);
                console.log("Local state flag marked.");
            }

            // [CRITICAL] Ensure local state is refreshed immediately to reflect the flag
            await refreshData();

            // 5. Notify
            addNotification({
                type: 'reward',
                title: '스타터팩 지급 완료!',
                message: '1000 코인과 카드 5장을 획용했습니다.',
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
                coins, // Explicitly pass state
                tokens, // Explicitly pass state
                level, // Explicitly pass state
                experience, // Explicitly pass state
                user,
                profile: profile ? { ...profile, coins, tokens } : null,
                inventory,
                loading,
                refreshData,
                addCoins: addCoinsByContext,
                addTokens: addTokensByContext,
                addExperience: addExperienceByContext,
                isAdmin,
                starterPackAvailable,
                claimStarterPack,
                hideStarterPack,
                consumeTokens, // [NEW]
                subscriptions // [NEW]
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
