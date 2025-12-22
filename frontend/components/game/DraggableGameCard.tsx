'use client';

import { Card as CardType } from '@/lib/types';
import { DraggableCard } from '@/components/ui/aceternity/draggable-card';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface DraggableGameCardProps {
    card: CardType;
    onDragEnd?: (event: any, info: any) => void;
    className?: string;
    dragConstraints?: any;
}

const TYPE_ICONS = {
    EFFICIENCY: '✂️',
    CREATIVITY: '🪨',
    COST: '📄',
};

const TYPE_COLORS = {
    EFFICIENCY: 'border-blue-400/50 bg-blue-500/10',
    CREATIVITY: 'border-purple-400/50 bg-purple-500/10',
    COST: 'border-amber-400/50 bg-amber-500/10',
};

export default function DraggableGameCard({
    card,
    onDragEnd,
    className = '',
    dragConstraints,
}: DraggableGameCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const cardType = card.type || 'EFFICIENCY';

    return (
        <DraggableCard
            dragConstraints={dragConstraints}
            onDragEnd={onDragEnd}
            className={className}
        >
            <motion.div
                animate={{
                    scale: isDragging ? 1.1 : 1,
                    opacity: isDragging ? 0.8 : 1,
                }}
                className={`relative w-48 h-64 rounded-2xl border-2 ${TYPE_COLORS[cardType]} backdrop-blur-sm overflow-hidden transition-all`}
            >
                {/* Card Image */}
                <div className="relative w-full h-32 overflow-hidden">
                    <img
                        src={`/images/cards/${card.id}.png`}
                        alt={card.name || 'Card'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-card.png';
                        }}
                    />

                    {/* Type Icon */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/90 flex items-center justify-center">
                        <span className="text-lg">{TYPE_ICONS[cardType]}</span>
                    </div>

                    {/* Level */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-slate-900/90 text-xs font-bold text-white">
                        Lv.{card.level}
                    </div>
                </div>

                {/* Card Info */}
                <div className="p-3 space-y-2">
                    <h4 className="text-sm font-bold text-white truncate">
                        {card.name || 'Unknown'}
                    </h4>

                    {/* Compact Stats */}
                    <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center">
                            <div className="text-slate-400">Func</div>
                            <div className="font-bold text-white">{card.stats.function || 0}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-slate-400">Eff</div>
                            <div className="font-bold text-white">{card.stats.efficiency || 0}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-slate-400">Cre</div>
                            <div className="font-bold text-white">{card.stats.creativity || 0}</div>
                        </div>
                    </div>

                    {/* Total Power */}
                    <div className="pt-2 border-t border-white/10 text-center">
                        <div className="text-xs text-slate-400">Power</div>
                        <div className="text-lg font-black text-white">
                            {(card.stats.function || 0) +
                                (card.stats.efficiency || 0) +
                                (card.stats.creativity || 0)}
                        </div>
                    </div>
                </div>

                {/* Drag Indicator */}
                {isDragging && (
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                        <div className="text-white text-xs font-bold">Dragging...</div>
                    </div>
                )}
            </motion.div>
        </DraggableCard>
    );
}
