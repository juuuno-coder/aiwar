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
    cardImage?: string;
    iconUrl?: string; // 군단 아이콘 추가
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
    onAssignClick,
    cardImage,
    iconUrl
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
        <div className="relative h-72 rounded-xl p-0 transition-all">
            {subscription ? (
                <div className="h-full w-full flex flex-col relative group p-2">
                    {/* Inserted Card Visual Container */}
                    <div className={cn(
                        "relative flex-1 bg-zinc-900/80 border rounded-lg overflow-hidden flex flex-col transition-all duration-300",
                        canGenerate ? "border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]" :
                            slot.status === 'active' ? "border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]" :
                                "border-white/10"
                    )}>
                        {/* Top Accent Bar */}
                        <div className={cn(
                            "h-1 w-full",
                            canGenerate ? "bg-pink-500 animate-pulse" :
                                slot.status === 'active' ? "bg-green-500" :
                                    "bg-gray-600"
                        )} />

                        {/* Card Content */}
                        <div className="flex-1 flex flex-col items-center p-3 relative z-10">
                            {/* Header Info */}
                            <div className="w-full flex justify-between items-center mb-2">
                                <div className="text-[10px] bg-black/50 px-2 py-0.5 rounded border border-white/10 text-white/50">
                                    SLOT {slot.index + 1}
                                </div>
                                <div className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                                    subscription.tier === 'ultra' ? "bg-purple-500/20 text-purple-400 border-purple-500/50" :
                                        subscription.tier === 'pro' ? "bg-blue-500/20 text-blue-400 border-blue-500/50" :
                                            "bg-gray-500/20 text-gray-400 border-gray-500/50"
                                )}>
                                    {TIER_CONFIG[subscription.tier as keyof typeof TIER_CONFIG]?.name || subscription.tier}
                                </div>
                            </div>

                            {/* Main Card Image Area */}
                            <div className="relative w-full flex-1 mb-2 group-hover:scale-[1.02] transition-transform duration-300">
                                <div className={cn(
                                    "absolute inset-0 rounded-lg overflow-hidden border bg-black shadow-inner flex items-center justify-center",
                                    canGenerate ? "border-pink-500/30" : "border-white/10"
                                )}>
                                    {cardImage ? (
                                        <img
                                            src={cardImage}
                                            alt={factionName}
                                            className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <div className="text-4xl text-white/10">🤖</div>
                                    )}

                                    {/* Faction Icon Overlay */}
                                    {iconUrl && (
                                        <div className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm border border-white/20 rounded-md p-1 z-20 shadow-lg">
                                            <img src={iconUrl} alt="faction icon" className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    {/* Generating Overlay */}
                                    {canGenerate && (
                                        <div className="absolute inset-0 bg-pink-500/10 animate-pulse flex items-center justify-center backdrop-blur-[1px]">
                                            <Gift className="text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] animate-bounce" size={32} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="font-bold text-white text-sm mb-2 text-center w-full truncate px-1">
                                {factionName}
                            </div>

                            {/* Bottom Status Area */}
                            <div className="w-full mt-auto">
                                {canGenerate ? (
                                    <button
                                        onClick={() => onReceiveCard(slot.index)}
                                        className="w-full h-8 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded hover:from-pink-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 animate-pulse shadow-lg shadow-pink-500/20"
                                    >
                                        <Gift size={12} />
                                        카드 수령
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-8 flex items-center justify-center bg-black/40 rounded border border-white/5 text-[10px] text-white/50 gap-1">
                                            <Clock size={10} />
                                            {subscription.generationInterval}분
                                        </div>
                                        <div className="flex-[1.5] h-8 flex items-center justify-center bg-white/5 rounded border border-white/10 text-cyan-400 font-mono font-bold text-xs gap-1.5">
                                            {slot.status === 'limit_reached' ? (
                                                <span className="text-yellow-500">완료</span>
                                            ) : (
                                                <>
                                                    <Clock size={10} className="animate-spin-slow" />
                                                    {remainingTime}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Background Tech Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-[length:10px_10px] opacity-20 pointer-events-none" />
                    </div>

                    {/* Eject Button (Below Card) */}
                    <button
                        onClick={() => onRemoveFaction(slot.index)}
                        className="mt-1 text-[10px] text-white/20 hover:text-red-400 transition-colors flex items-center justify-center gap-1 w-full hover:bg-red-500/10 py-1 rounded group/eject"
                    >
                        <span className="group-hover/eject:scale-110 transition-transform">⏏</span> EJECT CARD
                    </button>

                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full relative p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="absolute inset-2 border-2 border-dashed border-white/10 rounded-lg pointer-events-none" />
                    <Plus size={32} className="text-white/10 mb-2" />
                    <span className="text-xs text-white/20 mb-3 font-bold">EMPTY SLOT</span>
                    {/* Slot Label */}
                    <div className="absolute top-2 left-4 text-[10px] text-white/20">
                        SLOT {slot.index + 1}
                    </div>
                    <button
                        onClick={() => onAssignClick(slot.index)}
                        className="z-10 px-4 py-2 bg-white/5 text-cyan-400 text-xs rounded hover:bg-cyan-500/10 transition-colors font-bold border border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                        + 배치하기
                    </button>
                </div>
            )}
        </div>
    );
});

GenerationSlot.displayName = 'GenerationSlot';

export default GenerationSlot;
