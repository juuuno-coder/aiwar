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
import type { Rarity } from '@/lib/types';
import { useNotification } from '@/context/NotificationContext';
import { useFirebase } from '@/components/FirebaseProvider';

interface UserContextType {
    coins: number;
    tokens: number;
    level: number;
    experience: number;
    loading: boolean;
    addCoins: (amount: number) => Promise<number>;
    addTokens: (amount: number) => Promise<number>;
    addExperience: (amount: number) => Promise<{ level: number; experience: number; leveledUp: boolean }>;
    refreshData: () => Promise<void>;
    applyAdminCheat: () => Promise<void>;
    isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user } = useFirebase();
    const { profile, reload: reloadProfile, loading: profileLoading } = useUserProfile();

    const [coins, setCoins] = useState<number>(0);
    const [tokens, setTokens] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [experience, setExperience] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial mount check to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset state when user changes
    useEffect(() => {
        if (!mounted) return;

        // Reset state to default before loading new user data
        setLoading(true);
        setCoins(0);
        setTokens(0);
        setLevel(1);
        setExperience(0);

        // Data will be reloaded by the profile sync or refreshData effect
    }, [mounted, user?.uid]);

    // Sync state from Firebase profile
    useEffect(() => {
        if (mounted && profile) {
            setCoins(profile.coins);
            setTokens(profile.tokens);
            setLevel(profile.level);
            setExperience(profile.exp);
            setLoading(false);
        }
    }, [mounted, profile]);

    const refreshData = useCallback(async () => {
        if (!mounted) return;

        if (profile) {
            await reloadProfile(user?.uid);
        } else {
            setLoading(true);
            try {
                const state = await gameStorage.loadGameState(user?.uid);
                setCoins(state.coins || 0);
                setTokens(state.tokens || 0);
                setLevel(state.level || 1);
                setExperience(state.experience || 0);
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
            await reloadProfile(user?.uid);
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
            await reloadProfile(user?.uid);
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
            await reloadProfile(user?.uid);

            return { level: currentLevel, experience: currentExp, leveledUp };
        } else {
            const result = await gameStorage.addExperience(amount, user?.uid);

            // Check for local storage level up
            if (result.leveledUp) {
                // We need to import useNotification but hooks can't be used outside component directly ideally in same logic flow
                // But here we are inside UserProvider which IS a component component
                // Wait, addExperienceByContext is inside the component
            }

            setLevel(result.level);
            setExperience(result.experience);
            return result;
        }
    };

    const applyAdminCheat = async () => {
        if (!mounted || !user) return;

        console.log("🛠️ Admin Cheat Activated for:", user.email);

        const MAX_COINS = 99999999;
        const MAX_TOKENS = 9999999;
        const MAX_LEVEL = 99;
        const MAX_EXP = 0;

        if (profile) {
            // Update Firestore
            await firebaseUpdateCoins(MAX_COINS - coins, user.uid);
            await firebaseUpdateTokens(MAX_TOKENS - tokens, user.uid);
            await firebaseUpdateExpAndLevel(MAX_EXP, MAX_LEVEL, user.uid);
            await reloadProfile(user.uid);
        } else {
            // Update LocalStorage (Guest/Local)
            const state = await gameStorage.loadGameState(user.uid);
            state.coins = MAX_COINS;
            state.tokens = MAX_TOKENS;
            state.level = MAX_LEVEL;
            state.experience = MAX_EXP;
            await gameStorage.saveGameState(state, user.uid);
            setCoins(MAX_COINS);
            setTokens(MAX_TOKENS);
            setLevel(MAX_LEVEL);
            setExperience(MAX_EXP);
        }
    };

    // Auto-detect admin email for convenience and redundancy
    useEffect(() => {
        if (!mounted) return;

        const checkAdmin = () => {
            // 1. Check Firebase User
            if (user?.email === 'nerounni@gmail.com') return true;

            // 2. Check Local Auth Session (from auth-utils.ts)
            try {
                const sessionStr = localStorage.getItem('auth-session');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    const userEmail = session.user?.email || session.user?.username;
                    if (userEmail === 'nerounni@gmail.com') return true;
                }
            } catch (e) { }

            return false;
        };

        const isUserAdmin = checkAdmin();
        setIsAdmin(isUserAdmin);

        if (isUserAdmin) {
            console.log("👑 Hello Admin! You can use 'window.applyCheat()' in the console or use the Admin Terminal in Settings.");
            (window as any).applyCheat = applyAdminCheat;

            // Auto-apply if it's the first time (low resources)
            const autoCheatApplied = localStorage.getItem('admin_cheat_auto_applied');
            if (!autoCheatApplied && coins < 1000 && level === 1) {
                console.log("🛠️ Auto-applying admin resources for testing...");
                applyAdminCheat();
                localStorage.setItem('admin_cheat_auto_applied', 'true');
            }
        }
    }, [mounted, user, coins, tokens, level, profile, applyAdminCheat]);

    return (
        <UserContext.Provider
            value={{
                coins,
                tokens,
                level,
                experience,
                loading,
                addCoins: addCoinsByContext,
                addTokens: addTokensByContext,
                addExperience: addExperienceByContext,
                refreshData,
                applyAdminCheat,
                isAdmin
            }}
        >
            {children}
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
