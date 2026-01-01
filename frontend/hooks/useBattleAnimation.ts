import { useState, useCallback, useEffect } from 'react';
import { determineRoundWinner, BattleResult, RoundResult } from '@/lib/pvp-battle-system';
// import { BattleType } from '@/lib/types';

export type AnimationPhase = 'idle' | 'draw' | 'clash' | 'result' | 'hidden-draw' | 'hidden-clash' | 'hidden-result' | 'victory';

export interface BattleAnimationState {
    currentRound: number;
    animationPhase: AnimationPhase;
    results: RoundResult[]; // Uses PVP RoundResult
    victoryState: {
        playerScore: number;
        enemyScore: number;
        playerWonCards: any[];
        enemyWonCards: any[];
        isGameOver: boolean;
        finalWinner: 'player' | 'opponent' | 'draw' | null;
    };
    activePlayerCard: any | null;
    activeEnemyCard: any | null;
    activePlayerHiddenCard: any | null;
    activeEnemyHiddenCard: any | null;
}

export function useBattleAnimation(
    playerCards: any[],
    enemyCards: any[],
    battleType: string = 'tactics',
    playerHiddenCards?: { round2?: any; round3?: any; round4?: any },
    enemyHiddenCards?: { round2?: any; round3?: any; round4?: any },
    onBattleEnd?: (victory: boolean) => void,
    precalculatedResult?: BattleResult // Optional: Use simulation result
) {
    const [state, setState] = useState<BattleAnimationState>({
        currentRound: 0,
        animationPhase: 'idle',
        results: [],
        victoryState: {
            playerScore: 0,
            enemyScore: 0,
            playerWonCards: [],
            enemyWonCards: [],
            isGameOver: false,
            finalWinner: null,
        },
        activePlayerCard: null,
        activeEnemyCard: null,
        activePlayerHiddenCard: null,
        activeEnemyHiddenCard: null,
    });

    /**
     * 라운드 실행
     */
    const playRound = useCallback(async () => {
        const roundIndex = state.currentRound; // 0-based index
        const roundNumber = roundIndex + 1; // 1-based round number

        // Check bounds
        if (!precalculatedResult && roundIndex >= playerCards.length) return;
        if (precalculatedResult && roundIndex >= 5) return; // Should not exceed 5 rounds
        if (state.victoryState.isGameOver) return;

        // Determine if this round has hidden phase
        const isAmbushRound = battleType === 'ambush' && roundNumber === 3;

        // Get cards
        const playerCard = playerCards[roundIndex];
        const enemyCard = enemyCards[roundIndex];

        if (!playerCard || !enemyCard) {
            // Safety check
            if (precalculatedResult && precalculatedResult.winner) {
                // Force finish if cards missing but result exists (early win reached)
                setState(prev => ({
                    ...prev,
                    animationPhase: 'victory',
                    victoryState: {
                        ...prev.victoryState,
                        isGameOver: true,
                        finalWinner: precalculatedResult.winner
                    }
                }));
            }
            return;
        }

        // START ANIMATION SEQUENCE

        // Phase 1: Draw Main Cards
        setState(prev => ({
            ...prev,
            animationPhase: 'draw',
            activePlayerCard: playerCard,
            activeEnemyCard: enemyCard,
        }));
        await new Promise(resolve => setTimeout(resolve, 500));

        // Phase 2: Clash
        setState(prev => ({ ...prev, animationPhase: 'clash' }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Phase 3: Result
        // Use precalculated result if available
        let mainWinner: 'player' | 'opponent' | 'draw' = 'draw';
        let hiddenWinner: 'player' | 'opponent' | 'draw' | undefined;
        let roundRes: RoundResult | undefined;

        if (precalculatedResult) {
            // Logic for finding main result:
            // Ambush Round 3 Main is '3-1', others are numbers
            const targetRoundLabel = battleType === 'ambush' && roundNumber === 3 ? '3-1' : roundNumber;
            // Loose matching: round might be number or string in result
            roundRes = precalculatedResult.rounds.find(r => r.round == targetRoundLabel);
            mainWinner = roundRes?.winner || 'draw';
        } else {
            mainWinner = determineRoundWinner(playerCard, enemyCard);
        }

        setState(prev => ({ ...prev, animationPhase: 'result' }));
        await new Promise(resolve => setTimeout(resolve, 800));

        // Handling Hidden Phase (Ambush R3)
        if (isAmbushRound) {
            const playerHidden = playerHiddenCards?.round3;
            const enemyHidden = enemyHiddenCards?.round3;

            if (playerHidden && enemyHidden) {
                // Phase 4: Draw Hidden
                setState(prev => ({
                    ...prev,
                    animationPhase: 'hidden-draw',
                    activePlayerHiddenCard: playerHidden,
                    activeEnemyHiddenCard: enemyHidden,
                }));
                await new Promise(resolve => setTimeout(resolve, 500));

                // Phase 5: Hidden Clash
                setState(prev => ({ ...prev, animationPhase: 'hidden-clash' }));
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Phase 6: Hidden Result
                if (precalculatedResult) {
                    const hiddenRes = precalculatedResult.rounds.find(r => r.round == '3-2');
                    hiddenWinner = hiddenRes?.winner;
                } else {
                    hiddenWinner = determineRoundWinner(playerHidden, enemyHidden);
                }

                setState(prev => ({ ...prev, animationPhase: 'hidden-result' }));
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        // UPDATE STATE
        setState(prev => {
            const newResults = [...prev.results];
            if (roundRes) newResults.push(roundRes); // Store if available

            // Calculate Score Updates from previous state
            let newPlayerScore = prev.victoryState.playerScore;
            let newEnemyScore = prev.victoryState.enemyScore;
            const newPlayerWonCards = [...prev.victoryState.playerWonCards];
            const newEnemyWonCards = [...prev.victoryState.enemyWonCards];

            // Main Round Scoring
            if (mainWinner === 'player') {
                newPlayerScore += 1;
                newPlayerWonCards.push(playerCard);
            } else if (mainWinner === 'opponent') {
                newEnemyScore += 1;
                newEnemyWonCards.push(enemyCard);
            }

            // Hidden Round Scoring (Ambush)
            if (isAmbushRound && hiddenWinner) {
                if (hiddenWinner === 'player') {
                    // Ambush Negation Logic: If Player wins hidden, Enemy loses '3-1' point
                    if (mainWinner === 'opponent') {
                        newEnemyScore = Math.max(0, newEnemyScore - 1);
                        // Also consider removing won card? Logic too complex for visual.
                        // Just updating score is enough for user feedback.
                    }
                    newPlayerScore += 1;
                    if (playerHiddenCards?.round3) newPlayerWonCards.push(playerHiddenCards.round3);
                } else if (hiddenWinner === 'opponent') {
                    newEnemyScore += 1;
                    if (enemyHiddenCards?.round3) newEnemyWonCards.push(enemyHiddenCards.round3);
                }
            }

            // Check Game Over
            let isGameOver = false;
            let finalWinner = prev.victoryState.finalWinner;

            if (precalculatedResult) {
                // Check if score threshold reached OR roundIndex is 4 (end)
                // Ambush early win: 3 points
                if (newPlayerScore >= 3 || newEnemyScore >= 3 || roundIndex === 4) {
                    // Trust precalculated winner if available, else derive
                    if (precalculatedResult.winner) {
                        isGameOver = true;
                        finalWinner = precalculatedResult.winner;
                    }
                }
            } else {
                // Legacy check
                if (newPlayerScore >= 3) { isGameOver = true; finalWinner = 'player'; }
                else if (newEnemyScore >= 3) { isGameOver = true; finalWinner = 'opponent'; }
                else if (roundIndex === 4) {
                    isGameOver = true;
                    finalWinner = newPlayerScore > newEnemyScore ? 'player' : newPlayerScore < newEnemyScore ? 'opponent' : 'draw' as any;
                }
            }

            return {
                ...prev,
                currentRound: roundIndex + 1,
                results: newResults,
                victoryState: {
                    playerScore: newPlayerScore,
                    enemyScore: newEnemyScore,
                    playerWonCards: newPlayerWonCards,
                    enemyWonCards: newEnemyWonCards,
                    isGameOver,
                    finalWinner,
                },
                animationPhase: isGameOver ? 'victory' : 'idle',
                activePlayerCard: null,
                activeEnemyCard: null,
                activePlayerHiddenCard: null,
                activeEnemyHiddenCard: null,
            };
        });

    }, [state, playerCards, enemyCards, battleType, playerHiddenCards, enemyHiddenCards, precalculatedResult]);

    // Auto-play effect
    useEffect(() => {
        if (state.animationPhase === 'idle' && !state.victoryState.isGameOver) {
            const timer = setTimeout(() => {
                playRound();
            }, 1000);
            return () => clearTimeout(timer);
        } else if (state.animationPhase === 'victory') {
            const timer = setTimeout(() => {
                onBattleEnd?.(state.victoryState.finalWinner === 'player');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.animationPhase, state.victoryState.isGameOver, playRound, onBattleEnd, state.victoryState.finalWinner]);

    return { state, playRound };
}
