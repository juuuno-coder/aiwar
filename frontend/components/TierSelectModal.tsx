'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionTier, TIER_CONFIGS, TierConfig } from '@/lib/faction-subscription';

interface TierSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    factionName: string;
    currentTier?: SubscriptionTier;
    onSelect: (tier: SubscriptionTier) => void;
    userCoins: number;
}

const tierIcons = {
    basic: Zap,
    pro: Star,
    ultra: Crown
};

export default function TierSelectModal({
    isOpen,
    onClose,
    factionName,
    currentTier,
    onSelect,
    userCoins
}: TierSelectModalProps) {
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(currentTier || 'basic');

    const handleConfirm = () => {
        onSelect(selectedTier);
        onClose();
    };

    const canAfford = (tier: SubscriptionTier) => {
        return userCoins >= TIER_CONFIGS[tier].cost;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full z-[81]"
                    >
                        <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-2xl border border-white/10 p-6 shadow-2xl">
                            {/* 헤더 */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{factionName} 구독 등급</h3>
                                    <p className="text-sm text-white/50">등급을 선택하세요</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                                    <X size={20} className="text-white/60" />
                                </button>
                            </div>

                            {/* 등급 카드들 */}
                            <div className="space-y-3 mb-6">
                                {(Object.entries(TIER_CONFIGS) as [SubscriptionTier, TierConfig][]).map(([tier, config]) => {
                                    const Icon = tierIcons[tier];
                                    const isSelected = selectedTier === tier;
                                    const affordable = canAfford(tier);
                                    const isCurrent = currentTier === tier;

                                    return (
                                        <motion.button
                                            key={tier}
                                            whileHover={{ scale: affordable ? 1.02 : 1 }}
                                            whileTap={{ scale: affordable ? 0.98 : 1 }}
                                            onClick={() => affordable && setSelectedTier(tier)}
                                            disabled={!affordable}
                                            className={cn(
                                                "w-full p-4 rounded-xl border-2 transition-all text-left",
                                                isSelected
                                                    ? `border-${config.color}-500 bg-${config.color}-500/20`
                                                    : "border-white/10 bg-white/5",
                                                !affordable && "opacity-40 cursor-not-allowed",
                                                isSelected && `bg-gradient-to-r ${config.gradient} bg-opacity-20`
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* 아이콘 */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                                    config.gradient
                                                )}>
                                                    <Icon size={24} className="text-white" />
                                                </div>

                                                {/* 정보 */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white">{config.koreanName}</span>
                                                        {isCurrent && (
                                                            <span className="text-xs bg-green-500/30 text-green-400 px-2 py-0.5 rounded-full">
                                                                현재
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-white/50">
                                                        {config.cost === 0 ? '무료' : `${config.cost.toLocaleString()} 코인`}
                                                        {config.dailyCost > 0 && ` (+${config.dailyCost}/일)`}
                                                    </p>
                                                </div>

                                                {/* 보너스 */}
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-white">+{config.statBonus}%</p>
                                                    <p className="text-xs text-white/40">{config.productionMultiplier}x 속도</p>
                                                </div>

                                                {/* 선택 표시 */}
                                                {isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                        <Check size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 추가 혜택 */}
                                            {(config.rareBonus > 0 || config.legendaryBonus > 0) && (
                                                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 flex gap-4">
                                                    {config.rareBonus > 0 && (
                                                        <span>희귀 확률 +{config.rareBonus}%</span>
                                                    )}
                                                    {config.legendaryBonus > 0 && (
                                                        <span>전설 확률 +{config.legendaryBonus}%</span>
                                                    )}
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* 보유 코인 */}
                            <div className="text-center text-sm text-white/50 mb-4">
                                보유: <span className="text-yellow-400 font-bold">{userCoins.toLocaleString()}</span> 코인
                            </div>

                            {/* 확인 버튼 */}
                            <button
                                onClick={handleConfirm}
                                disabled={!canAfford(selectedTier)}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-white transition-all",
                                    canAfford(selectedTier)
                                        ? `bg-gradient-to-r ${TIER_CONFIGS[selectedTier].gradient} hover:opacity-90`
                                        : "bg-gray-600 cursor-not-allowed"
                                )}
                            >
                                {TIER_CONFIGS[selectedTier].cost === 0
                                    ? '무료 구독 시작'
                                    : `${TIER_CONFIGS[selectedTier].cost.toLocaleString()} 코인으로 구독`
                                }
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
