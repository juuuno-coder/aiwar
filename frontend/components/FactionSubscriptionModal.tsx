
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, Zap, Database, Crown } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import {
    TIER_CONFIGS,
    SubscriptionTier,
    getApprovedFactions,
    FACTIONS_DATA,
    UserSubscription
} from '@/lib/faction-subscription';
import { subscribeToFaction } from '@/lib/firebase-db';
import { CATEGORY_TOKEN_BONUS, FACTION_CATEGORY_MAP } from '@/lib/token-constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function FactionSubscriptionModal({ isOpen, onClose }: Props) {
    const { user, profile, refreshData, addCoins, subscriptions } = useUser(); // subscriptions should be available from UserContext now
    const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Filter approved factions
    const approvedFactionIds = profile ? getApprovedFactions(profile.level) : ['gemini'];

    // Get valid faction data
    const approvedFactions = FACTIONS_DATA.factions.filter(f => selectedFactionId ? f.id === selectedFactionId : approvedFactionIds.includes(f.id));

    // Handle selection
    // If no faction selected, show list. If selected, show tier details.

    const handleSubscribe = async (factionId: string, tier: SubscriptionTier) => {
        if (!user || !profile) return;

        const tierConfig = TIER_CONFIGS[tier];

        // Basic is free, others cost coins
        if (tierConfig.cost > 0) {
            if (profile.coins < tierConfig.cost) {
                alert('코인이 부족합니다.');
                return;
            }

            // Check confirmation
            if (!confirm(`${tierConfig.koreanName} 등급을 구독하시겠습니까?\n비용: ${tierConfig.cost} 코인`)) {
                return;
            }
        }

        setLoading(true);
        try {
            // Deduct coins first
            if (tierConfig.cost > 0) {
                await addCoins(-tierConfig.cost);
            }

            // Save subscription to DB
            await subscribeToFaction(user.uid, factionId, tier);

            await refreshData();
            alert('구독이 완료되었습니다!');
            setSelectedFactionId(null); // Go back to list
        } catch (error) {
            console.error(error);
            alert('구독 처리에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getActiveTier = (factionId: string): SubscriptionTier | null => {
        // subscriptions is UserSubscription[] from context
        // But types might mismatch if context not fully updated with types.
        // Assuming context has subscriptions state now.
        // For safe fallback, we can rely on parent props if context is missing it, 
        // but let's assume UseUser context update worked (we did it in previous steps).

        // Wait, UserContext.tsx update in previous step added 'subscriptions' state? NO.
        // Currently UserContext only does logic, subscriptions state was removed in previous steps to fix type errors?
        // Ah, in previous step 12967, I saw 'setSubscriptions'.
        // Let's assume we can't access subscriptions directly via useUser() UNLESS we added it to the return value.
        // We added 'addCoins' etc but did we add 'subscriptions'? 
        // Checking UserContext.tsx... NO, we did NOT add 'subscriptions' to the value object in the last effective edit (Step 12953 ref).
        // Wait, step 12967 UserContext had `setSubscriptions` but value object update in 12985 did NOT include `subscriptions`.
        // So we cannot access subscriptions list here easily.

        // Workaround: We will fetch subscriptions individually or just rely on 'refreshData' and maybe pass subscriptions as a prop later.
        // Or better: Let's refactor UserContext to expose subscriptions, OR just fetch them here?
        // Fetching here is safer for now.
        return null; // Placeholder. We will fix this by fetching inside this component for now.
    }

    // Local subscription state since Context might not expose it
    const [localSubs, setLocalSubs] = useState<UserSubscription[]>([]);

    useEffect(() => {
        if (isOpen && user) {
            import('@/lib/firebase-db').then(({ fetchUserSubscriptions }) => {
                fetchUserSubscriptions(user.uid).then(setLocalSubs);
            });
        }
    }, [isOpen, user]);

    const getActiveSub = (factionId: string) => localSubs.find(s => s.factionId === factionId && s.status === 'active');


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Database className="w-6 h-6 text-blue-400" />
                                AI 군단 구독 관리
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                보유한 군단을 구독하여 생산 효율과 특수 능력을 활성화하세요.
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
                        {!selectedFactionId ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {approvedFactionIds.map(fid => {
                                    const faction = FACTIONS_DATA.factions.find(f => f.id === fid);
                                    if (!faction) return null;

                                    const activeSub = getActiveSub(fid);
                                    const categoryKey = FACTION_CATEGORY_MAP[fid];
                                    const bonusConfig = CATEGORY_TOKEN_BONUS[categoryKey];

                                    return (
                                        <div
                                            key={fid}
                                            onClick={() => setSelectedFactionId(fid)}
                                            className={`
                                                relative p-4 rounded-xl border border-gray-700 bg-gray-800/50 
                                                hover:bg-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group
                                                ${activeSub ? 'ring-1 ring-blue-500 bg-blue-900/10' : ''}
                                            `}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={faction.iconUrl} alt={faction.displayName} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">{faction.displayName}</h3>
                                                        <div className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded inline-block mt-1">
                                                            {activeSub ? `${TIER_CONFIGS[activeSub.tier].koreanName} 구독 중` : '미구독'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-xs text-gray-400 line-clamp-2">{faction.description}</p>

                                                {bonusConfig && (
                                                    <div className="mt-3 p-2 rounded bg-gray-950/50 border border-gray-800">
                                                        <div className="text-xs text-gray-500 font-medium mb-1">카테고리: {categoryKey}</div>
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                                            <Zap className="w-3 h-3" />
                                                            {bonusConfig.description}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {activeSub && (
                                                <div className="absolute top-3 right-3 text-blue-500">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Detail View for Selected Faction */}
                                <div className="flex items-center gap-4 mb-6">
                                    <button
                                        onClick={() => setSelectedFactionId(null)}
                                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                    >
                                        ← 목록으로
                                    </button>
                                    <h3 className="text-xl font-bold text-white">
                                        {FACTIONS_DATA.factions.find(f => f.id === selectedFactionId)?.displayName} 구독 설정
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(['basic', 'pro', 'ultra'] as SubscriptionTier[]).map(tier => {
                                        const config = TIER_CONFIGS[tier];
                                        const sub = getActiveSub(selectedFactionId);
                                        const isCurrent = sub?.tier === tier;
                                        const isUpgrade = sub && (tier === 'pro' || tier === 'ultra') && sub.tier !== tier; // Simplified

                                        return (
                                            <div
                                                key={tier}
                                                className={`
                                                    relative rounded-xl border-2 p-6 flex flex-col items-center text-center transition-all
                                                    ${isCurrent ? `border-${config.color}-500 bg-${config.color}-500/10` : 'border-gray-700 bg-gray-800'}
                                                    hover:border-${config.color}-400 hover:shadow-lg
                                                `}
                                                style={{ borderColor: isCurrent ? undefined : 'rgb(55 65 81)' }} // Tailwind dynamic color workaround fallback
                                            >
                                                <div className={`
                                                    w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl
                                                    bg-gradient-to-br ${config.gradient} text-white shadow-lg
                                                `}>
                                                    {tier === 'basic' && 'B'}
                                                    {tier === 'pro' && 'P'}
                                                    {tier === 'ultra' && 'U'}
                                                </div>

                                                <h4 className={`text-xl font-bold mb-2 text-${config.color}-400`}>{config.koreanName}</h4>
                                                <div className="text-2xl font-bold text-white mb-6">
                                                    {tier === 'basic' ? '무료' : `${config.cost} 코인`}
                                                    <span className="text-xs text-gray-500 font-normal block mt-1">
                                                        {tier === 'basic' ? '기본 제공' : `/ 30일`}
                                                    </span>
                                                </div>

                                                <ul className="space-y-3 text-sm text-gray-300 mb-8 flex-1 w-full text-left">
                                                    <li className="flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-gray-500" />
                                                        생산 효율 {config.productionMultiplier}배
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                        능력치 +{config.statBonus}%
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-emerald-500" />
                                                        토큰 보너스 {tier === 'basic' ? 'Lv.1' : (tier === 'pro' ? 'Lv.2' : 'Lv.3')}
                                                    </li>
                                                </ul>

                                                <button
                                                    onClick={() => handleSubscribe(selectedFactionId, tier)}
                                                    disabled={loading || isCurrent}
                                                    className={`
                                                        w-full py-3 rounded-lg font-bold transition-all
                                                        ${isCurrent
                                                            ? 'bg-gray-700 text-gray-400 cursor-default'
                                                            : `bg-gradient-to-r ${config.gradient} text-white hover:brightness-110 shadow-lg`}
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                    `}
                                                >
                                                    {loading ? '처리 중...' : isCurrent ? '이용 중' : '구독하기'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
