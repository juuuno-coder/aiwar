'use client';

import { useCallback } from 'react';

type SoundType = 'click' | 'victory' | 'defeat' | 'levelup' | 'error';

const SOUND_PATHS: Record<SoundType, string> = {
    click: '/assets/sounds/click.mp3',
    victory: '/assets/sounds/victory.mp3',
    defeat: '/assets/sounds/defeat.mp3',
    levelup: '/assets/sounds/levelup.mp3',
    error: '/assets/sounds/error.mp3',
};

export const useSound = () => {
    const play = useCallback((type: SoundType) => {
        try {
            const audio = new Audio(SOUND_PATHS[type]);
            audio.volume = 0.5;

            // Auto-play policy handling
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // console.warn(`Audio play failed for ${type} (Auto-play policy?):`, error);
                });
            }
        } catch (error) {
            console.warn(`Failed to play sound: ${type}`, error);
        }
    }, []);

    return { play };
};
