'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type SoundType = 'click' | 'hover' | 'success' | 'error' | 'start';

interface SoundContextType {
    playSfx: (type: SoundType) => void;
    playBgm: (bgmName: string) => void;
    isMuted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);

    // settings 페이지의 로컬스토리지와 연동 (초기 로드)
    useEffect(() => {
        const storedSettings = localStorage.getItem('gameSettings');
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            if (settings.soundEnabled === false) {
                setIsMuted(true);
            }
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newState = !prev;
            // 설정 저장 로직은 Settings 페이지와 이원화될 수 있으므로, 
            // 여기서는 Context 상태만 변경하고 실제 연동은 Settings 페이지에서 처리하거나
            // 전역 이벤트로 처리해야 함. 현재는 간단히 상태만 관리.
            return newState;
        });
    }, []);

    const playSfx = useCallback((type: SoundType) => {
        if (isMuted) return;

        // Try to play sound if file exists
        try {
            const audio = new Audio(`/sounds/sfx/${type}.mp3`);
            audio.volume = 0.5;
            audio.play().catch((e) => {
                // Ignore errors if file doesn't exist (common in dev without assets)
                console.warn(`[Sound] Missing SFX file: /sounds/sfx/${type}.mp3`);
            });
        } catch (e) {
            console.error('[Sound] Audio Error:', e);
        }
    }, [isMuted]);

    const playBgm = useCallback((bgmName: string) => {
        if (isMuted) return;

        try {
            // Stop previous BGM if needed (basic implementation)
            const audio = new Audio(`/sounds/bgm/${bgmName}.mp3`);
            audio.loop = true;
            audio.volume = 0.3;
            audio.play().catch((e) => {
                console.warn(`[Sound] Missing BGM file: /sounds/bgm/${bgmName}.mp3`);
            });
            // Store ref to current BGM to stop it later (omitted for simplicity in this step)
        } catch (e) {
            console.error('[Sound] Audio Error:', e);
        }
    }, [isMuted]);

    return (
        <SoundContext.Provider value={{ playSfx, playBgm, isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
