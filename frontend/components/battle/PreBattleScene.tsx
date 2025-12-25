'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBattleModeConfig, BattleMode } from '@/lib/battle-modes';
import { Card } from '@/lib/types';
import UnitFrame from './UnitFrame';
import { ArrowRight, Clock, Shuffle, AlertTriangle } from 'lucide-react';

interface PreBattleSceneProps {
    userInventory: Card[];
    enemyPool: Card[]; // The 5 cards enemy revealed (simulated)
    mode: BattleMode;
    onStartBattle: (selectedCards: Card[], jokerCards?: Card[]) => void;
}

type Phase = 'SELECTION' | 'REVEAL' | 'STRATEGY';

const PreBattleScene: React.FC<PreBattleSceneProps> = ({ userInventory, enemyPool, mode, onStartBattle }) => {
    const [phase, setPhase] = useState<Phase>('SELECTION');
    const [selectedPool, setSelectedPool] = useState<Card[]>([]);
    const [orderedDeck, setOrderedDeck] = useState<Card[]>([]);
    const [jokers, setJokers] = useState<Card[]>([]); // For Ambush mode
    const [timeLeft, setTimeLeft] = useState(10);

    const config = getBattleModeConfig(mode);
    const ante = config.ante;

    // Initial Filter: Only show eligible cards
    const eligibleCards = userInventory.filter(c => !c.isLocked || c.level > 1); // Simple filter

    // --- PHASE 1: SELECTION ---
    const handleSelect = (card: Card) => {
        if (selectedPool.find(c => c.id === card.id)) {
            setSelectedPool(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (selectedPool.length < 5) {
                setSelectedPool(prev => [...prev, card]);
            }
        }
    };

    const confirmSelection = () => {
        if (selectedPool.length === 5) {
            setPhase('REVEAL');
            setTimeLeft(10);
            setOrderedDeck([...selectedPool]); // Default order
        }
    };

    // --- PHASE 2: REVEAL (Timer) ---
    useEffect(() => {
        if (phase === 'REVEAL') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setPhase('STRATEGY');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase]);

    // --- PHASE 3: STRATEGY ---
    const moveCard = (fromIdx: number, toIdx: number) => {
        const newOrder = [...orderedDeck];
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        setOrderedDeck(newOrder);
    };

    const handleBattleStart = () => {
        if (mode === 'sudden-death') {
            // For Sudden Death, we strictly need 1 card, but logic says "Pick 1 of 5".
            // Let's assume the FIRST card in orderedDeck is the chosen one.
            onStartBattle([orderedDeck[0]]);
        } else if (mode === 'ambush') {
            // Need to define logic for Jokers. 
            // For simplicity in this demo, let's assume Jokers are auto-selected or added steps.
            // Let's just pass order.
            onStartBattle(orderedDeck, jokers);
        } else {
            onStartBattle(orderedDeck);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 flex flex-col gap-6 min-h-[600px] bg-black/90 text-white rounded-3xl border border-white/10">

            {/* Header Steps */}
            <div className="flex justify-between items-center text-sm font-orbitron text-gray-500 border-b border-white/10 pb-4">
                <div className={phase === 'SELECTION' ? 'text-cyan-400 font-bold' : ''}>1. DRAFT</div>
                <div className={phase === 'REVEAL' ? 'text-cyan-400 font-bold' : ''}>2. REVEAL</div>
                <div className={phase === 'STRATEGY' ? 'text-cyan-400 font-bold' : ''}>3. STRATEGY</div>
            </div>

            {/* PHASE 1: SELECTION */}
            {phase === 'SELECTION' && (
                <div className="flex-1 flex flex-col gap-4">
                    {/* ANTE WARNING */}
                    <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-500/20 p-2 rounded-lg text-red-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm">High Stakes Warning</h3>
                                <p className="text-white/70 text-xs">
                                    Defeat Penalty: Lose <span className="font-bold text-red-400">{ante.lossCount} Card(s)</span> (Common/Rare).
                                    <br />
                                    <span className="opacity-50 text-[10px]">Cards Level {'>'} 1 are protected.</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-green-400 font-bold uppercase tracking-wider text-sm">Victory Reward</h3>
                            <p className="text-white/70 text-xs">
                                {ante.winRewardType === 'card' ? 'Capture 1 Enemy Card' : 'Earn Arena Tokens'}
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold">Select 5 Units</h2>
                    <div className="flex gap-4 min-h-[180px] p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                        {selectedPool.map(card => (
                            <div key={card.id} onClick={() => handleSelect(card)}>
                                <UnitFrame card={card} isRevealed />
                            </div>
                        ))}
                        {Array.from({ length: 5 - selectedPool.length }).map((_, i) => (
                            <div key={i} className="w-32 h-44 rounded-xl border border-gray-800 bg-gray-900/30 flex items-center justify-center text-gray-600">
                                Slot {selectedPool.length + i + 1}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-4 p-2">
                        {eligibleCards.map(card => {
                            const isSelected = selectedPool.find(c => c.id === card.id);
                            return (
                                <div key={`pool-${card.id}`} onClick={() => handleSelect(card)} className={isSelected ? 'opacity-20 pointer-events-none' : ''}>
                                    <UnitFrame card={card} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <button
                            disabled={selectedPool.length !== 5}
                            onClick={confirmSelection}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 rounded-lg font-bold transition-colors"
                        >
                            CONFIRM SQUAD
                        </button>
                    </div>
                </div>
            )}

            {/* PHASE 2: REVEAL */}
            {phase === 'REVEAL' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12">
                    <div className="text-4xl font-black italic text-yellow-400 flex items-center gap-4">
                        <Clock size={40} />
                        {timeLeft}s
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="text-red-500 font-bold tracking-widest">ENEMY INTEL</div>
                        <div className="flex gap-4">
                            {enemyPool.map(card => <UnitFrame key={card.id} card={card} isRevealed />)}
                        </div>
                    </div>

                    <div className="w-full border-t border-white/5" />

                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="text-cyan-500 font-bold tracking-widest">YOUR SQUAD</div>
                        <div className="flex gap-4">
                            {selectedPool.map(card => <UnitFrame key={card.id} card={card} isRevealed />)}
                        </div>
                    </div>
                </div>
            )}

            {/* PHASE 3: STRATEGY */}
            {phase === 'STRATEGY' && (
                <div className="flex-1 flex flex-col gap-8">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold">
                            {mode === 'sudden-death' ? 'Select Your Champion' : 'Ordering Phase'}
                        </h2>
                        <div className="text-gray-400 text-sm">
                            {mode === 'sudden-death' ? 'Slot 1 will fight.' : 'Drag to reorder sequence.'}
                        </div>
                    </div>

                    {/* Enemy Hint (Smaller) */}
                    <div className="flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="text-xs text-red-400">ENEMY POOL (REMINDER)</div>
                        <div className="flex gap-2 scale-75 origin-left">
                            {enemyPool.map(card => <UnitFrame key={card.id} card={card} isRevealed />)}
                        </div>
                    </div>

                    {/* Ordering Area */}
                    <div className="flex gap-4 justify-center bg-gray-900 p-8 rounded-2xl border border-cyan-500/30">
                        {orderedDeck.map((card, idx) => (
                            <div key={card.id} className="relative group cursor-pointer">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-cyan-400 font-bold">
                                    {mode === 'sudden-death' && idx === 0 ? 'CHAMPION' : `#${idx + 1}`}
                                </div>
                                <UnitFrame card={card} isRevealed />

                                {idx < 4 && (
                                    <div
                                        onClick={() => moveCard(idx, idx + 1)}
                                        className="absolute top-1/2 -right-6 md:-right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-white text-black z-20 cursor-pointer"
                                    >
                                        <ArrowRight size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-auto">
                        <button
                            onClick={handleBattleStart}
                            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 rounded-lg font-black text-xl italic tracking-tighter shadow-lg shadow-red-900/50"
                        >
                            FIGHT!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreBattleScene;
