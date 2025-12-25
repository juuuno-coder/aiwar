'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import GameCard from './GameCard';
import { cn } from '@/lib/utils';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CardRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: CardType[];
    title?: string;
}

export default function CardRewardModal({ isOpen, onClose, cards, title = "카드 획득!" }: CardRewardModalProps) {
    const [showCards, setShowCards] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowCards(false);
            const timer = setTimeout(() => setShowCards(true), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                onClick={onClose}
            >
                {/* Background Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-gradient-radial from-green-500/20 via-transparent to-transparent opacity-50 animate-pulse" />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative z-10 w-full max-w-lg flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-green-400 orbitron drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                            {title}
                        </h2>
                        <p className="text-white/60 mt-2">인벤토리에 추가되었습니다</p>
                    </motion.div>

                    <div className="flex justify-center gap-4 flex-wrap">
                        {showCards && cards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                initial={{ rotateY: 90, scale: 0.5 }}
                                animate={{ rotateY: 0, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    damping: 12,
                                    stiffness: 100,
                                    delay: index * 0.1
                                }}
                                className="relative"
                            >
                                <div className="absolute -inset-4 bg-green-500/30 rounded-full blur-xl animate-pulse" />
                                <GameCard card={card} isHolographic={['legendary', 'unique'].includes(card.rarity || '')} />

                                {/* Sparkle Effects around card */}
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -top-6 -right-6 text-yellow-400"
                                >
                                    <Sparkles size={32} />
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        onClick={onClose}
                        className="mt-12 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        확인
                    </motion.button>
                </motion.div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                >
                    <X size={32} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
