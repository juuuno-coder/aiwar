'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import GameCard from './GameCard';
import { SparklesCore } from './ui/aceternity/effects';
import { cn } from '@/lib/utils';
import CyberButton from './CyberButton';

interface CardRevealModalProps {
    isOpen: boolean;
    card: CardType | null;
    onClose: () => void;
    onAddToInventory?: () => void; // 인벤토리 추가 콜백
}

export default function CardRevealModal({ isOpen, card, onClose, onAddToInventory }: CardRevealModalProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsFlipped(false);
            setShowContent(false);
        }
    }, [isOpen]);

    if (!card) return null;

    const handleFlip = () => {
        if (!isFlipped) {
            setIsFlipped(true);
            setTimeout(() => setShowContent(true), 300);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    {/* Effects Backdrop */}
                    {isFlipped && (
                        <div className="absolute inset-0 pointer-events-none">
                            <SparklesCore
                                id="reveal-sparkles"
                                background="transparent"
                                minSize={0.6}
                                maxSize={1.4}
                                particleDensity={100}
                                className="w-full h-full"
                                particleColor="#00f2ff"
                            />
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 50 }}
                            className="perspective-1000"
                        >
                            <motion.div
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
                                className="relative w-[360px] h-[480px] preserve-3d cursor-pointer"
                                onClick={handleFlip}
                            >
                                {/* Front (Card Back Design) */}
                                <div
                                    className={cn(
                                        "absolute inset-0 backface-hidden rounded-[2rem] border-4 border-cyan-500/50 bg-gray-900 flex flex-col items-center justify-center gap-6 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]",
                                        isFlipped ? "pointer-events-none" : ""
                                    )}
                                >
                                    <div className="absolute inset-0 grid-pattern opacity-20" />
                                    <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center border-2 border-cyan-500/40 animate-pulse">
                                        <span className="text-4xl">💎</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-black text-cyan-400 orbitron italic tracking-tighter">NEW ASSET</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Ready to Extract</p>
                                    </div>
                                    <div className="absolute bottom-8 text-cyan-500/50 font-black text-xs animate-bounce">
                                        CLICK TO REVEAL
                                    </div>
                                </div>

                                {/* Back (The Actual Card) */}
                                <div
                                    className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden rotate-y-180"
                                >
                                    <div className="scale-150 w-full h-full flex items-center justify-center">
                                        <GameCard card={card} />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Info & Action */}
                        <AnimatePresence>
                            {showContent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-12 flex flex-col items-center gap-6"
                                >
                                    <div className="text-center">
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            className="text-4xl font-black text-white italic tracking-tighter mb-2"
                                        >
                                            IDENTIFIED: <span className="text-cyan-400 uppercase">{card.name || 'GENERIC UNIT'}</span>
                                        </motion.div>
                                        <div className="text-purple-400 font-black tracking-widest text-sm uppercase">
                                            {(card.rarity || 'common').toUpperCase()} GRADE SUCCESS
                                        </div>
                                    </div>

                                    <CyberButton
                                        onClick={() => {
                                            if (onAddToInventory) {
                                                onAddToInventory();
                                            }
                                            onClose();
                                        }}
                                        className="px-16"
                                    >
                                        인벤토리로 이동
                                    </CyberButton>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </AnimatePresence>
    );
}
