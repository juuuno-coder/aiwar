'use client';

import { Card as CardType } from '@/lib/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EnhancedGameCardProps {
    card: CardType;
    onClick?: () => void;
    className?: string;
    showVideo?: boolean;
}

// Type icons for rock-paper-scissors
const TYPE_ICONS = {
    EFFICIENCY: '✂️', // Scissors
    CREATIVITY: '🪨', // Rock
    COST: '📄', // Paper
};

const TYPE_COLORS = {
    EFFICIENCY: {
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-400/30',
        text: 'text-blue-300',
        glow: 'shadow-blue-500/20',
    },
    CREATIVITY: {
        bg: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-400/30',
        text: 'text-purple-300',
        glow: 'shadow-purple-500/20',
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

                    {/* Type Icon Badge */}
                    <div
                        className={`absolute top-3 right-3 w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border ${typeStyle.border} flex items-center justify-center`}
                    >
                        <span className="text-2xl">{TYPE_ICONS[cardType]}</span>
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-white/10">
                        <span className="text-xs font-bold text-white">Lv.{card.level}</span>
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
                    className={`absolute inset-0 bg-gradient-to-t from-${cardType === 'EFFICIENCY' ? 'blue' : cardType === 'CREATIVITY' ? 'purple' : 'amber'}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />
            </div>
        </motion.div>
    );
}
