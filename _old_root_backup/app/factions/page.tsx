'use client';

import { useState, useEffect } from 'react';
import { AIFaction, FactionSlot } from '@/lib/types';
import { storage, getRemainingMinutes, formatTime, generateId, getRandomRarity, generateRandomStats } from '@/lib/utils';
import aiFactionsData from '@/data/ai-factions.json';
import UiCard from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function FactionsPage() {
    const [factions] = useState<AIFaction[]>(aiFactionsData.factions as any);
    const [slots, setSlots] = useState<FactionSlot[]>([]);
    const [userCoins, setUserCoins] = useState(1000);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const savedSlots = storage.get<FactionSlot[]>('factionSlots', []);
        const savedCoins = storage.get<number>('userCoins', 1000);

        if (savedSlots.length === 0) {
            const initialSlots: FactionSlot[] = [
                {
                    id: generateId(),
                    userId: 'user-001',
                    slotNumber: 1,
                    aiFactionId: 'gemini',
                    lastGeneration: new Date(),
                    nextGeneration: new Date(Date.now() + 30 * 60 * 1000),
                },
                ...Array.from({ length: 4 }, (_, i) => ({
                    id: generateId(),
                    userId: 'user-001',
                    slotNumber: i + 2,
                    aiFactionId: null,
                    lastGeneration: null,
                    nextGeneration: null,
                })),
            ];
            setSlots(initialSlots);
            storage.set('factionSlots', initialSlots);
        } else {
            const parsedSlots = savedSlots.map(slot => ({
                ...slot,
                lastGeneration: slot.lastGeneration ? new Date(slot.lastGeneration) : null,
                nextGeneration: slot.nextGeneration ? new Date(slot.nextGeneration) : null,
            }));
            setSlots(parsedSlots);
        }

        setUserCoins(savedCoins);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (slots.length > 0) {
            storage.set('factionSlots', slots);
        }
    }, [slots]);

    useEffect(() => {
        storage.set('userCoins', userCoins);
    }, [userCoins]);

    const recruitFaction = (factionId: string) => {
        const faction = factions.find(f => f.id === factionId);
        if (!faction) return;

        if (userCoins < faction.unlockCost) {
            alert('데이터 코인이 부족합니다!');
            return;
        }

        const emptySlot = slots.find(s => s.aiFactionId === null);
        if (!emptySlot) {
            alert('빈 슬롯이 없습니다!');
            return;
        }

        setUserCoins(prev => prev - faction.unlockCost);

        const updatedSlots = slots.map(slot => {
            if (slot.id === emptySlot.id) {
                return {
                    ...slot,
                    aiFactionId: factionId,
                    lastGeneration: new Date(),
                    nextGeneration: new Date(Date.now() + faction.generationInterval * 60 * 1000),
                };
            }
            return slot;
        });

        setSlots(updatedSlots);
    };

    const claimUnit = (slotId: string) => {
        const slot = slots.find(s => s.id === slotId);
        if (!slot || !slot.aiFactionId || !slot.nextGeneration) return;

        const remaining = getRemainingMinutes(slot.nextGeneration);
        if (remaining > 0) {
            alert('아직 생성이 완료되지 않았습니다!');
            return;
        }

        const faction = factions.find(f => f.id === slot.aiFactionId);
        if (!faction) return;

        const rarity = getRandomRarity(faction.rarityWeights);
        const stats = generateRandomStats(rarity);

        const newCard = {
            id: generateId(),
            templateId: `${faction.id}-${faction.specialty[0]}-${Date.now()}`,
            ownerId: 'user-001',
            level: 1,
            experience: 0,
            stats,
            acquiredAt: new Date(),
            isLocked: false,
        };

        const existingCards = storage.get('userCards', []);
        storage.set('userCards', [...existingCards, newCard]);

        const updatedSlots = slots.map(s => {
            if (s.id === slotId) {
                return {
                    ...s,
                    lastGeneration: new Date(),
                    nextGeneration: new Date(Date.now() + faction.generationInterval * 60 * 1000),
                };
            }
            return s;
        });

        setSlots(updatedSlots);
        alert(`${rarity.toUpperCase()} 등급 유닛을 획득했습니다! (전투력: ${stats.totalPower})`);

        if (typeof window !== 'undefined') {
            import('@/lib/mission-utils').then(({ updateMissionProgress }) => {
                updateMissionProgress('unit_claim', 1);
            });
        }
    };

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8 animate-slide-down">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        🤖 AI 군단 관리
                    </h1>
                    <p className="text-lg text-gray-400">
                        AI 군단을 영입하고 유닛을 생성하세요
                    </p>
                </div>
                <UiCard variant="gradient" className="text-right">
                    <p className="text-sm text-gray-400 mb-1">보유 코인</p>
                    <p className="text-3xl font-bold text-yellow-300">
                        💰 {userCoins.toLocaleString()}
                    </p>
                </UiCard>
            </div>

            {/* 슬롯 섹션 */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white">
                    내 슬롯 (5개)
                </h2>
                <div className="grid grid-cols-5 gap-4">
                    {slots.map((slot, index) => {
                        const faction = slot.aiFactionId ? factions.find(f => f.id === slot.aiFactionId) : null;
                        const remaining = slot.nextGeneration ? getRemainingMinutes(slot.nextGeneration) : 0;
                        const isReady = remaining === 0 && slot.aiFactionId !== null;

                        return (
                            <UiCard
                                key={slot.id}
                                variant={isReady ? 'glow' : 'default'}
                                className={`text-center animate-slide-up delay-${(index + 1) * 100} ${isReady ? 'animate-pulse' : ''}`}
                            >
                                <div className="text-xs text-gray-400 mb-2">
                                    슬롯 {slot.slotNumber}
                                </div>

                                {faction ? (
                                    <>
                                        <div className="text-4xl mb-3">🤖</div>
                                        <h3 className="font-bold mb-2 text-white">
                                            {faction.displayName}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-3">
                                            {faction.specialty.join(', ')}
                                        </p>

                                        {isReady ? (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => claimUnit(slot.id)}
                                                className="w-full"
                                            >
                                                유닛 수령 ✨
                                            </Button>
                                        ) : (
                                            <div className="text-sm">
                                                <p className="text-gray-400 mb-1">다음 생성</p>
                                                <p className="text-2xl font-bold text-blue-400">
                                                    {formatTime(remaining)}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="text-4xl mb-3 opacity-30">⚪</div>
                                        <p className="text-sm text-gray-400">
                                            빈 슬롯
                                        </p>
                                    </>
                                )}
                            </UiCard>
                        );
                    })}
                </div>
            </div>

            {/* 사용 가능한 AI 군단 */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-white">
                    영입 가능한 AI 군단
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {factions.map((faction, index) => {
                        const isOwned = slots.some(s => s.aiFactionId === faction.id);
                        const canAfford = userCoins >= faction.unlockCost;
                        const hasEmptySlot = slots.some(s => s.aiFactionId === null);

                        return (
                            <UiCard
                                key={faction.id}
                                className={`animate-slide-up delay-${(index + 1) * 50} ${isOwned ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl">🤖</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1 text-white">
                                            {faction.displayName}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-2">
                                            {faction.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-gray-400">
                                                전문: {faction.specialty.join(', ')}
                                            </span>
                                            <span className="text-gray-400">
                                                생성 주기: {faction.generationInterval}분
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {isOwned ? (
                                            <div className="text-green-400 font-bold">
                                                ✓ 보유중
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-lg font-bold mb-2 text-yellow-300">
                                                    💰 {faction.unlockCost.toLocaleString()}
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => recruitFaction(faction.id)}
                                                    disabled={!canAfford || !hasEmptySlot}
                                                >
                                                    {!hasEmptySlot ? '슬롯 없음' : !canAfford ? '코인 부족' : '영입하기'}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </UiCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
