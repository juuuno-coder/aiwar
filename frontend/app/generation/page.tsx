'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CyberPageLayout from '@/components/CyberPageLayout';
import { AIFaction, Card } from '@/lib/types';
import aiFactionsData from '@/data/ai-factions.json';
import { cn } from '@/lib/utils';
import { useAlert } from '@/context/AlertContext';
import { Clock, AlertTriangle, Plus, X, Zap, Gift, Sparkles } from 'lucide-react';
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

export default function GenerationPage() {
    const router = useRouter();
    const { showAlert, showConfirm } = useAlert();

    const [factions, setFactions] = useState<AIFaction[]>([]);
    const [slots, setSlots] = useState(getGenerationSlots());
    const [subscriptions, setSubscriptions] = useState(getSubscribedFactions());
    const [selectedSlotForAssignment, setSelectedSlotForAssignment] = useState<number | null>(null);

    // Reward Modal State
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [rewardCards, setRewardCards] = useState<Card[]>([]);

    useEffect(() => {
        try {
            const data = (aiFactionsData as any)?.factions || [];
            if (Array.isArray(data)) {
                setFactions(data);
            }
        } catch (e) {
            console.error("Data Load Error", e);
        }
        loadData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            loadData();
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const loadData = () => {
        updateAllSlotStatuses();
        setSlots(getGenerationSlots());
        setSubscriptions(getSubscribedFactions());
    };

    const handleAssignFaction = (slotIndex: number, factionId: string) => {
        const alreadyAssigned = slots.some(s => s.factionId === factionId);
        if (alreadyAssigned) {
            showAlert({ title: '중복 배치 불가', message: '이 군단은 이미 다른 슬롯에 배치되어 있습니다.', type: 'warning' });
            return;
        }

        const result = assignFactionToSlot(slotIndex, factionId);
        if (result.success) {
            showAlert({ title: '배치 완료', message: '군단이 배치되었으며, 첫 카드를 즉시 생성할 수 있습니다!', type: 'success' });
            loadData();
            setSelectedSlotForAssignment(null);
        } else {
            showAlert({ title: '배치 실패', message: result.message, type: 'error' });
        }
    };

    const handleRemoveFaction = (slotIndex: number) => {
        showConfirm({
            title: '군단 제거',
            message: '이 슬롯에서 군단을 제거하시겠습니까?',
            onConfirm: () => {
                const result = removeFactionFromSlot(slotIndex);
                if (result.success) {
                    showAlert({ title: '제거 완료', message: result.message, type: 'success' });
                    loadData();
                } else {
                    showAlert({ title: '제거 실패', message: result.message, type: 'error' });
                }
            }
        });
    };

    // 통합된 생성+수령 로직
    const handleReceiveCard = async (slotIndex: number) => {
        const result = await generateCard(slotIndex);

        if (result.success && result.card) {
            try {
                // 인벤토리에 즉시 추가
                await addCardToInventory(result.card);

                // 보상 모달 표시
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
    };

    // 준비된 모든 카드 받기
    const handleReceiveAll = async () => {
        const readySlots = slots.filter(slot => {
            if (!slot.factionId) return false;
            const status = checkGenerationStatus(slot.index);
            return status.canGenerate;
        });

        if (readySlots.length === 0) return;

        const receivedCards: Card[] = [];
        let successCount = 0;

        for (const slot of readySlots) {
            const result = await generateCard(slot.index);
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

    const getRemainingTime = (nextGenAt: Date | null): string => {
        if (!nextGenAt) return '--:--';
        const diff = nextGenAt.getTime() - Date.now();
        if (diff <= 0) return '준비됨!';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'free': return 'text-gray-400';
            case 'pro': return 'text-blue-400';
            case 'ultra': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    const assignedFactionIds = slots.filter(s => s.factionId).map(s => s.factionId);
    const availableFactions = subscriptions.filter(s => !assignedFactionIds.includes(s.factionId));

    // 생성 가능한 슬롯 수 계산
    const readyCount = slots.filter(slot => {
        if (!slot.factionId) return false;
        const status = checkGenerationStatus(slot.index);
        return status.canGenerate;
    }).length;

    return (
        <CyberPageLayout
            title="카드 생성"
            englishTitle="CARD GENERATION"
            description="시간이 되면 자동으로 생성되는 카드를 수령하세요"
            color="green"
        >
            <div className="max-h-[calc(100vh-200px)] flex flex-col">
                {/* Subscription Summary */}
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
                            <h3 className="text-sm text-white/60 mb-1">생성 주기</h3>
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

                {/* Generation Slots */}
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
                            const { canGenerate } = checkGenerationStatus(slot.index);
                            const remainingTime = getRemainingTime(slot.nextGenerationAt);
                            const remaining = slot.factionId ? getRemainingGenerations(slot.factionId) : 0;

                            return (
                                <div
                                    key={slot.index}
                                    className={cn(
                                        "relative h-72 rounded-xl border flex flex-col p-4 transition-all",
                                        canGenerate && "ring-2 ring-pink-500 ring-offset-2 ring-offset-black bg-pink-500/5 border-pink-500/50",
                                        !canGenerate && slot.status === 'active' && "bg-green-500/5 border-green-500/30", // Active but timer running logic handled by canGenerate check usually
                                        !canGenerate && slot.status === 'waiting' && "bg-cyan-500/5 border-cyan-500/30",
                                        slot.status === 'limit_reached' && "bg-yellow-500/5 border-yellow-500/30",
                                        slot.status === 'empty' && "bg-black/40 border-dashed border-white/10"
                                    )}
                                >
                                    {subscription ? (
                                        <>
                                            {/* Faction Info */}
                                            <div className="text-center mb-auto">
                                                <div className="text-xs text-white/40 mb-2">슬롯 {slot.index + 1}</div>
                                                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mx-auto mb-2 relative group">
                                                    🤖
                                                    {canGenerate && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping" />
                                                    )}
                                                </div>
                                                <div className="font-bold text-white text-sm mb-1">
                                                    {factions.find(f => f.id === subscription.factionId)?.displayName || subscription.factionId}
                                                </div>
                                                <div className={cn("text-xs font-bold mb-2", getTierColor(subscription.tier))}>
                                                    {TIER_CONFIG[subscription.tier].name}
                                                </div>

                                                <div className="text-xs text-white/60 space-y-1">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Clock size={10} />
                                                        {subscription.generationInterval}분 주기
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Zap size={10} />
                                                        {subscription.dailyGenerationLimit === 999999 ? '무제한' : `${remaining}회 남음`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Area */}
                                            <div className="mt-auto space-y-2">
                                                {canGenerate ? (
                                                    <button
                                                        onClick={() => handleReceiveCard(slot.index)}
                                                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all flex items-center justify-center gap-2 animate-bounce shadow-lg shadow-pink-500/20"
                                                    >
                                                        <Gift size={16} />
                                                        카드 받기
                                                    </button>
                                                ) : (
                                                    <div className="text-center py-2 bg-black/40 rounded-lg border border-white/5">
                                                        {slot.status === 'limit_reached' ? (
                                                            <div className="text-xs text-yellow-400 font-bold">일일 제한 도달</div>
                                                        ) : (
                                                            <div className="text-cyan-400 font-mono font-bold flex items-center justify-center gap-2 text-sm">
                                                                <Clock size={14} className="animate-pulse" />
                                                                {remainingTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleRemoveFaction(slot.index)}
                                                    className="w-full py-1 text-red-400 text-xs hover:text-red-300 transition-colors opacity-50 hover:opacity-100"
                                                >
                                                    배치 해제
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <Plus size={32} className="text-white/20 mb-2" />
                                            <span className="text-xs text-white/40 mb-3">빈 슬롯</span>
                                            <button
                                                onClick={() => setSelectedSlotForAssignment(slot.index)}
                                                className="px-4 py-2 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30 transition-colors font-bold"
                                            >
                                                군단 배치
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <h3 className="text-base font-bold text-white mb-3">💡 생성 시스템 안내</h3>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li>• 구독한 군단을 슬롯에 배치하면 티어에 따라 자동으로 카드가 생성됩니다</li>
                        <li>• 배치 직후 첫 카드는 <span className="text-pink-400 font-bold">즉시 수령</span> 가능합니다!</li>
                        <li>• 이후 일정 시간마다 [카드 받기] 버튼이 활성화됩니다.</li>
                        <li>• <span className="text-blue-400 font-bold">Pro</span>: 20분 주기, <span className="text-purple-400 font-bold">Ultra</span>: 10분 주기</li>
                    </ul>
                </div>

                {/* Faction Assignment Modal */}
                {selectedSlotForAssignment !== null && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-white/20 w-full max-w-5xl rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">군단 선택</h2>
                                    <p className="text-sm text-white/60 mt-1">슬롯 {selectedSlotForAssignment + 1}에 배치할 군단을 선택하세요</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSlotForAssignment(null)}
                                    className="text-white/50 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6">
                                {availableFactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-white/60 mb-4">
                                            {subscriptions.length === 0
                                                ? '구독 중인 군단이 없습니다.'
                                                : '배치 가능한 군단이 없습니다. 모든 군단이 이미 배치되었습니다.'}
                                        </p>
                                        <button
                                            onClick={() => router.push('/factions')}
                                            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors font-bold"
                                        >
                                            군단 구독하러 가기
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {availableFactions.map(subscription => {
                                            const faction = factions.find(f => f.id === subscription.factionId);
                                            const remaining = getRemainingGenerations(subscription.factionId);

                                            return (
                                                <button
                                                    key={subscription.factionId}
                                                    onClick={() => handleAssignFaction(selectedSlotForAssignment, subscription.factionId)}
                                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg p-5 hover:border-green-500/50 hover:bg-zinc-800/80 hover:scale-[1.02] transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-2xl">
                                                            🤖
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-white truncate">{faction?.displayName || subscription.factionId}</div>
                                                            <div className={cn("text-xs font-bold", getTierColor(subscription.tier))}>
                                                                {TIER_CONFIG[subscription.tier].name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-white/60 space-y-1 bg-black/30 rounded p-2">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {subscription.generationInterval}분 주기
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Zap size={12} />
                                                            {subscription.dailyGenerationLimit === 999999
                                                                ? '무제한'
                                                                : `오늘 ${remaining}회 남음`}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reward Modal */}
                <CardRewardModal
                    isOpen={rewardModalOpen}
                    onClose={() => setRewardModalOpen(false)}
                    cards={rewardCards}
                />
            </div>
        </CyberPageLayout>
    );
}
