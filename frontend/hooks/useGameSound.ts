import { useCallback } from 'react';

export function useGameSound() {
    const playSound = useCallback((soundName: string) => {
        // Placeholder for sound playing logic
        // In a real implementation, this would trigger an audio element
        console.log(`Playing sound: ${soundName}`);
    }, []);

    return { playSound };
}
