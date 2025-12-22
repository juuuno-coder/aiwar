'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/utils';
import { Mission, DailyMissions } from '@/lib/mission-types';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';

// 오늘 날짜 가져오기 (YYYY-MM-DD)
function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 일일 미션 생성
function generateDailyMissions(): Mission[] {
    return [
        {
            id: 'mission-battle-1',
            title: '대전 승리',
            description: '대전에서 3회 승리하세요',
            type: 'battle_win',
            target: 3,
            current: 0,
            reward: { coins: 500 },
            completed: false,
            claimed: false,
        },
        {
            id: 'mission-unit-1',
            title: '유닛 수령',
            description: 'AI 군단에서 유닛 5개를 수령하세요',
            type: 'unit_claim',
            target: 5,
            current: 0,
            reward: { coins: 300, cards: 1 },
            completed: false,
            claimed: false,
        },
        {
            id: 'mission-fusion-1',
            title: '카드 합성',
            description: '카드를 2회 합성하세요',
            type: 'card_fusion',
            target: 2,
            current: 0,
            reward: { coins: 400 },
            completed: false,
            claimed: false,
        },
    ];
}

export default function MissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [userCoins, setUserCoins] = useState(1000);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        const today = getTodayDate();
        const savedMissions = storage.get<DailyMissions>('dailyMissions', { date: '', missions: [] });

        // 날짜가 바뀌었으면 새로운 미션 생성
        if (savedMissions.date !== today) {
            const newMissions = generateDailyMissions();
            const dailyMissions: DailyMissions = {
                date: today,
                missions: newMissions,
            };
            storage.set('dailyMissions', dailyMissions);
            setMissions(newMissions);
        } else {
            setMissions(savedMissions.missions);
        }

        const coins = storage.get<number>('userCoins', 1000);
        setUserCoins(coins);
    }, []);

    const claimReward = (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !mission.completed || mission.claimed) return;

        setClaimingId(missionId);

        setTimeout(() => {
            // 보상 지급
            let newCoins = userCoins;
            if (mission.reward.coins) {
                newCoins += mission.reward.coins;
                setUserCoins(newCoins);
                storage.set('userCoins', newCoins);
            }

            if (mission.reward.cards) {
                // 카드 팩 지급 로직 (추후 구현)
            }

            // 미션 상태 업데이트
            const updatedMissions = missions.map(m =>
                m.id === missionId ? { ...m, claimed: true } : m
            );
            setMissions(updatedMissions);

            const today = getTodayDate();
            storage.set('dailyMissions', { date: today, missions: updatedMissions });

            setClaimingId(null);
        }, 600);
    };

    const getMissionIcon = (type: Mission['type']): string => {
        switch (type) {
            case 'battle_win':
                return '⚔️';
            case 'unit_claim':
                return '🎴';
            case 'card_fusion':
                return '✨';
            case 'faction_win':
                return '🤖';
            default:
                return '🎯';
        }
    };

    const completedCount = missions.filter(m => m.completed).length;
    const claimedCount = missions.filter(m => m.claimed).length;
    const unclaimedRewards = missions.filter(m => m.completed && !m.claimed).length;

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold text-gradient mb-2">
                    📋 일일 미션
                </h1>
                <p className="text-lg text-gray-400">
                    매일 자정에 새로운 미션이 갱신됩니다
                </p>
            </div>

            {/* 상단 통계 */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <Card variant="gradient" className="animate-slide-up delay-100">
                    <p className="text-sm text-gray-400 mb-2">보유 코인</p>
                    <p className="text-3xl font-bold text-yellow-300">💰 {userCoins.toLocaleString()}</p>
                </Card>
                <Card variant="gradient" className="animate-slide-up delay-150">
                    <p className="text-sm text-gray-400 mb-2">완료된 미션</p>
                    <p className="text-3xl font-bold text-green-300">{completedCount} / {missions.length}</p>
                </Card>
                <Card variant="gradient" className="animate-slide-up delay-200">
                    <p className="text-sm text-gray-400 mb-2">수령한 보상</p>
                    <p className="text-3xl font-bold text-blue-300">{claimedCount} / {missions.length}</p>
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
                <h2 className="text-2xl font-bold mb-4">오늘의 진행도</h2>
                <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${(claimedCount / missions.length) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                </div>
                <p className="text-center mt-2 text-gray-400">
                    {Math.round((claimedCount / missions.length) * 100)}% 완료
                </p>
            </Card>

            {/* 미션 목록 */}
            <div className="grid grid-cols-1 gap-4 animate-slide-up delay-400">
                {missions.map((mission, index) => {
                    const progress = (mission.current / mission.target) * 100;
                    const isClaiming = claimingId === mission.id;

                    return (
                        <Card
                            key={mission.id}
                            variant={mission.completed && !mission.claimed ? 'glow' : 'default'}
                            className={`transition-all duration-300 ${mission.completed && !mission.claimed ? 'animate-pulse-glow' : ''
                                } ${mission.claimed ? 'opacity-60' : 'hover:scale-[1.02]'} ${isClaiming ? 'scale-105 shadow-lg shadow-purple-500/50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* 아이콘 */}
                                <div className={`text-5xl transition-all ${mission.completed ? 'animate-bounce-in' : ''}`}>
                                    {getMissionIcon(mission.type)}
                                </div>

                                {/* 미션 정보 */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-white">
                                            {mission.title}
                                        </h3>
                                        {mission.claimed && (
                                            <span className="text-green-400 text-sm bg-green-500/20 px-2 py-1 rounded-full">
                                                ✓ 완료
                                            </span>
                                        )}
                                        {mission.completed && !mission.claimed && (
                                            <span className="text-yellow-400 text-sm bg-yellow-500/20 px-2 py-1 rounded-full animate-pulse">
                                                ! 보상 대기
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">
                                        {mission.description}
                                    </p>

                                    {/* 진행도 바 */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400">진행도</span>
                                            <span className="text-xs font-bold text-white">
                                                {mission.current}/{mission.target}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${mission.completed
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                    } ${mission.completed ? 'animate-shimmer' : ''}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* 보상 */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-gray-400">보상:</span>
                                        {mission.reward.coins && (
                                            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
                                                <span>💰</span>
                                                <span className="font-bold text-yellow-400">{mission.reward.coins}</span>
                                            </div>
                                        )}
                                        {mission.reward.cards && (
                                            <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded">
                                                <span>🎴</span>
                                                <span className="font-bold text-blue-400">{mission.reward.cards}장</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 보상 수령 버튼 */}
                                <div className="flex items-center">
                                    {mission.claimed ? (
                                        <div className="text-green-400 font-bold text-sm bg-green-500/20 px-4 py-2 rounded-lg">
                                            수령 완료
                                        </div>
                                    ) : mission.completed ? (
                                        <Button
                                            color="primary"
                                            onClick={() => claimReward(mission.id)}
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
                <h3 className="text-lg font-bold mb-2 text-white">💡 미션 팁</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 미션은 매일 자정(00:00)에 초기화됩니다</li>
                    <li>• 미션을 완료하면 즉시 보상을 받을 수 있습니다</li>
                    <li>• 모든 미션을 완료하면 추가 보너스를 받을 수 있습니다 (추후 추가)</li>
                    <li>• 게임을 플레이하면서 자연스럽게 미션이 달성됩니다</li>
                </ul>
            </Card>
        </div>
    );
}
