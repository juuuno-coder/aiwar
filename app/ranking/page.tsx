'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RankingEntry } from '@/lib/ranking-types';
import {
    loadRankings,
    findMyRank,
    getCurrentSeason,
    getRewardForRank,
    getRankTier,
    getRatingToNextTier
} from '@/lib/ranking-utils';
import { getPvPStats } from '@/lib/pvp-utils';

export default function RankingPage() {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [myRank, setMyRank] = useState<RankingEntry | null>(null);
    const [currentSeason, setCurrentSeason] = useState<any>(null);
    const [pvpStats, setPvpStats] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'top10' | 'top100'>('top100');

    useEffect(() => {
        setCurrentSeason(getCurrentSeason());
        setPvpStats(getPvPStats());

        const rankingData = loadRankings();
        setRankings(rankingData);
        setMyRank(findMyRank(rankingData));
    }, []);

    if (!currentSeason || !pvpStats) {
        return <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-auto flex items-center justify-center text-white">Loading...</div>;
    }

    const filteredRankings = filter === 'top10'
        ? rankings.slice(0, 10)
        : filter === 'top100'
            ? rankings.slice(0, 100)
            : rankings;

    const myTier = getRankTier(pvpStats.currentRating);
    const ratingToNext = getRatingToNextTier(pvpStats.currentRating);
    const myReward = myRank ? getRewardForRank(myRank.rank, currentSeason) : null;

    return (
        <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">🏆 랭킹</h1>
                    <Link href="/" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        메인으로
                    </Link>
                </div>

                {/* 시즌 정보 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{currentSeason.name}</h2>
                            <div className="text-gray-300">
                                {new Date(currentSeason.startDate).toLocaleDateString()} ~ {new Date(currentSeason.endDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${currentSeason.status === 'active' ? 'bg-green-500' :
                            currentSeason.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
                            }`}>
                            <span className="text-white font-bold">
                                {currentSeason.status === 'active' ? '진행 중' :
                                    currentSeason.status === 'upcoming' ? '예정' : '종료'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-8">
                    {/* 내 정보 */}
                    <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">내 정보</h3>
                        {myRank ? (
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-gray-300 text-sm mb-1">순위</div>
                                    <div className="text-3xl font-bold text-yellow-400">#{myRank.rank}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-300 text-sm mb-1">티어</div>
                                    <div className={`text-2xl font-bold ${myTier.color}`}>
                                        {myTier.icon} {myTier.tier}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-300 text-sm mb-1">레이팅</div>
                                    <div className="text-3xl font-bold text-blue-400">{pvpStats.currentRating}</div>
                                    {ratingToNext > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">다음 티어까지 {ratingToNext}</div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-300 text-sm mb-1">승률</div>
                                    <div className="text-3xl font-bold text-green-400">{pvpStats.winRate}%</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-300 py-8">
                                PvP 대전을 시작하여 랭킹에 등록하세요!
                            </div>
                        )}
                    </div>

                    {/* 예상 보상 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">시즌 보상</h3>
                        {myReward ? (
                            <div className="space-y-3">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{myReward.title?.split(' ')[0]}</div>
                                    <div className="text-white font-bold">{myReward.title?.split(' ')[1]}</div>
                                </div>
                                <div className="border-t border-white/20 pt-3">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300">코인</span>
                                        <span className="text-yellow-400 font-bold">+{myReward.coins}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">카드 팩</span>
                                        <span className="text-blue-400 font-bold">+{myReward.cards}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-300 text-sm py-8">
                                상위 100위 안에 들면<br />보상을 받을 수 있습니다!
                            </div>
                        )}
                    </div>
                </div>

                {/* 필터 */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setFilter('top10')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${filter === 'top10'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        TOP 10
                    </button>
                    <button
                        onClick={() => setFilter('top100')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${filter === 'top100'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        TOP 100
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${filter === 'all'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        전체
                    </button>
                </div>

                {/* 랭킹 테이블 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/20">
                            <tr>
                                <th className="px-6 py-4 text-left text-white font-bold">순위</th>
                                <th className="px-6 py-4 text-left text-white font-bold">플레이어</th>
                                <th className="px-6 py-4 text-center text-white font-bold">레벨</th>
                                <th className="px-6 py-4 text-center text-white font-bold">티어</th>
                                <th className="px-6 py-4 text-center text-white font-bold">레이팅</th>
                                <th className="px-6 py-4 text-center text-white font-bold">전적</th>
                                <th className="px-6 py-4 text-center text-white font-bold">승률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRankings.map((entry, index) => {
                                const isMe = entry.playerId === 'player';
                                const tier = getRankTier(entry.rating);
                                const reward = getRewardForRank(entry.rank, currentSeason);

                                return (
                                    <tr
                                        key={entry.playerId}
                                        className={`border-t border-white/10 ${isMe ? 'bg-yellow-500/20 ring-2 ring-yellow-400' :
                                            index % 2 === 0 ? 'bg-white/5' : ''
                                            } hover:bg-white/10 transition-colors`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-2xl font-bold ${entry.rank === 1 ? 'text-yellow-400' :
                                                    entry.rank === 2 ? 'text-gray-300' :
                                                        entry.rank === 3 ? 'text-orange-400' :
                                                            'text-white'
                                                    }`}>
                                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                                </span>
                                                {reward && (
                                                    <span className="text-xs">{reward.title?.split(' ')[0]}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-bold">
                                                {entry.playerName}
                                                {isMe && <span className="ml-2 text-yellow-400">👤</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-yellow-400">Lv.{entry.level}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${tier.color}`}>
                                                {tier.icon}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-blue-400 font-bold">{entry.rating}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-green-400">{entry.wins}</span>
                                            <span className="text-gray-400"> / </span>
                                            <span className="text-red-400">{entry.losses}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${entry.winRate >= 60 ? 'text-green-400' :
                                                entry.winRate >= 50 ? 'text-yellow-400' :
                                                    'text-gray-400'
                                                }`}>
                                                {entry.winRate}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* PvP 바로가기 */}
                <div className="mt-8 text-center">
                    <Link
                        href="/pvp"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xl font-bold transition-all"
                    >
                        PvP 대전 시작하기 ⚔️
                    </Link>
                </div>
            </div>
        </div>
    );
}
