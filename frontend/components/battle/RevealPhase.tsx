/**
 * 카드 공개 단계 컴포넌트
 * 
 * 선택한 카드를 15초간 서로 공개하는 단계
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevealPhaseProps {
    playerCards: Card[];
    opponentCards: Card[];
    revealDuration?: number; // 초 단위 (기본 15초)
    onComplete: () => void;
}

export default function RevealPhase({
    playerCards,
    opponentCards,
    revealDuration = 15,
    onComplete
}: RevealPhaseProps) {
    const [timeLeft, setTimeLeft] = useState(revealDuration);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        // 0.5초 후 카드 공개
        const revealTimeout = setTimeout(() => {
            setIsRevealed(true);
        }, 500);

        return () => clearTimeout(revealTimeout);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    const progress = ((revealDuration - timeLeft) / revealDuration) * 100;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black/40">
            {/* 타이머 */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-8"
            >
                <div className="relative w-32 h-32">
                    {/* 원형 프로그레스 */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="60"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="60"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 377" }}
                            animate={{ strokeDasharray: `${(progress / 100) * 377} 377` }}
                            transition={{ duration: 0.5 }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* 시간 표시 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Clock className="text-cyan-400 mb-2" size={24} />
                        <div className="text-3xl font-black text-white orbitron">{timeLeft}</div>
                        <div className="text-xs text-white/60">초 남음</div>
                    </div>
                </div>
            </motion.div>

            {/* 안내 메시지 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Eye className="text-cyan-400" />
                    <h2 className="text-2xl font-black text-white orbitron">카드 공개</h2>
                </div>
                <p className="text-white/60">상대방의 카드를 확인하세요</p>
            </motion.div>

            {/* 카드 표시 */}
            <div className="w-full max-w-6xl space-y-6">
                {/* 상대방 카드 */}
                <div>
                    <div className="text-sm text-white/60 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        상대방 카드
                    </div>
                    <AnimatePresence>
                        {isRevealed && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-5 gap-3"
                            >
                                {opponentCards.map((card, index) => (
                                    <CardMini key={card.id} card={card} index={index} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 내 카드 */}
                <div>
                    <div className="text-sm text-white/60 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                        내 카드
                    </div>
                    <AnimatePresence>
                        {isRevealed && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-5 gap-3"
                            >
                                {playerCards.map((card, index) => (
                                    <CardMini key={card.id} card={card} index={index} isPlayer />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// 미니 카드 컴포넌트
function CardMini({ card, index, isPlayer = false }: { card: Card; index: number; isPlayer?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                "aspect-[2/3] rounded-lg border-2 overflow-hidden",
                isPlayer ? "border-cyan-500/50" : "border-red-500/50"
            )}
        >
            <div className={cn(
                "h-full p-2 flex flex-col",
                isPlayer ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20" : "bg-gradient-to-br from-red-900/20 to-orange-900/20"
            )}>
                <div className="text-[10px] text-white/60 mb-1 truncate">{card.templateId}</div>
                <div className="text-xs font-bold text-white mb-1 line-clamp-2">
                    {card.name || card.templateId}
                </div>
                <div className="mt-auto">
                    <div className="text-[10px] text-white/60">타입</div>
                    <div className="text-xs font-bold text-white">{card.type || 'N/A'}</div>
                </div>
                <div className="mt-1">
                    <div className="text-[10px] text-white/60">전투력</div>
                    <div className={cn(
                        "text-sm font-black",
                        isPlayer ? "text-cyan-400" : "text-red-400"
                    )}>
                        {card.stats?.totalPower || 0}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
