'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { AIFaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Zap, Clock } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/faction-subscription-utils';

interface FactionCardProps {
    faction: AIFaction;
    subscription: any;
    koreanName: string;
    bgImage: string;
    onLoreClick: (factionId: string) => void;
    onSubscribeClick: (faction: AIFaction) => void;
}

const FactionCard = memo(({
    faction,
    subscription,
    koreanName,
    bgImage,
    onLoreClick,
    onSubscribeClick
}: FactionCardProps) => {
    const getTierBadgeColor = (tier: string) => {
        switch (tier) {
            case 'free': return 'from-gray-500 to-gray-600';
            case 'pro': return 'from-blue-500 to-cyan-500';
            case 'ultra': return 'from-purple-500 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const handleSubscribe = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSubscribeClick(faction);
    };

    return (
        <div
            onClick={() => onLoreClick(faction.id)}
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
                            {TIER_CONFIG[subscription.tier as keyof typeof TIER_CONFIG]?.name || subscription.tier}
                        </div>
                    )}
                </div>

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

                {/* Action Button */}
                <div className="mt-auto">
                    <button
                        onClick={handleSubscribe}
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
});

FactionCard.displayName = 'FactionCard';

export default FactionCard;
