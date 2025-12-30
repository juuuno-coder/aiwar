'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CyberPageLayout from '@/components/CyberPageLayout';
import { AIFaction } from '@/lib/types';
import aiFactionsData from '@/data/ai-factions.json';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlert } from '@/context/AlertContext';
import { Info, X, Check, Crown, Zap, Clock, Infinity } from 'lucide-react';
import FactionLoreModal from '@/components/FactionLoreModal';
import { FACTION_LORE_DATA, FactionLore } from '@/lib/faction-lore';
import { getCardCharacterImage } from '@/lib/card-images';
import { useFirebase } from '@/components/FirebaseProvider';
import {
    getSubscribedFactions,
    subscribeFaction,
    unsubscribeFaction,
    getTotalSubscriptionCost,
    getFactionSubscription,
    TIER_CONFIG,
    SubscriptionTier
} from '@/lib/faction-subscription-utils';
import FactionCard from '@/components/FactionCard';

export default function FactionsPage() {
    const { profile, reload: refreshProfile } = useUserProfile();
    const { user } = useFirebase();
    const { showAlert, showConfirm } = useAlert();

    // Derived state for easier access
    const coins = profile?.coins || 0;
    const level = profile?.level || 1;
    const userId = user?.uid;

    const [factions, setFactions] = useState<AIFaction[]>([]);
    const [totalCost, setTotalCost] = useState(0);
    const [selectedFaction, setSelectedFaction] = useState<AIFaction | null>(null);
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('free');

    // Lore Modal State
    const [selectedLoreFaction, setSelectedLoreFaction] = useState<FactionLore | null>(null);
    const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);

    const TIER_LEVEL_REQ: Record<SubscriptionTier, number> = {
        free: 1,
        pro: 10,
        ultra: 30
    };

    // Memoize subscriptions to prevent unnecessary re-renders of the grid
    const subscriptions = useMemo(() => getSubscribedFactions(userId), [userId]);

    useEffect(() => {
        // Load factions data
        try {
            const data = (aiFactionsData as { factions: AIFaction[] })?.factions || [];
            if (Array.isArray(data)) {
                setFactions(data);
            }
        } catch (e) {
            console.error("Data Load Error", e);
        }

        setTotalCost(getTotalSubscriptionCost(userId));
    }, [userId]);

    const handleSubscribe = (factionId: string, tier: SubscriptionTier) => {
        const config = TIER_CONFIG[tier];
        const reqLevel = TIER_LEVEL_REQ[tier];

        if (level < reqLevel) {
            showAlert({ title: '레벨 부족', message: `${config.name} 티어는 레벨 ${reqLevel} 이상부터 구독 가능합니다.`, type: 'error' });
            return;
        }

        // 프로필 코인이 로컬 상태와 다르면 동기화
        if (profile?.coins !== undefined) {
            const gameState = require('@/lib/game-state').getGameState();
            if (gameState.coins !== profile.coins) {
                require('@/lib/game-state').updateGameState({ coins: profile.coins });
            }
        }

        showConfirm({
            title: `${config.name} 티어 구독`,
            message: `${factionId} 군단을 ${config.name} 티어로 구독하시겠습니까?\n\n⚠️ 주의: 이 티어는 매일 ${config.cost.toLocaleString()} 코인이 자동 차감되는 Recurring Billing(정기 결제) 방식입니다.`,
            onConfirm: () => {
                const result = subscribeFaction(factionId, tier, userId);
                if (result.success) {
                    showAlert({ title: '구독 완료', message: result.message, type: 'success' });
                    refreshProfile(); // 코인 잔액 갱신
                    setTotalCost(getTotalSubscriptionCost(userId));
                    setSelectedFaction(null);
                } else {
                    showAlert({ title: '구독 실패', message: result.message, type: 'error' });
                }
            }
        });
    };

    const handleUnsubscribe = (factionId: string) => {
        const subscription = getFactionSubscription(factionId, userId);
        if (!subscription) return;

        // 환불 금액 미리 계산 (로직 복제)
        const calculateRefundPreview = () => {
            if (subscription.dailyCost === 0) return 0;

            const storageKey = userId ? `cancellationHistory_${userId}` : 'cancellationHistory';
            const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const hasEverCancelled = history.some((h: any) => h.factionId === factionId);

            if (!hasEverCancelled) {
                return Math.floor(subscription.dailyCost * 0.5);
            } else {
                const now = new Date();
                const subscriptionStart = new Date(subscription.subscribedAt);
                const hoursUsed = (now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60);

                // 24시간 이내 취소: 전액 환불
                if (hoursUsed < 24) {
                    return subscription.dailyCost;
                }
                return 0;
            }
        };

        const refundAmount = calculateRefundPreview();
        const refundMsg = refundAmount > 0
            ? `\n\n💰 환불 예상 금액: ${refundAmount.toLocaleString()} 코인`
            : '';

        showConfirm({
            title: '구독 취소',
            message: `${factionId} 군단 구독을 취소하시겠습니까?${refundMsg}`,
            onConfirm: () => {
                const result = unsubscribeFaction(factionId, userId);
                if (result.success) {
                    showAlert({ title: '취소 완료', message: result.message, type: 'success' });
                    refreshProfile(); // 코인 잔액 갱신 (환불 시)
                    setTotalCost(getTotalSubscriptionCost(userId));
                } else {
                    showAlert({ title: '취소 실패', message: result.message, type: 'error' });
                }
            }
        });
    };

    const handleLoreClick = useCallback((factionId: string) => {
        const loreData = FACTION_LORE_DATA[factionId];
        if (loreData) {
            setSelectedLoreFaction(loreData);
            setIsLoreModalOpen(true);
        } else {
            showAlert({ title: '정보 없음', message: '상세 정보가 준비 중입니다.', type: 'info' });
        }
    }, [showAlert]);

    const handleSubscribeRequest = useCallback((faction: AIFaction) => {
        setSelectedFaction(faction);
    }, []);

    return (
        <CyberPageLayout
            title="AI 군단"
            englishTitle="AI FACTIONS"
            description="AI 군단을 구독하여 카드를 자동 생성하세요"
            color="purple"
        >
            <div className="flex flex-col">
                {/* Subscription Info */}
                <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-6 flex-shrink-0">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Crown className="text-yellow-400" size={24} />
                                일간 구독 비용
                            </h3>
                            <p className="text-3xl font-black text-yellow-400">
                                {totalCost.toLocaleString()} <span className="text-lg text-white/60">코인/일</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/60">구독 중인 군단</p>
                            <p className="text-2xl font-bold text-cyan-400">{subscriptions.length}</p>
                        </div>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 flex items-start gap-3">
                        <Info className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-white/80">
                            <p className="font-bold mb-2">💎 티어별 혜택</p>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                <div className="bg-gray-500/10 border border-gray-500/20 rounded p-2">
                                    <p className="font-bold text-gray-400 mb-1">Free</p>
                                    <p className="text-white/60">무료 • 30분 • 5회/일</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                                    <p className="font-bold text-blue-400 mb-1">Pro</p>
                                    <p className="text-white/60">40코인 • Lv.10 • 20회/일</p>
                                </div>
                                <div className="bg-purple-500/10 border border-blue-500/20 rounded p-2">
                                    <p className="font-bold text-purple-400 mb-1">Ultra</p>
                                    <p className="text-white/60">200코인 • Lv.30 • 무제한</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Market Economy Reminder */}
                    <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg animate-pulse">
                        <p className="text-sm text-amber-300 flex items-center gap-2">
                            <Zap size={16} className="text-amber-400" />
                            <strong>시장 경제 알림:</strong> 구독 중인 군단은 접속 여부와 관계없이 매일 유지비가 차감됩니다. <strong>게임을 종료하기 전 반드시 구독 해지를 검토하세요!</strong>
                        </p>
                    </div>
                </div>

                {/* Factions Grid - Scrollable Container */}
                <div className="flex-1 pb-4">
                    <h2 className="text-xl font-bold text-white mb-4">
                        전체 AI 군단 ({factions.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {factions.map(faction => {
                            const subscription = getFactionSubscription(faction.id, userId);
                            const loreData = FACTION_LORE_DATA[faction.id];
                            const koreanName = loreData?.koreanName || faction.displayName;
                            const bgImage = getCardCharacterImage(faction.id) || faction.iconUrl;

                            return (
                                <FactionCard
                                    key={faction.id}
                                    faction={faction}
                                    subscription={subscription}
                                    koreanName={koreanName}
                                    bgImage={bgImage}
                                    onLoreClick={handleLoreClick}
                                    onSubscribeClick={handleSubscribeRequest}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Tier Selection Modal */}
                {selectedFaction && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-white/20 w-full max-w-2xl rounded-2xl overflow-hidden relative">
                            <button
                                onClick={() => setSelectedFaction(null)}
                                className="absolute right-4 top-4 text-white/50 hover:text-white z-10"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center text-3xl">
                                        🤖
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedFaction.displayName}</h2>
                                        <p className="text-sm text-white/60">구독 티어를 선택하세요</p>
                                    </div>
                                </div>

                                {/* Tier Options */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {(['free', 'pro', 'ultra'] as SubscriptionTier[]).map(tier => {
                                        const config = TIER_CONFIG[tier];
                                        const isSelected = selectedTier === tier;
                                        const canAfford = coins >= config.cost;
                                        const reqLevel = TIER_LEVEL_REQ[tier];
                                        const isLevelSufficient = level >= reqLevel;

                                        return (
                                            <button
                                                key={tier}
                                                onClick={() => setSelectedTier(tier)}
                                                disabled={(!canAfford && tier !== 'free') || !isLevelSufficient}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden",
                                                    isSelected
                                                        ? "border-cyan-500 bg-cyan-500/10"
                                                        : "border-white/10 hover:border-white/30",
                                                    ((!canAfford && tier !== 'free') || !isLevelSufficient) && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {!isLevelSufficient && (
                                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-[1px] border border-white/5">
                                                        <span className="text-xl mb-1">🔒</span>
                                                        <span className="text-xs font-bold text-red-400">Lv.{reqLevel} 필요</span>
                                                    </div>
                                                )}

                                                <div className="font-bold text-white mb-2">{config.name}</div>
                                                <div className="text-2xl font-black text-yellow-400 mb-2">
                                                    {config.cost === 0 ? 'FREE' : `${config.cost.toLocaleString()}`}
                                                    {config.cost > 0 && <span className="text-xs text-white/60 ml-1">코인</span>}
                                                </div>
                                                <div className="space-y-1 text-xs text-white/60">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {config.generationInterval}분 주기
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {config.dailyLimit === 999999 ? <Infinity size={12} /> : <Zap size={12} />}
                                                        {config.dailyLimit === 999999 ? '무제한' : `${config.dailyLimit}회/일`}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Subscribe Button */}
                                <button
                                    onClick={() => handleSubscribe(selectedFaction.id, selectedTier)}
                                    disabled={(coins < TIER_CONFIG[selectedTier].cost && selectedTier !== 'free') || level < TIER_LEVEL_REQ[selectedTier]}
                                    className={cn(
                                        "w-full py-3 rounded-lg font-bold transition-colors",
                                        (coins >= TIER_CONFIG[selectedTier].cost || selectedTier === 'free') && level >= TIER_LEVEL_REQ[selectedTier]
                                            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400"
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {level < TIER_LEVEL_REQ[selectedTier]
                                        ? `Lv.${TIER_LEVEL_REQ[selectedTier]} 도달 시 활성화`
                                        : `${TIER_CONFIG[selectedTier].name} 티어로 구독하기`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lore Modal */}
                <FactionLoreModal
                    faction={selectedLoreFaction}
                    isOpen={isLoreModalOpen}
                    onClose={() => setIsLoreModalOpen(false)}
                    allFactions={Object.values(FACTION_LORE_DATA)}
                />
            </div>
        </CyberPageLayout >
    );
}
