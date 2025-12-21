'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPvPStats } from '@/lib/pvp-utils';
import { PvPPlayer } from '@/lib/pvp-types';
import botData from '@/data/pvp-bots.json';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';

export default function LeaderboardPage() {
    const router = useRouter();
    const [ranking, setRanking] = useState<PvPPlayer[]>([]);
    const [userRank, setUserRank] = useState<number>(0);

    useEffect(() => {
        // 1. 봇 데이터 가져오기
        let allPlayers = [...botData.bots] as any[];

        // 2. 유저 데이터 가져오기 (가상의 PvPPlayer 객체 생성)
        const userStats = getPvPStats();
        const userPlayer = {
            id: 'user',
            name: 'ME', // 실제 닉네임 로드 필요
            level: 10, // 실제 레벨 로드 필요
            rating: userStats.currentRating,
            totalPower: 0, // 표시 안함
            selectedCards: [],
            isUser: true // 유저 식별용 플래그
        };

        // 3. 합치고 정렬 (Rating 내림차순)
        allPlayers.push(userPlayer);
        allPlayers.sort((a, b) => b.rating - a.rating);

        setRanking(allPlayers);

        // 유저 순위 찾기
        const rank = allPlayers.findIndex(p => p.id === 'user') + 1;
        setUserRank(rank);

    }, []);

    const getTierColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-white';
    };

    return (
        <div className="h-full max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="text-2xl" onClick={() => router.back()}>
                    ←
                </Button>
                <h1 className="text-3xl font-bold text-gradient">
                    🏆 랭킹 리더보드
                </h1>
            </div>

            <div className="space-y-4 animate-slide-up">
                {/* 1~10위까지만 표시 */}
                {ranking.slice(0, 10).map((player: any, index) => {
                    const rank = index + 1;
                    return (
                        <Card
                            key={player.id}
                            className={`flex items-center justify-between p-4 ${player.isUser ? 'border-2 border-green-500 bg-green-500/10' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`text-2xl font-bold w-12 text-center ${getTierColor(rank)}`}>
                                    {rank <= 3 ? ['🥇', '🥈', '🥉'][index] : rank}
                                </div>
                                <div>
                                    <div className={`font-bold ${player.isUser ? 'text-green-400' : ''}`}>
                                        {player.name}
                                    </div>
                                    <div className="text-sm text-gray-400">Lv.{player.level}</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-yellow-400">
                                {player.rating} MMR
                            </div>
                        </Card>
                    );
                })}

                {/* 유저가 10위 밖이라면 하단에 표시 */}
                {userRank > 10 && (
                    <div className="mt-8 pt-4 border-t border-gray-700">
                        <div className="text-center text-gray-400 mb-2">내 순위</div>
                        <Card className="flex items-center justify-between p-4 border-2 border-green-500 bg-green-500/10">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold w-12 text-center text-gray-500">
                                    {userRank}
                                </div>
                                <div>
                                    <div className="font-bold text-green-400">ME</div>
                                    <div className="text-sm text-gray-400">Lv. --</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-yellow-400">
                                {ranking.find((p: any) => p.isUser)?.rating} MMR
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
