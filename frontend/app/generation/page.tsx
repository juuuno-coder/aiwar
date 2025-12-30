'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CyberPageLayout from '@/components/CyberPageLayout';
import { AIFaction, Card } from '@/lib/types';
import aiFactionsData from '@/data/ai-factions.json';
import { cn } from '@/lib/utils';
import { useAlert } from '@/context/AlertContext';
import { Clock, AlertTriangle, Plus, X, Zap, Gift, Sparkles, Info } from 'lucide-react';
import { addCardToInventory } from '@/lib/inventory-system';
import {
    getGenerationSlots,
    assignFactionToSlot,
    removeFactionFromSlot,
    checkGenerationStatus,
    generateCard,
    updateAllSlotStatuses,
    getRemainingGenerations
} from '@/lib/generation-utils';
import { getSubscribedFactions, TIER_CONFIG } from '@/lib/faction-subscription-utils';
import CardRewardModal from '@/components/CardRewardModal';
import { COMMANDERS } from '@/data/card-database';
import { createCardFromTemplate } from '@/lib/card-generation-system';
import { loadInventory } from '@/lib/inventory-system';
import { useFirebase } from '@/components/FirebaseProvider';
import GenerationSlot from '@/components/GenerationSlot';

export default function GenerationPage() {
    const router = useRouter();
    const { user } = useFirebase();
    const { showAlert, showConfirm } = useAlert();

    const userId = user?.uid;

    const [factions, setFactions] = useState<AIFaction[]>([]);
    const [slots, setSlots] = useState(getGenerationSlots(userId));
    const [subscriptions, setSubscriptions] = useState(getSubscribedFactions(userId));
    const [selectedSlotForAssignment, setSelectedSlotForAssignment] = useState<number | null>(null);
    const [tick, setTick] = useState(0);

    // Reward Modal State
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [rewardCards, setRewardCards] = useState<Card[]>([]);
    const [rewardModalTitle, setRewardModalTitle] = useState("카드 획득!");

    useEffect(() => {
        try {
            const data = (aiFactionsData as { factions: AIFaction[] })?.factions || [];
            if (Array.isArray(data)) {
                setFactions(data);
            }
        } catch (e) {
            console.error("Data Load Error", e);
        }
        loadData();
    }, [userId]);

    // Optimized polling: Separate the 1s UI "tick" from the expensive data reload
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);

        // Periodically sync heavy state (every 10s or when needed)
        const stateSyncTimer = setInterval(() => {
            updateAllSlotStatuses(userId);
            setSlots(getGenerationSlots(userId));
        }, 10000);

        return () => {
            clearInterval(timer);
            clearInterval(stateSyncTimer);
        };
    }, [userId]);

    const loadData = () => {
        updateAllSlotStatuses(userId);
        setSlots(getGenerationSlots(userId));
        setSubscriptions(getSubscribedFactions(userId));
    };

    const handleAssignFaction = async (slotIndex: number, factionId: string) => {
        const alreadyAssigned = slots.some(s => s.factionId === factionId);
        if (alreadyAssigned) {
            showAlert({ title: '중복 배치 불가', message: '이 군단은 이미 다른 슬롯에 배치되어 있습니다.', type: 'warning' });
            return;
        }

        const result = assignFactionToSlot(slotIndex, factionId, userId);
        if (result.success) {
            showAlert({ title: '배치 완료', message: '군단이 배치되었으며, 카드 생성 타이머가 시작되었습니다.', type: 'success' });
            loadData();
            setSelectedSlotForAssignment(null);

            // Commander Acquisition Logic
            try {
                const commanderTemplate = COMMANDERS.find(c => c.aiFactionId === factionId);
                if (commanderTemplate) {
                    const inventory = await loadInventory();
                    const hasCommander = inventory.some(c => c.templateId === commanderTemplate.id);

                    if (!hasCommander) {
                        const newCommanderCard = createCardFromTemplate(commanderTemplate);
                        await addCardToInventory(newCommanderCard);
                        setRewardCards([newCommanderCard]);
                        setRewardModalTitle("🎖️ COMMANDER ACQUIRED 🎖️");
                        setRewardModalOpen(true);
                    }
                }
            } catch (error) {
                console.error("Failed to process Commander acquisition:", error);
            }
        } else {
            showAlert({ title: '배치 실패', message: result.message, type: 'error' });
        }
    };

    const handleRemoveFaction = useCallback((slotIndex: number) => {
        showConfirm({
            title: '군단 제거',
            message: '이 슬롯에서 군단을 제거하시겠습니까?',
            onConfirm: () => {
                const result = removeFactionFromSlot(slotIndex, userId);
                if (result.success) {
                    showAlert({ title: '제거 완료', message: result.message, type: 'success' });
                    loadData();
                } else {
                    showAlert({ title: '제거 실패', message: result.message, type: 'error' });
                }
            }
        });
    }, [userId, showConfirm, showAlert]);

    const handleReceiveCard = useCallback(async (slotIndex: number) => {
        const result = await generateCard(slotIndex, userId);
        if (result.success && result.card) {
            try {
                await addCardToInventory(result.card);
                setRewardCards([result.card]);
                setRewardModalOpen(true);
                loadData();
            } catch (error) {
                console.error('Failed to save card:', error);
                showAlert({ title: '오류', message: '카드 저장 중 오류가 발생했습니다.', type: 'error' });
            }
        } else {
            showAlert({ title: '생성 실패', message: result.message, type: 'error' });
        }
    }, [userId, showAlert]);

    const handleReceiveAll = async () => {
        const readySlots = slots.filter(slot => {
            if (!slot.factionId) return false;
            const status = checkGenerationStatus(slot.index, userId);
            return status.canGenerate;
        });

        if (readySlots.length === 0) return;

        const receivedCards: Card[] = [];
        let successCount = 0;

        for (const slot of readySlots) {
            const result = await generateCard(slot.index, userId);
            if (result.success && result.card) {
                await addCardToInventory(result.card);
                receivedCards.push(result.card);
                successCount++;
            }
        }

        if (successCount > 0) {
            setRewardCards(receivedCards);
            setRewardModalOpen(true);
            loadData();
        }
    };

    const getRemainingTime = (nextGenAt: Date | string | null): string => {
        if (!nextGenAt) return '--:--';
        const diff = new Date(nextGenAt).getTime() - Date.now();
        if (diff <= 0) return '준비됨!';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const assignedFactionIds = useMemo(() => slots.filter(s => s.factionId).map(s => s.factionId), [slots]);
    const availableFactions = useMemo(() => subscriptions.filter(s => !assignedFactionIds.includes(s.factionId)), [subscriptions, assignedFactionIds]);

    const readyCount = useMemo(() => slots.filter(slot => {
        if (!slot.factionId) return false;
        if (!slot.nextGenerationAt) return false;
        return new Date(slot.nextGenerationAt).getTime() <= Date.now();
    }).length, [slots, tick]);
    const handleSlotReceive = useCallback((index: number) => {
        setRewardModalTitle("카드 획득!");
        handleReceiveCard(index);
    }, [handleReceiveCard]);

    const handleAssign = useCallback((index: number) => {
        setSelectedSlotForAssignment(index);
    }, []);

    return (
        <CyberPageLayout
            title="카드 생성"
            englishTitle="CARD GENERATION"
            description="시간이 되면 자동으로 생성되는 카드를 수령하세요"
            color="green"
        >
            <div className="flex flex-col">
                <div className="mb-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-6 flex-shrink-0">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <h3 className="text-sm text-white/60 mb-1">구독 중인 군단</h3>
                            <p className="text-2xl font-bold text-green-400">{subscriptions.length}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-white/60 mb-1">활성 슬롯</h3>
                            <p className="text-2xl font-bold text-cyan-400">
                                {slots.filter(s => s.factionId).length}/5
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm text-white/60 mb-1">최단 주기</h3>
                            <p className="text-2xl font-bold text-yellow-400">
                                {subscriptions.length > 0 ? Math.min(...subscriptions.map(s => s.generationInterval)) + '분' : '-'}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm text-white/60 mb-1">수령 대기</h3>
                            <p className="text-2xl font-bold text-pink-400">{readyCount}</p>
                        </div>
                    </div>

                    {subscriptions.length === 0 && (
                        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-yellow-400">
                                구독 중인 군단이 없습니다. <button onClick={() => router.push('/factions')} className="underline font-bold">군단 구독하러 가기</button>
                            </p>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap className="text-green-400" size={20} />
                            생성 슬롯 (5개)
                        </h2>
                        {readyCount > 0 && (
                            <button
                                onClick={handleReceiveAll}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all flex items-center gap-2 animate-pulse shadow-lg shadow-pink-500/30"
                            >
                                <Gift size={16} />
                                모두 받기 ({readyCount})
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {slots.map((slot) => {
                            const subscription = subscriptions.find(s => s.factionId === slot.factionId);
                            const status = checkGenerationStatus(slot.index, userId);
                            const canGenerate = status.canGenerate;
                            const remainingTime = getRemainingTime(slot.nextGenerationAt);
                            const remaining = slot.factionId ? getRemainingGenerations(slot.factionId, userId) : 0;
                            const faction = factions.find(f => f.id === slot.factionId);

                            return (
                                <GenerationSlot
                                    key={slot.index}
                                    slot={slot}
                                    subscription={subscription}
                                    factionName={faction?.displayName || slot.factionId || ''}
                                    canGenerate={canGenerate}
                                    remainingTime={remainingTime}
                                    remainingGenerations={remaining}
                                    onReceiveCard={handleSlotReceive}
                                    onRemoveFaction={handleRemoveFaction}
                                    onAssignClick={handleAssign}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Info size={18} className="text-cyan-400" />
                        카드 생성 가이드
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2">
                            <p className="text-cyan-400 font-bold">1. 군단 구독</p>
                            <p className="text-white/60">AI 군단 페이지에서 원하는 군단을 구독하세요. 티어가 높을수록 생성 주기가 짧아지고 일일 생성 제한이 늘어납니다.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-green-400 font-bold">2. 슬롯 배치</p>
                            <p className="text-white/60">구독한 군단을 빈 슬롯에 배치하세요. 배치가 완료되면 타이머가 작동하며 카드를 생성하기 시작합니다.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-pink-400 font-bold">3. 카드 수령</p>
                            <p className="text-white/60">타이머가 완료되면 '카드 받기' 버튼이 활성화됩니다. 생성된 카드는 즉시 인벤토리에 추가됩니다.</p>
                        </div>
                    </div>
                </div>

                {selectedSlotForAssignment !== null && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-white/20 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                                <div>
                                    <h2 className="text-xl font-bold text-white">군단 배치</h2>
                                    <p className="text-xs text-white/50">슬롯 {selectedSlotForAssignment + 1}에 배치할 군단을 선택하세요</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSlotForAssignment(null)}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {availableFactions.length > 0 ? (
                                    <div className="grid gap-3">
                                        {availableFactions.map(sub => {
                                            const faction = factions.find(f => f.id === sub.factionId);
                                            const config = TIER_CONFIG[sub.tier as keyof typeof TIER_CONFIG];
                                            const remaining = getRemainingGenerations(sub.factionId, userId);

                                            return (
                                                <button
                                                    key={sub.factionId}
                                                    onClick={() => handleAssignFaction(selectedSlotForAssignment, sub.factionId)}
                                                    className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left bg-white/5 group"
                                                >
                                                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                        🤖
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                            {faction?.displayName || sub.factionId}
                                                        </div>
                                                        <div className={cn("text-xs font-bold",
                                                            sub.tier === 'free' ? 'text-gray-400' :
                                                                sub.tier === 'pro' ? 'text-blue-400' : 'text-purple-400'
                                                        )}>
                                                            {config?.name || sub.tier} 티어
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-xs space-y-1">
                                                        <div className="flex items-center justify-end gap-1 text-white/40">
                                                            <Clock size={12} />
                                                            {sub.generationInterval}분
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1 text-white/40">
                                                            <Zap size={12} />
                                                            {sub.dailyGenerationLimit === 999999 ? '무제한' : `${remaining}회 남음`}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-6">
                                        <AlertTriangle className="mx-auto text-yellow-500/50 mb-4" size={48} />
                                        <p className="text-white font-bold mb-2">배치 가능한 군단이 없습니다</p>
                                        <p className="text-sm text-white/50 mb-6">먼저 AI 군단 메뉴에서 군단을 구독하세요.</p>
                                        <button
                                            onClick={() => router.push('/factions')}
                                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors"
                                        >
                                            군단 구독하러 가기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <CardRewardModal
                    isOpen={rewardModalOpen}
                    onClose={() => setRewardModalOpen(false)}
                    cards={rewardCards}
                    title={rewardModalTitle}
                />
            </div>
        </CyberPageLayout>
    );
}
