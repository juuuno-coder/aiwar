'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCardCharacterImage, getFactionIcon } from '@/lib/card-images';
import {
    SubscriptionTier,
    TIER_CONFIGS,
    getProficiencyLevel,
    PROFICIENCY_LEVELS
} from '@/lib/faction-subscription';
import { Shield, Zap, Star, Crown } from 'lucide-react';

interface CommanderCardProps {
    factionId: string;
    factionName: string;
    leaderName: string;
    leaderTitle: string;
    tier: SubscriptionTier;
    totalSubscribedDays: number;
    isSubscribed: boolean;
    onClick?: () => void;
    className?: string;
}

/**
 * 모델 카드 (가로형)
 * - 구독한 군단의 리더를 특별한 카드로 표시
 * - 숙련도와 등급에 따른 시각적 효과
 */
export default function CommanderCard({
    factionId,
    factionName,
    leaderName,
    leaderTitle,
    tier,
    totalSubscribedDays,
    isSubscribed,
    onClick,
    className
}: CommanderCardProps) {
    const tierConfig = TIER_CONFIGS[tier];
    const proficiency = getProficiencyLevel(totalSubscribedDays);
    const characterImage = getCardCharacterImage(factionId, factionName);
    const factionIcon = getFactionIcon(factionId);

    // 등급별 테두리 스타일
    const tierBorderStyles: Record<SubscriptionTier, string> = {
        basic: 'border-gray-500/50',
        pro: 'border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        ultra: 'border-purple-500/70 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
    };

    // 숙련도 아이콘
    const proficiencyIcons = [null, Shield, Zap, Star, Star, Crown];
    const ProficiencyIcon = proficiencyIcons[proficiency.level];

    return (
        <motion.div
            whileHover={{ scale: isSubscribed ? 1.02 : 1, y: isSubscribed ? -5 : 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={isSubscribed ? onClick : undefined}
            className={cn(
                "relative w-full aspect-[2.5/1] rounded-2xl overflow-hidden border-2 transition-all",
                isSubscribed ? "cursor-pointer" : "opacity-50 grayscale cursor-not-allowed",
                tierBorderStyles[tier],
                className
            )}
        >
            {/* 배경 이미지 */}
            <div className="absolute inset-0">
                {characterImage ? (
                    <Image
                        src={characterImage}
                        alt={factionName}
                        fill
                        className="object-cover object-top"
                        sizes="400px"
                    />
                ) : (
                    <div className={cn(
                        "w-full h-full bg-gradient-to-br",
                        tierConfig.gradient
                    )} />
                )}
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>

            {/* 등급별 효과 */}
            {tier === 'ultra' && isSubscribed && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-purple-400 rounded-full"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: '50%'
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                y: [-20, -40, -20],
                                scale: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.3,
                                repeat: Infinity
                            }}
                        />
                    ))}
                </div>
            )}

            {/* 콘텐츠 */}
            <div className="relative z-10 h-full flex items-center p-4 gap-4">
                {/* 좌측: 군단 아이콘 */}
                <div className="flex-shrink-0 w-16 h-16 relative">
                    <div className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-br",
                        tierConfig.gradient,
                        "opacity-30"
                    )} />
                    {factionIcon ? (
                        <Image
                            src={factionIcon}
                            alt={factionId}
                            fill
                            className="object-contain p-2"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                            🤖
                        </div>
                    )}

                    {/* 등급 뱃지 */}
                    <div className={cn(
                        "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                        `bg-gradient-to-r ${tierConfig.gradient}`
                    )}>
                        {tierConfig.name}
                    </div>
                </div>

                {/* 중앙: 정보 */}
                <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">
                        {factionName} 모델
                    </p>
                    <h3 className="text-xl font-black text-white truncate orbitron">
                        {leaderName}
                    </h3>
                    <p className="text-white/50 text-sm truncate">
                        {leaderTitle}
                    </p>
                </div>

                {/* 우측: 숙련도 */}
                {isSubscribed && (
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        {ProficiencyIcon && (
                            <ProficiencyIcon
                                size={24}
                                className={cn(
                                    proficiency.level >= 4 ? "text-yellow-400" : "text-white/70"
                                )}
                            />
                        )}
                        <span className="text-xs font-medium text-white/70">
                            {proficiency.name}
                        </span>
                        <div className="flex gap-0.5">
                            {PROFICIENCY_LEVELS.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        i < proficiency.level
                                            ? "bg-yellow-400"
                                            : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-white/40 mt-1">
                            +{proficiency.statBonus + tierConfig.statBonus}%
                        </span>
                    </div>
                )}
            </div>

            {/* 미구독 오버레이 */}
            {!isSubscribed && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                    <span className="text-white/60 font-medium">구독 필요</span>
                </div>
            )}
        </motion.div>
    );
}
