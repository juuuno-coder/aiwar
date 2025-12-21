'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useFooter } from '@/context/FooterContext';
import { Button } from '@/components/ui/custom/Button';
import { ArrowLeft, Menu, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';
import { getCardCharacterImage } from '@/lib/card-images';
import { useState } from 'react';
import CardDetailModal from './CardDetailModal';
import { Card as CardType } from '@/lib/types';

const RARITY_COLORS: Record<string, { border: string; bg: string; glow: string }> = {
    common: { border: 'border-gray-500/50', bg: 'bg-gray-900/60', glow: '' },
    rare: { border: 'border-blue-500/60', bg: 'bg-blue-900/40', glow: 'shadow-blue-500/30' },
    epic: { border: 'border-purple-500/60', bg: 'bg-purple-900/40', glow: 'shadow-purple-500/30' },
    legendary: { border: 'border-yellow-500/70', bg: 'bg-yellow-900/40', glow: 'shadow-yellow-500/40' },
    unique: { border: 'border-pink-500/70', bg: 'bg-pink-900/40', glow: 'shadow-pink-500/40' },
};

export default function DynamicFooter() {
    const { state, removeFromDeck, removeFromSelection, reorderSelection, showDeckSlots, hideDeckSlots } = useFooter();
    const router = useRouter();
    const pathname = usePathname();
    const isLobby = pathname === '/';
    const [selectedDetailCard, setSelectedDetailCard] = useState<CardType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 경로에 따른 덱 슬롯 표시 제어
    useEffect(() => {
        if (isLobby) {
            hideDeckSlots();
        } else {
            // 스토리 페이지 등 특수 예외가 필요하면 여기서 추가 분기
            showDeckSlots();
        }
    }, [isLobby, pathname]);

    if (!state.visible) return null;

    const handleLeftNavClick = () => {
        if (state.leftNav?.onClick) {
            state.leftNav.onClick();
        } else if (state.leftNav?.type === 'back') {
            router.back();
        }
    };

    // 선택 모드 여부
    const isSelectionMode = state.mode === 'selection';

    // 현재 슬롯과 최대 슬롯
    const currentSlots = isSelectionMode ? state.selectionSlots : state.deck;
    const maxSlots = isSelectionMode ? state.maxSelectionSlots : state.maxDeckSize;
    const slotLabel = isSelectionMode ? state.selectionLabel : 'DECK';

    // 슬롯 제거 핸들러
    const handleRemoveCard = (cardId: string) => {
        if (isSelectionMode) {
            removeFromSelection(cardId);
        } else {
            removeFromDeck(cardId);
        }
    };

    // 슬롯을 보여줄지 여부
    const showSlots = isSelectionMode || state.showDeckSlots;

    const handleCardClick = (card: CardType) => {
        if (isSelectionMode) {
            handleRemoveCard(card.id);
        } else {
            setSelectedDetailCard(card);
            setIsModalOpen(true);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50"
            >
                {/* 캐릭터 오버레이 (z-60으로 푸터 위에 표시) */}
                <AnimatePresence>
                    {state.characterOverlay && (
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            className={cn(
                                "absolute -top-48 z-60 pointer-events-none",
                                state.characterOverlay.position === 'left' ? "left-4 sm:left-8" : "right-4 sm:right-8"
                            )}
                        >
                            {/* 캐릭터 이미지 */}
                            <div className="relative w-32 h-40 sm:w-40 sm:h-52">
                                <Image
                                    src={state.characterOverlay.characterImage}
                                    alt={state.characterOverlay.name || 'Character'}
                                    fill
                                    className={cn(
                                        "object-contain object-bottom drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                                        state.characterOverlay.emotion === 'happy' && "animate-bounce-slow",
                                        state.characterOverlay.emotion === 'surprised' && "animate-pulse"
                                    )}
                                    sizes="160px"
                                />
                            </div>

                            {/* 대사 말풍선 */}
                            {state.characterOverlay.dialogue && (
                                <motion.div
                                    initial={{ opacity: 0, x: state.characterOverlay.position === 'left' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={cn(
                                        "absolute top-0 max-w-[200px] sm:max-w-[280px] p-3 rounded-2xl bg-white/95 text-black shadow-xl backdrop-blur-sm",
                                        state.characterOverlay.position === 'left'
                                            ? "left-full ml-3 rounded-bl-sm"
                                            : "right-full mr-3 rounded-br-sm"
                                    )}
                                >
                                    {/* 캐릭터 이름 */}
                                    {state.characterOverlay.name && (
                                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-wider mb-1">
                                            {state.characterOverlay.name}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium leading-relaxed">
                                        {state.characterOverlay.dialogue}
                                    </p>

                                    {/* 말풍선 꼬리 */}
                                    <div className={cn(
                                        "absolute bottom-4 w-3 h-3 bg-white/95 rotate-45",
                                        state.characterOverlay.position === 'left' ? "-left-1.5" : "-right-1.5"
                                    )} />
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 배경 - 더 강한 블러와 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/98 to-transparent pointer-events-none" />
                <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />

                <div className={cn(
                    "relative px-4 pb-5",
                    isSelectionMode ? "pt-10" : "pt-6" // 상단 여유 공간 확보 (제목 등)
                )}>
                    {/* 상단 제목 (상태 제어창) */}
                    {isSelectionMode && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-50">
                            <div className="h-[1px] w-8 bg-cyan-500" />
                            <span className="text-[10px] font-black orbitron uppercase tracking-[0.3em] text-cyan-400">
                                Status Control Window
                            </span>
                            <div className="h-[1px] w-8 bg-cyan-500" />
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                        {/* 왼쪽: 네비게이션 + 정보 */}
                        <div className="flex items-center gap-3 min-w-[100px]">
                            {state.leftNav && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={handleLeftNavClick}
                                    className="text-white/60 hover:text-white"
                                >
                                    {state.leftNav.type === 'back' && <ArrowLeft size={18} />}
                                    {state.leftNav.type === 'menu' && <Menu size={18} />}
                                    {state.leftNav.label && (
                                        <span className="ml-1 text-xs">{state.leftNav.label}</span>
                                    )}
                                </Button>
                            )}

                            {/* 추가 정보 표시 */}
                            {state.info && state.info.length > 0 && (
                                <div className="hidden sm:flex items-center gap-3 text-xs">
                                    {state.info.map((item, idx) => (
                                        <div key={idx} className="text-white/60">
                                            <span>{item.label}: </span>
                                            <span className={cn("font-bold", item.color || "text-white")}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 가운데: 슬롯 영역 */}
                        {showSlots && (
                            <div className="flex items-center gap-4">
                                {/* 슬롯 카드들 */}
                                {isSelectionMode ? (
                                    <Reorder.Group
                                        axis="x"
                                        values={state.selectionSlots}
                                        onReorder={reorderSelection}
                                        className="flex items-center gap-2"
                                    >
                                        {state.selectionSlots.map((card, slotIndex) => {
                                            const rarity = card?.rarity || 'common';
                                            const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
                                            const characterImage = getCardCharacterImage(card.templateId, card.name, rarity as any);
                                            const isTargetSlot = slotIndex === 0;

                                            return (
                                                <Reorder.Item
                                                    key={card.id}
                                                    value={card}
                                                    className={cn(
                                                        "relative rounded-xl border-2 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing transition-all group",
                                                        isTargetSlot
                                                            ? "w-20 h-28 border-cyan-400 bg-cyan-900/40 shadow-cyan-500/40 shadow-xl ring-2 ring-cyan-400/50" // 대상 카드 - 더 큼
                                                            : "w-14 h-20 border-orange-500/60 bg-orange-900/30 shadow-orange-500/30 shadow-md" // 재료 카드
                                                    )}
                                                    whileHover={{ scale: 1.1, y: -8, zIndex: 10 }}
                                                    whileDrag={{ scale: 1.15, zIndex: 100, rotate: 2 }}
                                                >
                                                    {characterImage ? (
                                                        <Image
                                                            src={characterImage}
                                                            alt={card.name || 'Card'}
                                                            fill
                                                            className="object-cover object-top"
                                                            sizes={isTargetSlot ? "80px" : "56px"}
                                                        />
                                                    ) : (
                                                        <Sparkles size={20} className="text-white/60" />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                                    {/* 대상/재료 라벨 */}
                                                    <div className={cn(
                                                        "absolute top-0.5 left-0 right-0 text-center",
                                                        isTargetSlot ? "bg-cyan-500/80" : "bg-orange-500/80"
                                                    )}>
                                                        <p className="text-[8px] text-white font-black orbitron">
                                                            {isTargetSlot ? '🎯 대상' : '🔥'}
                                                        </p>
                                                    </div>

                                                    {/* 레벨 표시 */}
                                                    <div className="absolute bottom-1 left-0 right-0 p-0.5 text-center">
                                                        <p className="text-[10px] text-white font-black orbitron">
                                                            Lv.{card.level}
                                                        </p>
                                                    </div>

                                                    {/* 제거 버튼 (호버 시) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFromSelection(card.id);
                                                        }}
                                                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                                    >
                                                        <X size={10} className="text-white" />
                                                    </button>
                                                </Reorder.Item>
                                            );
                                        })}

                                        {/* 빈 슬롯 표시 - 첫 번째인지 여부에 따라 다른 스타일 */}
                                        {Array.from({ length: Math.max(0, maxSlots - state.selectionSlots.length) }).map((_, idx) => {
                                            const isTargetEmpty = state.selectionSlots.length === 0 && idx === 0;
                                            return (
                                                <div
                                                    key={`empty-${idx}`}
                                                    className={cn(
                                                        "rounded-xl border-2 border-dashed flex flex-col items-center justify-center",
                                                        isTargetEmpty
                                                            ? "w-20 h-28 border-cyan-400/50 bg-cyan-500/10"
                                                            : "w-14 h-20 border-orange-400/30 bg-orange-500/5"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-xs font-black orbitron",
                                                        isTargetEmpty ? "text-cyan-400/60" : "text-orange-400/40"
                                                    )}>
                                                        {isTargetEmpty ? '🎯' : '🔥'}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[8px] font-bold",
                                                        isTargetEmpty ? "text-cyan-400/60" : "text-orange-400/40"
                                                    )}>
                                                        {isTargetEmpty ? '대상' : idx + 1}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </Reorder.Group>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: maxSlots }).map((_, index) => {
                                            const card = currentSlots[index];
                                            const rarity = card?.rarity || 'common';
                                            const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
                                            const characterImage = card ? getCardCharacterImage(card.templateId, card.name, rarity as any) : null;

                                            return (
                                                <motion.div
                                                    key={index}
                                                    className={cn(
                                                        "relative rounded-lg border-2 flex items-center justify-center overflow-hidden cursor-pointer transition-all w-12 h-16",
                                                        card
                                                            ? cn(colors.border, colors.bg, colors.glow, "shadow-lg")
                                                            : "border-white/20 bg-white/5 border-dashed"
                                                    )}
                                                    whileHover={card ? { scale: 1.08, y: -4, zIndex: 10 } : {}}
                                                    onClick={() => card && handleCardClick(card)}
                                                >
                                                    {card ? (
                                                        <>
                                                            {characterImage ? (
                                                                <Image
                                                                    src={characterImage}
                                                                    alt={card.name || 'Card'}
                                                                    fill
                                                                    className="object-cover object-top"
                                                                    sizes="48px"
                                                                />
                                                            ) : (
                                                                <Sparkles size={16} className="text-white/60" />
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                                            <div className="absolute bottom-0 left-0 right-0 p-0.5 text-center">
                                                                <p className="text-[8px] text-white font-bold truncate">Lv.{card.level}</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-white/30 text-xs font-bold">{index + 1}</span>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 카운터 */}
                                <div className="text-center min-w-[60px]">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mb-1">{slotLabel}</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className={cn(
                                            "text-lg font-black orbitron",
                                            currentSlots.length === maxSlots ? "text-cyan-400" : "text-white"
                                        )}>
                                            {currentSlots.length}
                                        </span>
                                        <span className="text-white/20 font-bold text-xs">/ {maxSlots}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 오른쪽: 액션 버튼들 */}
                        <div className="min-w-[120px] flex justify-end gap-2">
                            {/* 보조 액션 버튼 (자동강화/자동합성 등) */}
                            {state.secondaryAction && (
                                <Button
                                    variant="ghost"
                                    size="md"
                                    isDisabled={state.secondaryAction.isDisabled}
                                    isLoading={state.secondaryAction.isLoading}
                                    onPress={state.secondaryAction.onClick}
                                    className="font-medium text-white/80 border-white/30"
                                >
                                    {state.secondaryAction.label}
                                </Button>
                            )}

                            {/* 메인 액션 버튼 */}
                            {state.action ? (
                                <motion.div
                                    animate={currentSlots.length === maxSlots ? {
                                        scale: [1, 1.05, 1],
                                        boxShadow: [
                                            "0 0 0px rgba(34,211,238,0)",
                                            "0 0 20px rgba(34,211,238,0.4)",
                                            "0 0 0px rgba(34,211,238,0)"
                                        ]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <Button
                                        color={state.action.color || 'primary'}
                                        size="lg"
                                        isDisabled={state.action.isDisabled}
                                        isLoading={state.action.isLoading}
                                        onPress={state.action.onClick}
                                        className={cn(
                                            "font-black orbitron px-8 transition-all duration-500 uppercase tracking-widest",
                                            currentSlots.length === maxSlots && "bg-cyan-500 hover:bg-cyan-400 text-black border-none ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-black scale-110"
                                        )}
                                    >
                                        {state.action.label}
                                    </Button>
                                </motion.div>
                            ) : (
                                !state.secondaryAction && <div className="w-24" /> // 빈 공간 유지
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 카드 상세 정보 모달 */}
            <CardDetailModal
                card={selectedDetailCard}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </AnimatePresence>
    );
}
