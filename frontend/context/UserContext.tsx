'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { loadInventory, InventoryCard } from '@/lib/inventory-system';
import type { Card } from '@/lib/types';
import { useFirebase } from '@/components/FirebaseProvider';
import { addNotification } from '@/components/NotificationCenter';
import {
    syncSubscriptionsWithFirebase,
} from '@/lib/faction-subscription-utils';


import { // [NEW]
    CATEGORY_TOKEN_BONUS, // [NEW]
} from '@/lib/token-constants'; // [NEW]
import { UserSubscription } from '@/lib/faction-subscription'; // [NEW]
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
    completeTutorial: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user } = useFirebase();
    const { profile, reload: reloadProfile, loading: profileLoading } = useUserProfile();

    const [error, setError] = useState<string | null>(null); // [NEW] Critical Error State

    const [coins, setCoins] = useState(0);
    const [tokens, setTokens] = useState(0);
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(0);
    const [inventory, setInventory] = useState<InventoryCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [starterPackAvailable, setStarterPackAvailable] = useState(false);
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [isClaimingInSession, setIsClaimingInSession] = useState(false);
    const [mounted, setMounted] = useState(false);

    const isAdmin = user?.email === 'admin@example.com'; // Temporary admin logic

    // [Safety] Reset state to prevent data bleed from previous sessions/users
    const resetState = useCallback(() => {
        console.log("🧹 [UserContext] Resetting State to Defaults");
        setCoins(0);
        setTokens(0);
        setLevel(1);
        setExperience(0);
        setInventory([]);
        setSubscriptions([]);
        setIsClaimingInSession(false);
        setStarterPackAvailable(false);
        setError(null);
    }, []);

    // ... useEffects ...

    // Initial mount check
    useEffect(() => {
        setMounted(true);
        console.log('✅ UserProvider Mounted - Version: 2026-01-03-ISOLATION-FIX');
    }, []);

    // [REFACTORED] Centralized Auth State and Data Loading Effect
    useEffect(() => {
        if (!mounted) return;

        // Case 1: User is logged out or session is cleared
        if (!user) {
            console.log("[Auth] No user detected. Resetting state and stopping loading.");
            resetState();
            setLoading(false);
            return;
        }

        // Case 2: User is logged in, but profile is still loading
        if (user && profileLoading) {
            console.log(`[Auth] User ${user.uid} detected, waiting for profile...`);
            setLoading(true);
            return;
        }

        // Case 3: User is logged in and profile is loaded
        if (user && profile) {
            console.log(`[Auth] User ${user.uid} and profile loaded. Syncing data...`);
            setLoading(true);

            const syncUserData = async () => {
                try {
                    // [Auto-Heal] Negative Balance Check
                    if (profile.coins < 0) {
                        console.warn(`[Auto-Heal] Negative balance of ${profile.coins} detected. Resetting to 0.`);
                        await firebaseUpdateCoins(Math.abs(profile.coins), user.uid);
                        setCoins(0); // Set local state immediately
                    } else {
                        setCoins(profile.coins);
                    }

                    // Sync basic profile data
                    setTokens(profile.tokens);
                    setLevel(profile.level);
                    setExperience(profile.exp);

                    // Sync inventory and subscriptions
                    const [cards, subs] = await Promise.all([
                        loadInventory(user.uid),
                        fetchUserSubscriptions(user.uid),
                        syncSubscriptionsWithFirebase(user.uid) // Syncs local with remote
                    ]);

                    const formattedCards = cards.map(c => ({
                        ...c,
                        acquiredAt: (c.acquiredAt && 'toDate' in (c.acquiredAt as any)) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
                    })) as InventoryCard[];

                    // [Restored] Add Commander cards from Ultra subscriptions
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
                    setSubscriptions(subs);

                    // [Restored] Emergency Rescue for starter pack
                    if (profile.level === 1 && profile.hasReceivedStarterPack && finalInventory.length === 0) {
                        console.log("[SafetySystem] Rescue: Found claimed flag but 0 cards. Re-distributing...");
                        await claimStarterPack(profile.nickname || '지휘관');
                    }


                    // Check for starter pack eligibility
                    const isTutorialCompleted = profile.tutorialCompleted || false;
                    if (isTutorialCompleted && !profile.hasReceivedStarterPack && finalInventory.length === 0) {
                        console.log("[Auth] User is eligible for the starter pack.");
                        setStarterPackAvailable(true);
                    } else {
                        setStarterPackAvailable(false);
                    }
                } catch (error) {
                    console.error("[Auth] Failed to sync user data:", error);
                    setError("Failed to synchronize your account data. Please try again later.");
                } finally {
                    setLoading(false);
                    console.log("[Auth] User data sync complete.");
                }
            };

            syncUserData();
        }

    }, [mounted, user, profile, profileLoading, resetState]);



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

    const completeTutorial = useCallback(async () => {
        if (!user?.uid || !profile) return;

        console.log(`[UserContext] Completing tutorial for ${user.uid}...`);

        try {
            // Update Firebase state first
            await saveUserProfile({ tutorialCompleted: true }, user.uid);

            // Then, update local state to trigger UI changes
            // The reloadProfile() from useUserProfile will fetch the latest profile
            await reloadProfile();

            // After profile reloads, the main useEffect will re-evaluate starter pack eligibility.
            console.log("[UserContext] Tutorial status saved to Firebase. State will update.");

        } catch (error) {
            console.error("Failed to save tutorial completion status:", error);
            // Optionally: show an error to the user
        }
    }, [user?.uid, profile, reloadProfile]);

    const refreshData = useCallback(async () => {
        if (!mounted || !user) return;

        if (profile) {
            try {
                // 1. 프로필 리로드 (DB 연결 확인)
                await reloadProfile(); // This might throw if DB is unreachable? Usually returns void or null.

                // 2. 인벤토리 로드 (DB 필수)
                const inv = await loadInventory(user.uid);
                const formattedInv = inv.map(c => ({
                    ...c,
                    acquiredAt: (c.acquiredAt && 'toDate' in (c.acquiredAt as any)) ? (c.acquiredAt as any).toDate() : new Date(c.acquiredAt as any)
                })) as InventoryCard[];
                setInventory(formattedInv);

                // 3. 토큰 상태 확인 및 충전
                // fetchUserSubscriptions is imported from firebase-db
                const fetchedSubscriptions = await fetchUserSubscriptions(user.uid);
                setSubscriptions(fetchedSubscriptions);

                const refreshedToken = await checkAndRechargeTokens(user.uid, profile.tokens, profile.lastTokenUpdate, fetchedSubscriptions);
                if (refreshedToken !== profile.tokens) {
                    setTokens(refreshedToken);
                }

                // 4. 스타터팩 구조 요청 로직 (필요 시)
                const isTutorialCompleted = localStorage.getItem(`tutorial_completed_${user.uid}`);
                if (isTutorialCompleted && !isClaimingInSession && formattedInv.length === 0 && !profile.hasReceivedStarterPack) {
                    // DB에는 starterPack 수령 기록이 없는데, 인벤토리도 비어있고 튜토리얼은 깼다? -> 구조 요청
                    console.log("[UserContext] Rescue Mode: Starter Pack Available.");
                    setStarterPackAvailable(true);
                } else if (profile.hasReceivedStarterPack || formattedInv.length > 0) {
                    // 수령했거나 인벤토리가 있으면 숨김
                    setStarterPackAvailable(false);
                }

                // Clear Error if successful
                setError(null);

            } catch (err) {
                console.error("WARNING: Failed to refresh user data from DB (Non-fatal)", err);
                // [Relaxed Mode] Do not block app, just log error. 
                // The UI might show empty data, but user can retry or navigation works.
                // setError("데이터 동기화 실패: 서버와 통신할 수 없습니다. (Network/DB Error)");
                setLoading(false);
            }

        } else {
            // [Strict Auth Mode] Do NOT load guest state.
            // If user is null, we should simply reset state and wait for auth.
            // Loading guest state here causes "Zombie Data" bleeding when switching accounts.
            console.log("[UserContext] No User/Profile -> Resetting State (Strict Mode)");
            setLoading(false);
            resetState();
        }
    }, [mounted, profile, reloadProfile, user?.uid, isClaimingInSession, resetState]);


    const addCoinsByContext = async (amount: number) => {
        if (!mounted || !profile || !user) return;

        try {
            await firebaseUpdateCoins(amount, user.uid);
            await reloadProfile();
        } catch (err) {
            console.error("Failed to add coins:", err);
        }
    };

    const addTokensByContext = async (amount: number) => {
        if (!mounted || !profile || !user) return;

        try {
            await firebaseUpdateTokens(amount, user.uid);
            await reloadProfile();
        } catch (err) {
            console.error("Failed to add tokens:", err);
        }
    };

    const addExperienceByContext = async (amount: number) => {
        if (!profile || !user) {
            // Return a default or empty state if there's no user
            return { level: 1, experience: 0, leveledUp: false };
        }

        // Replicate Level Up Logic locally to calculate new state to send to Firebase
        let currentExp = experience + amount;
        let currentLevel = level;
        let leveledUp = false;

        while (currentExp >= currentLevel * 100) {
            currentExp -= currentLevel * 100;
            currentLevel++;
            leveledUp = true;
        }

        // Apply limits
        currentLevel = Math.max(1, currentLevel);
        currentExp = Math.max(0, currentExp);

        try {
            await firebaseUpdateExpAndLevel(currentExp, currentLevel, user.uid);
            await reloadProfile();

            if (leveledUp) {
                checkFeatureUnlocks(currentLevel);
            }
        } catch (err) {
            console.error("Failed to add experience:", err);
            // In case of error, should we revert local state?
            // For now, we rely on reloadProfile to sync the source of truth.
        }

        return { level: currentLevel, experience: currentExp, leveledUp };
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

            // 1. 카드 리스트 생성 (기존 방식 유지 - 5장 명시적 생성)
            const { generateCardByRarity: gen } = await import('@/lib/card-generation-system');

            console.log("⚡️ [DEBUG] Generating 5 Starter Cards...");

            const starterCards = [
                gen('common', uid),
                gen('rare', uid),
                gen('epic', uid),
                gen('legendary', uid),
                gen('unique', uid)
            ];

            if (starterCards.length !== 5) {
                console.error("❌ Generated card count mismatch:", starterCards.length);
            }

            // 닉네임 커스터마이징
            starterCards[4].name = `지휘관 ${nickname}`;
            starterCards[4].description = "전장에 새롭게 합류한 지휘관의 전용 유닉입니다.";

            // 2. Transaction 실행 (5장 지급 + 코인/토큰 설정 + 닉네임 설정)
            // [Fix] pass entire card objects to transaction
            await claimStarterPackTransaction(uid, nickname, starterCards);

            // [Fix] Wait for Firebase propagation
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. 상태 갱신 (강제 리로드)
            await reloadProfile(); // 프로필(코인, 플래그) 갱신
            await refreshData(); // 인벤토리 갱신

            // 인벤토리가 여전히 비어있다면, 로우 레벨 API로 직접 확인
            const invCheck = await loadInventory(uid);
            if (invCheck.length > 0) {
                setInventory(invCheck as InventoryCard[]);
            } else if (starterCards.length > 0) {
                // 정말로 DB 반영이 느리다면 로컬 상태에 주입하여 UI라도 먼저 보여줌
                const claimedInventory = starterCards.map(c => ({
                    ...c,
                    acquiredAt: new Date()
                })) as InventoryCard[];
                setInventory(claimedInventory);
            }

            console.log(`✅ Starter Pack (5 Cards) Claimed for ${uid}`);
            addNotification({
                type: 'reward',
                title: '스타터팩 지급 완료!',
                message: `${nickname} 지휘관님, 1000 코인과 카드 5장을 획득했습니다.`,
                icon: '🎁'
            });

            return starterCards as InventoryCard[];

        } catch (error: any) {
            console.error("❌ Failed to claim starter pack - DETAILED ERROR:", error);

            let message = '스타터팩 지급 중 서버 오류가 발생했습니다.';
            const isAlreadyClaimed = error.message === 'ALREADY_CLAIMED';

            if (isAlreadyClaimed) message = '이미 보급품을 수령하셨습니다.';
            else if (error.message === 'Firebase NOT_CONFIGURED') message = '서버 설정이 완료되지 않았습니다.';

            // [Fix] Already claimed is not always a "Critical Error" to the user, 
            // especially if they double-clicked. Silence alert if it's already claimed.
            if (!isAlreadyClaimed) {
                window.alert(`[보급 오류] ${message}\n(에러 상세: ${error.message || 'Unknown'})`);
            } else {
                console.log("ℹ️ ALREADY_CLAIMED caught - silencing alert for better UX.");
            }

            addNotification({
                type: isAlreadyClaimed ? 'warning' : 'error',
                title: isAlreadyClaimed ? '확인 완료' : '오류 발생',
                message: message,
                icon: isAlreadyClaimed ? 'ℹ️' : '⚠️'
            });
            return [];
        }
    };

    // Render Error Screen if Critical Error exists
    if (error) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 text-white font-mono p-4 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-3xl font-black mb-4">SYSTEM CRITICAL FAILURE</h1>
                <p className="text-red-400 mb-8">{error}</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
                    >
                        SYSTEM REBOOT (RELOAD)
                    </button>
                    <button
                        onClick={() => {
                            import('@/lib/firebase-auth').then(({ signOutUser }) => signOutUser());
                            resetState();
                            window.location.reload();
                        }}
                        className="px-6 py-2 border border-white/20 hover:bg-white/10 rounded"
                    >
                        FORCE LOGOUT
                    </button>
                </div>
                <p className="mt-8 text-xs text-gray-500">Error Code: DB_SYNC_STRICT_ENFORCEMENT</p>
            </div>
        );
    }

    return (
        <UserContext.Provider
            value={{
                coins, // Explicitly pass state
                tokens, // Explicitly pass state
                level, // Explicitly pass state
                experience, // Explicitly pass state
                user,
                profile: profile, // [Fix] Use pure DB profile to prevent ghost data (600 coins)
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
                },
                completeTutorial // [NEW]
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
