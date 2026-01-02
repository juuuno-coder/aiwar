'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import { getTypeIcon, getTypeColor } from '@/lib/type-system';

interface RoundPlacementSlotProps {
    roundNumber: number;
    hasHidden: boolean;
    mainCard: any | null;
    hiddenCard: any | null;
    onDropMain: (cardId: string, sourceSlot?: string) => void;
    onDropHidden: (cardId: string, sourceSlot?: string) => void;
    onRemoveMain: () => void;
    onRemoveHidden: () => void;
    isDraggingOver?: boolean;
}

function RoundPlacementSlot({
    roundNumber,
    hasHidden,
    mainCard,
    hiddenCard,
    onDropMain,
    onDropHidden,
    onRemoveMain,
    onRemoveHidden,
    mainSlotId,
    hiddenSlotId,
}: RoundPlacementSlotProps & { mainSlotId: string; hiddenSlotId?: string }) {
    const getCardImage = (card: any) => {
        const { getCardCharacterImage } = require('@/lib/card-images');
        return getCardCharacterImage(card.templateId, card.name, card.rarity) || '/assets/cards/default-card.png';
    };

    const handleDragStart = (e: React.DragEvent, card: any, slotId: string) => {
        e.dataTransfer.setData('cardId', card.id);
        e.dataTransfer.setData('sourceSlot', slotId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropMain = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const cardId = e.dataTransfer.getData('cardId');
        const sourceSlot = e.dataTransfer.getData('sourceSlot');

        // Pass sourceSlot if available (for swap), otherwise just cardId (from pool)
        // We pass it via a custom event or modified callback if needed, 
        // but current props only take cardId. 
        // We will overload the callback or expect the parent to handle the data transfer if we passed the event?
        // Actually, easiest is to pass the sourceSlot information along with cardId in a structured way 
        // OR rely on the parent updating the onDropMain signature? 
        // Let's stick to the props interface but maybe pass an object? No, existing code calls it with string.
        // Let's assume onDropMain can take a second optional arg, or we change how it's called.
        // Better: The parent's handler `handleDropMain` logic is inside the parent scope. 
        // We can just pass the event data logic up if we change the prop signature, OR 
        // we can attach the source info to the function call if we change the prop type.
        // Let's modify the onDropMain prop type in the interface to accept sourceSlot.

        onDropMain(cardId, sourceSlot);
    };

    const handleDropHidden = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const cardId = e.dataTransfer.getData('cardId');
        const sourceSlot = e.dataTransfer.getData('sourceSlot');
        onDropHidden(cardId, sourceSlot);
    };

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Round Label */}
            <div className="text-sm font-bold text-white/80">
                Round {roundNumber}
                {hasHidden && <span className="text-purple-400 ml-1">🎭</span>}
            </div>

            {/* Main Card Slot */}
            <div
                onDragOver={handleDragOver}
                onDrop={handleDropMain}
                draggable={!!mainCard}
                onDragStart={(e) => mainCard && handleDragStart(e, mainCard, mainSlotId)}
                className={cn(
                    "relative w-28 h-40 rounded-2xl border-2 transition-all overflow-hidden",
                    mainCard
                        ? "border-cyan-500 bg-cyan-900/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-grab active:cursor-grabbing backdrop-blur-md scale-105"
                        : "border-dashed border-white/20 bg-white/2 hover:border-cyan-400 hover:bg-cyan-500/5"
                )}
            >
                {mainCard ? (
                    <>
                        {/* Card Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center pointer-events-none transition-transform hover:scale-110"
                            style={{
                                backgroundImage: `url(${getCardImage(mainCard)})`,
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                        {/* Rarity Badge */}
                        {(() => {
                            const rarityInfo: Record<string, { text: string; bg: string }> = {
                                legendary: { text: '전설', bg: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
                                commander: { text: '군단장', bg: 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
                                epic: { text: '영웅', bg: 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]' },
                                rare: { text: '희귀', bg: 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' },
                                unique: { text: '유니크', bg: 'bg-gradient-to-r from-red-600 to-pink-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' },
                                common: { text: '일반', bg: 'bg-zinc-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]' }
                            };
                            const info = rarityInfo[mainCard.rarity || 'common'] || rarityInfo.common;
                            return (
                                <div className={`absolute top-1.5 left-1.5 px-2 py-1 rounded-full text-[8px] font-black text-white shadow-xl z-20 ${info.bg} border border-white/20 pointer-events-none uppercase tracking-tighter`}>
                                    {info.text}
                                </div>
                            );
                        })()}

                        {/* Type Icon - Large and Prominent */}
                        {mainCard.type && (
                            <div
                                className="absolute top-1 right-1 w-9 h-9 rounded-full border-2 border-white/50 flex items-center justify-center text-xl shadow-2xl z-30 pointer-events-none backdrop-blur-sm"
                                style={{ backgroundColor: getTypeColor(mainCard.type) }}
                            >
                                <span className="drop-shadow-md">{getTypeIcon(mainCard.type)}</span>
                            </div>
                        )}

                        {/* Level Badge */}
                        <div className="absolute bottom-8 right-1.5 z-20 pointer-events-none">
                            <div className="px-2 py-0.5 bg-black/80 rounded border border-white/20 text-[9px] font-black text-white shadow-xl">
                                LV.{mainCard.level || 1}
                            </div>
                        </div>

                        {/* Card Name + Power */}
                        <div className="absolute bottom-0 left-0 right-0 text-center bg-black/80 py-1.5 border-t border-white/10 pointer-events-none backdrop-blur-sm">
                            <div className="text-[10px] font-black text-white truncate px-2 mb-0.5">
                                {mainCard.name}
                            </div>
                            <div className="text-[9px] font-bold text-cyan-400 tracking-widest orbitron">PWR {Math.floor(mainCard.stats?.totalPower || 0)}</div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors pointer-events-none" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 pointer-events-none group-hover:text-cyan-400/20 transition-colors">
                        <div className="text-4xl font-thin mb-1">+</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] font-black">Main Slot</div>
                    </div>
                )}
            </div>

            {/* Hidden Card Slot (for R2, R4) */}
            {hasHidden && hiddenSlotId && (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropHidden}
                    draggable={!!hiddenCard}
                    onDragStart={(e) => hiddenCard && handleDragStart(e, hiddenCard, hiddenSlotId)}
                    className={cn(
                        "relative w-28 h-40 rounded-2xl border-2 transition-all overflow-hidden mt-2",
                        hiddenCard
                            ? "border-purple-500 bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-grab active:cursor-grabbing backdrop-blur-md"
                            : "border-dashed border-purple-400/30 bg-purple-500/5 hover:border-purple-400 hover:bg-purple-500/10"
                    )}
                >
                    {hiddenCard ? (
                        <>
                            {/* Card Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center pointer-events-none group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${getCardImage(hiddenCard)})`,
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-purple-900/40 to-transparent pointer-events-none" />

                            {/* Hidden Badge */}
                            <div className="absolute top-1.5 left-1.5 px-2 py-1 bg-purple-600 rounded-full text-[8px] font-black text-white z-20 shadow-xl border border-white/20 pointer-events-none">
                                🎭
                            </div>

                            {/* Type Icon - Large and Prominent */}
                            {hiddenCard.type && (
                                <div
                                    className="absolute top-1 right-1 w-9 h-9 rounded-full border-2 border-white/50 flex items-center justify-center text-xl shadow-2xl z-30 pointer-events-none backdrop-blur-sm"
                                    style={{ backgroundColor: getTypeColor(hiddenCard.type) }}
                                >
                                    <span className="drop-shadow-md">{getTypeIcon(hiddenCard.type)}</span>
                                </div>
                            )}

                            {/* Level Badge */}
                            <div className="absolute bottom-8 right-1.5 z-20 pointer-events-none">
                                <div className="px-2 py-0.5 bg-black/80 rounded border border-white/20 text-[9px] font-black text-white shadow-xl">
                                    LV.{hiddenCard.level || 1}
                                </div>
                            </div>

                            {/* Card Name + Power */}
                            <div className="absolute bottom-0 left-0 right-0 text-center bg-black/80 py-1.5 border-t border-white/10 pointer-events-none backdrop-blur-sm">
                                <div className="text-[10px] font-black text-white truncate px-2 mb-0.5">
                                    {hiddenCard.name}
                                </div>
                                <div className="text-[9px] font-bold text-purple-400 tracking-widest orbitron">PWR {Math.floor(hiddenCard.stats?.totalPower || 0)}</div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400/20 group-hover:text-purple-400/40 transition-colors pointer-events-none">
                            <div className="text-3xl mb-1">🎭</div>
                            <div className="text-[10px] uppercase tracking-widest font-black">Hidden</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default React.memo(RoundPlacementSlot);
