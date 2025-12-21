'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gameStorage, GameState } from '@/lib/game-storage';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [coins, setCoins] = useState<number>(0);
    const [tokens, setTokens] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [experience, setExperience] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const refreshData = useCallback(async () => {
        try {
            const state = await gameStorage.loadGameState();
            setCoins(state.coins);
            setTokens(state.tokens);
            setLevel(state.level);
            setExperience(state.experience);
        } catch (error) {
            console.error('Failed to load user resources:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addCoinsByContext = async (amount: number) => {
        const newTotal = await gameStorage.addCoins(amount);
        setCoins(newTotal);
        return newTotal;
    };

    const addTokensByContext = async (amount: number) => {
        const newTotal = await gameStorage.addTokens(amount);
        setTokens(newTotal);
        return newTotal;
    };

    const addExperienceByContext = async (amount: number) => {
        const result = await gameStorage.addExperience(amount);
        setLevel(result.level);
        setExperience(result.experience);
        return result;
    };

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
                refreshData
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
