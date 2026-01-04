'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';
// import { EncryptedText } from '@/components/ui/custom/EncryptedText'; // Not used yet

export default function MissionsPage() {
    const { quests, coins, claimQuest, refreshData } = useUser();
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleClaimReward = async (questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return;

        setClaimingId(questId);

        // Slight delay for animation effect
        setTimeout(async () => {
            const success = await claimQuest(questId);
            if (success) {
                // Sound or visual feedback here
            }
            setClaimingId(null);
        }, 600);
    };

    const getMissionIcon = (category: string): string => {
        switch (category) {
            case 'battle': return '⚔️';
            case 'card': return '🎴';
            case 'fusion': return '✨';
            default: return '🎯';
        }
    };

    // Filter for Daily Quests
    const displayQuests = quests.filter(q => q.type === 'daily');

    const completedCount = displayQuests.filter(m => m.completed).length;
    const claimedCount = displayQuests.filter(m => m.claimed).length;
    const unclaimedRewards = displayQuests.filter(m => m.completed && !m.claimed).length;

    return (
        <CyberPageLayout
            title="DAILY_OPERATIONS"
            subtitle="Mission Control"
            description="매일 자정에 새로운 미션이 갱신됩니다. 미션을 완료하고 보상을 획득하세요."
            color="green"
            action={
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
                    <span className="text-2xl">💰</span>
                    <div>
                        <p className="text-[9px] font-mono text-white/40 uppercase">COINS</p>
                        <p className="text-lg font-bold orbitron text-amber-400">{coins.toLocaleString()}</p>
                    </div>
                </div>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'COMPLETED', value: `${completedCount}/${displayQuests.length}`, color: 'text-green-400' },
                    { label: 'CLAIMED', value: `${claimedCount}/${displayQuests.length}`, color: 'text-blue-400' },
                    { label: 'PENDING', value: unclaimedRewards, color: unclaimedRewards > 0 ? 'text-purple-400 animate-pulse' : 'text-white/40' },
                    { label: 'PROGRESS', value: `${Math.round((claimedCount / Math.max(displayQuests.length, 1)) * 100)}%`, color: 'text-cyan-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-sm"
                    >
                        <p className="text-[10px] font-mono text-white/40 mb-1">{stat.label}</p>
                        <p className={cn("text-2xl font-bold orbitron", stat.color)}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8"
            >
                <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase mb-2">
                    <span>DAILY_PROGRESS</span>
                    <span>{Math.round((claimedCount / Math.max(displayQuests.length, 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(claimedCount / Math.max(displayQuests.length, 1)) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                    />
                </div>
            </motion.div>

            {/* Mission List */}
            <div className="space-y-4">
                {displayQuests.map((mission, index) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "relative overflow-hidden rounded-2xl border transition-all duration-300",
                            mission.claimed
                                ? "bg-black/20 border-white/5 opacity-60"
                                : mission.completed
                                    ? "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                    : "bg-black/40 border-white/10 hover:border-white/20"
                        )}
                    >
                        {/* Progress Bar Background */}
                        <div
                            className="absolute inset-0 bg-white/5 origin-left transition-transform duration-1000 ease-out"
                            style={{ transform: `scaleX(${mission.progress / mission.target})` }}
                        />

                        <div className="relative p-6 flex items-center gap-6">
                            {/* Icon */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner",
                                mission.completed ? "bg-green-500/20 text-green-400" : "bg-black/40 text-gray-400"
                            )}>
                                {getMissionIcon(mission.category)}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className={cn(
                                        "text-lg font-bold orbitron",
                                        mission.completed ? "text-white" : "text-gray-300"
                                    )}>
                                        {mission.title}
                                    </h3>
                                    {mission.completed && !mission.claimed && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500 text-black animate-pulse">
                                            COMPLETE
                                        </span>
                                    )}
                                    {mission.claimed && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white/60">
                                            CLAIMED
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 font-mono mb-2">{mission.description}</p>

                                {/* Rewards */}
                                <div className="flex items-center gap-3">
                                    {mission.reward.coins && (
                                        <div className="flex items-center gap-1 text-xs text-amber-400">
                                            <span>💰</span> {mission.reward.coins}
                                        </div>
                                    )}
                                    {mission.reward.cards && (
                                        <div className="flex items-center gap-1 text-xs text-purple-400">
                                            <span>🎴</span> {mission.reward.cards} Cards
                                        </div>
                                    )}
                                    {mission.reward.experience && (
                                        <div className="flex items-center gap-1 text-xs text-blue-400">
                                            <span>⭐</span> {mission.reward.experience} EXP
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                <p className="font-mono text-sm text-white/60">
                                    <span className={cn(
                                        "font-bold",
                                        mission.completed ? "text-green-400" : "text-white"
                                    )}>{mission.progress}</span>
                                    <span className="mx-1">/</span>
                                    <span>{mission.target}</span>
                                </p>

                                {mission.completed && !mission.claimed ? (
                                    <button
                                        onClick={() => handleClaimReward(mission.id)}
                                        disabled={claimingId === mission.id}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-lg transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {claimingId === mission.id ? 'CLAIMING...' : 'CLAIM REWARD'}
                                    </button>
                                ) : (
                                    <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                mission.completed ? "bg-green-500" : "bg-cyan-500"
                                            )}
                                            style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </CyberPageLayout>
    );
}
