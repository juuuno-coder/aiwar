'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/lib/types';
import Button from '@/components/ui/Button';
import GameCard from '@/components/GameCard';
import { cn } from '@/lib/utils';
import { Check, X, Shuffle, Swords, Shield, Zap } from 'lucide-react';
import { getMainCards, selectBalancedDeck } from '@/lib/balanced-deck-selector';

// Helper for card image (simplified version of pvp page logic)
const getCardImageStyle = (card: Card) => {
    // This is a simplified reliable fallback. In a real scenario we'd import getCardCharacterImage.
    // Assuming card has imageUrl or we use a default.
    return {
        backgroundImage: `url(${card.imageUrl || '/assets/cards/default-card.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };
};

interface BattleDeckSelectionProps {
    availableCards: Card[];
    maxSelection: number;
    currentSelection: Card[];
    onSelectionChange: (cards: Card[]) => void;
    onConfirm: (cards: Card[]) => void;
    onCancel?: () => void;
    onAutoSelect?: () => void; // Added as per instruction
}

export default function BattleDeckSelection({
    availableCards,
    maxSelection,
    currentSelection,
    onSelectionChange,
    onConfirm,
    onCancel
}: BattleDeckSelectionProps) {

    const mainCards = getMainCards(availableCards);

    const toggleCard = (card: Card) => {
        const isSelected = currentSelection.find(c => c.id === card.id);

        if (isSelected) {
            onSelectionChange(currentSelection.filter(c => c.id !== card.id));
        } else {
            if (currentSelection.length < maxSelection) {
                onSelectionChange([...currentSelection, card]);
            }
        }
    };

    const handleAutoSelect = () => {
        // Use the shared utility for balanced deck selection
        const balancedDeck = selectBalancedDeck(availableCards, maxSelection);
        onSelectionChange(balancedDeck as Card[]);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-black to-black" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-6 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <span className="text-cyan-500">DECK</span> SELECTION
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                        <Swords size={14} className="text-cyan-500" />
                        전투에 참여할 카드 <span className="text-white font-bold">{maxSelection}장</span>을 선택하세요
                    </p>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Main Content - Grid */}
            <div className="relative z-10 flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800">
                <div className="max-w-7xl mx-auto">
                    {/* Main Cards Section */}
                    {mainCards.length > 0 && (
                        <div className="mb-10">
                            <h4 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2 px-2">
                                <span className="text-xl">⭐</span>
                                권장 주력 카드
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {mainCards.map((card) => {
                                    const isSelected = currentSelection.some(c => c.id === card.id);
                                    return (
                                        <motion.div
                                            key={`main-${card.id}`}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="cursor-pointer relative group"
                                            onClick={() => toggleCard(card as Card)}
                                        >
                                            <div className="relative">
                                                <GameCard
                                                    card={card}
                                                    isSelected={isSelected}
                                                />
                                                {/* Selection Overlay */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-xl border-4 border-cyan-400 flex items-center justify-center z-20 backdrop-blur-[2px]">
                                                        <div className="bg-cyan-500 rounded-full p-2 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                                                            <Check size={24} className="text-black font-black" />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Hover Glow */}
                                                <div className="absolute inset-0 rounded-xl bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors border-2 border-transparent group-hover:border-amber-500/50 pointer-events-none" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-30 border border-amber-300">
                                                RECOMMENDED
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Cards Section */}
                    <div className="mb-6 flex items-center justify-between px-2">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-cyan-500 rounded-full mr-2" />
                            전체 카드 목록
                        </h4>
                        <span className="text-gray-500 text-sm">
                            {availableCards.length} Cards Available
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-32">
                        {availableCards
                            .sort((a, b) => (b.stats?.totalPower || 0) - (a.stats?.totalPower || 0))
                            .map((card) => {
                                const isSelected = currentSelection.some(c => c.id === card.id);
                                return (
                                    <motion.div
                                        key={card.id}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer relative group"
                                        onClick={() => toggleCard(card)}
                                    >
                                        <div className="relative">
                                            <GameCard card={card} isSelected={isSelected} />

                                            {/* Selection Overlay */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-cyan-500/20 rounded-xl border-4 border-cyan-400 flex items-center justify-center z-20 backdrop-blur-[2px]">
                                                    <div className="bg-cyan-500 rounded-full p-2 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                                                        <Check size={24} className="text-black font-black" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-20 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Selected Cards Mini Preview */}
                        <div className="flex-1 w-full md:w-auto overflow-x-auto no-scrollbar py-2">
                            <div className="flex gap-2 justify-center md:justify-start min-w-min">
                                {Array.from({ length: maxSelection }).map((_, i) => {
                                    const card = currentSelection[i];
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-12 h-16 md:w-16 md:h-20 rounded-lg border flex-shrink-0 relative overflow-hidden transition-all",
                                                card ? "border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "border-white/10 bg-white/5 border-dashed"
                                            )}
                                            onClick={() => card && toggleCard(card)}
                                        >
                                            {card ? (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={getCardImageStyle(card)}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-center">
                            <div className="text-right hidden md:block mr-4">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Selected</div>
                                <div className="text-3xl font-black italic flex items-center justify-end gap-1">
                                    <span className={cn(currentSelection.length === maxSelection ? "text-cyan-400" : "text-white")}>
                                        {currentSelection.length}
                                    </span>
                                    <span className="text-white/40 text-xl">/ {maxSelection}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAutoSelect}
                                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10 group"
                            >
                                <Shuffle size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                <span className="hidden sm:inline">AUTO</span>
                            </button>

                            <button
                                onClick={() => currentSelection.length === maxSelection && onConfirm(currentSelection)}
                                disabled={currentSelection.length !== maxSelection}
                                className={cn(
                                    "px-10 py-4 rounded-xl font-black text-lg flex items-center gap-3 transition-all min-w-[200px] justify-center shadow-lg",
                                    currentSelection.length === maxSelection
                                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20 hover:scale-105 active:scale-95"
                                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                                )}
                            >
                                {currentSelection.length === maxSelection ? (
                                    <>
                                        BATTLE START <Swords size={20} />
                                    </>
                                ) : (
                                    <span className="text-sm font-normal">
                                        Select {maxSelection - currentSelection.length} more
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
