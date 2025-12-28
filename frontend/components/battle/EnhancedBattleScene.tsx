'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useBattleAnimation } from '@/hooks/useBattleAnimation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EnhancedBattleSceneProps {
    playerCards: any[];
    enemyCards: any[];
    onBattleEnd: (victory: boolean) => void;
}

export default function EnhancedBattleScene({
    playerCards,
    enemyCards,
    onBattleEnd,
}: EnhancedBattleSceneProps) {
    const { state } = useBattleAnimation(playerCards, enemyCards, onBattleEnd);

    const getCardImage = (card: any) => {
        const { getCardCharacterImage } = require('@/lib/card-images');
        return getCardCharacterImage(card.templateId, card.name, card.rarity) || '/assets/cards/default-card.png';
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl overflow-hidden border border-white/10">
            {/* 배경 그리드 */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* 승점 표시 */}
            <div className="absolute top-4 left-0 right-0 flex justify-center items-center gap-8 z-20">
                <div className="text-center">
                    <div className="text-red-400 text-sm font-mono mb-1">ENEMY</div>
                    <div className="text-4xl font-black text-red-500">{state.victoryState.enemyScore}</div>
                </div>
                <div className="text-white/30 text-2xl font-mono">VS</div>
                <div className="text-center">
                    <div className="text-cyan-400 text-sm font-mono mb-1">YOU</div>
                    <div className="text-4xl font-black text-cyan-500">{state.victoryState.playerScore}</div>
                </div>
            </div>

            {/* 메인 전투 영역 */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 pt-24">
                {/* 적 카드 덱 (상단) */}
                <div className="flex justify-center gap-2">
                    {enemyCards.map((card, i) => {
                        const isPlayed = i < state.currentRound;
                        const isActive = i === state.currentRound && state.animationPhase !== 'idle';
                        const isWon = state.victoryState.enemyWonCards.some(c => c.id === card.id);

                        if (isWon) return null; // 승리한 카드는 승점 영역으로 이동

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 1, scale: 1 }}
                                animate={{
                                    opacity: isPlayed ? 0 : isActive ? 0 : 1,
                                    scale: isActive ? 0 : 1,
                                }}
                                className={cn(
                                    "w-16 h-24 rounded-lg border-2 border-red-500/30 bg-gradient-to-br from-red-900/20 to-black relative overflow-hidden",
                                    isActive && "opacity-0"
                                )}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                    🃏
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 중앙 전투 영역 */}
                <div className="flex-1 flex items-center justify-center relative">
                    {/* 승점 영역 - 왼쪽 (적) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        {state.victoryState.enemyWonCards.map((card, i) => (
                            <motion.div
                                key={`enemy-won-${i}`}
                                initial={{ x: 0, y: 0, scale: 1 }}
                                animate={{ x: 0, y: 0, scale: 0.8 }}
                                className="w-20 h-28 rounded-lg border-2 border-red-500 bg-cover bg-center relative overflow-hidden"
                                style={{ backgroundImage: `url(${getCardImage(card)})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent" />
                                <div className="absolute bottom-1 left-0 right-0 text-center">
                                    <div className="text-xs font-bold text-white">⚡{card.stats?.totalPower || 0}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 승점 영역 - 오른쪽 (플레이어) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        {state.victoryState.playerWonCards.map((card, i) => (
                            <motion.div
                                key={`player-won-${i}`}
                                initial={{ x: 0, y: 0, scale: 1 }}
                                animate={{ x: 0, y: 0, scale: 0.8 }}
                                className="w-20 h-28 rounded-lg border-2 border-cyan-500 bg-cover bg-center relative overflow-hidden"
                                style={{ backgroundImage: `url(${getCardImage(card)})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent" />
                                <div className="absolute bottom-1 left-0 right-0 text-center">
                                    <div className="text-xs font-bold text-white">⚡{card.stats?.totalPower || 0}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 활성 카드 전투 */}
                    <AnimatePresence mode="wait">
                        {state.animationPhase !== 'idle' && state.activePlayerCard && state.activeEnemyCard && (
                            <motion.div
                                key="battle-cards"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-8"
                            >
                                {/* 적 카드 */}
                                <motion.div
                                    initial={{ x: 0, y: -200, rotate: -20 }}
                                    animate={{
                                        x: state.animationPhase === 'clash' ? -20 : 0,
                                        y: 0,
                                        rotate: 0,
                                    }}
                                    exit={{
                                        x: state.results[state.currentRound - 1]?.winner === 'enemy' ? -150 : 0,
                                        opacity: state.results[state.currentRound - 1]?.winner === 'enemy' ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="w-32 h-44 rounded-xl border-2 border-red-500 bg-cover bg-center relative overflow-hidden shadow-2xl"
                                    style={{ backgroundImage: `url(${getCardImage(state.activeEnemyCard)})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent" />
                                    <div className="absolute bottom-2 left-0 right-0 text-center">
                                        <div className="text-sm font-bold text-white">⚡{state.activeEnemyCard.stats?.totalPower || 0}</div>
                                    </div>
                                </motion.div>

                                {/* 충돌 이펙트 */}
                                {state.animationPhase === 'clash' && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute text-8xl"
                                    >
                                        ⚔️
                                    </motion.div>
                                )}

                                {/* 플레이어 카드 */}
                                <motion.div
                                    initial={{ x: 0, y: 200, rotate: 20 }}
                                    animate={{
                                        x: state.animationPhase === 'clash' ? 20 : 0,
                                        y: 0,
                                        rotate: 0,
                                    }}
                                    exit={{
                                        x: state.results[state.currentRound - 1]?.winner === 'player' ? 150 : 0,
                                        opacity: state.results[state.currentRound - 1]?.winner === 'player' ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="w-32 h-44 rounded-xl border-2 border-cyan-500 bg-cover bg-center relative overflow-hidden shadow-2xl"
                                    style={{ backgroundImage: `url(${getCardImage(state.activePlayerCard)})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent" />
                                    <div className="absolute bottom-2 left-0 right-0 text-center">
                                        <div className="text-sm font-bold text-white">⚡{state.activePlayerCard.stats?.totalPower || 0}</div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 플레이어 카드 덱 (하단) */}
                <div className="flex justify-center gap-2">
                    {playerCards.map((card, i) => {
                        const isPlayed = i < state.currentRound;
                        const isActive = i === state.currentRound && state.animationPhase !== 'idle';
                        const isWon = state.victoryState.playerWonCards.some(c => c.id === card.id);

                        if (isWon) return null;

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 1, scale: 1 }}
                                animate={{
                                    opacity: isPlayed ? 0 : isActive ? 0 : 1,
                                    scale: isActive ? 0 : 1,
                                }}
                                className={cn(
                                    "w-16 h-24 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-black relative overflow-hidden",
                                    isActive && "opacity-0"
                                )}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                    🃏
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 승리 오버레이 */}
            <AnimatePresence>
                {state.animationPhase === 'victory' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <div className={cn(
                                "text-8xl font-black mb-4",
                                state.victoryState.finalWinner === 'player' ? "text-cyan-400" : "text-red-400"
                            )}>
                                {state.victoryState.finalWinner === 'player' ? '🏆 VICTORY' : '💀 DEFEAT'}
                            </div>
                            <div className="text-2xl text-white/60 font-mono">
                                FINAL SCORE: {state.victoryState.playerScore} - {state.victoryState.enemyScore}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
