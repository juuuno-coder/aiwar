'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { initializeAchievements, claimAchievementReward } from '@/lib/achievement-utils';
import { Achievement } from '@/lib/achievement-types';
import { storage } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userCoins, setUserCoins] = useState(1000);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        const data = initializeAchievements();
        setAchievements(data.achievements);
        setUserCoins(storage.get<number>('userCoins', 1000));
    }, []);

    const handleClaimReward = (achievementId: string) => {
        setClaimingId(achievementId);
        setTimeout(() => {
            const success = claimAchievementReward(achievementId);
            if (success) {
                const data = initializeAchievements();
                setAchievements(data.achievements);
                setUserCoins(storage.get<number>('userCoins', 1000));
            }
            setClaimingId(null);
        }, 600);
    };

    const completedCount = achievements.filter(a => a.completed).length;
    const claimedCount = achievements.filter(a => a.claimed).length;
    const unclaimedRewards = achievements.filter(a => a.completed && !a.claimed).length;

    return (
        <CyberPageLayout
            title="ACHIEVEMENT_LOG"
            subtitle="Honor System"
            description="다양한 목표를 달성하고 보상과 칭호를 획득하세요. 달성한 업적은 영구적으로 기록됩니다."
            color="amber"
            action={
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
                    <span className="text-2xl">💰</span>
                    <div>
                        <p className="text-[9px] font-mono text-white/40 uppercase">COINS</p>
                        <p className="text-lg font-bold orbitron text-amber-400">{userCoins.toLocaleString()}</p>
                    </div>
                </div>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'TOTAL', value: achievements.length, color: 'text-white' },
                    { label: 'COMPLETED', value: completedCount, color: 'text-green-400' },
                    { label: 'CLAIMED', value: claimedCount, color: 'text-blue-400' },
                    { label: 'PENDING', value: unclaimedRewards, color: unclaimedRewards > 0 ? 'text-purple-400 animate-pulse' : 'text-white/40' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                    >
                        <p className={cn("text-2xl font-black orbitron", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
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
                    <span>OVERALL_PROGRESS</span>
                    <span>{Math.round((completedCount / Math.max(achievements.length, 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / Math.max(achievements.length, 1)) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                </div>
            </motion.div>

            {/* Achievements List */}
            <div className="space-y-4">
                {achievements.map((achievement, i) => {
                    const progress = (achievement.current / achievement.target) * 100;
                    const isClaiming = claimingId === achievement.id;

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={cn(
                                "bg-white/5 border rounded-xl p-5 transition-all",
                                achievement.completed && !achievement.claimed ? "border-amber-500/30" : "border-white/10",
                                achievement.claimed && "opacity-60"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{achievement.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold orbitron text-white">{achievement.title}</h3>
                                        {achievement.claimed && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono">CLAIMED</span>}
                                        {achievement.completed && !achievement.claimed && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono animate-pulse">PENDING</span>}
                                    </div>
                                    <p className="text-sm text-white/40 mb-3">{achievement.description}</p>

                                    {/* Progress */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
                                            <span>PROGRESS</span>
                                            <span>{achievement.current}/{achievement.target}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all",
                                                    achievement.completed ? "bg-amber-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                                                )}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-white/40 font-mono text-[10px]">REWARD:</span>
                                        {achievement.reward.coins && <span className="text-amber-400">💰 {achievement.reward.coins}</span>}
                                        {achievement.reward.title && <span className="text-purple-400">🏅 {achievement.reward.title}</span>}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div>
                                    {achievement.claimed ? (
                                        <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded text-[10px] font-mono uppercase">DONE</span>
                                    ) : achievement.completed ? (
                                        <button
                                            onClick={() => handleClaimReward(achievement.id)}
                                            disabled={isClaiming}
                                            className={cn(
                                                "px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-amber-500/30 transition-all",
                                                isClaiming && "animate-pulse"
                                            )}
                                        >
                                            {isClaiming ? 'CLAIMING...' : 'CLAIM'}
                                        </button>
                                    ) : (
                                        <span className="px-4 py-2 bg-white/5 text-white/30 rounded text-[10px] font-mono uppercase">IN_PROGRESS</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </CyberPageLayout>
    );
}
