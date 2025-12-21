'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundContextType {
    bgmEnabled: boolean;
    sfxEnabled: boolean;
    volume: number;
    toggleBgm: () => void;
    toggleSfx: () => void;
    setVolume: (vol: number) => void;
    playBgm: (track: 'lobby' | 'battle' | 'victory' | 'defeat') => void;
    playSfx: (effect: 'click' | 'attack' | 'damage' | 'win' | 'lose') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [bgmEnabled, setBgmEnabled] = useState(false); // Default off for better UX on first load
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.loop = true;

        // Load settings from localStorage
        const storedBgm = localStorage.getItem('bgmEnabled');
        const storedSfx = localStorage.getItem('sfxEnabled');
        const storedVol = localStorage.getItem('volume');

        if (storedBgm !== null) setBgmEnabled(JSON.parse(storedBgm));
        if (storedSfx !== null) setSfxEnabled(JSON.parse(storedSfx));
        if (storedVol !== null) setVolume(parseFloat(storedVol));
    }, []);

    // Update volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Update BGM state
    useEffect(() => {
        if (audioRef.current) {
            if (bgmEnabled && currentTrack) {
                audioRef.current.play().catch(e => console.log('Auto-play prevented:', e));
            } else {
                audioRef.current.pause();
            }
        }
        localStorage.setItem('bgmEnabled', JSON.stringify(bgmEnabled));
    }, [bgmEnabled, currentTrack]);

    useEffect(() => {
        localStorage.setItem('sfxEnabled', JSON.stringify(sfxEnabled));
    }, [sfxEnabled]);

    useEffect(() => {
        localStorage.setItem('volume', volume.toString());
    }, [volume]);

    const toggleBgm = () => setBgmEnabled(prev => !prev);
    const toggleSfx = () => setSfxEnabled(prev => !prev);

    const playBgm = (track: 'lobby' | 'battle' | 'victory' | 'defeat') => {
        if (currentTrack === track) return;

        const trackMap = {
            lobby: '/sounds/bgm/lobby.mp3',
            battle: '/sounds/bgm/battle.mp3',
            victory: '/sounds/bgm/victory.mp3',
            defeat: '/sounds/bgm/defeat.mp3'
        };

        const src = trackMap[track];
        setCurrentTrack(track);

        if (audioRef.current) {
            audioRef.current.src = src;
            if (bgmEnabled) {
                audioRef.current.play().catch(e => console.log('Play failed:', e));
            }
        }
    };

    const playSfx = (effect: 'click' | 'attack' | 'damage' | 'win' | 'lose') => {
        if (!sfxEnabled) return;

        const sfxMap = {
            click: '/sounds/sfx/click.mp3',
            attack: '/sounds/sfx/attack.mp3',
            damage: '/sounds/sfx/damage.mp3',
            win: '/sounds/sfx/win.mp3',
            lose: '/sounds/sfx/lose.mp3'
        };

        const audio = new Audio(sfxMap[effect]);
        audio.volume = volume;
        audio.play().catch(e => console.log('SFX play failed:', e));
    };

    return (
        <SoundContext.Provider
            value={{
                bgmEnabled,
                sfxEnabled,
                volume,
                toggleBgm,
                toggleSfx,
                setVolume,
                playBgm,
                playSfx
            }}
        >
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
