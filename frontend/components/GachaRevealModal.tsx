'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, Rarity } from '@/lib/types';
import GameCard from './GameCard';
import { cn } from '@/lib/utils';
import { Sparkles, Trophy, Star, Zap, Package } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface GachaRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: CardType[];
    packType: 'basic' | 'premium' | 'legendary' | 'starter';
    bonusReward?: { type: 'coins'; amount: number };
}

// 등급별 연출 설정
const RARITY_EFFECTS = {
    common: { color: 'gray', duration: 0.3, particles: 5 },
    rare: { color: 'blue', duration: 0.5, particles: 10 },
    epic: { color: 'purple', duration: 0.8, particles: 20 },
    legendary: { color: 'amber', duration: 1.2, particles: 30 },
    unique: { color: 'red', duration: 1.5, particles: 40 },
    commander: { color: 'emerald', duration: 1.5, particles: 40 }
};

// 등급별 배경 그라데이션
const RARITY_GRADIENTS = {
    common: 'from-gray-900 via-gray-800 to-gray-900',
    rare: 'from-blue-900 via-blue-800 to-blue-900',
    epic: 'from-purple-900 via-purple-800 to-purple-900',
    legendary: 'from-amber-900 via-orange-800 to-amber-900',
    unique: 'from-red-900 via-pink-800 to-red-900',
    commander: 'from-emerald-900 via-teal-800 to-emerald-900'
};

export default function GachaRevealModal({ isOpen, onClose, cards, packType, bonusReward }: GachaRevealModalProps) {
    useEscapeKey(isOpen, onClose);

    const [phase, setPhase] = useState<'opening' | 'revealing' | 'complete'>('opening');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [revealedCards, setRevealedCards] = useState<CardType[]>([]);

    // 최고 등급 찾기
    const highestRarity = cards.reduce<Rarity>((highest, card) => {
        const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'unique', 'commander'];
        const cardRarity = card.rarity || 'common';
        return rarityOrder.indexOf(cardRarity) > rarityOrder.indexOf(highest) ? cardRarity : highest;
    }, 'common');

    useEffect(() => {
        if (isOpen) {
            setPhase('opening');
            setCurrentCardIndex(0);
            setRevealedCards([]);

            // 오프닝 연출 후 카드 공개 시작
            const timer = setTimeout(() => {
                setPhase('revealing');
            }, packType === 'legendary' ? 1500 : packType === 'premium' ? 1000 : 500);

            return () => clearTimeout(timer);
        }
    }, [isOpen, packType]);

    useEffect(() => {
        if (phase === 'revealing' && currentCardIndex < cards.length) {
            const card = cards[currentCardIndex];
            const effect = RARITY_EFFECTS[card.rarity || 'common'];

            const timer = setTimeout(() => {
                setRevealedCards(prev => [...prev, card]);

                if (currentCardIndex < cards.length - 1) {
                    setCurrentCardIndex(prev => prev + 1);
                } else {
                    setPhase('complete');
                }
            }, effect.duration * 1000);

            return () => clearTimeout(timer);
        }
    }, [phase, currentCardIndex, cards]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
                onClick={phase === 'complete' ? onClose : undefined}
            >
                {/* 배경 효과 */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-radial",
                    RARITY_GRADIENTS[highestRarity]
                )} />

                {/* 파티클 효과 */}
                <ParticleEffect rarity={highestRarity} isActive={phase !== 'opening'} />

                {/* 오프닝 연출 */}
                {phase === 'opening' && (
                    <motion.div
                        initial={{ scale: 0, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.1, 1, 1.1, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.5,
                                ease: "easeInOut"
                            }}
                            className="w-48 h-64 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.6)] border-4 border-yellow-200"
                        >
                            <div className="absolute inset-0 bg-white/30 rounded-xl animate-pulse" />
                            <Package size={80} className="text-white drop-shadow-lg" />
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="text-center text-white mt-8 text-2xl font-black orbitron tracking-widest"
                        >
                            OPENING...
                        </motion.p>
                    </motion.div>
                )}

                {/* 카드 공개 */}
                {phase === 'revealing' && currentCardIndex < cards.length && (
                    <CardRevealAnimation
                        card={cards[currentCardIndex]}
                        index={currentCardIndex}
                        onComplete={() => { }}
                    />
                )}

                {/* 완료 - 모든 카드 표시 */}
                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <motion.h2
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-black text-white orbitron mb-8"
                        >
                            🎉 PACK OPENED!
                        </motion.h2>

                        <div className="flex flex-wrap justify-center gap-4 max-w-4xl px-4">
                            {revealedCards.map((card, i) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <GameCard card={card} isHolographic={card.rarity === 'legendary' || card.rarity === 'unique'} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Bonus Reward */}
                        {bonusReward && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 flex flex-col items-center justify-center py-4 px-8 bg-black/40 border border-yellow-500/50 rounded-xl backdrop-blur-sm"
                            >
                                <div className="text-yellow-400 font-bold mb-2 uppercase tracking-wider text-xs">Starter Gift</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl animate-bounce">💰</div>
                                    <div className="text-4xl font-black text-white orbitron text-shadow-glow">+{bonusReward.amount.toLocaleString()}</div>
                                </div>
                            </motion.div>
                        )}

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/60 mt-8 text-sm"
                        >
                            화면을 클릭하여 닫기
                        </motion.p>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

// 개별 카드 공개 애니메이션
function CardRevealAnimation({ card, index, onComplete }: { card: CardType; index: number; onComplete: () => void }) {
    const rarity = card.rarity || 'common';
    const effect = RARITY_EFFECTS[rarity];
    const isHighRarity = rarity === 'legendary' || rarity === 'unique' || rarity === 'epic';

    return (
        <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', duration: effect.duration }}
            className="relative z-10"
        >
            {/* 등급별 글로우 */}
            {isHighRarity && (
                <motion.div
                    animate={{
                        boxShadow: [
                            `0 0 50px var(--${effect.color}-500)`,
                            `0 0 100px var(--${effect.color}-500)`,
                            `0 0 50px var(--${effect.color}-500)`
                        ]
                    }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute inset-0 rounded-xl"
                />
            )}

            <GameCard card={card} isHolographic={isHighRarity} />

            {/* 등급 텍스트 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center"
            >
                <p className={cn(
                    "text-lg font-black orbitron uppercase",
                    rarity === 'legendary' && "text-amber-400",
                    rarity === 'unique' && "text-red-400",
                    rarity === 'epic' && "text-purple-400",
                    rarity === 'rare' && "text-blue-400",
                    rarity === 'common' && "text-gray-400"
                )}>
                    {rarity === 'legendary' && '⭐ LEGENDARY! ⭐'}
                    {rarity === 'unique' && '🔥 UNIQUE!! 🔥'}
                    {rarity === 'epic' && '✨ EPIC! ✨'}
                    {rarity === 'rare' && 'RARE'}
                    {rarity === 'common' && 'COMMON'}
                </p>
            </motion.div>
        </motion.div>
    );
}

// 파티클 효과
function ParticleEffect({ rarity, isActive }: { rarity: Rarity; isActive: boolean }) {
    const effect = RARITY_EFFECTS[rarity];

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: effect.particles }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: '50%',
                        y: '50%',
                        opacity: 0,
                        scale: 0
                    }}
                    animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                    className={cn(
                        "absolute w-2 h-2 rounded-full",
                        rarity === 'legendary' && "bg-amber-400",
                        rarity === 'unique' && "bg-red-400",
                        rarity === 'epic' && "bg-purple-400",
                        rarity === 'rare' && "bg-blue-400",
                        rarity === 'common' && "bg-gray-400"
                    )}
                />
            ))}
        </div>
    );
}
