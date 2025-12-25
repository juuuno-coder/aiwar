'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Swords, Trophy, Skull } from 'lucide-react';
import { Card } from '@/lib/types';

interface UnitFrameProps {
    card: Card;
    isWinner?: boolean;
    isLoser?: boolean;
    score?: number;
    showScore?: boolean;
    isRevealed?: boolean; // For enemy cards
}

const UnitFrame: React.FC<UnitFrameProps> = ({
    card,
    isWinner,
    isLoser,
    score,
    showScore,
    isRevealed = true
}) => {
    // Type Colors and Icons
    const getTypeConfig = (type?: string) => {
        switch (type) {
            case 'FUNCTION': return { color: 'border-red-500', icon: <Swords size={14} className="text-red-400" />, label: '✊' };
            case 'EFFICIENCY': return { color: 'border-blue-500', icon: <Zap size={14} className="text-blue-400" />, label: '✌️' };
            case 'CREATIVITY': return { color: 'border-purple-500', icon: <Shield size={14} className="text-purple-400" />, label: '🖐️' };
            default: return { color: 'border-gray-500', icon: null, label: '?' };
        }
    };

    const typeConfig = getTypeConfig(card.type);

    if (!isRevealed) {
        return (
            <div className="w-32 h-44 rounded-xl border-2 border-gray-700 bg-gray-900 flex items-center justify-center">
                <div className="text-4xl opacity-20">?</div>
            </div>
        );
    }

    return (
        <motion.div
            className={`relative w-32 h-44 rounded-xl border-2 bg-black/80 backdrop-blur-md overflow-hidden transition-all
                ${typeConfig.color}
                ${isWinner ? 'scale-110 z-10 ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}
                ${isLoser ? 'opacity-50 grayscale scale-90' : ''}
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: isWinner ? 1.1 : (isLoser ? 0.9 : 1) }}
        >
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${card.imageUrl})` }} />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            {/* Top Left: Type Icon */}
            <div className="absolute top-2 left-2 flex gap-1 bg-black/50 p-1 rounded-full backdrop-blur-sm">
                {typeConfig.icon}
            </div>

            {/* Top Right: RPS Hand */}
            <div className="absolute top-2 right-2 text-xl filter drop-shadow-md">
                {typeConfig.label}
            </div>

            {/* Center Result Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isWinner && <Trophy className="text-yellow-400 drop-shadow-lg" size={48} />}
                {isLoser && <Skull className="text-gray-500/50" size={48} />}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-2 left-2 right-2">
                <div className="text-xs font-bold text-white truncate text-center font-orbitron mb-1">
                    {card.name}
                </div>

                {/* Score / Power Display */}
                <div className={`flex justify-center items-center gap-1 font-mono text-xs
                    ${showScore ? (isWinner ? 'text-yellow-400 font-bold' : 'text-gray-400') : 'text-white/60'}
                `}>
                    {showScore ? (
                        <span>{score} pts</span>
                    ) : (
                        <span>PWR: {card.stats.totalPower}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default UnitFrame;
