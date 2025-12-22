'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import {
    getAllChapters,
    isChapterUnlocked,
    isChapterCompleted,
    checkChapterMissions,
    claimChapterRewards,
    getStoryProgress,
    Chapter
} from '@/lib/story-utils';
import { getGameState } from '@/lib/game-state';
import { cn } from '@/lib/utils';

export default function StoryPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        loadStoryData();
    }, []);

    const loadStoryData = () => {
        const allChapters = getAllChapters();
        setChapters(allChapters);
        setProgress(getStoryProgress());
        allChapters.forEach(chapter => {
            checkChapterMissions(chapter.id);
        });
    };

    const handleClaimRewards = (chapterId: string) => {
        const result = claimChapterRewards(chapterId);
        if (result.success) {
            let message = result.message;
            if (result.rewards) {
                message += `\n\n💰 ${result.rewards.tokens} 토큰`;
                if (result.rewards.cards && result.rewards.cards.length > 0) {
                    message += `\n🎴 카드 ${result.rewards.cards.length}장`;
                }
            }
            alert(message);
            loadStoryData();
        } else {
            alert(result.message);
        }
    };

    return (
        <CyberPageLayout
            title="NEURAL_CHRONICLE"
            subtitle="Story Archive"
            description="AI 전쟁의 역사를 경험하고 특별한 보상을 획득하세요. 미션을 완료하면 보상이 해금됩니다."
            color="cyan"
        >
            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6 mb-8"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono text-white/60 uppercase tracking-widest">OVERALL_PROGRESS</span>
                    <span className="text-2xl font-black orbitron text-cyan-400">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    />
                </div>
            </motion.div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chapters.map((chapter, index) => {
                    const unlocked = isChapterUnlocked(chapter.id);
                    const completed = isChapterCompleted(chapter.id);
                    const state = getGameState();
                    const completedMissions = chapter.missions.filter(m =>
                        state.storyProgress.completedMissions.includes(m.id)
                    ).length;

                    return (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={unlocked ? `/story/${chapter.id}` : '#'}>
                                <div className={cn(
                                    "bg-white/5 border rounded-xl p-6 transition-all cursor-pointer group",
                                    completed ? "border-green-500/30 hover:border-green-500/50" :
                                        unlocked ? "border-white/10 hover:border-cyan-500/30" :
                                            "border-white/5 opacity-50 cursor-not-allowed"
                                )}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "text-4xl font-black orbitron",
                                            chapter.number === 1 ? "text-green-400" :
                                                chapter.number === 2 ? "text-cyan-400" : "text-red-400"
                                        )}>
                                            CH.{String(chapter.number).padStart(2, '0')}
                                        </div>
                                        <div className="text-2xl">
                                            {!unlocked && '🔒'}
                                            {unlocked && !completed && '⭕'}
                                            {completed && '✅'}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                        {chapter.title}
                                    </h3>
                                    <p className="text-sm text-white/40 mb-4 line-clamp-2">{chapter.subtitle}</p>

                                    {/* Mission Progress */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase mb-2">
                                            <span>MISSIONS</span>
                                            <span>{completedMissions}/{chapter.missions.length}</span>
                                        </div>
                                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                style={{ width: `${(completedMissions / chapter.missions.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-amber-400">
                                            💰 {chapter.rewards.tokens}
                                        </span>
                                        {chapter.rewards.cards && (
                                            <span className="flex items-center gap-1 text-blue-400">
                                                🎴 {chapter.rewards.cards.reduce((sum, c) => sum + c.count, 0)}
                                            </span>
                                        )}
                                        {chapter.rewards.title && (
                                            <span className="flex items-center gap-1 text-purple-400">🏆</span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="mt-4 text-[10px] font-mono uppercase tracking-widest">
                                        {!unlocked && <span className="text-white/30">LOCKED</span>}
                                        {unlocked && !completed && <span className="text-cyan-400">AVAILABLE</span>}
                                        {completed && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClaimRewards(chapter.id);
                                                }}
                                                className="text-green-400 hover:text-green-300"
                                            >
                                                CLAIM_REWARDS →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </CyberPageLayout>
    );
}
