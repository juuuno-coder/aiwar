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
                    "relative w-24 h-32 rounded-xl border-2 transition-all overflow-hidden",
                    mainCard
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 cursor-grab active:cursor-grabbing"
                        : "border-dashed border-white/30 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/5"
                )}
            >
                {mainCard ? (
                    <>
                        {/* Card Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center pointer-events-none"
                            style={{
                                backgroundImage: `url(${getCardImage(mainCard)})`,
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        {/* Rarity Badge */}
                        {(() => {
                            const rarityInfo: Record<string, { text: string; bg: string }> = {
                                legendary: { text: '전설', bg: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
                                commander: { text: '사령관', bg: 'bg-gradient-to-r from-purple-600 to-pink-600' },
                                epic: { text: '영웅', bg: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
                                rare: { text: '희귀', bg: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
                                unique: { text: '유니크', bg: 'bg-gradient-to-r from-green-500 to-emerald-500' },
                                common: { text: '일반', bg: 'bg-gradient-to-r from-gray-500 to-slate-500' }
                            };
                            const info = rarityInfo[mainCard.rarity || 'common'] || rarityInfo.common;
                            return (
                                <div className={`absolute top-0.5 left-0.5 px-1 py-0.5 rounded text-[7px] font-black text-white shadow-lg z-10 ${info.bg} pointer-events-none`}>
                                    {info.text}
                                </div>
                            );
                        })()}

                        {/* Type Icon - Large and Prominent */}
                        {mainCard.type && (
                            <div
                                className="absolute top-1 right-8 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-lg shadow-xl z-20 pointer-events-none"
                                style={{ backgroundColor: getTypeColor(mainCard.type) }}
                            >
                                {getTypeIcon(mainCard.type)}
                            </div>
                        )}

                        {/* Level Badge */}
                        <div className="absolute bottom-6 right-0.5 z-10 pointer-events-none">
                            <div className="px-1 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-[7px] font-black text-white shadow-lg">
                                LV.{mainCard.level || 1}
                            </div>
                        </div>

                        {/* Card Name + Power */}
                        <div className="absolute bottom-0 left-0 right-0 text-center bg-black/70 py-0.5 pointer-events-none">
                            <div className="text-[9px] font-bold text-white truncate px-1">
                                {mainCard.name}
                            </div>
                            <div className="text-[8px] text-cyan-400">⚡{Math.floor(mainCard.stats?.totalPower || 0)}</div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-2xl pointer-events-none">
                        +
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
                        "relative w-24 h-32 rounded-xl border-2 transition-all overflow-hidden",
                        hiddenCard
                            ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/30 cursor-grab active:cursor-grabbing"
                            : "border-dashed border-purple-400/40 bg-purple-500/5 hover:border-purple-400 hover:bg-purple-500/10"
                    )}
                >
                    {hiddenCard ? (
                        <>
                            {/* Card Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                                style={{
                                    backgroundImage: `url(${getCardImage(hiddenCard)})`,
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent pointer-events-none" />

                            {/* Hidden Badge */}
                            <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-purple-600 rounded text-[7px] font-black text-white z-10 pointer-events-none">
                                🎭
                            </div>

                            {/* Type Icon - Large and Prominent */}
                            {hiddenCard.type && (
                                <div
                                    className="absolute top-1 right-8 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-lg shadow-xl z-20 pointer-events-none"
                                    style={{ backgroundColor: getTypeColor(hiddenCard.type) }}
                                >
                                    {getTypeIcon(hiddenCard.type)}
                                </div>
                            )}

                            {/* Level Badge */}
                            <div className="absolute bottom-6 right-0.5 z-10 pointer-events-none">
                                <div className="px-1 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-[7px] font-black text-white shadow-lg">
                                    LV.{hiddenCard.level || 1}
                                </div>
                            </div>

                            {/* Card Name + Power */}
                            <div className="absolute bottom-0 left-0 right-0 text-center bg-black/70 py-0.5 pointer-events-none">
                                <div className="text-[9px] font-bold text-white truncate px-1">
                                    {hiddenCard.name}
                                </div>
                                <div className="text-[8px] text-purple-400">⚡{Math.floor(hiddenCard.stats?.totalPower || 0)}</div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400/60 text-xs pointer-events-none">
                            <div className="text-2xl mb-1">🎭</div>
                            <div className="text-[10px]">Hidden</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default React.memo(RoundPlacementSlot);
