'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import RoundPlacementSlot from './RoundPlacementSlot';

interface CardPlacementBoardProps {
    selectedCards: any[];
    onPlacementComplete: (placement: RoundPlacement) => void;
}

export interface RoundPlacement {
    round1: any;
    round2: { main: any; hidden?: any };
    round3: any;
    round4: { main: any; hidden?: any };
    round5: any;
}

export default function CardPlacementBoard({ selectedCards, onPlacementComplete }: CardPlacementBoardProps) {
    const [placement, setPlacement] = useState<{
        round1: any | null;
        round2Main: any | null;
        round2Hidden: any | null;
        round3: any | null;
        round4Main: any | null;
        round4Hidden: any | null;
        round5: any | null;
    }>({
        round1: null,
        round2Main: null,
        round2Hidden: null,
        round3: null,
        round4Main: null,
        round4Hidden: null,
        round5: null,
    });

    const [draggingCard, setDraggingCard] = useState<any | null>(null);

    // Get cards that are still available in the pool
    const getAvailableCards = () => {
        const placedCardIds = new Set([
            placement.round1?.id,
            placement.round2Main?.id,
            placement.round3?.id,
            placement.round4Main?.id,
            placement.round5?.id,
        ].filter(Boolean));

        return selectedCards.filter(card => !placedCardIds.has(card.id));
    };

    // Get cards that can be used as hidden (already placed in main slots)
    const getHiddenEligibleCards = () => {
        return [
            placement.round1,
            placement.round2Main,
            placement.round3,
            placement.round4Main,
            placement.round5,
        ].filter(Boolean);
    };

    const handleDragStart = (card: any) => {
        setDraggingCard(card);
    };

    const handleDragEnd = () => {
        setDraggingCard(null);
    };

    const handleDropMain = (round: string, cardId: string) => {
        const card = selectedCards.find(c => c.id === cardId);
        if (!card) return;

        setPlacement(prev => ({
            ...prev,
            [round]: card,
        }));
    };

    const handleDropHidden = (round: string, cardId: string) => {
        const card = selectedCards.find(c => c.id === cardId);
        if (!card) return;

        // Check if card is already placed in a main slot
        const isPlaced = [
            placement.round1,
            placement.round2Main,
            placement.round3,
            placement.round4Main,
            placement.round5,
        ].some(c => c?.id === card.id);

        if (!isPlaced) {
            alert('히든 카드는 이미 배치된 카드 중에서만 선택할 수 있습니다!');
            return;
        }

        // Check if card is already used as hidden in another round
        const otherHiddenRound = round === 'round2Hidden' ? 'round4Hidden' : 'round2Hidden';
        if (placement[otherHiddenRound as keyof typeof placement]?.id === card.id) {
            alert('이 카드는 이미 다른 라운드의 히든 카드로 사용 중입니다!');
            return;
        }

        setPlacement(prev => ({
            ...prev,
            [round]: card,
        }));
    };

    const handleRemove = (round: string) => {
        setPlacement(prev => ({
            ...prev,
            [round]: null,
        }));
    };

    const isPlacementComplete = () => {
        return placement.round1 &&
            placement.round2Main &&
            placement.round3 &&
            placement.round4Main &&
            placement.round5;
    };

    const handleConfirm = () => {
        if (!isPlacementComplete()) {
            alert('모든 라운드에 카드를 배치해주세요!');
            return;
        }

        const finalPlacement: RoundPlacement = {
            round1: placement.round1!,
            round2: {
                main: placement.round2Main!,
                hidden: placement.round2Hidden || undefined,
            },
            round3: placement.round3!,
            round4: {
                main: placement.round4Main!,
                hidden: placement.round4Hidden || undefined,
            },
            round5: placement.round5!,
        };

        onPlacementComplete(finalPlacement);
    };

    const getCardImage = (card: any) => {
        const { getCardCharacterImage } = require('@/lib/card-images');
        return getCardCharacterImage(card.templateId, card.name, card.rarity) || '/assets/cards/default-card.png';
    };

    const availableCards = getAvailableCards();

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            {/* Title */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">라운드별 카드 배치</h2>
                <p className="text-sm text-white/60">
                    카드를 드래그하여 각 라운드에 배치하세요. 2, 4라운드는 히든 카드를 추가할 수 있습니다.
                </p>
            </div>

            {/* Round Slots */}
            <div className="flex justify-center gap-4">
                <RoundPlacementSlot
                    roundNumber={1}
                    hasHidden={false}
                    mainCard={placement.round1}
                    hiddenCard={null}
                    onDropMain={(cardId) => handleDropMain('round1', cardId)}
                    onDropHidden={() => { }}
                    onRemoveMain={() => handleRemove('round1')}
                    onRemoveHidden={() => { }}
                />
                <RoundPlacementSlot
                    roundNumber={2}
                    hasHidden={true}
                    mainCard={placement.round2Main}
                    hiddenCard={placement.round2Hidden}
                    onDropMain={(cardId) => handleDropMain('round2Main', cardId)}
                    onDropHidden={(cardId) => handleDropHidden('round2Hidden', cardId)}
                    onRemoveMain={() => handleRemove('round2Main')}
                    onRemoveHidden={() => handleRemove('round2Hidden')}
                />
                <RoundPlacementSlot
                    roundNumber={3}
                    hasHidden={false}
                    mainCard={placement.round3}
                    hiddenCard={null}
                    onDropMain={(cardId) => handleDropMain('round3', cardId)}
                    onDropHidden={() => { }}
                    onRemoveMain={() => handleRemove('round3')}
                    onRemoveHidden={() => { }}
                />
                <RoundPlacementSlot
                    roundNumber={4}
                    hasHidden={true}
                    mainCard={placement.round4Main}
                    hiddenCard={placement.round4Hidden}
                    onDropMain={(cardId) => handleDropMain('round4Main', cardId)}
                    onDropHidden={(cardId) => handleDropHidden('round4Hidden', cardId)}
                    onRemoveMain={() => handleRemove('round4Main')}
                    onRemoveHidden={() => handleRemove('round4Hidden')}
                />
                <RoundPlacementSlot
                    roundNumber={5}
                    hasHidden={false}
                    mainCard={placement.round5}
                    hiddenCard={null}
                    onDropMain={(cardId) => handleDropMain('round5', cardId)}
                    onDropHidden={() => { }}
                    onRemoveMain={() => handleRemove('round5')}
                    onRemoveHidden={() => { }}
                />
            </div>

            {/* Card Pool */}
            <div className="space-y-3">
                <div className="text-center text-sm font-bold text-white/80">
                    선택한 카드 ({availableCards.length}/5)
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                    {availableCards.map((card) => (
                        <motion.div
                            key={card.id}
                            draggable
                            onDragStart={(e: any) => {
                                e.dataTransfer.setData('cardId', card.id);
                                handleDragStart(card);
                            }}
                            onDragEnd={handleDragEnd}
                            whileHover={{ scale: 1.05 }}
                            className={cn(
                                "relative w-24 h-32 rounded-xl border-2 border-white/30 overflow-hidden cursor-grab active:cursor-grabbing",
                                "hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                            )}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${getCardImage(card)})`,
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
                                const info = rarityInfo[card.rarity || 'common'] || rarityInfo.common;
                                return (
                                    <div className={`absolute top-0.5 left-0.5 px-1 py-0.5 rounded text-[7px] font-black text-white shadow-lg z-10 ${info.bg}`}>
                                        {info.text}
                                    </div>
                                );
                            })()}

                            {/* Type Icon */}
                            {(() => {
                                const type = card.type;
                                if (type === 'rock') return <div className="absolute top-0.5 right-0.5 px-0.5 py-0.5 rounded bg-red-500/80 text-xs shadow-lg z-10">✊</div>;
                                if (type === 'paper') return <div className="absolute top-0.5 right-0.5 px-0.5 py-0.5 rounded bg-blue-500/80 text-xs shadow-lg z-10">✋</div>;
                                if (type === 'scissors') return <div className="absolute top-0.5 right-0.5 px-0.5 py-0.5 rounded bg-green-500/80 text-xs shadow-lg z-10">✌️</div>;
                                return null;
                            })()}

                            {/* Level Badge */}
                            <div className="absolute bottom-6 right-0.5 z-10">
                                <div className="px-1 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-[7px] font-black text-white shadow-lg">
                                    LV.{card.level || 1}
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 text-center bg-black/70 py-0.5">
                                <div className="text-[9px] font-bold text-white truncate px-1">
                                    {card.name}
                                </div>
                                <div className="text-[8px] text-cyan-400">⚡{Math.floor(card.stats?.totalPower || 0)}</div>
                            </div>
                        </motion.div>
                    ))}
                    {availableCards.length === 0 && (
                        <div className="text-white/40 text-sm py-8">
                            모든 카드가 배치되었습니다
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleConfirm}
                    disabled={!isPlacementComplete()}
                    className={cn(
                        "px-8 py-3 rounded-xl font-bold text-lg transition-all",
                        isPlacementComplete()
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    )}
                >
                    배치 완료 → 전투 시작
                </button>
            </div>
        </div>
    );
}
