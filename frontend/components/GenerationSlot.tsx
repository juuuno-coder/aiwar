'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Zap, Plus, Gift } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/faction-subscription-utils';

interface GenerationSlotProps {
    slot: any;
    subscription: any;
    factionName: string;
    canGenerate: boolean;
    remainingTime: string;
    remainingGenerations: number;
    onReceiveCard: (slotIndex: number) => void;
    onRemoveFaction: (slotIndex: number) => void;
    onAssignClick: (slotIndex: number) => void;
}

const GenerationSlot = memo(({
    slot,
    subscription,
    factionName,
    canGenerate,
    remainingTime,
    remainingGenerations,
    onReceiveCard,
    onRemoveFaction,
    onAssignClick
}: GenerationSlotProps) => {
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'free': return 'text-gray-400';
            case 'pro': return 'text-blue-400';
            case 'ultra': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    return (
        <div
            className={cn(
                "relative h-72 rounded-xl border flex flex-col p-4 transition-all",
                canGenerate && "ring-2 ring-pink-500 ring-offset-2 ring-offset-black bg-pink-500/5 border-pink-500/50",
                !canGenerate && slot.status === 'active' && "bg-green-500/5 border-green-500/30",
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
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mx-auto mb-2 relative group border border-white/10">
                            🤖
                            {canGenerate && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping" />
                            )}
                        </div>
                        <div className="font-bold text-white text-sm mb-1 truncate px-1">
                            {factionName}
                        </div>
                        <div className={cn("text-xs font-bold mb-2 uppercase", getTierColor(subscription.tier))}>
                            {TIER_CONFIG[subscription.tier as keyof typeof TIER_CONFIG]?.name || subscription.tier}
                        </div>

                        <div className="text-xs text-white/60 space-y-1">
                            <div className="flex items-center justify-center gap-1">
                                <Clock size={10} />
                                {subscription.generationInterval}분 주기
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                <Zap size={10} />
                                {subscription.dailyGenerationLimit === 999999 ? '무제한' : `${remainingGenerations}회 남음`}
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto space-y-2">
                        {canGenerate ? (
                            <button
                                onClick={() => onReceiveCard(slot.index)}
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
                            onClick={() => onRemoveFaction(slot.index)}
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
                        onClick={() => onAssignClick(slot.index)}
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30 transition-colors font-bold border border-purple-500/20"
                    >
                        군단 배치
                    </button>
                </div>
            )}
        </div>
    );
});

GenerationSlot.displayName = 'GenerationSlot';

export default GenerationSlot;
