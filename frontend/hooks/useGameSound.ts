import { useCallback, useEffect, useState } from 'react';
import SoundManager from '@/lib/sound-manager';

export function useGameSound() {
    const [manager] = useState(() => SoundManager.getInstance());

    const playSound = useCallback((soundName: string, type: 'bgm' | 'sfx' = 'sfx') => {
        // Map abstract sound names to file paths
        const soundMap: Record<string, string> = {
            'click': '/sounds/click.mp3',
            'hover': '/sounds/hover.mp3',
            'battle_start': '/sounds/battle_start.mp3',
            'card_play': '/sounds/card_play.mp3',
            'attack': '/sounds/attack.mp3',
            'damage': '/sounds/damage.mp3',
            'victory': '/sounds/victory.mp3',
            'defeat': '/sounds/defeat.mp3',
            'bgm_main': '/sounds/bgm_main.mp3',
            'bgm_battle': '/sounds/bgm_battle.mp3',
        };

        const fallbackMap: Record<string, 'click' | 'attack' | 'success' | 'error' | undefined> = {
            'click': 'click',
            'hover': 'click', // Quiet click
            'attack': 'attack',
            'damage': 'error',
            'victory': 'success',
            'defeat': 'error',
            'card_play': 'click',
            'battle_start': 'success'
        };

        if (type === 'bgm') {
            manager.playBGM(soundMap[soundName] || soundName);
        } else {
            manager.playSFX(soundMap[soundName] || soundName, fallbackMap[soundName]);
        }
    }, [manager]);

    const stopBGM = useCallback(() => {
        manager.stopBGM();
    }, [manager]);

    const setVolume = useCallback((volume: number) => {
        manager.setVolume(volume);
    }, [manager]);

    return { playSound, stopBGM, setVolume };
}
