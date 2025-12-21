'use client';

import { useState, useEffect } from 'react';
import {
    getAllFactions,
    getSlots,
    placeFactonInSlot,
    removeFactonFromSlot,
    calculateSynergy,
    canPlaceInSlot,
    getSlotFaction
} from '@/lib/slot-utils';
import { AIFaction } from '@/lib/faction-types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/faction-types';
import { getGameState } from '@/lib/game-state';
import UiCard from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SlotsPage() {
    const [factions, setFactions] = useState<AIFaction[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [synergy, setSynergy] = useState<any>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [userTokens, setUserTokens] = useState(0);
    const [unlockedFactions, setUnlockedFactions] = useState<string[]>([]);
    const [hoveredFaction, setHoveredFaction] = useState<string | null>(null);
    const [placementAnimation, setPlacementAnimation] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allFactions = getAllFactions();
        const currentSlots = getSlots();
        const currentSynergy = calculateSynergy();
        const state = getGameState();

        setFactions(allFactions);
        setSlots(currentSlots);
        setSynergy(currentSynergy);
        setUserTokens(state.tokens);
        setUnlockedFactions(state.unlockedFactions);
    };

    const handleSlotClick = (slotIndex: number) => {
        setSelectedSlot(slotIndex);
    };

    const handleFactionSelect = (factionId: string) => {
        if (selectedSlot === null) {
            alert('먼저 슬롯을 선택해주세요.');
            return;
        }

        const result = placeFactonInSlot(selectedSlot, factionId);

        if (result.success) {
            // Trigger placement animation
            setPlacementAnimation(selectedSlot);
            setTimeout(() => setPlacementAnimation(null), 600);

            loadData();
            setSelectedSlot(null);
        } else {
            alert(result.message);
        }
    };

    const handleRemoveSlot = (slotIndex: number) => {
        const result = removeFactonFromSlot(slotIndex);

        if (result.success) {
            loadData();
        } else {
            alert(result.message);
        }
    };

    const getCategoryColor = (category: string) => {
        return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#888';
    };

    const getCategoryIcon = (category: string) => {
        return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '❓';
    };

    const getCategoryName = (category: string) => {
        return CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category;
    };

    // Calculate total synergy percentage
    const getTotalSynergyBonus = () => {
        if (!synergy) return 0;
        const total = (synergy.timeReduction || 0) + (synergy.powerBonus || 0);
        return Math.round(total * 100);
    };

    // Get filled slots count
    const getFilledSlotsCount = () => {
        return slots.filter(slot => slot !== null).length;
    };

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold text-gradient mb-2">
                    🎰 슬롯 시스템
                </h1>
                <p className="text-lg text-gray-400">
                    AI 군단을 슬롯에 배치하여 최대 +120% 시너지 효과를 얻으세요
                </p>
            </div>

            {/* 상단 정보 */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <UiCard variant="gradient" className="animate-slide-up delay-100">
                    <p className="text-sm text-gray-400 mb-2">보유 토큰</p>
                    <p className="text-3xl font-bold text-yellow-300">💰 {userTokens.toLocaleString()}</p>
                </UiCard>
                <UiCard variant="gradient" className="animate-slide-up delay-150">
                    <p className="text-sm text-gray-400 mb-2">해금된 AI 군단</p>
                    <p className="text-3xl font-bold text-blue-300">{unlockedFactions.length}개</p>
                </UiCard>
                <UiCard variant="gradient" className="animate-slide-up delay-200">
                    <p className="text-sm text-gray-400 mb-2">배치된 슬롯</p>
                    <p className="text-3xl font-bold text-green-300">{getFilledSlotsCount()} / 5</p>
                </UiCard>
                <UiCard variant="gradient" className="animate-slide-up delay-250">
                    <p className="text-sm text-gray-400 mb-2">총 시너지 보너스</p>
                    <p className={`text-3xl font-bold transition-all ${getTotalSynergyBonus() > 0 ? 'text-purple-400 animate-pulse-glow' : 'text-gray-500'}`}>
                        {getTotalSynergyBonus() > 0 ? `+${getTotalSynergyBonus()}%` : '0%'}
                    </p>
                </UiCard>
            </div>

            {/* 슬롯 영역 */}
            <UiCard variant="glow" className="mb-8 animate-slide-up delay-300">
                <h2 className="text-2xl font-bold mb-6">슬롯 배치 (5개)</h2>

                <div className="grid grid-cols-5 gap-4 mb-8">
                    {slots.map((slot, index) => {
                        const slotFaction = getSlotFaction(index);
                        const isSelected = selectedSlot === index;
                        const isAnimating = placementAnimation === index;

                        return (
                            <div
                                key={index}
                                onClick={() => handleSlotClick(index)}
                                className={`relative cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'
                                    } ${isAnimating ? 'animate-bounce-in' : ''}`}
                            >
                                <UiCard
                                    className={`h-48 flex flex-col items-center justify-center transition-all ${slotFaction ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30' : 'bg-gray-800/50'
                                        } ${isAnimating ? 'shadow-lg shadow-purple-500/50' : ''}`}
                                >
                                    {slotFaction ? (
                                        <>
                                            <div
                                                className={`text-4xl mb-2 transition-all ${isAnimating ? 'animate-pulse-glow' : ''}`}
                                                style={{ color: getCategoryColor(slotFaction.category) }}
                                            >
                                                {getCategoryIcon(slotFaction.category)}
                                            </div>
                                            <p className="font-bold text-center mb-1 text-white">{slotFaction.displayName}</p>
                                            <p className="text-xs text-gray-400 text-center mb-2">
                                                {getCategoryName(slotFaction.category)}
                                            </p>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={(e) => {
                                                    e?.stopPropagation();
                                                    handleRemoveSlot(index);
                                                }}
                                            >
                                                제거
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`text-4xl mb-2 transition-all ${isSelected ? 'opacity-100 scale-110' : 'opacity-30'}`}>
                                                {isSelected ? '🎯' : '➕'}
                                            </div>
                                            <p className="text-sm text-gray-400">슬롯 {index + 1}</p>
                                            <p className="text-xs text-gray-500">{isSelected ? '배치할 AI 선택' : '비어있음'}</p>
                                        </>
                                    )}
                                </UiCard>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                        선택됨
                                    </div>
                                )}
                                {slotFaction && !isSelected && (
                                    <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                        ✓
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 시너지 정보 */}
                {synergy && (
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 rounded-lg border-2 border-purple-500/30 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {synergy.synergyTitle || '✨ 시너지 효과'}
                            </h3>
                            {getTotalSynergyBonus() > 0 && (
                                <div className="bg-purple-500/30 px-3 py-1 rounded-full border border-purple-400/50">
                                    <span className="text-purple-300 font-bold">총 +{getTotalSynergyBonus()}%</span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 mb-4">{synergy.description}</p>

                        <div className="grid grid-cols-3 gap-4">
                            {synergy.timeReduction > 0 && (
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-green-500/30 hover:border-green-500/60 transition-all">
                                    <p className="text-sm text-gray-400 mb-2">⏱️ 생성 시간 감소</p>
                                    <p className="text-3xl font-bold text-green-400 mb-2">
                                        {(synergy.timeReduction * 100).toFixed(0)}%
                                    </p>
                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 animate-shimmer"
                                            style={{ width: `${Math.min(synergy.timeReduction * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            {synergy.powerBonus > 0 && (
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-red-500/30 hover:border-red-500/60 transition-all">
                                    <p className="text-sm text-gray-400 mb-2">⚔️ 전투력 보너스</p>
                                    <p className="text-3xl font-bold text-red-400 mb-2">
                                        +{(synergy.powerBonus * 100).toFixed(0)}%
                                    </p>
                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 to-orange-400 animate-shimmer"
                                            style={{ width: `${Math.min(synergy.powerBonus * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            {synergy.fragmentBonus > 0 && (
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500/30 hover:border-yellow-500/60 transition-all">
                                    <p className="text-sm text-gray-400 mb-2">💎 파편 보너스</p>
                                    <p className="text-3xl font-bold text-yellow-400 mb-2">
                                        +{synergy.fragmentBonus}개
                                    </p>
                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 animate-shimmer"
                                            style={{ width: `${Math.min((synergy.fragmentBonus / 10) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </UiCard>

            {/* AI 군단 목록 */}
            <UiCard className="animate-slide-up delay-400">
                <h2 className="text-2xl font-bold mb-6 text-white">
                    AI 군단 목록
                    {selectedSlot !== null && (
                        <span className="text-sm text-blue-400 ml-4">
                            (슬롯 {selectedSlot + 1}에 배치할 AI 군단을 선택하세요)
                        </span>
                    )}
                </h2>

                {/* 카테고리별 그룹 */}
                {['super', 'image', 'video', 'audio', 'coding'].map(category => {
                    const categoryFactions = factions.filter(f => f.category === category);

                    return (
                        <div key={category} className="mb-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span style={{ color: getCategoryColor(category) }}>
                                    {getCategoryIcon(category)}
                                </span>
                                <span className="text-white">{getCategoryName(category)}</span>
                            </h3>

                            <div className="grid grid-cols-4 gap-4">
                                {categoryFactions.map(faction => {
                                    const isUnlocked = unlockedFactions.includes(faction.id);
                                    const canPlaceResult = selectedSlot !== null ? canPlaceInSlot(selectedSlot, faction.id) : { canPlace: true };

                                    return (
                                        <div
                                            key={faction.id}
                                            onMouseEnter={() => setHoveredFaction(faction.id)}
                                            onMouseLeave={() => setHoveredFaction(null)}
                                            className={`transition-all duration-300 ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                                                } ${!canPlaceResult.canPlace && selectedSlot !== null ? 'opacity-30' : ''
                                                } ${hoveredFaction === faction.id && isUnlocked ? 'ring-2 ring-purple-500 rounded-lg' : ''
                                                }`}
                                        >
                                            <UiCard
                                                onClick={() => {
                                                    if (isUnlocked && selectedSlot !== null) {
                                                        handleFactionSelect(faction.id);
                                                    }
                                                }}
                                                className="h-full"
                                            >
                                                <div
                                                    className={`text-3xl mb-2 transition-all ${hoveredFaction === faction.id ? 'scale-110' : ''}`}
                                                    style={{ color: getCategoryColor(faction.category) }}
                                                >
                                                    {getCategoryIcon(faction.category)}
                                                </div>
                                                <p className="font-bold mb-1 text-white">{faction.displayName}</p>
                                                <p className="text-xs text-gray-400 mb-2">
                                                    {faction.description}
                                                </p>

                                                {!isUnlocked ? (
                                                    <div className="text-xs">
                                                        <p className="text-yellow-400">🔒 해금 필요</p>
                                                        <p className="text-gray-400">
                                                            {faction.unlockCost.toLocaleString()} 토큰
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs">
                                                        <p className="text-green-400">✅ 해금됨</p>
                                                        <p className="text-gray-400">
                                                            배치: {faction.slotCost.toLocaleString()} 토큰
                                                        </p>
                                                    </div>
                                                )}

                                                {/* 효과 표시 */}
                                                <div className="mt-2 text-xs text-gray-400 space-y-1">
                                                    {faction.effects.timeReduction > 0 && (
                                                        <p className="flex items-center gap-1">
                                                            <span>⏱️</span>
                                                            <span>시간 {(faction.effects.timeReduction * 100).toFixed(0)}%↓</span>
                                                        </p>
                                                    )}
                                                    {faction.effects.powerBonus > 0 && (
                                                        <p className="flex items-center gap-1">
                                                            <span>⚔️</span>
                                                            <span>전투력 +{(faction.effects.powerBonus * 100).toFixed(0)}%</span>
                                                        </p>
                                                    )}
                                                    {faction.effects.fragmentBonus > 0 && (
                                                        <p className="flex items-center gap-1">
                                                            <span>💎</span>
                                                            <span>파편 +{faction.effects.fragmentBonus}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </UiCard>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </UiCard>
        </div>
    );
}
