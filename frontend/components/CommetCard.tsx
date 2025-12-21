'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import GameCard from './GameCard';
import { cn } from '@/lib/utils';

interface CommetCardProps {
    card: CardType;
    isFocused?: boolean;
}

export default function CommetCard({ card, isFocused }: CommetCardProps) {
    return (
        <div className={cn(
            "relative group transition-all duration-700",
            isFocused ? "scale-110 z-[100]" : "hover:scale-105"
        )}>
            {/* Focus Dim Background (only if focused) */}
            {isFocused && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[-1] transition-opacity duration-700" />
            )}

            {/* Comet Trail Effect (Animated SVG or Divs) */}
            <div className="absolute -inset-8 pointer-events-none overflow-hidden rounded-[3rem]">
                <motion.div
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.2)_50%,transparent_100%)] opacity-30"
                />
            </div>

            {/* Particle Stream (Tail) */}
            <div className="absolute -right-16 -top-16 w-32 h-32 pointer-events-none">
                <motion.div
                    animate={{
                        opacity: [0, 1, 0],
                        x: [0, 40],
                        y: [0, -40],
                        scale: [0.5, 1.5, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 w-4 h-4 bg-cyan-400 blur-xl rounded-full"
                />
                <motion.div
                    animate={{
                        opacity: [0, 0.8, 0],
                        x: [-20, 20],
                        y: [20, -60],
                        scale: [1, 0.5, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-1/2 left-1/2 w-6 h-6 bg-purple-400 blur-xl rounded-full"
                />
            </div>

            {/* Actual Card */}
            <div className="relative shadow-[0_0_40px_rgba(6,182,212,0.15)] rounded-3xl group-hover:shadow-[0_0_60px_rgba(6,182,212,0.3)] transition-shadow">
                <GameCard card={card} />
            </div>

            {/* Bottom Glow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-cyan-500/40 blur-md rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
        </div>
    );
}
