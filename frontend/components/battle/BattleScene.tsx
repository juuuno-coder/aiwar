'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useBattleLogic } from '@/hooks/useBattle';
import UnitFrame from './UnitFrame';
import { Card } from '@/lib/types';
import { BattleMode, getBattleModeConfig } from '@/lib/battle-modes';

interface BattleSceneProps {
    mode: BattleMode;
    playerDeck: Card[];
    enemyDeck: Card[];
    playerJokers?: Card[];
    enemyJokers?: Card[];
    onBattleEnd: (victory: boolean) => void;
}

const BattleScene: React.FC<BattleSceneProps> = ({ mode, playerDeck, enemyDeck, playerJokers, enemyJokers, onBattleEnd }) => {
    const { gameState, playRound } = useBattleLogic(mode, playerDeck, enemyDeck);
    const config = getBattleModeConfig(mode);

    // Auto-play Rounds Effect
    React.useEffect(() => {
        if (gameState.isBattleOver) {
            const timer = setTimeout(() => {
                onBattleEnd(gameState.victory);
            }, 3000); // 3s delay to see final result
            return () => clearTimeout(timer);
        }

        if (!gameState.isProcessing) {
            const timer = setTimeout(() => {
                playRound();
            }, 2000); // 2s delay between rounds
            return () => clearTimeout(timer);
        }
    }, [gameState.isBattleOver, gameState.isProcessing, playRound, onBattleEnd, gameState.victory]);

    // Current Round Cards (or last played if over)
    const currentRoundIdx = Math.min(gameState.currentRound, gameState.totalRounds - 1);
    const pCard = gameState.isBattleOver ? null : playerDeck[currentRoundIdx];
    const eCard = gameState.isBattleOver ? null : enemyDeck[currentRoundIdx];

    // Result of the *just completed* round (for display)
    const lastHistory = gameState.history[gameState.history.length - 1];
    const showResult = gameState.history.length > gameState.currentRound; // If history is ahead of currentRound index, we are showing result?
    // Actually, useBattleLogic increments currentRound *immediately*. 
    // So if history.length === currentRound, we just finished a round.

    // Let's use the currentResult from state if valid
    const displayResult = gameState.currentResult;
    const isRoundDone = !gameState.isProcessing && displayResult !== null;

    return (
        <div className="relative w-full h-full min-h-[600px] bg-black/95 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-10" />

            {/* Header / Scoreboard */}
            <div className="relative z-10 flex flex-col items-center p-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="text-3xl font-black italic text-white font-orbitron mb-2">
                    ROUND <span className="text-cyan-400">{gameState.history.length + 1}</span> / {gameState.totalRounds}
                </div>

                {/* Score Dots */}
                <div className="flex gap-8 items-center">
                    <div className="flex gap-2">
                        {Array.from({ length: gameState.victoriesNeeded }).map((_, i) => (
                            <div key={`p-score-${i}`} className={`w-4 h-4 rounded-full border border-white/20 ${i < gameState.playerWins ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-black/50'}`} />
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">FIRST TO {gameState.victoriesNeeded}</div>
                    <div className="flex gap-2">
                        {Array.from({ length: gameState.victoriesNeeded }).map((_, i) => (
                            <div key={`e-score-${i}`} className={`w-4 h-4 rounded-full border border-white/20 ${i < gameState.enemyWins ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-black/50'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative z-10 flex flex-col justify-center items-center gap-12 p-8">

                {config.battleSize === 1 ? (
                    /* 1v1 Center Stage */
                    <div className="flex items-center gap-12">
                        {pCard && (
                            <UnitFrame
                                card={pCard}
                                isWinner={displayResult?.winner === 'player'}
                                isLoser={displayResult?.winner === 'enemy'}
                                score={displayResult?.playerScore}
                                showScore={!!displayResult}
                            />
                        )}
                        <div className="text-2xl font-bold italic text-white/20">VS</div>
                        {eCard && (
                            <UnitFrame
                                card={eCard}
                                isWinner={displayResult?.winner === 'enemy'}
                                isLoser={displayResult?.winner === 'player'}
                                score={displayResult?.enemyScore}
                                showScore={!!displayResult}
                                isRevealed={!!displayResult} // Reveal only after processing starts? Or always reveal? Let's say reveal when processing starts.
                            />
                        )}
                    </div>
                ) : (
                    /* Queue View for 3/5 Card Modes */
                    <div className="flex flex-col gap-8 w-full items-center">
                        {/* Enemy Row */}
                        <div className="flex gap-4 opacity-80">
                            {enemyDeck.map((card, i) => {
                                const isPlayed = i < gameState.currentRound;
                                const isCurrent = i === gameState.currentRound;
                                const hist = gameState.history[i];

                                return (
                                    <div key={card.id} className={`${isCurrent ? 'scale-110 z-10' : 'scale-90 opacity-50'}`}>
                                        <UnitFrame
                                            card={card}
                                            isRevealed={isPlayed || isCurrent} // Reveal past and current
                                            isWinner={hist?.result.winner === 'enemy'}
                                            isLoser={hist?.result.winner === 'player'}
                                            showScore={!!hist}
                                            score={hist?.result.enemyScore}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Player Row */}
                        <div className="flex gap-4">
                            {playerDeck.map((card, i) => {
                                const isPlayed = i < gameState.currentRound;
                                const isCurrent = i === gameState.currentRound;
                                const hist = gameState.history[i];

                                return (
                                    <div key={card.id} className={`${isCurrent ? 'scale-110 z-10' : 'scale-90 opacity-50'}`}>
                                        <UnitFrame
                                            card={card}
                                            isWinner={hist?.result.winner === 'player'}
                                            isLoser={hist?.result.winner === 'enemy'}
                                            showScore={!!hist}
                                            score={hist?.result.playerScore}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}


                {/* Log Display */}
                {displayResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={displayResult.log}
                        className="px-6 py-2 bg-black/60 border border-white/10 rounded-full text-sm font-mono text-cyan-200"
                    >
                        {displayResult.log}
                    </motion.div>
                )}

            </div>

            {/* Victory/Defeat Overlay */}
            {gameState.isBattleOver && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-6xl font-black italic tracking-tighter mb-4 ${gameState.victory ? 'text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]' : 'text-red-500'}`}
                    >
                        {gameState.victory ? 'VICTORY' : 'DEFEAT'}
                    </motion.div>
                    <div className="text-xl text-white/60 font-mono">
                        FINAL SCORE: {gameState.playerWins} - {gameState.enemyWins}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BattleScene;
