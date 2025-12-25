'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { RankingEntry } from '@/lib/ranking-types';
import { loadRankings, findMyRank, getCurrentSeason, getRewardForRank, getRankTier, getRatingToNextTier } from '@/lib/ranking-utils';
import { getPvPStats } from '@/lib/pvp-utils';
import { cn } from '@/lib/utils';

export default function RankingPage() {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [myRank, setMyRank] = useState<RankingEntry | null>(null);
    const [currentSeason, setCurrentSeason] = useState<any>(null);
    const [pvpStats, setPvpStats] = useState<any>(null);
    const [filter, setFilter] = useState<'top10' | 'top100' | 'all'>('top100');

    useEffect(() => {
        setCurrentSeason(getCurrentSeason());
        setPvpStats(getPvPStats());
        const rankingData = loadRankings();
        setRankings(rankingData);
        setMyRank(findMyRank(rankingData));
    }, []);

    if (!currentSeason || !pvpStats) {
        return (
            <CyberPageLayout title="글로벌 랭킹" englishTitle="GLOBAL LEADERBOARD" description="로딩 중..." color="pink">
                <div className="text-center py-20 text-white/30 font-mono">LOADING_DATA...</div>
            </CyberPageLayout>
        );
    }

    const filteredRankings = filter === 'top10' ? rankings.slice(0, 10) : filter === 'top100' ? rankings.slice(0, 100) : rankings;
    const myTier = getRankTier(pvpStats.currentRating);
    const ratingToNext = getRatingToNextTier(pvpStats.currentRating);

    return (
        <CyberPageLayout
            title="글로벌 랭킹"
            englishTitle="GLOBAL LEADERBOARD"
            description="시즌 랭킹을 확인하고 상위 랭커들과 경쟁하세요. 시즌 종료 시 순위에 따라 보상이 지급됩니다."
            color="pink"
        >
            {/* Season Info */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold orbitron text-white">{currentSeason.name}</h2>
                        <p className="text-sm text-white/40 font-mono">{new Date(currentSeason.startDate).toLocaleDateString()} ~ {new Date(currentSeason.endDate).toLocaleDateString()}</p>
                    </div>
                    <span className={cn("px-3 py-1 rounded text-[10px] font-mono uppercase", currentSeason.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40")}>
                        {currentSeason.status === 'active' ? 'ACTIVE' : currentSeason.status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
                    </span>
                </div>
            </motion.div>

            {/* My Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'MY_RANK', value: myRank ? `#${myRank.rank}` : 'N/A', color: 'text-amber-400' },
                    { label: 'TIER', value: `${myTier.icon} ${myTier.tier}`, color: myTier.color },
                    { label: 'RATING', value: pvpStats.currentRating, color: 'text-cyan-400' },
                    { label: 'WIN_RATE', value: `${pvpStats.winRate}%`, color: 'text-green-400' }
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className={cn("text-2xl font-black orbitron", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['top10', 'top100', 'all'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded text-[10px] font-mono uppercase tracking-widest transition-all", filter === f ? "bg-pink-500/20 border border-pink-500/50 text-pink-400" : "bg-white/5 border border-white/10 text-white/40 hover:border-white/20")}>
                        {f === 'top10' ? 'TOP_10' : f === 'top100' ? 'TOP_100' : 'ALL'}
                    </button>
                ))}
            </div>

            {/* Ranking Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            {['RANK', 'PLAYER', 'LEVEL', 'TIER', 'RATING', 'RECORD', 'WIN_RATE'].map(h => (
                                <th key={h} className="px-4 py-3 text-[10px] font-mono text-white/40 uppercase tracking-widest text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRankings.map((entry, i) => {
                            const isMe = entry.playerId === 'player';
                            const tier = getRankTier(entry.rating);
                            return (
                                <tr key={entry.playerId} className={cn("border-t border-white/5 transition-colors hover:bg-white/5", isMe && "bg-pink-500/10")}>
                                    <td className="px-4 py-3"><span className={cn("font-bold", entry.rank <= 3 ? "text-amber-400" : "text-white")}>{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}</span></td>
                                    <td className="px-4 py-3 text-white font-medium">{entry.playerName} {isMe && <span className="text-pink-400 ml-1">👤</span>}</td>
                                    <td className="px-4 py-3 text-amber-400">LV.{entry.level}</td>
                                    <td className="px-4 py-3"><span className={tier.color}>{tier.icon}</span></td>
                                    <td className="px-4 py-3 text-cyan-400 font-bold">{entry.rating}</td>
                                    <td className="px-4 py-3"><span className="text-green-400">{entry.wins}</span><span className="text-white/20">/</span><span className="text-red-400">{entry.losses}</span></td>
                                    <td className="px-4 py-3"><span className={cn("font-bold", entry.winRate >= 60 ? "text-green-400" : entry.winRate >= 50 ? "text-amber-400" : "text-white/40")}>{entry.winRate}%</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* PvP CTA */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
                <Link href="/pvp" className="inline-block px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-bold orbitron hover:opacity-90 transition-all">
                    START_PVP ⚔️
                </Link>
            </motion.div>
        </CyberPageLayout>
    );
}
