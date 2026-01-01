'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gameStorage, GameState } from '@/lib/game-storage';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
    updateCoins as firebaseUpdateCoins,
    updateTokens as firebaseUpdateTokens,
    updateExpAndLevel as firebaseUpdateExpAndLevel,
    saveUserProfile,
    checkAndRechargeTokens,
    claimStarterPackTransaction,
    purchaseCardPackTransaction
} from '@/lib/firebase-db';
import { generateCardByRarity } from '@/lib/card-generation-system';
import { addCardToInventory, loadInventory, distributeStarterPack, InventoryCard } from '@/lib/inventory-system';
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
    inventory: InventoryCard[];
    addCoins: (amount: number) => Promise<void>;
    addTokens: (amount: number) => Promise<void>;
    addExperience: (amount: number) => Promise<{ level: number; experience: number; leveledUp: boolean }>;
    refreshData: () => Promise<void>;
    isAdmin: boolean;
    user: User | null;
    profile: UserProfile | null;
    starterPackAvailable: boolean;
    claimStarterPack: (nickname: string) => Promise<InventoryCard[]>;
    hideStarterPack: () => void;
    consumeTokens: (baseAmount: number, category?: string) => Promise<boolean>; // Added
    subscriptions: UserSubscription[];
    buyCardPack: (cards: Card[], price: number, currencyType: 'coin' | 'token') => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user } = useFirebase();
    const { profile, reload: reloadProfile, loading: profileLoading } = useUserProfile();

    const [coins, setCoins] = useState<number>(0);
    const [tokens, setTokens] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [experience, setExperience] = useState<number>(0);
    const [inventory, setInventory] = useState<InventoryCard[]>([]);
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
        setSubscriptions([]);
        setIsAdmin(false);
        setIsClaimingInSession(false);
    }, []);


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
            console.log(`[Auth] User changed from ${prevUid} to ${currentUid}. Clearing ALL session data to prevent bleed.`);

            // 더욱 강력한 초기화: 단순히 UID별 삭제가 아니라 전체 세션 클린업
            gameStorage.clearAllSessionData();

            // UI 상태 초기화
            resetState();
            setLoading(true);
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
                    // [Disable Migration] User requested strict DB-only data. No merging from local guest data.
                    // migrateLegacyGameState(user.uid);
                    // migrateLegacySlots(user.uid);
                    // await migrateLegacySubscriptions(user.uid);

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

            // [NEW] Load inventory and subscriptions with commander logic
            const loadData = async () => {
                try {
                    const cards = await loadInventory(user.uid);
                    const formattedCards = cards.map(c => ({
                        ...c,
                        acquiredAt: (c.acquiredAt && 'toDate' in (c.acquiredAt as any)) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
                    })) as Card[];

                    // [NEW] Add Commander cards from Ultra subscriptions
                    const subs = await fetchUserSubscriptions(user.uid);
                    setSubscriptions(subs);

                    const { COMMANDERS } = await import('@/data/card-database');
                    const ultraCommanders: Card[] = [];

                    for (const sub of subs) {
                        if (sub.tier === 'ultra' && sub.status === 'active') {
                            const cmdTemplate = COMMANDERS.find(c => c.aiFactionId === sub.factionId);
                            if (cmdTemplate) {
                                const alreadyExists = formattedCards.some(c => c.templateId === cmdTemplate.id || c.id === cmdTemplate.id);
                                if (!alreadyExists) {
                                    ultraCommanders.push({
                                        id: `commander-${cmdTemplate.id}`,
                                        instanceId: `commander-${cmdTemplate.id}-${user.uid}`,
                                        templateId: cmdTemplate.id,
                                        ownerId: user.uid,
                                        name: cmdTemplate.name,
                                        rarity: 'commander',
                                        type: 'EFFICIENCY',
                                        level: 1,
                                        experience: 0,
                                        imageUrl: cmdTemplate.imageUrl,
                                        aiFactionId: cmdTemplate.aiFactionId,
                                        description: cmdTemplate.description,
                                        stats: {
                                            efficiency: 95,
                                            creativity: 95,
                                            function: 95,
                                            totalPower: 285
                                        },
                                        acquiredAt: new Date(),
                                        isCommanderCard: true,
                                        isLocked: false,
                                        specialty: cmdTemplate.specialty
                                    } as InventoryCard);
                                }
                            }
                        }
                    }

                    const finalInventory = [...formattedCards, ...ultraCommanders] as InventoryCard[];
                    setInventory(finalInventory);

                    // Emergency Rescue (기존 로직 유지)
                    if (profile.level === 1 && profile.hasReceivedStarterPack && formattedCards.length === 0) {
                        console.log("[SafetySystem] Rescue: Found claimed flag but 0 cards. Re-distributing...");
                        const rescuedCards = await claimStarterPack(profile.nickname || '지휘관');
                        if (rescuedCards && rescuedCards.length > 0) {
                            // refreshData will handle the update
                        }
                    }

                    // Starter Pack Check
                    const isTutorialCompleted = localStorage.getItem(`tutorial_completed_${user.uid}`);
                    if (isTutorialCompleted && !isClaimingInSession && formattedCards.length === 0 && !profile.hasReceivedStarterPack) {
                        setStarterPackAvailable(true);
                    } else {
                        setStarterPackAvailable(false);
                    }

                } catch (e) {
                    console.error("Error loading user data:", e);
                }
            };

            loadData();
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
            })) as InventoryCard[];
            setInventory(formattedInv);

            // [Auto Recharge Check]
            if (user?.uid && profile) {
                // TODO: Active Subscriptions fetch from DB
                // 임시: 빈 배열 (구독 기능 완성 시 여기에 fetch 로직 추가 필요)
                // const subscriptions = await fetchUserSubscriptions(user.uid);
                // fetchUserSubscriptions is now imported from firebase-db
                try {
                    const fetchedSubscriptions = await fetchUserSubscriptions(user.uid); // [NEW]
                    setSubscriptions(fetchedSubscriptions); // [NEW]

                    const refreshedToken = await checkAndRechargeTokens(user.uid, profile.tokens, profile.lastTokenUpdate, fetchedSubscriptions); // Pass fetchedSubscriptions
                    if (refreshedToken !== profile.tokens) {
                        setTokens(refreshedToken);
                    }
                } catch (rechargeError) {
                    console.error("Token recharge check failed (non-critical):", rechargeError);
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
                })) as InventoryCard[];
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
        if (!mounted) return;

        if (profile) {
            // Firestore increment handles negative amounts, 
            // but we ensure local state doesn't dip below 0 if it were local-only
            await firebaseUpdateCoins(amount, user?.uid);
            await reloadProfile();
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

    const claimStarterPack = async (nickname: string): Promise<InventoryCard[]> => {
        if (!mounted || !user) return [];

        setStarterPackAvailable(false);
        setIsClaimingInSession(true);

        try {
            const uid = user.uid;

            // 1. 카드 리스트 생성 (기존 방식 유지)
            // inventory-system.ts의 distributeStarterPack 로직 중 카드 생성 부분만 필요하지만,
            // 트랜잭션 내에서 모든 처리를 하기 위해 generateCardByRarity를 사용하여 수동 생성.
            const { generateCardByRarity: gen } = await import('@/lib/card-generation-system');
            const starterCards = [
                gen('common', uid),
                gen('rare', uid),
                gen('epic', uid),
                gen('legendary', uid),
                gen('unique', uid)
            ];

            // 닉네임 커스터마이징
            starterCards[4].name = `지휘관 ${nickname}`;
            starterCards[4].description = "전장에 새롭게 합류한 지휘관의 전용 유닉입니다.";

            // 2. 트랜잭션 실행 (재화 지급 + 닉네임 설정 + 카드 추가)
            await claimStarterPackTransaction(uid, nickname, starterCards, 1000);

            // 3. 로컬 데이터 즉시 갱신
            await refreshData();

            addNotification({
                type: 'reward',
                title: '스타터팩 지급 완료!',
                message: `${nickname} 지휘관님, 1000 코인과 카드 5장을 획득했습니다.`,
                icon: '🎁'
            });

            return starterCards as InventoryCard[];

        } catch (error) {
            console.error("Failed to claim starter pack:", error);
            addNotification({
                type: 'error',
                title: '오류 발생',
                message: '스타터팩 지급 중 문제가 발생했습니다. 관리자에게 문의해주세요.',
                icon: '⚠️'
            });
            return [];
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
                subscriptions,
                buyCardPack: async (cards: Card[], price: number, currencyType: 'coin' | 'token') => {
                    if (!user) return;
                    await purchaseCardPackTransaction(user.uid, cards, price, currencyType);
                    // Force refresh to ensure coins and inventory are in sync
                    await refreshData();
                }
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
