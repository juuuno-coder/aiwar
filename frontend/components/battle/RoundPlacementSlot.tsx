'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface RoundPlacementSlotProps {
    roundNumber: number;
    hasHidden: boolean;
    mainCard: any | null;
    hiddenCard: any | null;
    onDropMain: (cardId: string) => void;
    onDropHidden: (cardId: string) => void;
    onRemoveMain: () => void;
    onRemoveHidden: () => void;
    isDraggingOver?: boolean;
}

export default function RoundPlacementSlot({
    roundNumber,
    hasHidden,
    mainCard,
    hiddenCard,
    onDropMain,
    onDropHidden,
    onRemoveMain,
    onRemoveHidden,
}: RoundPlacementSlotProps) {
    const getCardImage = (card: any) => {
        const { getCardCharacterImage } = require('@/lib/card-images');
        return getCardCharacterImage(card.templateId, card.name, card.rarity) || '/assets/cards/default-card.png';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDropMain = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) {
            onDropMain(cardId);
        }
    };

    const handleDropHidden = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) {
            onDropHidden(cardId);
        }
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
                className={cn(
                    "relative w-24 h-32 rounded-xl border-2 transition-all overflow-hidden",
                    mainCard
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/30"
                        : "border-dashed border-white/30 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/5"
                )}
            >
                {mainCard ? (
                    <>
                        {/* Card Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${getCardImage(mainCard)})`,
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Remove Button */}
                        <button
                            onClick={onRemoveMain}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-red-600 z-10"
                        >
                            ×
                        </button>

                        {/* Card Name */}
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                            <div className="text-[10px] font-bold text-white truncate px-1">
                                {mainCard.name}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-2xl">
                        +
                    </div>
                )}
            </div>

            {/* Hidden Card Slot (for R2, R4) */}
            {hasHidden && (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropHidden}
                    className={cn(
                        "relative w-24 h-32 rounded-xl border-2 transition-all overflow-hidden",
                        hiddenCard
                            ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/30"
                            : "border-dashed border-purple-400/40 bg-purple-500/5 hover:border-purple-400 hover:bg-purple-500/10"
                    )}
                >
                    {hiddenCard ? (
                        <>
                            {/* Card Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${getCardImage(hiddenCard)})`,
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent" />

                            {/* Hidden Badge */}
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-600 rounded text-[8px] font-black text-white">
                                🎭 HIDDEN
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={onRemoveHidden}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-red-600 z-10"
                            >
                                ×
                            </button>

                            {/* Card Name */}
                            <div className="absolute bottom-1 left-0 right-0 text-center">
                                <div className="text-[10px] font-bold text-white truncate px-1">
                                    {hiddenCard.name}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400/60 text-xs">
                            <div className="text-2xl mb-1">🎭</div>
                            <div className="text-[10px]">Hidden</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
