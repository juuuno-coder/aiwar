import { useState, useCallback } from 'react';
import { Card } from '@/lib/types';
import { calculateDuel, DuelResult } from '../lib/battle-system/battle-engine';
import { BattleMode, getBattleModeConfig } from '../lib/battle-modes';

export interface RoundHistory {
    roundNumber: number;
    playerCard: Card;
    enemyCard: Card;
    result: DuelResult;
}

export interface BattleState {
    mode: BattleMode;
    currentRound: number; // 0-indexed internally, display +1
    totalRounds: number;
    playerWins: number;
    enemyWins: number;
    victoriesNeeded: number;
    isBattleOver: boolean;
    victory: boolean;
    history: RoundHistory[];

    // Immediate Round State
    isProcessing: boolean; // Animation state
    currentResult: DuelResult | null;
}

export const useBattleLogic = (
    mode: BattleMode,
    playerDeck: Card[],
    enemyDeck: Card[]
) => {
    const config = getBattleModeConfig(mode);

    const [gameState, setGameState] = useState<BattleState>({
        mode,
        currentRound: 0,
        totalRounds: config.rounds,
        playerWins: 0,
        enemyWins: 0,
        victoriesNeeded: config.winsNeeded,
        isBattleOver: false,
        victory: false,
        history: [],
        isProcessing: false,
        currentResult: null
    });

    // Auto-resolve round
    const playRound = useCallback(() => {
        if (gameState.isBattleOver || gameState.isProcessing) return;

        const roundIdx = gameState.currentRound;
        const playerCard = playerDeck[roundIdx];
        const enemyCard = enemyDeck[roundIdx];

        if (!playerCard || !enemyCard) {
            // Should not happen if decks are validated
            console.error('Missing card for round', roundIdx);
            return;
        }

        setGameState(prev => ({ ...prev, isProcessing: true }));

        // Simulate calculation delay for dramatic effect
        setTimeout(() => {
            const result = calculateDuel(playerCard, enemyCard);

            setGameState(prev => {
                const newPlayerWins = prev.playerWins + (result.winner === 'player' ? 1 : 0);
                const newEnemyWins = prev.enemyWins + (result.winner === 'enemy' ? 1 : 0);

                // Check Match End Condition
                let isMatchOver = false;
                let matchVictory = false;

                if (newPlayerWins >= prev.victoriesNeeded) {
                    isMatchOver = true;
                    matchVictory = true;
                } else if (newEnemyWins >= prev.victoriesNeeded) {
                    isMatchOver = true;
                    matchVictory = false;
                } else if (prev.currentRound + 1 >= prev.totalRounds) {
                    // All rounds done, check sudden death or tie breaker?
                    // For now, whoever has more wins. If tie, assume Defeat (harsh) or Draw?
                    isMatchOver = true;
                    matchVictory = newPlayerWins > newEnemyWins;
                }

                return {
                    ...prev,
                    isProcessing: false,
                    currentResult: result,
                    playerWins: newPlayerWins,
                    enemyWins: newEnemyWins,
                    history: [
                        ...prev.history,
                        { roundNumber: prev.currentRound + 1, playerCard, enemyCard, result }
                    ],
                    isBattleOver: isMatchOver,
                    victory: matchVictory,
                    // If match not over, increment round (but UI might want to wait before showing next)
                    // We'll increment round 'index' but next hook call handles 'next card'.
                    // Actually, let's wait for user/auto to trigger 'next' visual. 
                    // For this simple version, we stick to state update.
                    currentRound: prev.currentRound + 1
                };
            });

        }, 1000); // 1s processing Time
    }, [gameState.isBattleOver, gameState.isProcessing, gameState.currentRound, playerDeck, enemyDeck]);

    return {
        gameState,
        playRound
    };
};
