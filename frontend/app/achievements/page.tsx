'use client';

import { useState, useEffect } from 'react';
import { initializeAchievements, claimAchievementReward } from '@/lib/achievement-utils';
import { Achievement } from '@/lib/achievement-types';
import { storage } from '@/lib/utils';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userCoins, setUserCoins] = useState(1000);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        const data = initializeAchievements();
        setAchievements(data.achievements);

        const coins = storage.get<number>('userCoins', 1000);
        setUserCoins(coins);
    }, []);

    const handleClaimReward = (achievementId: string) => {
        setClaimingId(achievementId);

        setTimeout(() => {
            const success = claimAchievementReward(achievementId);

            if (success) {
                const data = initializeAchievements();
                setAchievements(data.achievements);

                const coins = storage.get<number>('userCoins', 1000);
                setUserCoins(coins);

                const achievement = achievements.find(a => a.id === achievementId);
                if (achievement?.reward.coins) {
                    // Success feedback handled by animation
                }
            }
            setClaimingId(null);
        }, 600);
    };

    const completedCount = achievements.filter(a => a.completed).length;
    const claimedCount = achievements.filter(a => a.claimed).length;
    const unclaimedRewards = achievements.filter(a => a.completed && !a.claimed).length;

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold text-gradient mb-2">
                    🏆 업적
                </h1>
                <p className="text-lg text-gray-400">
                    목표를 달성하고 보상을 받으세요
                </p>
            </div>

            {/* 상단 통계 */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <Card variant="gradient" className="animate-slide-up delay-100">
                    <p className="text-sm text-gray-400 mb-2">보유 코인</p>
                    <p className="text-3xl font-bold text-yellow-300">💰 {userCoins.toLocaleString()}</p>
                </Card>
                <Card variant="gradient" className="animate-slide-up delay-150">
                    <p className="text-sm text-gray-400 mb-2">완료된 업적</p>
                    <p className="text-3xl font-bold text-green-300">{completedCount} / {achievements.length}</p>
                </Card>
                <Card variant="gradient" className="animate-slide-up delay-200">
                    <p className="text-sm text-gray-400 mb-2">수령한 보상</p>
                    <p className="text-3xl font-bold text-blue-300">{claimedCount} / {achievements.length}</p>
                </Card>
                <Card variant="gradient" className="animate-slide-up delay-250">
                    <p className="text-sm text-gray-400 mb-2">미수령 보상</p>
                    <p className={`text-3xl font-bold ${unclaimedRewards > 0 ? 'text-purple-400 animate-pulse-glow' : 'text-gray-500'}`}>
                        {unclaimedRewards}개
                    </p>
                </Card>
            </div>

            {/* 전체 진행도 */}
            <Card variant="glow" className="mb-8 animate-slide-up delay-300">
                <h2 className="text-2xl font-bold mb-4">전체 진행도</h2>
                <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${(completedCount / achievements.length) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                </div>
                <p className="text-center mt-2 text-gray-400">
                    {Math.round((completedCount / achievements.length) * 100)}% 완료
                </p>
            </Card>

            {/* 업적 목록 */}
            <div className="grid grid-cols-1 gap-4 animate-slide-up delay-400">
                {achievements.map((achievement, index) => {
                    const progress = (achievement.current / achievement.target) * 100;
                    const isClaiming = claimingId === achievement.id;

                    return (
                        <Card
                            key={achievement.id}
                            variant={achievement.completed && !achievement.claimed ? 'glow' : 'default'}
                            className={`transition-all duration-300 ${achievement.completed && !achievement.claimed ? 'animate-pulse-glow' : ''
                                } ${achievement.claimed ? 'opacity-60' : 'hover:scale-[1.02]'} ${isClaiming ? 'scale-105 shadow-lg shadow-purple-500/50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* 아이콘 */}
                                <div className={`text-5xl transition-all ${achievement.completed ? 'animate-bounce-in' : ''}`}>
                                    {achievement.icon}
                                </div>

                                {/* 업적 정보 */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-white">
                                            {achievement.title}
                                        </h3>
                                        {achievement.claimed && (
                                            <span className="text-green-400 text-sm bg-green-500/20 px-2 py-1 rounded-full">
                                                ✓ 완료
                                            </span>
                                        )}
                                        {achievement.completed && !achievement.claimed && (
                                            <span className="text-yellow-400 text-sm bg-yellow-500/20 px-2 py-1 rounded-full animate-pulse">
                                                ! 보상 대기
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">
                                        {achievement.description}
                                    </p>

                                    {/* 진행도 바 */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400">진행도</span>
                                            <span className="text-xs font-bold text-white">
                                                {achievement.current}/{achievement.target}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${achievement.completed
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                    } ${achievement.completed ? 'animate-shimmer' : ''}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* 보상 */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-gray-400">보상:</span>
                                        {achievement.reward.coins && (
                                            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
                                                <span>💰</span>
                                                <span className="font-bold text-yellow-400">{achievement.reward.coins}</span>
                                            </div>
                                        )}
                                        {achievement.reward.title && (
                                            <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded">
                                                <span>🏅</span>
                                                <span className="font-bold text-purple-400">{achievement.reward.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 보상 수령 버튼 */}
                                <div className="flex items-center">
                                    {achievement.claimed ? (
                                        <div className="text-green-400 font-bold text-sm bg-green-500/20 px-4 py-2 rounded-lg">
                                            수령 완료
                                        </div>
                                    ) : achievement.completed ? (
                                        <Button
                                            variant="primary"
                                            onClick={() => handleClaimReward(achievement.id)}
                                            disabled={isClaiming}
                                            className={isClaiming ? 'animate-pulse' : ''}
                                        >
                                            {isClaiming ? '수령 중...' : '보상 받기'}
                                        </Button>
                                    ) : (
                                        <div className="text-gray-500 text-sm bg-gray-800/50 px-4 py-2 rounded-lg">
                                            진행 중
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* 안내 메시지 */}
            <Card className="mt-8 bg-gray-800/50">
                <h3 className="text-lg font-bold mb-2 text-white">💡 업적 팁</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 업적을 완료하면 즉시 보상을 받을 수 있습니다</li>
                    <li>• 일부 업적은 특별한 칭호를 제공합니다</li>
                    <li>• 게임을 플레이하면서 자연스럽게 업적이 달성됩니다</li>
                    <li>• 카테고리별로 필터링하여 원하는 업적을 쉽게 찾을 수 있습니다</li>
                </ul>
            </Card>
        </div>
    );
}
