'use client';

import { Card as CardType } from '@/lib/types';
import { Card3D, CardBody, CardItem } from '@/components/ui/aceternity/3d-card';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Card3DGameCardProps {
    card: CardType;
    onClick?: () => void;
    className?: string;
}

const TYPE_ICONS = {
    EFFICIENCY: '✂️',
    CREATIVITY: '🪨',
    COST: '📄',
};

const TYPE_COLORS = {
    EFFICIENCY: {
        gradient: 'from-blue-500/30 via-cyan-500/20 to-blue-500/30',
        glow: 'shadow-blue-500/50',
        text: 'text-blue-300',
    },
    CREATIVITY: {
        gradient: 'from-purple-500/30 via-pink-500/20 to-purple-500/30',
        glow: 'shadow-purple-500/50',
        text: 'text-purple-300',
    },
    COST: {
        gradient: 'from-amber-500/30 via-orange-500/20 to-amber-500/30',
        glow: 'shadow-amber-500/50',
        text: 'text-amber-300',
    },
};

export default function Card3DGameCard({
    card,
    onClick,
    className = '',
}: Card3DGameCardProps) {
    const [isSelected, setIsSelected] = useState(false);
    const cardType = card.type || 'EFFICIENCY';
    const typeStyle = TYPE_COLORS[cardType];

    const totalPower =
        (card.stats.function || 0) +
        (card.stats.efficiency || 0) +
        (card.stats.creativity || 0);

    return (
        <Card3D
            className={`w-72 ${className}`}
            containerClassName="py-8"
        >
            <CardBody
                className={`relative group/card bg-gradient-to-br ${typeStyle.gradient} backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:${typeStyle.glow} transition-all duration-300`}
            >
                {/* Card Image */}
                <CardItem
                    translateZ="100"
                    className="w-full mb-4"
                >
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                        <img
                            src={`/images/cards/${card.id}.png`}
                            alt={card.name || 'Card'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder-card.png';
                            }}
                        />

                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-slate-900/90 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <span className="text-2xl">{TYPE_ICONS[cardType]}</span>
                        </div>

                        {/* Level Badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-sm border border-white/20">
                            <span className="text-xs font-bold text-white">Lv.{card.level}</span>
                        </div>
                    </div>
                </CardItem>

                {/* Card Name */}
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-white mb-4"
                >
                    {card.name || 'Unknown Card'}
                </CardItem>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                    <CardItem
                        translateZ="60"
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="text-slate-400">Function</span>
                        <span className={`font-bold ${typeStyle.text}`}>
                            {card.stats.function || 0}
                        </span>
                    </CardItem>
                    <CardItem
                        translateZ="60"
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="text-slate-400">Efficiency</span>
                        <span className={`font-bold ${typeStyle.text}`}>
                            {card.stats.efficiency || 0}
                        </span>
                    </CardItem>
                    <CardItem
                        translateZ="60"
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="text-slate-400">Creativity</span>
                        <span className={`font-bold ${typeStyle.text}`}>
                            {card.stats.creativity || 0}
                        </span>
                    </CardItem>
                </div>

                {/* Total Power */}
                <CardItem
                    translateZ="80"
                    className="pt-4 border-t border-white/10"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Total Power</span>
                        <span className="text-2xl font-black text-white">{totalPower}</span>
                    </div>
                </CardItem>

                {/* Select Button */}
                {onClick && (
                    <CardItem
                        translateZ="100"
                        className="mt-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsSelected(!isSelected);
                                onClick();
                            }}
                            className={`w-full py-3 rounded-xl font-medium transition-all ${isSelected
                                    ? `bg-gradient-to-r ${typeStyle.gradient} border-2 border-white/30 text-white`
                                    : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-700/50'
                                }`}
                        >
                            {isSelected ? 'Selected' : 'Select Card'}
                        </motion.button>
                    </CardItem>
                )}
            </CardBody>
        </Card3D>
    );
}
