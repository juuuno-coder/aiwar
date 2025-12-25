'use client';

import { useState, useEffect } from 'react';
import CyberPageLayout from '@/components/CyberPageLayout';
import { AIFaction } from '@/lib/types';
import aiFactionsData from '@/data/ai-factions.json';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { Info, X, Check, Crown, Zap, Clock, Infinity } from 'lucide-react';
import {
    getSubscribedFactions,
    subscribeFaction,
    unsubscribeFaction,
    getTotalSubscriptionCost,
    getFactionSubscription,
    TIER_CONFIG,
    SubscriptionTier
} from '@/lib/faction-subscription-utils';

export default function FactionsPage() {
    const { coins } = useUser();
    const { showAlert, showConfirm } = useAlert();

    const [factions, setFactions] = useState<AIFaction[]>([]);
    const [subscriptions, setSubscriptions] = useState(getSubscribedFactions());
    const [totalCost, setTotalCost] = useState(0);
    const [selectedFaction, setSelectedFaction] = useState<AIFaction | null>(null);
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('free');

    useEffect(() => {
        // Load factions data
        try {
            const data = (aiFactionsData as any)?.factions || [];
            if (Array.isArray(data)) {
                setFactions(data);
            }
        } catch (e) {
            console.error("Data Load Error", e);
        }

        loadSubscriptions();
    }, []);

    const loadSubscriptions = () => {
        const subs = getSubscribedFactions();
        setSubscriptions(subs);
        setTotalCost(getTotalSubscriptionCost());
    };

    const handleSubscribe = (factionId: string, tier: SubscriptionTier) => {
        const config = TIER_CONFIG[tier];
        const costMsg = config.cost > 0 ? `${config.cost.toLocaleString()} 코인` : '무료';

        showConfirm({
            title: `${config.name} 티어 구독`,
            message: `${factionId} 군단을 ${config.name} 티어로 구독하시겠습니까?\n\n비용: ${costMsg}\n생성 주기: ${config.generationInterval}분\n일일 제한: ${config.dailyLimit === 999999 ? '무제한' : config.dailyLimit + '회'}`,
            onConfirm: () => {
                const result = subscribeFaction(factionId, tier);
                if (result.success) {
                    showAlert({ title: '구독 완료', message: result.message, type: 'success' });
                    loadSubscriptions();
                    setSelectedFaction(null);
                } else {
                    showAlert({ title: '구독 실패', message: result.message, type: 'error' });
                }
            }
        });
    };

    const handleUnsubscribe = (factionId: string) => {
        const subscription = getFactionSubscription(factionId);
        if (!subscription) return;

        // 환불 금액 미리 계산 (로직 복제)
        const calculateRefundPreview = () => {
            if (subscription.dailyCost === 0) return 0;

            const history = JSON.parse(localStorage.getItem('cancellationHistory') || '[]');
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
                const result = unsubscribeFaction(factionId);
                if (result.success) {
                    showAlert({ title: '취소 완료', message: result.message, type: 'success' });
                    loadSubscriptions();
                } else {
                    showAlert({ title: '취소 실패', message: result.message, type: 'error' });
                }
            }
        });
    };

    const getTierBadgeColor = (tier: SubscriptionTier) => {
        switch (tier) {
            case 'free': return 'from-gray-500 to-gray-600';
            case 'pro': return 'from-blue-500 to-cyan-500';
            case 'ultra': return 'from-purple-500 to-pink-500';
        }
    };

    return (
        <CyberPageLayout
            title="AI 군단"
            englishTitle="AI FACTIONS"
            description="AI 군단을 구독하여 카드를 자동 생성하세요"
            color="purple"
        >
            <div className="max-h-[calc(100vh-200px)] flex flex-col">
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
                                    <p className="text-white/60">500코인 • 20분 • 20회/일</p>
                                </div>
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                                    <p className="font-bold text-purple-400 mb-1">Ultra</p>
                                    <p className="text-white/60">2000코인 • 10분 • 무제한</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Factions Grid - Scrollable Container */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xl font-bold text-white mb-4">
                        전체 AI 군단 ({factions.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {factions.map(faction => {
                            const subscription = getFactionSubscription(faction.id);

                            return (
                                <div
                                    key={faction.id}
                                    className={cn(
                                        "relative bg-zinc-900/50 border rounded-xl p-5 hover:border-white/20 transition-all",
                                        subscription
                                            ? "border-green-500/50 shadow-lg shadow-green-500/20"
                                            : "border-white/10"
                                    )}
                                >
                                    {/* Subscription Badge */}
                                    {subscription && (
                                        <div className={cn(
                                            "absolute -top-2 -right-2 bg-gradient-to-r text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1",
                                            getTierBadgeColor(subscription.tier)
                                        )}>
                                            <Check size={12} />
                                            {TIER_CONFIG[subscription.tier].name}
                                        </div>
                                    )}

                                    {/* Faction Icon */}
                                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mb-3">
                                        🤖
                                    </div>

                                    {/* Faction Info */}
                                    <h3 className="text-lg font-bold text-white mb-1">{faction.displayName}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 h-8 mb-3">{faction.description}</p>

                                    {/* Subscription Info */}
                                    {subscription && (
                                        <div className="mb-3 text-xs space-y-1">
                                            <div className="flex items-center gap-1 text-white/60">
                                                <Clock size={12} />
                                                <span>{subscription.generationInterval}분 주기</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white/60">
                                                <Zap size={12} />
                                                <span>오늘: {subscription.generationsToday}/{subscription.dailyGenerationLimit === 999999 ? '∞' : subscription.dailyGenerationLimit}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedFaction(faction)}
                                            className="flex-1 py-2 bg-white/5 text-white text-xs font-bold rounded hover:bg-white/10 transition-colors"
                                        >
                                            {subscription ? '티어 변경' : '구독하기'}
                                        </button>
                                        {subscription && (
                                            <button
                                                onClick={() => handleUnsubscribe(faction.id)}
                                                className="flex-1 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded hover:bg-red-500/30 transition-colors"
                                            >
                                                취소
                                            </button>
                                        )}
                                    </div>
                                </div>
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

                                        return (
                                            <button
                                                key={tier}
                                                onClick={() => setSelectedTier(tier)}
                                                disabled={!canAfford && tier !== 'free'}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-left",
                                                    isSelected
                                                        ? "border-cyan-500 bg-cyan-500/10"
                                                        : "border-white/10 hover:border-white/30",
                                                    !canAfford && tier !== 'free' && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
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
                                    disabled={coins < TIER_CONFIG[selectedTier].cost && selectedTier !== 'free'}
                                    className={cn(
                                        "w-full py-3 rounded-lg font-bold transition-colors",
                                        coins >= TIER_CONFIG[selectedTier].cost || selectedTier === 'free'
                                            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400"
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {TIER_CONFIG[selectedTier].name} 티어로 구독하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CyberPageLayout>
    );
}
