'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card as CardType, Rarity } from '@/lib/types';
import { getCardCharacterImage, getFactionIcon } from '@/lib/card-images';
import { cn } from '@/lib/utils';

interface GameCardProps {
    card: CardType;
    onClick?: () => void;
    isSelected?: boolean;
    isDisabled?: boolean;
    isHolographic?: boolean;
}

// 등급별 색상 설정
const RARITY_CONFIG: Record<Rarity, { border: string; glow: string; badge: string; bgGradient: string }> = {
    common: {
        border: 'border-gray-500/50',
        glow: '',
        badge: 'bg-gray-600 text-gray-200',
        bgGradient: 'from-gray-800/50 to-gray-900/50'
    },
    rare: {
        border: 'border-blue-500/50',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
        badge: 'bg-blue-600 text-blue-100',
        bgGradient: 'from-blue-900/30 to-gray-900/50'
    },
    epic: {
        border: 'border-purple-500/50',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        badge: 'bg-purple-600 text-purple-100',
        bgGradient: 'from-purple-900/30 to-gray-900/50'
    },
    legendary: {
        border: 'border-amber-500/50',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
        badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        bgGradient: 'from-amber-900/30 to-gray-900/50'
    },
    unique: {
        border: 'border-red-500/50',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
        badge: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
        bgGradient: 'from-red-900/30 to-gray-900/50'
    },
    commander: {
        border: 'border-emerald-500/50',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]',
        badge: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white',
        bgGradient: 'from-emerald-900/30 to-gray-900/50'
    }
};

// 등급 한글 이름
const RARITY_NAMES: Record<Rarity, string> = {
    common: '일반',
    rare: '희귀',
    epic: '영웅',
    legendary: '전설',
    unique: '유니크',
    commander: '지휘관'
};

// 등급별 별 개수
const RARITY_STARS: Record<Rarity, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    unique: 5,
    commander: 6
};

export default function GameCard({
    card,
    onClick,
    isSelected = false,
    isDisabled = false,
    isHolographic = false
}: GameCardProps) {
    const [imageError, setImageError] = useState(false);

    // 실제 카드 등급 사용 (fallback: common)
    const rarity: Rarity = card.rarity || 'common';
    const config = RARITY_CONFIG[rarity];

    // 카드 이미지 가져오기
    const characterImage = getCardCharacterImage(card.templateId, card.name, rarity);
    const factionIcon = card.templateId ? getFactionIcon(card.templateId.split('-')[0]) : null;

    return (
        <div
            className={cn(
                "relative transition-all duration-300 rounded-xl overflow-hidden",
                config.border,
                config.glow,
                isSelected && "scale-105 ring-2 ring-cyan-400",
                !isSelected && !isDisabled && "hover:scale-105",
                isDisabled && "opacity-50 cursor-not-allowed grayscale",
                !isDisabled && "cursor-pointer",
                isHolographic && "animate-pulse"
            )}
            onClick={isDisabled ? undefined : onClick}
            style={{ width: '160px', height: '240px' }}
        >
            {/* Holographic Overlay */}
            {isHolographic && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
            )}

            {/* 카드 배경 */}
            <div className={cn("absolute inset-0 bg-gradient-to-b", config.bgGradient)} />

            {/* 카드 이미지 영역 */}
            <div className="relative h-[55%] flex items-center justify-center overflow-hidden bg-black/30">
                {/* 배경 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

                {/* 카드 이미지 */}
                {characterImage && !imageError ? (
                    <Image
                        src={characterImage}
                        alt={card.name || 'Card'}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : factionIcon && !imageError ? (
                    <Image
                        src={factionIcon}
                        alt={card.name || 'Card'}
                        width={80}
                        height={80}
                        className="object-contain drop-shadow-lg"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="text-5xl">🤖</div>
                )}

                {/* 레벨 표시 */}
                <div className="absolute top-1.5 right-1.5 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                    Lv.{card.level}
                </div>

                {/* 등급 배지 */}
                <div className={cn("absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider", config.badge)}>
                    {RARITY_NAMES[rarity]}
                </div>
            </div>

            {/* 카드 정보 영역 */}
            <div className="relative h-[45%] p-2.5 flex flex-col bg-black/60">
                {/* 카드 이름 */}
                <h3 className="text-xs font-bold text-white truncate orbitron mb-1">
                    {card.name || `AI 유닛 #${card.id?.slice(0, 5) || '???'}`}
                </h3>

                {/* 등급 별 표시 */}
                <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: RARITY_STARS[rarity] }).map((_, i) => (
                        <span key={i} className="text-[10px] text-amber-400">★</span>
                    ))}
                </div>

                {/* 스탯 - 올바른 이름으로 표시 */}
                <div className="flex-1 space-y-1 text-[10px]">
                    <StatBar label="효율" value={card.stats?.efficiency || 0} color="cyan" />
                    <StatBar label="창의" value={card.stats?.creativity || 0} color="purple" />
                    <StatBar label="기능" value={card.stats?.function || 0} color="green" />
                </div>

                {/* 총 전투력 */}
                <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[9px] text-white/50 font-mono">PWR</span>
                    <span className="text-sm font-black orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {card.stats?.totalPower || 0}
                    </span>
                </div>
            </div>
        </div>
    );
}

function StatBar({ label, value, color }: { label: string; value: number; color: 'cyan' | 'purple' | 'green' }) {
    const maxValue = 100;
    const percentage = Math.min((value / maxValue) * 100, 100);

    const colorClasses = {
        cyan: 'from-cyan-500 to-cyan-400',
        purple: 'from-purple-500 to-purple-400',
        green: 'from-green-500 to-green-400'
    };

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-white/50 w-6 font-mono">{label}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn("h-full bg-gradient-to-r rounded-full", colorClasses[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-white/70 w-5 text-right font-mono">{value}</span>
        </div>
    );
}
