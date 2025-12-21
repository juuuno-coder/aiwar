import { useState } from 'react';
import { Card, Rarity } from '@/lib/types';
import GameCard from './GameCard';
import { Button } from "@/components/ui/custom/Button";
import { Progress } from "@/components/ui/custom/Progress";
import { Chip } from "@/components/ui/custom/Chip";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesCore } from '@/components/ui/aceternity/effects';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Zap, ChevronRight } from "lucide-react";

interface CardGachaProps {
    cards: Card[];
    onComplete: () => void;
}

export default function CardGacha({ cards, onComplete }: CardGachaProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);

    // Unused state removed: revealTrigger

    const currentCard = cards[currentIndex];
    const rarity = currentCard.rarity || 'common';

    const handleReveal = () => {
        if (isRevealed) return;
        setIsRevealed(true);
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsRevealed(false);
        } else {
            onComplete();
        }
    };

    const rarityColors: Record<Rarity, string> = {
        common: '#9CA3AF',
        rare: '#3B82F6',
        epic: '#A855F7',
        legendary: '#F59E0B'
    };

    // Removed unused glowColors

    return (
        <div className="fixed inset-0 bg-[#020202] z-[100] overflow-hidden flex items-center justify-center">
            <BackgroundBeams className="opacity-40" />

            <AnimatePresence>
                {isRevealed && rarity === 'legendary' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0"
                    >
                        <SparklesCore
                            id="gachaLegendary"
                            background="transparent"
                            minSize={0.6}
                            maxSize={1.4}
                            particleDensity={100}
                            className="w-full h-full"
                            particleColor="#EAB308"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center px-6">
                {/* 상단 프로그레스 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mb-16 flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-1 bg-purple-600 rounded-full" />
                        <span className="text-gray-500 font-black orbitron text-xs tracking-[0.3em]">ANALYZING UNIT DATA</span>
                        <Chip size="sm" color="secondary" variant="shadow" className="font-black orbitron px-3 h-6">
                            {currentIndex + 1} / {cards.length}
                        </Chip>
                    </div>
                    <Progress
                        size="sm"
                        color="secondary"
                        value={((currentIndex + 1) / cards.length) * 100}
                        className="max-w-xs"
                        classNames={{
                            track: "bg-white/5",
                            indicator: "bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        }}
                    />
                </motion.div>

                {/* 카드 메인 컨테이너 */}
                <div className="relative w-full flex items-center justify-center min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {!isRevealed ? (
                            <motion.div
                                key="back"
                                initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                exit={{ scale: 1.1, opacity: 0, rotateY: 90 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                onClick={handleReveal}
                                className="w-[300px] h-[450px] bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white/5 flex flex-col items-center justify-center cursor-pointer group shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />

                                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all duration-500">
                                    <Zap size={40} className="text-purple-400 animate-pulse" />
                                </div>

                                <div className="orbitron font-black text-white text-xl tracking-widest italic mb-2">AI WAR</div>
                                <div className="orbitron text-[10px] text-purple-400 font-bold uppercase tracking-[0.5em] mb-12">Neural Core</div>

                                <div className="absolute bottom-10 flex flex-col items-center gap-2">
                                    <div className="w-6 h-1 bg-white/10 rounded-full" />
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Initialization Pending</div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="front"
                                initial={{ scale: 1.5, opacity: 0, rotateY: -110, filter: "blur(20px)" }}
                                animate={{ scale: 1, opacity: 1, rotateY: 0, filter: "blur(0px)" }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="relative flex flex-col items-center"
                            >
                                {/* 등급 글로우 레이어 */}
                                <div
                                    className="absolute inset-0 rounded-full blur-[100px] opacity-40 transition-all duration-1000 scale-150"
                                    style={{ background: rarityColors[rarity] }}
                                />

                                <div className="scale-[1.3] relative z-10">
                                    <GameCard card={currentCard} />
                                </div>

                                {/* 등급 텍스트 효과 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, type: "spring" }}
                                    className="absolute -bottom-32 flex flex-col items-center gap-2"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-0.5 bg-white/20" />
                                        <span className="text-[10px] text-gray-500 font-black orbitron tracking-widest uppercase">Encryption Broken</span>
                                        <div className="w-6 h-0.5 bg-white/20" />
                                    </div>
                                    <div
                                        className="text-6xl font-black orbitron italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                        style={{ color: rarityColors[rarity] }}
                                    >
                                        {rarity.toUpperCase()}!
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 하단 제어부 */}
                <div className="h-24 flex items-center justify-center mt-32 relative z-20">
                    <AnimatePresence>
                        {isRevealed && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Button
                                    size="lg"
                                    color="primary"
                                    variant="shadow"
                                    onPress={handleNext}
                                    className="h-16 px-16 font-black orbitron text-sm tracking-[0.2em] bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_30px_rgba(37,99,235,0.4)] border-none italic"
                                    endContent={<ChevronRight size={18} />}
                                >
                                    {currentIndex < cards.length - 1 ? 'NEXT DATA STREAM' : 'SYNCHRONIZATION COMPLETE'}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
