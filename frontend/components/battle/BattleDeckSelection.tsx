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
        <div className="flex flex-col h-full bg-black/95 backdrop-blur-md absolute inset-0 z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white orbitron">DECK SELECTION</h2>
                    <p className="text-gray-400 text-sm">Select {maxSelection} cards for battle</p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-48 scrollbar-thin scrollbar-thumb-gray-800">

                {/* Main Cards Section */}
                {mainCards.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                            <span>⭐</span>
                            주력 카드
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-gradient-to-b from-amber-500/10 to-transparent rounded-xl border border-amber-500/30">
                            {mainCards.map((card) => {
                                const isSelected = currentSelection.some(c => c.id === card.id);
                                return (
                                    <motion.div
                                        key={`main-${card.id}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer relative"
                                        onClick={() => toggleCard(card as Card)}
                                    >
                                        <div className={cn(
                                            "transition-all duration-200 transform",
                                        )}>
                                            <GameCard
                                                card={card}
                                                isSelected={isSelected}
                                            />
                                        </div>
                                        <div className="absolute top-1 right-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded shadow-lg z-20">MAIN</div>
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-30 rounded-xl border-2 border-green-500">
                                                <div className="bg-green-500 rounded-full p-2 shadow-lg scale-110">
                                                    <Check size={20} className="text-black font-bold" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* All Cards Section */}
                <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white/60">전체 카드 목록</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {availableCards
                        .sort((a, b) => (b.stats?.totalPower || 0) - (a.stats?.totalPower || 0))
                        .map((card) => {
                            const isSelected = currentSelection.some(c => c.id === card.id);
                            // Highlight main cards in the grid too? PvP doesn't seem to double render strictly or it renders all.
                            // Let's just render all.
                            return (
                                <motion.div
                                    key={card.id}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer relative"
                                    onClick={() => toggleCard(card)}
                                >
                                    <div className={cn(
                                        "transition-all duration-200 transform",
                                    )}>
                                        <GameCard card={card} isSelected={isSelected} />
                                    </div>

                                    {/* Selection Overlay for Grid Items */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-30 rounded-xl border-2 border-green-500">
                                            <div className="bg-green-500 rounded-full p-2 shadow-lg scale-110">
                                                <Check size={20} className="text-black font-bold" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                </div>
            </div>

            {/* Fixed Bottom Bar - EXACT COPY OF PVP STYLE */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-4 z-50">
                <div className="max-w-7xl mx-auto px-4">

                    {/* Deck Slots */}
                    <div className="flex justify-center gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
                        {Array.from({ length: maxSelection }).map((_, i) => {
                            const card = currentSelection[i];
                            // Rock Paper Scissors Type Info (Mocked if missing, or use real)
                            const type = card?.type || 'EFFICIENCY';
                            let typeInfo = null;
                            if (card) {
                                if (type === 'EFFICIENCY') typeInfo = { emoji: '✊', bg: 'bg-gradient-to-br from-amber-500 to-orange-600', border: 'border-amber-300/50' };
                                else if (type === 'CREATIVITY') typeInfo = { emoji: '✌️', bg: 'bg-gradient-to-br from-red-500 to-pink-600', border: 'border-red-300/50' };
                                else typeInfo = { emoji: '🖐️', bg: 'bg-gradient-to-br from-blue-500 to-cyan-600', border: 'border-blue-300/50' };
                            }

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={cn(
                                        "relative w-24 h-32 md:w-28 md:h-40 rounded-xl border-2 transition-all overflow-hidden cursor-pointer shrink-0",
                                        card
                                            ? "border-cyan-500 bg-cyan-500/10 shadow-xl shadow-cyan-500/30"
                                            : "border-white/20 bg-white/5 border-dashed"
                                    )}
                                    onClick={() => {
                                        if (card) {
                                            onSelectionChange(currentSelection.filter(c => c.id !== card.id));
                                        }
                                    }}
                                >
                                    {card ? (
                                        <>
                                            {/* Card Image Background */}
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={getCardImageStyle(card)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Rarity Badge */}
                                            <div className={cn(
                                                "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-lg z-10 border bg-gray-800 border-gray-600",
                                                // Simplified rarity coloring
                                                card.rarity === 'legendary' && "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-300/50",
                                                card.rarity === 'epic' && "bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-300/50"
                                            )}>
                                                {card.rarity?.toUpperCase() || 'COMMON'}
                                            </div>

                                            {/* Type Icon */}
                                            {typeInfo && (
                                                <div className={cn(
                                                    "absolute top-1.5 right-1.5 px-2 py-1 rounded-full text-xs shadow-lg z-10",
                                                    typeInfo.bg,
                                                    typeInfo.border
                                                )}>
                                                    {typeInfo.emoji}
                                                </div>
                                            )}

                                            {/* Level */}
                                            <div className="absolute bottom-8 right-1.5 z-10">
                                                <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-[10px] font-black text-white shadow-lg border border-yellow-300/50">
                                                    LV.{card.level || 1}
                                                </div>
                                            </div>

                                            {/* Power */}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-black/70 z-10">
                                                <div className="text-xs md:text-sm font-bold text-white">
                                                    ⚡{Math.floor(card.stats?.totalPower || 0)}
                                                </div>
                                            </div>

                                            {/* Remove Overlay */}
                                            <div className="absolute inset-0 bg-red-500/0 hover:bg-red-500/60 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 z-20">
                                                <span className="text-white font-bold text-2xl drop-shadow-lg">✕</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-white/30">
                                            <span className="text-2xl font-bold mb-1">{i + 1}</span>
                                            <span className="text-[10px]">빈 슬롯</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                        <button
                            onClick={handleAutoSelect}
                            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold rounded-xl transition-all flex items-center gap-2 group"
                        >
                            <Shuffle size={20} className="group-hover:rotate-180 transition-transform" />
                            <span className="hidden sm:inline">자동 선택</span>
                        </button>

                        <div className="flex-1 text-center">
                            <span className="text-2xl font-black orbitron">
                                <span className={cn(
                                    currentSelection.length === maxSelection ? "text-green-400" : "text-white/60"
                                )}>{currentSelection.length}</span>
                                <span className="text-white/40">/{maxSelection}</span>
                            </span>
                            <span className="text-white/40 ml-2 text-xs md:text-sm">선택됨</span>
                        </div>

                        <button
                            onClick={() => currentSelection.length === maxSelection && onConfirm(currentSelection)}
                            disabled={currentSelection.length !== maxSelection}
                            className={cn(
                                "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all min-w-[180px] justify-center",
                                currentSelection.length === maxSelection
                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
                                    : "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                            )}
                        >
                            <Swords size={20} />
                            {currentSelection.length === maxSelection
                                ? "BATTLE START"
                                : `${currentSelection.length}/${maxSelection} Selected`
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
