'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import RoundPlacementSlot from './RoundPlacementSlot';
import { BattleMode } from '@/lib/pvp-battle-system';
import { getTypeIcon, getTypeColor } from '@/lib/type-system';
import { RefreshCcw, Wand2, Trash2 } from 'lucide-react';

interface CardPlacementBoardProps {
    selectedCards: any[];
    onPlacementComplete: (placement: RoundPlacement) => void;
    battleMode?: BattleMode; // 'sudden-death' 모드 확인용
    opponentDeck?: any[]; // 상대방 덱 정보
}

export interface RoundPlacement {
    round1: { main: any; hidden?: any };
    round2: { main: any; hidden?: any };
    round3: { main: any; hidden?: any };
    round4: { main: any; hidden?: any };
    round5: { main: any; hidden?: any };
}

export default function CardPlacementBoard({ selectedCards, onPlacementComplete, battleMode = 'tactics', opponentDeck = [] }: CardPlacementBoardProps) {
    const hasHiddenSlots = battleMode === 'ambush';

    const [placement, setPlacement] = useState<{
        round1: any | null;
        round1Hidden: any | null; // Added for Double Battle
        round2Main: any | null;
        round2Hidden: any | null;
        round3Main: any | null;
        round3Hidden: any | null;
        round4Main: any | null;
        round4Hidden: any | null;
        round5: any | null;
    }>(() => {
        const initial = {
            round1: null,
            round1Hidden: null, // Added for Double Battle
            round2Main: null,
            round2Hidden: null,
            round3Main: null,
            round3Hidden: null,
            round4Main: null,
            round4Hidden: null,
            round5: null,
        };

        // Ambush 모드: 메인 슬롯 1~5번 자동 배치 (6번째는 히든)
        // Ambush 모드: 초기화 시 빈 상태로 시작 (수동 배치 유도)
        // if (battleMode === 'ambush' && selectedCards.length === 6) { ... }

        return initial;
    });

    const [draggingCard, setDraggingCard] = useState<any | null>(null);

    // Get cards that are still available in the pool
    const getAvailableCards = () => {
        if (battleMode === 'double') {
            const placedCardIds = new Set([
                placement.round1?.id,
                placement.round1Hidden?.id,
                placement.round2Main?.id,
                placement.round2Hidden?.id,
                placement.round3Main?.id,
                placement.round3Hidden?.id,
            ].filter(Boolean));
            return selectedCards.filter(card => !placedCardIds.has(card.id));
        }

        if (hasHiddenSlots) {
            // Ambush 모드: 히든 슬롯에 배치되지 않은 카드만 표시 (메인 슬롯 카드는 재사용 가능)
            const hiddenPlacedIds = new Set([
                placement.round3Hidden?.id
            ].filter(Boolean));
            return selectedCards.filter(card => !hiddenPlacedIds.has(card.id));
        }

        // 일반 모드: 어디든 배치된 카드는 제외
        const placedCardIds = new Set([
            placement.round1?.id,
            placement.round2Main?.id,
            placement.round3Main?.id, // Changed from round3
            placement.round4Main?.id,
            placement.round5?.id,
        ].filter(Boolean));

        return selectedCards.filter(card => !placedCardIds.has(card.id));
    };

    // Get cards that can be used as hidden (already placed in main slots)
    const getHiddenEligibleCards = () => {
        // For Double Battle, any card can be hidden if not already placed in another slot
        if (battleMode === 'double') {
            return selectedCards.filter(card => {
                const p = placement;
                const cardId = card.id;
                if (p.round1?.id === cardId) return true;
                if (p.round1Hidden?.id === cardId) return true;
                if (p.round2Main?.id === cardId) return true;
                if (p.round2Hidden?.id === cardId) return true;
                if (p.round3Main?.id === cardId) return true;
                if (p.round3Hidden?.id === cardId) return true;
                if (p.round4Main?.id === cardId) return true;
                if (p.round4Hidden?.id === cardId) return true;
                if (p.round5?.id === cardId) return true;
                return false;
            });
        }

        // For Ambush, only cards already in main slots can be hidden
        return [
            placement.round1,
            placement.round2Main,
            placement.round3Main, // Changed from round3
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

    const handleDropMain = (round: string, cardId: string, sourceSlot?: string) => {
        // Ambush 모드에서는 메인 슬롯 변경 불가
        if (hasHiddenSlots && !round.includes('Hidden')) return;

        // Swap logic
        if (sourceSlot) {
            handleSwap(sourceSlot, round);
            return;
        }

        // Standard drop (from pool)
        const card = selectedCards.find(c => c.id === cardId);
        if (!card) return;

        setPlacement(prev => ({
            ...prev,
            [round]: card,
        }));
    };

    const handleDropHidden = (round: string, cardId: string, sourceSlot?: string) => {
        if (!hasHiddenSlots && battleMode !== 'double') return;

        // Swap logic
        if (sourceSlot) {
            handleSwap(sourceSlot, round);
            return;
        }

        const card = selectedCards.find(c => c.id === cardId);
        if (!card) return;

        // Check if card is already used as hidden in another round (for Ambush)
        if (battleMode === 'ambush') {
            const otherHiddenRound = round === 'round3Hidden' ? null : 'round3Hidden'; // Only one hidden slot in Ambush
            if (otherHiddenRound && placement[otherHiddenRound as keyof typeof placement]?.id === card.id) {
                alert('이 카드는 이미 다른 라운드의 히든 카드로 사용 중입니다!');
                return;
            }
        }

        // Check for Double Battle: card cannot be in any other slot (main or hidden)
        if (battleMode === 'double') {
            const isCardAlreadyPlaced = Object.entries(placement).some(([key, value]) =>
                value && value.id === card.id && key !== round
            );
            if (isCardAlreadyPlaced) {
                alert('이 카드는 이미 다른 슬롯에 배치되었습니다!');
                return;
            }
        }

        setPlacement(prev => ({
            ...prev,
            [round]: card,
        }));
    };

    // Swap function
    const handleSwap = (sourceSlot: string, targetSlot: string) => {
        // Ambush 모드에서도 스왑 허용 (일반 <-> 히든)
        // if (hasHiddenSlots && (!sourceSlot.includes('Hidden') || !targetSlot.includes('Hidden'))) return;

        if (sourceSlot === targetSlot) return;

        setPlacement(prev => {
            const newPlacement = { ...prev };
            const sourceCard = newPlacement[sourceSlot as keyof typeof placement];
            const targetCard = newPlacement[targetSlot as keyof typeof placement];

            newPlacement[sourceSlot as keyof typeof placement] = targetCard;
            newPlacement[targetSlot as keyof typeof placement] = sourceCard;

            return newPlacement;
        });
    };

    const handleRemove = (round: string) => {
        // Ambush 모드에서도 삭제 허용
        // if (hasHiddenSlots && !round.includes('Hidden')) return;

        setPlacement(prev => ({
            ...prev,
            [round]: null,
        }));
    };

    const handleReset = () => {
        if (battleMode === 'double') {
            setPlacement(prev => ({
                ...prev,
                round1: null,
                round1Hidden: null,
                round2Main: null,
                round2Hidden: null,
                round3Main: null,
                round3Hidden: null,
            }));
        } else if (hasHiddenSlots) {
            // Ambush 모드: 전체 초기화 (수동 배치 지원)
            setPlacement({
                round1: null,
                round1Hidden: null,
                round2Main: null,
                round2Hidden: null,
                round3Main: null,
                round3Hidden: null,
                round4Main: null,
                round4Hidden: null,
                round5: null,
            });
        } else {
            setPlacement({
                round1: null,
                round1Hidden: null, // Reset this too for consistency
                round2Main: null,
                round2Hidden: null,
                round3Main: null, // Changed from round3
                round3Hidden: null,
                round4Main: null,
                round4Hidden: null,
                round5: null,
            });
        }
    };

    const handleAutoFill = () => {
        if (battleMode === 'double') {
            const available = getAvailableCards();
            const emptySlots = [
                'round1', 'round1Hidden',
                'round2Main', 'round2Hidden',
                'round3Main', 'round3Hidden'
            ].filter(slot => !placement[slot as keyof typeof placement]);

            const shuffled = [...available].sort(() => Math.random() - 0.5);

            setPlacement(prev => {
                const next = { ...prev };
                emptySlots.forEach((slot, i) => {
                    if (shuffled[i]) {
                        next[slot as keyof typeof placement] = shuffled[i];
                    }
                });
                return next;
            });
            return;
        }

        // Ambush 모드: 히든 슬롯만 채우기
        // Ambush 모드: 자동 배치 (최강 카드 -> 히든, 나머지 랜덤)
        if (hasHiddenSlots) {
            // 전체 재배치 로직으로 변경 (기존 배치 무시)
            const allCards = [...selectedCards];

            // 1. Find Strongest Card (Total Power)
            const strongest = allCards.reduce((prev, current) => {
                return (prev.stats?.totalPower || 0) > (current.stats?.totalPower || 0) ? prev : current;
            });

            // 2. Others
            const others = allCards.filter(c => c.id !== strongest.id).sort(() => Math.random() - 0.5);

            setPlacement({
                round1: others[0],
                round1Hidden: null,
                round2Main: others[1],
                round2Hidden: null,
                round3Main: others[2],
                round3Hidden: strongest, // Strongest to Hidden
                round4Main: others[3],
                round4Hidden: null,
                round5: others[4],
            });
            return;
        }

        const available = getAvailableCards();
        if (available.length === 0) return;

        const emptySlots = [
            'round1', 'round2Main', 'round3Main', 'round4Main', 'round5' // Changed from round3
        ].filter(slot => !placement[slot as keyof typeof placement]);

        const shuffled = [...available].sort(() => Math.random() - 0.5);

        setPlacement(prev => {
            const next = { ...prev };
            emptySlots.forEach((slot, i) => {
                if (shuffled[i]) {
                    next[slot as keyof typeof placement] = shuffled[i];
                }
            });
            return next;
        });
    };

    // 클릭으로 자동 배치 (첫 번째 빈 슬롯에 배치)
    const handleAutoPlace = (card: any) => {
        if (battleMode === 'double') {
            if (!placement.round1) handleDropMain('round1', card.id);
            else if (!placement.round1Hidden) handleDropHidden('round1Hidden', card.id);
            else if (!placement.round2Main) handleDropMain('round2Main', card.id);
            else if (!placement.round2Hidden) handleDropHidden('round2Hidden', card.id);
            else if (!placement.round3Main) handleDropMain('round3Main', card.id);
            else if (!placement.round3Hidden) handleDropHidden('round3Hidden', card.id);
            return;
        }

        if (hasHiddenSlots) {
            // Ambush: R1 -> R5 -> Hidden 순서 배치
            if (!placement.round1) handleDropMain('round1', card.id);
            else if (!placement.round2Main) handleDropMain('round2Main', card.id);
            else if (!placement.round3Main) handleDropMain('round3Main', card.id);
            else if (!placement.round4Main) handleDropMain('round4Main', card.id);
            else if (!placement.round5) handleDropMain('round5', card.id);
            else if (!placement.round3Hidden) handleDropHidden('round3Hidden', card.id);
            return;
        }

        if (!placement.round1) handleDropMain('round1', card.id);
        else if (!placement.round2Main) handleDropMain('round2Main', card.id);
        else if (!placement.round3Main) handleDropMain('round3Main', card.id); // Changed from round3
        else if (!placement.round4Main) handleDropMain('round4Main', card.id);
        else if (!placement.round5) handleDropMain('round5', card.id);
    };

    const isPlacementComplete = () => {
        // Double Battle: 3 Rounds x 2 Cards = 6 Total
        if (battleMode === 'double') {
            return placement.round1 && placement.round1Hidden &&
                placement.round2Main && placement.round2Hidden &&
                placement.round3Main && placement.round3Hidden;
        }

        // Standard / Ambush Base: 5 Main Cards
        const basicCheck = placement.round1 &&
            placement.round2Main &&
            placement.round3Main &&
            placement.round4Main &&
            placement.round5;

        if (!basicCheck) return false;

        // Ambush: R3 Hidden
        if (battleMode === 'ambush') {
            return placement.round3Hidden;
        }

        return true;
    };

    const handleConfirm = () => {
        if (!isPlacementComplete()) {
            alert('모든 라운드에 카드를 배치해주세요!');
            return;
        }

        const finalPlacement: RoundPlacement = {
            round1: {
                main: placement.round1!,
                hidden: placement.round1Hidden || undefined,
            },
            round2: {
                main: placement.round2Main!,
                hidden: placement.round2Hidden || undefined,
            },
            round3: {
                main: placement.round3Main!,
                hidden: placement.round3Hidden || undefined,
            },
            round4: {
                main: placement.round4Main!,
                hidden: placement.round4Hidden || undefined,
            },
            round5: {
                main: placement.round5!,
                hidden: undefined, // Round 5 never has hidden
            },
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
                    카드를 드래그하거나 클릭하여 순서대로 배치하세요.
                    {battleMode === 'ambush' && " 3라운드는 히든 카드(매복)를 추가할 수 있습니다."}
                    {battleMode === 'double' && " 각 라운드에 2장의 카드를 배치하세요."}
                </p>
            </div>

            {/* Opponent Deck Preview (if available) */}
            {
                opponentDeck && opponentDeck.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">😈</span>
                                <h3 className="font-bold text-red-400">상대방 덱 정보</h3>
                            </div>
                            <div className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded">
                                ⚠️ 상대방의 카드 배치 순서는 변경될 수 있습니다
                            </div>
                        </div>
                        <div className="flex justify-center gap-3">
                            {opponentDeck.map((card, idx) => (
                                <div key={idx} className="relative w-20 h-28 rounded-lg border-2 border-red-500/30 overflow-hidden shadow-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${getCardImage(card)})`,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-transparent to-transparent" />

                                    {/* Type Icon - Top Right Corner inside image */}
                                    {card.type && (
                                        <div
                                            className="absolute top-1 right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-lg shadow-xl z-20"
                                            style={{ backgroundColor: getTypeColor(card.type) }}
                                        >
                                            {getTypeIcon(card.type)}
                                        </div>
                                    )}

                                    {/* Power */}
                                    <div className="absolute bottom-0 left-0 right-0 text-center bg-black/70 py-0.5">
                                        <div className="text-[8px] font-bold text-white truncate px-1">{card.name}</div>
                                        <div className="text-[8px] text-red-400">⚡{Math.floor(card.stats?.totalPower || 0)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Round Slots - Dynamic Layout */}
            <div className="flex justify-center gap-4 flex-wrap">
                {/* Round 1 */}
                <RoundPlacementSlot
                    roundNumber={1}
                    hasHidden={battleMode === 'double'}
                    mainCard={placement.round1}
                    hiddenCard={placement.round1Hidden}
                    mainSlotId="round1"
                    hiddenSlotId="round1Hidden"
                    onDropMain={(cardId, sourceSlot) => handleDropMain('round1', cardId, sourceSlot)}
                    onDropHidden={(cardId, sourceSlot) => handleDropHidden('round1Hidden', cardId, sourceSlot)}
                    onRemoveMain={() => handleRemove('round1')}
                    onRemoveHidden={() => handleRemove('round1Hidden')}
                />

                {/* Round 2 */}
                <RoundPlacementSlot
                    roundNumber={2}
                    hasHidden={battleMode === 'double'} // Ambush no longer has hidden here
                    mainCard={placement.round2Main}
                    hiddenCard={placement.round2Hidden}
                    mainSlotId="round2Main"
                    hiddenSlotId="round2Hidden"
                    onDropMain={(cardId, sourceSlot) => handleDropMain('round2Main', cardId, sourceSlot)}
                    onDropHidden={(cardId, sourceSlot) => handleDropHidden('round2Hidden', cardId, sourceSlot)}
                    onRemoveMain={() => handleRemove('round2Main')}
                    onRemoveHidden={() => handleRemove('round2Hidden')}
                />

                {/* Round 3 - Ambush & Double have hidden here */}
                <RoundPlacementSlot
                    roundNumber={3}
                    hasHidden={battleMode === 'ambush' || battleMode === 'double'}
                    mainCard={placement.round3Main}
                    hiddenCard={placement.round3Hidden}
                    mainSlotId="round3Main"
                    hiddenSlotId="round3Hidden"
                    onDropMain={(cardId, sourceSlot) => handleDropMain('round3Main', cardId, sourceSlot)}
                    onDropHidden={(cardId, sourceSlot) => handleDropHidden('round3Hidden', cardId, sourceSlot)}
                    onRemoveMain={() => handleRemove('round3Main')}
                    onRemoveHidden={() => handleRemove('round3Hidden')}
                />

                {/* Round 4 & 5 (Not for Double) */}
                {battleMode !== 'double' && (
                    <>
                        <RoundPlacementSlot
                            roundNumber={4}
                            hasHidden={false} // Ambush removed hidden here
                            mainCard={placement.round4Main}
                            hiddenCard={null}
                            mainSlotId="round4Main"
                            onDropMain={(cardId, sourceSlot) => handleDropMain('round4Main', cardId, sourceSlot)}
                            onDropHidden={() => { }}
                            onRemoveMain={() => handleRemove('round4Main')}
                            onRemoveHidden={() => { }}
                        />
                        <RoundPlacementSlot
                            roundNumber={5}
                            hasHidden={false}
                            mainCard={placement.round5}
                            hiddenCard={null}
                            mainSlotId="round5"
                            onDropMain={(cardId, sourceSlot) => handleDropMain('round5', cardId, sourceSlot)}
                            onDropHidden={() => { }}
                            onRemoveMain={() => handleRemove('round5')}
                            onRemoveHidden={() => { }}
                        />
                    </>
                )}
            </div>



            {/* Quick Actions */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors border border-red-500/30 text-sm"
                >
                    <Trash2 size={16} />
                    초기화
                </button>
                <button
                    onClick={handleAutoFill}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg transition-colors border border-cyan-500/30 text-sm"
                >
                    <Wand2 size={16} />
                    자동 배치
                </button>
            </div>

            {/* Card Pool */}
            <div className="space-y-3">
                <div className="text-center text-sm font-bold text-white/80">
                    선택한 카드 ({availableCards.length}/{battleMode === 'double' ? 6 : 5})
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
                            onClick={() => handleAutoPlace(card)} // 클릭 시 자동 배치
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "relative w-24 h-32 rounded-xl border-2 border-white/30 overflow-hidden cursor-pointer", // cursor-pointer로 변경
                                "hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 transition-all",
                                "active:scale-95"
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
                                    commander: { text: '군단장', bg: 'bg-gradient-to-r from-purple-600 to-pink-600' },
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

                            {/* Type Icon - Top Right Corner inside image (Consistent with opponent deck) */}
                            {card.type && (
                                <div
                                    className="absolute top-1 right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-lg shadow-xl z-20"
                                    style={{ backgroundColor: getTypeColor(card.type) }}
                                >
                                    {getTypeIcon(card.type)}
                                </div>
                            )}

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
                        <div className="text-white/40 text-sm py-2">
                            모든 카드가 배치되었습니다
                        </div>
                    )}
                </div>

                {/* 힌트 메시지 */}
                <div className="text-center text-xs text-white/40 mt-2">
                    카드를 클릭하면 빈 슬롯에 순서대로 배치됩니다.
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
                    {isPlacementComplete()
                        ? "배치 완료 → 전투 시작"
                        : hasHiddenSlots
                            ? "히든 카드를 배치하세요"
                            : "모든 카드를 배치하세요"
                    }
                </button>
            </div>
        </div >
    );
}
