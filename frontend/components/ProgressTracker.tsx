// 프로그레스 트래커 컴포넌트 - 플레이어 진행도 시각화

'use client';

import { useEffect, useState } from 'react';
import { gameStorage } from '@/lib/game-storage';

interface Milestone {
    level: number;
    label: string;
    reward: string;
}

interface ProgressTrackerProps {
    showMilestones?: boolean;
    compact?: boolean;
}

export default function ProgressTracker({ showMilestones = true, compact = false }: ProgressTrackerProps) {
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(0);
    const [loading, setLoading] = useState(true);

    const milestones: Milestone[] = [
        { level: 5, label: '초보 탈출', reward: '카드팩 1개' },
        { level: 10, label: '숙련자', reward: '희귀 카드 1장' },
        { level: 25, label: '전문가', reward: '영웅 카드 1장' },
        { level: 50, label: '마스터', reward: '신화 카드 1장' },
        { level: 100, label: '전설', reward: '특별 칭호' }
    ];

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        const currentLevel = await gameStorage.getLevel();
        const currentExp = await gameStorage.getExperience();
        setLevel(currentLevel);
        setExperience(currentExp);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-700 h-20 rounded-lg"></div>
        );
    }

    const expNeeded = level * 100;
    const progress = (experience / expNeeded) * 100;
    const nextMilestone = milestones.find(m => m.level > level);

    if (compact) {
        return (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <div>
                            <div className="text-sm font-bold">레벨 {level}</div>
                            <div className="text-xs text-gray-400">
                                {experience} / {expNeeded} EXP
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400">진행률</div>
                        <div className="text-lg font-bold text-blue-400">{progress.toFixed(0)}%</div>
                    </div>
                </div>

                {/* 프로그레스 바 */}
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-6 border border-purple-500/30">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-5xl">⭐</div>
                    <div>
                        <h3 className="text-2xl font-bold">레벨 {level}</h3>
                        <p className="text-sm text-gray-400">
                            {experience} / {expNeeded} EXP
                        </p>
                    </div>
                </div>

                {nextMilestone && (
                    <div className="text-right">
                        <div className="text-xs text-gray-400">다음 마일스톤</div>
                        <div className="text-lg font-bold text-yellow-400">
                            Lv.{nextMilestone.level}
                        </div>
                        <div className="text-xs text-gray-400">{nextMilestone.label}</div>
                    </div>
                )}
            </div>

            {/* 프로그레스 바 */}
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 animate-pulse-slow"
                    style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                    {progress.toFixed(1)}%
                </div>
            </div>

            <div className="text-xs text-gray-400 text-right mb-4">
                다음 레벨까지 {expNeeded - experience} EXP
            </div>

            {/* 마일스톤 */}
            {showMilestones && (
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-300 mb-3">🏆 마일스톤</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {milestones.map((milestone) => {
                            const achieved = level >= milestone.level;
                            return (
                                <div
                                    key={milestone.level}
                                    className={`
                    p-3 rounded-lg border transition-all
                    ${achieved
                                            ? 'bg-green-900/20 border-green-500/50'
                                            : 'bg-gray-800/20 border-gray-700'
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">
                                                {achieved ? '✅' : '🔒'}
                                            </span>
                                            <div>
                                                <div className={`text-sm font-bold ${achieved ? 'text-green-400' : 'text-gray-400'}`}>
                                                    Lv.{milestone.level} - {milestone.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {milestone.reward}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
