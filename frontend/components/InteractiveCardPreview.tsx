'use client';

import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { useGame } from '@/components/GameContext';
import GameCard from './GameCard';
import { X, Maximize2, Move } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InteractiveCardPreview() {
    const { previewCard, setPreviewCard } = useGame();

    // 3D Tilting values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-200, 200], [25, -25]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-200, 200], [-25, 25]), { stiffness: 150, damping: 20 });

    const handleDrag = (_: any, info: any) => {
        x.set(info.offset.x);
        y.set(info.offset.y);
    };

    const handleDragEnd = () => {
        x.set(0);
        y.set(0);
    };

    if (!previewCard) return null;

    return (
        <AnimatePresence>
            {previewCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewCard(null)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-zoom-out"
                    />

                    {/* UI Guidance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white/40 pointer-events-none"
                    >
                        <div className="flex items-center gap-2">
                            <Move size={16} />
                            <span className="text-[10px] font-black orbitron uppercase tracking-widest">Drag to Move & Tilt</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X size={16} />
                            <span className="text-[10px] font-black orbitron uppercase tracking-widest">Click Backdrop to Close</span>
                        </div>
                    </motion.div>

                    {/* Draggable Card Container */}
                    <motion.div
                        drag
                        dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                        dragElastic={0.1}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                        animate={{ scale: 1.5, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                            perspective: 1000
                        }}
                        className="relative z-10 cursor-grab active:cursor-grabbing"
                    >
                        {/* Shadow that follows the tilt */}
                        <motion.div
                            className="absolute -inset-10 bg-purple-600/20 blur-[60px] rounded-full -z-10"
                            style={{
                                x: useTransform(rotateY, [-25, 25], [40, -40]),
                                y: useTransform(rotateX, [-25, 25], [-40, 40]),
                            }}
                        />

                        <div className="pointer-events-none scale-110">
                            <GameCard card={previewCard} />
                        </div>

                        {/* Extra Detail Overlay (Optional) */}
                        <div className="absolute -right-32 top-0 w-32 space-y-4 text-white pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-[8px] font-black orbitron text-purple-400 block mb-1">UNIT STATUS</span>
                                <div className="h-0.5 w-12 bg-purple-500 mb-2" />
                                <p className="text-[10px] font-bold uppercase">{previewCard.rarity || 'common'}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="text-[8px] font-black orbitron text-blue-400 block mb-1">BIO DATA</span>
                                <div className="h-0.5 w-12 bg-blue-500 mb-1" />
                                <p className="text-[8px] text-gray-400 italic font-medium leading-tight">{previewCard.specialSkill?.description || 'No special ability data found.'}</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
