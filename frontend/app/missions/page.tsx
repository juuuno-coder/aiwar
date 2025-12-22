'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { storage } from '@/lib/utils';
import { Mission, DailyMissions } from '@/lib/mission-types';
import { cn } from '@/lib/utils';

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

function generateDailyMissions(): Mission[] {
    return [
        { id: 'mission-battle-1', title: 'BATTLE_VICTORY', description: '대전에서 3회 승리하세요', type: 'battle_win', target: 3, current: 0, reward: { coins: 500 }, completed: false, claimed: false },
        { id: 'mission-unit-1', title: 'UNIT_CLAIM', description: 'AI 군단에서 유닛 5개를 수령하세요', type: 'unit_claim', target: 5, current: 0, reward: { coins: 300, cards: 1 }, completed: false, claimed: false },
        { id: 'mission-fusion-1', title: 'CARD_FUSION', description: '카드를 2회 합성하세요', type: 'card_fusion', target: 2, current: 0, reward: { coins: 400 }, completed: false, claimed: false },
    ];
}

export default function MissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [userCoins, setUserCoins] = useState(1000);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        const today = getTodayDate();
        const savedMissions = storage.get<DailyMissions>('dailyMissions', { date: '', missions: [] });
        if (savedMissions.date !== today) {
            const newMissions = generateDailyMissions();
            storage.set('dailyMissions', { date: today, missions: newMissions });
            setMissions(newMissions);
        } else {
            setMissions(savedMissions.missions);
        }
        setUserCoins(storage.get<number>('userCoins', 1000));
    }, []);

    const claimReward = (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !mission.completed || mission.claimed) return;
        setClaimingId(missionId);
        setTimeout(() => {
            let newCoins = userCoins;
            if (mission.reward.coins) {
                newCoins += mission.reward.coins;
                setUserCoins(newCoins);
                storage.set('userCoins', newCoins);
            }
            const updatedMissions = missions.map(m => m.id === missionId ? { ...m, claimed: true } : m);
            setMissions(updatedMissions);
            storage.set('dailyMissions', { date: getTodayDate(), missions: updatedMissions });
            setClaimingId(null);
        }, 600);
    };

    const getMissionIcon = (type: Mission['type']): string => {
        switch (type) {
            case 'battle_win': return '⚔️';
            case 'unit_claim': return '🎴';
            case 'card_fusion': return '✨';
            default: return '🎯';
        }
    };

    const completedCount = missions.filter(m => m.completed).length;
    const claimedCount = missions.filter(m => m.claimed).length;
    const unclaimedRewards = missions.filter(m => m.completed && !m.claimed).length;

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
                        <p className="text-lg font-bold orbitron text-amber-400">{userCoins.toLocaleString()}</p>
                    </div>
                </div>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'COMPLETED', value: `${completedCount}/${missions.length}`, color: 'text-green-400' },
                    { label: 'CLAIMED', value: `${claimedCount}/${missions.length}`, color: 'text-blue-400' },
                    { label: 'PENDING', value: unclaimedRewards, color: unclaimedRewards > 0 ? 'text-purple-400 animate-pulse' : 'text-white/40' },
                    { label: 'PROGRESS', value: `${Math.round((claimedCount / Math.max(missions.length, 1)) * 100)}%`, color: 'text-cyan-400' },
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
                    <span>DAILY_PROGRESS</span>
                    <span>{Math.round((claimedCount / Math.max(missions.length, 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(claimedCount / Math.max(missions.length, 1)) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                    />
                </div>
            </motion.div>

            {/* Missions List */}
            <div className="space-y-4">
                {missions.map((mission, i) => {
                    const progress = (mission.current / mission.target) * 100;
                    const isClaiming = claimingId === mission.id;

                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={cn(
                                "bg-white/5 border rounded-xl p-5 transition-all",
                                mission.completed && !mission.claimed ? "border-green-500/30" : "border-white/10",
                                mission.claimed && "opacity-60"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{getMissionIcon(mission.type)}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold orbitron text-white">{mission.title}</h3>
                                        {mission.claimed && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono">CLAIMED</span>}
                                        {mission.completed && !mission.claimed && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono animate-pulse">PENDING</span>}
                                    </div>
                                    <p className="text-sm text-white/40 mb-3">{mission.description}</p>

                                    {/* Progress */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
                                            <span>PROGRESS</span>
                                            <span>{mission.current}/{mission.target}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all",
                                                    mission.completed ? "bg-green-500" : "bg-gradient-to-r from-cyan-500 to-purple-500"
                                                )}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-white/40 font-mono text-[10px]">REWARD:</span>
                                        {mission.reward.coins && <span className="text-amber-400">💰 {mission.reward.coins}</span>}
                                        {mission.reward.cards && <span className="text-blue-400">🎴 {mission.reward.cards}</span>}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div>
                                    {mission.claimed ? (
                                        <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded text-[10px] font-mono uppercase">DONE</span>
                                    ) : mission.completed ? (
                                        <button
                                            onClick={() => claimReward(mission.id)}
                                            disabled={isClaiming}
                                            className={cn(
                                                "px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-green-500/30 transition-all",
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
