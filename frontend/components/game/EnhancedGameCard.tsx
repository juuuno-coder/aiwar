'use client';

import { Card as CardType, AIType } from '@/lib/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EnhancedGameCardProps {
    card: CardType;
    onClick?: () => void;
    className?: string;
    showVideo?: boolean;
}

// Type icons for rock-paper-scissors
const TYPE_ICONS: Record<string, string> = {
    EFFICIENCY: '✊', // Rock (EFFICIENCY beats FUNCTION/SCISSORS)
    CREATIVITY: '✋', // Paper (CREATIVITY beats EFFICIENCY/ROCK)
    FUNCTION: '✌️',   // Scissors (FUNCTION beats CREATIVITY/PAPER)
    COST: '💰',       // Cost
};

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    EFFICIENCY: {
        bg: 'from-red-500/20 to-rose-500/20',
        border: 'border-red-400/30',
        text: 'text-red-300',
        glow: 'shadow-red-500/20',
    },
    CREATIVITY: {
        bg: 'from-blue-500/20 to-indigo-500/20',
        border: 'border-blue-400/30',
        text: 'text-blue-300',
        glow: 'shadow-blue-500/20',
    },
    FUNCTION: {
        bg: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-400/30',
        text: 'text-green-300',
        glow: 'shadow-green-500/20',
    },
    COST: {
        bg: 'from-amber-500/20 to-orange-500/20',
        border: 'border-amber-400/30',
        text: 'text-amber-300',
        glow: 'shadow-amber-500/20',
    },
};

export default function EnhancedGameCard({
    card,
    onClick,
    className = '',
    showVideo = false,
}: EnhancedGameCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const cardType = card.type || 'EFFICIENCY';
    const typeStyle = TYPE_COLORS[cardType];

    // Calculate total battle power
    const totalPower =
        (card.stats.function || 0) +
        (card.stats.efficiency || 0) +
        (card.stats.creativity || 0);

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`relative group cursor-pointer ${className}`}
        >
            {/* Card Container */}
            <div
                className={`relative w-64 h-96 rounded-2xl bg-gradient-to-br ${typeStyle.bg} backdrop-blur-sm border ${typeStyle.border} overflow-hidden transition-all duration-300 hover:${typeStyle.glow}`}
            >
                {/* Card Image/Video */}
                <div className="relative w-full h-48 overflow-hidden">
                    {showVideo && isHovered && card.stats.function && !videoError ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            onError={() => setVideoError(true)}
                            className="w-full h-full object-cover"
                        >
                            <source src={`/videos/cards/${card.id}.mp4`} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={`/images/cards/${card.id}.png`}
                            alt={card.name || 'Card'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder-card.png';
                            }}
                        />
                    )}

                    {/* Type Icon Badge - Enlarged */}
                    <div
                        className={`absolute top-3 right-3 w-14 h-14 rounded-full bg-slate-900/90 backdrop-blur-md border-2 ${typeStyle.border} flex items-center justify-center z-50 shadow-xl`}
                    >
                        <span className="text-3xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{TYPE_ICONS[cardType]}</span>
                    </div>

                    {/* Level Badge - Moved to Bottom Right */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-slate-900/90 backdrop-blur-sm border border-white/20 z-40 shadow-lg">
                        <span className="text-xs font-black text-white font-mono">LV.{card.level}</span>
                    </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-3">
                    {/* Card Name */}
                    <h3 className="text-lg font-bold text-white truncate">
                        {card.name || 'Unknown Card'}
                    </h3>

                    {/* Battle Stats */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Function</span>
                            <span className={`font-bold ${typeStyle.text}`}>
                                {card.stats.function || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Efficiency</span>
                            <span className={`font-bold ${typeStyle.text}`}>
                                {card.stats.efficiency || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Creativity</span>
                            <span className={`font-bold ${typeStyle.text}`}>
                                {card.stats.creativity || 0}
                            </span>
                        </div>
                    </div>

                    {/* Total Power */}
                    <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-300">Total Power</span>
                            <span className="text-xl font-black text-white">{totalPower}</span>
                        </div>
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-${cardType === 'EFFICIENCY' ? 'red' : cardType === 'CREATIVITY' ? 'blue' : 'green'}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />
            </div>
        </motion.div>
    );
}
