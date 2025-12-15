'use client';

import { useEffect, useState } from 'react';
import UiCard from './ui/Card';
import Button from './ui/Button';

interface BattleResultProps {
    isVictory: boolean;
    playerWins: number;
    aiWins: number;
    rewards: {
        exp: number;
        tokens: number;
        cards?: number;
    };
    onClose: () => void;
}

export default function BattleResult({
    isVictory,
    playerWins,
    aiWins,
    rewards,
    onClose,
}: BattleResultProps) {
    const [showResult, setShowResult] = useState(false);
    const [showRewards, setShowRewards] = useState(false);
    const [animatedExp, setAnimatedExp] = useState(0);
    const [animatedTokens, setAnimatedTokens] = useState(0);

    useEffect(() => {
        // 결과 애니메이션
        setTimeout(() => setShowResult(true), 300);
        setTimeout(() => setShowRewards(true), 1000);

        // 숫자 카운트 애니메이션
        const expInterval = setInterval(() => {
            setAnimatedExp((prev) => {
                if (prev >= rewards.exp) {
                    clearInterval(expInterval);
                    return rewards.exp;
                }
                return prev + Math.ceil(rewards.exp / 30);
            });
        }, 50);

        const tokenInterval = setInterval(() => {
            setAnimatedTokens((prev) => {
                if (prev >= rewards.tokens) {
                    clearInterval(tokenInterval);
                    return rewards.tokens;
                }
                return prev + Math.ceil(rewards.tokens / 30);
            });
        }, 50);

        return () => {
            clearInterval(expInterval);
            clearInterval(tokenInterval);
        };
    }, [rewards]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="max-w-2xl w-full mx-4">
                {/* 승패 결과 */}
                <div
                    className={`text-center mb-8 transition-all duration-700 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
                        }`}
                >
                    <h1
                        className={`text-7xl font-bold mb-4 ${isVictory
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse-glow'
                            : 'text-red-500'
                            }`}
                    >
                        {isVictory ? '🏆 승리!' : '💔 패배'}
                    </h1>
                    <p className="text-2xl text-gray-300">
                        {playerWins} : {aiWins}
                    </p>
                </div>

                {/* 보상 카드 */}
                <UiCard
                    variant="gradient"
                    className={`transition-all duration-700 delay-300 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {isVictory ? '🎁 획득 보상' : '📊 전투 결과'}
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* 경험치 */}
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">경험치</span>
                                <span className="text-2xl">⭐</span>
                            </div>
                            <div className="text-4xl font-bold text-blue-400 animate-scaleIn">
                                +{animatedExp}
                            </div>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                    style={{ width: `${(animatedExp / rewards.exp) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* 토큰 */}
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">토큰</span>
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="text-4xl font-bold text-yellow-400 animate-scaleIn">
                                +{animatedTokens}
                            </div>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                                    style={{ width: `${(animatedTokens / rewards.tokens) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 추가 보상 */}
                    {rewards.cards && rewards.cards > 0 && (
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30 mb-6 animate-slideUp">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-gray-400">보너스 카드</span>
                                    <div className="text-3xl font-bold text-purple-400">
                                        +{rewards.cards}장
                                    </div>
                                </div>
                                <span className="text-5xl">🎴</span>
                            </div>
                        </div>
                    )}

                    {/* 버튼 */}
                    <div className="flex gap-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onClose}
                            className="flex-1"
                        >
                            확인
                        </Button>
                    </div>
                </UiCard>

                {/* 승리 시 축하 효과 */}
                {isVictory && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 text-6xl animate-float">✨</div>
                        <div className="absolute top-1/3 right-1/4 text-6xl animate-float delay-100">🌟</div>
                        <div className="absolute bottom-1/3 left-1/3 text-6xl animate-float delay-200">⭐</div>
                        <div className="absolute bottom-1/4 right-1/3 text-6xl animate-float delay-300">💫</div>
                    </div>
                )}
            </div>
        </div>
    );
}
