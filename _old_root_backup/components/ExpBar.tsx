'use client';

import React from 'react';

interface ExpBarProps {
    currentExp: number;
    requiredExp: number;
    level: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function ExpBar({
    currentExp,
    requiredExp,
    level,
    showLabel = true,
    size = 'md',
}: ExpBarProps) {
    const percentage = Math.min((currentExp / requiredExp) * 100, 100);

    const heights = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className="w-full">
            {showLabel && (
                <div className={`flex items-center justify-between mb-1 ${textSizes[size]}`}>
                    <span className="font-bold text-purple-400">Lv.{level}</span>
                    <span className="text-gray-400">
                        {currentExp.toLocaleString()} / {requiredExp.toLocaleString()} XP
                    </span>
                </div>
            )}
            <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${heights[size]} relative`}>
                {/* 배경 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />

                {/* 경험치 바 */}
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${percentage}%` }}
                >
                    {/* 반짝이는 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>

                {/* 글로우 효과 */}
                {percentage > 0 && (
                    <div
                        className="absolute top-0 h-full bg-purple-500/50 blur-sm transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                )}
            </div>

            {/* 레벨업 임박 알림 */}
            {percentage >= 90 && size !== 'sm' && (
                <div className="mt-1 text-xs text-yellow-400 animate-pulse flex items-center gap-1">
                    <span>⚡</span>
                    <span>레벨업 임박!</span>
                </div>
            )}

            {size === 'lg' && percentage < 90 && (
                <div className="text-center mt-1">
                    <span className="text-xs text-gray-400">
                        다음 레벨까지 {(requiredExp - currentExp).toLocaleString()} XP
                    </span>
                </div>
            )}
        </div>
    );
}
