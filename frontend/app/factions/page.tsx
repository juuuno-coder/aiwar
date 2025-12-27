'use client';

import { useState, useEffect } from 'react';
import CyberPageLayout from '@/components/CyberPageLayout';
import { AIFaction } from '@/lib/types';
import aiFactionsData from '@/data/ai-factions.json';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlert } from '@/context/AlertContext';
import { Info, X, Check, Crown, Zap, Clock, Infinity, Globe } from 'lucide-react';
import Image from 'next/image';
import FactionLoreModal from '@/components/FactionLoreModal';
import { FACTION_LORE_DATA, FactionLore } from '@/lib/faction-lore';
import { getCardCharacterImage } from '@/lib/card-images';
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
    const { profile, reload: refreshProfile } = useUserProfile();
    const { showAlert, showConfirm } = useAlert();

    // Derived state for easier access
    const coins = profile?.coins || 0;
    const level = profile?.level || 1;

    const [factions, setFactions] = useState<AIFaction[]>([]);
    const [subscriptions, setSubscriptions] = useState(getSubscribedFactions());
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
        const reqLevel = TIER_LEVEL_REQ[tier];

        if (level < reqLevel) {
            showAlert({ title: '레벨 부족', message: `${config.name} 티어는 레벨 ${reqLevel} 이상부터 구독 가능합니다.`, type: 'error' });
            return;
        }

        showConfirm({
            title: `${config.name} 티어 구독`,
            message: `${factionId} 군단을 ${config.name} 티어로 구독하시겠습니까?\n\n비용: ${costMsg}\n생성 주기: ${config.generationInterval}분\n일일 제한: ${config.dailyLimit === 999999 ? '무제한' : config.dailyLimit + '회'}`,
            onConfirm: () => {
                const result = subscribeFaction(factionId, tier);
                if (result.success) {
                    showAlert({ title: '구독 완료', message: result.message, type: 'success' });
                    refreshProfile(); // 코인 잔액 갱신
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
                    refreshProfile(); // 코인 잔액 갱신 (환불 시)
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
                                    <p className="text-white/60">500코인 • Lv.10 • 20회/일</p>
                                </div>
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                                    <p className="font-bold text-purple-400 mb-1">Ultra</p>
                                    <p className="text-white/60">2000코인 • Lv.30 • 무제한</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {factions.map(faction => {
                            const subscription = getFactionSubscription(faction.id);
                            const loreData = FACTION_LORE_DATA[faction.id];
                            const koreanName = loreData?.koreanName || faction.displayName;

                            // Background Image Selection (Try to use character/hero image for the faction)
                            const bgImage = getCardCharacterImage(faction.id) || faction.iconUrl;

                            return (
                                <div
                                    key={faction.id}
                                    onClick={() => {
                                        if (loreData) {
                                            setSelectedLoreFaction(loreData);
                                            setIsLoreModalOpen(true);
                                        } else {
                                            showAlert({ title: '정보 없음', message: '상세 정보가 준비 중입니다.', type: 'info' });
                                        }
                                    }}
                                    className={cn(
                                        "group relative border rounded-xl overflow-hidden transition-all h-[320px] flex flex-col cursor-pointer",
                                        subscription
                                            ? "border-green-500/50 shadow-lg shadow-green-500/20"
                                            : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    {/* Background Image Area */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                        style={{
                                            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                                            backgroundColor: '#111',
                                            filter: 'brightness(0.6)'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="relative z-10 flex flex-col h-full p-5">

                                        {/* Header: Icon & Name */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-black/50 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center text-2xl shadow-lg relative shrink-0">
                                                    {faction.iconUrl ? (
                                                        <Image
                                                            src={faction.iconUrl}
                                                            alt={faction.id}
                                                            fill
                                                            className="object-contain p-2"
                                                        />
                                                    ) : (
                                                        <span>🤖</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white leading-tight">
                                                        {koreanName}
                                                    </h3>
                                                    <p className="text-xs text-white/50 font-bold tracking-wider uppercase">
                                                        {faction.displayName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Subscription Badge */}
                                            {subscription && (
                                                <div className={cn(
                                                    "bg-gradient-to-r text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1",
                                                    getTierBadgeColor(subscription.tier)
                                                )}>
                                                    <Check size={10} />
                                                    {TIER_CONFIG[subscription.tier].name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Description Removed from Card Face */}
                                        <div className="flex-1" />

                                        {/* Subscription Stats (If Subscribed) */}
                                        {subscription && (
                                            <div className="mb-4 text-xs space-y-1 bg-green-900/20 p-2 rounded border border-green-500/20">
                                                <div className="flex items-center justify-between text-green-200">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        <span>생성 주기</span>
                                                    </div>
                                                    <span className="font-bold">{subscription.generationInterval}분</span>
                                                </div>
                                                <div className="flex items-center justify-between text-green-200">
                                                    <div className="flex items-center gap-1">
                                                        <Zap size={12} />
                                                        <span>오늘 생성</span>
                                                    </div>
                                                    <span className="font-bold">{subscription.generationsToday} / {subscription.dailyGenerationLimit === 999999 ? '∞' : subscription.dailyGenerationLimit}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent opening modal
                                                    setSelectedFaction(faction);
                                                }}
                                                className={cn(
                                                    "w-full py-2.5 text-white text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors z-20 relative",
                                                    subscription
                                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border border-white/20"
                                                        : "bg-cyan-600/80 hover:bg-cyan-500/80 border border-cyan-400/30 backdrop-blur-sm"
                                                )}
                                            >
                                                {subscription ? <Zap size={14} /> : <Check size={14} />}
                                                {subscription ? '구독 관리' : '구독하기'}
                                            </button>
                                        </div>
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
                                                {/* Lock Overlay if level insufficient */}
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
