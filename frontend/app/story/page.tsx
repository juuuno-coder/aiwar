'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import Link from 'next/link';
import { EncryptedText } from '@/components/ui/custom/EncryptedText';
import { Button } from '@/components/ui/custom/Button';
import {
    Clock,
    Lock,
    Play,
    ChevronLeft,
    BookOpen,
    Award,
    Star
} from 'lucide-react';
import { loadSeasonsWithProgress, claimSeasonReward, Season, Chapter } from '@/lib/story-system';
import { cn } from '@/lib/utils';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';

export default function StoryPage() {
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 데이터 로드
        const loadedSeasons = loadSeasonsWithProgress();
        setSeasons(loadedSeasons);
        setLoading(false);
    }, []);

    const handleSelectSeason = (season: Season) => {
        if (!season.isOpened) {
            // 잠금 효과 (흔들림 등) 또는 알림
            alert(`🔒 [${season.title_ko || season.title}] 시즌은 ${season.openDate}에 오픈됩니다.`);
            return;
        }
        setSelectedSeason(season);
    };

    const handleBackToSeasons = () => {
        setSelectedSeason(null);
    };

    const handleClaimRewards = (chapterId: string) => {
        const result = claimSeasonReward(chapterId);
        if (result.success) {
            alert(`🎉 보상 획득 완료!\n${result.message}`);
        } else {
            alert(result.message);
        }
    };

    if (loading) return null;

    // Use Korean title primarily, English as subtitle in CyberPageLayout
    return (
        <CyberPageLayout
            title={selectedSeason ? (selectedSeason.title_ko || selectedSeason.title) : "스토리 모드"}
            englishTitle={selectedSeason ? selectedSeason.title : "CAMPAIGN SEASONS"}
            description={selectedSeason ? (selectedSeason.description_ko || selectedSeason.description) : "인류와 AI의 거대한 전쟁, 그 서막을 여는 이야기"}
            backPath={selectedSeason ? "/story" : "/main"}
            showBack={true}
        >
            <AnimatePresence mode="wait">
                {/* 1. 시즌 선택 화면 */}
                {!selectedSeason && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8"
                    >
                        {seasons.map((season, index) => (
                            <motion.div
                                key={season.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleSelectSeason(season)}
                                className={cn(
                                    "relative h-[400px] rounded-3xl border overflow-hidden cursor-pointer group transition-all duration-500",
                                    season.isOpened
                                        ? "border-cyan-500/30 hover:border-cyan-500/80 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                                        : "border-white/5 opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                                )}
                            >
                                {/* 배경 이미지 대용 그라디언트 */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-110",
                                    season.number === 1 ? "from-black via-blue-950 to-cyan-900" :
                                        season.number === 2 ? "from-black via-purple-950 to-pink-900" :
                                            "from-black via-red-950 to-orange-900"
                                )} />

                                {/* 오버레이 */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                                {/* 컨텐츠 */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-cyan-400">
                                            SEASON {season.number}
                                        </div>
                                        {season.isOpened ? (
                                            <div className="bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/50 text-xs font-bold text-cyan-300 flex items-center gap-1">
                                                <Play size={10} /> OPEN
                                            </div>
                                        ) : (
                                            <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50 text-xs font-bold text-red-300 flex items-center gap-1">
                                                <Lock size={10} /> LOCKED
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-black text-white mb-2 italic">
                                            {season.title_ko || season.title}
                                        </h3>
                                        <p className="text-white/60 text-sm line-clamp-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-cyan-600">
                                            {season.title}
                                        </p>
                                        <p className="text-gray-300 text-sm line-clamp-3">
                                            {season.description_ko || season.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* 2. 챕터 선택 화면 */}
                {selectedSeason && (
                    <motion.div
                        key="chapter-list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="ghost"
                                className="text-gray-400 hover:text-white p-0 mr-2"
                                onClick={handleBackToSeasons}
                            >
                                <ChevronLeft size={24} />
                            </Button>
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                {selectedSeason.title_ko || selectedSeason.title} <span className="text-sm text-gray-500 font-normal ml-2">CHAPTER SELECT</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {selectedSeason.chapters.map((chapter) => (
                                <div key={chapter.id} className="relative group">
                                    <Link href={chapter.unlocked ? `/story/${chapter.id}` : '#'} className="block">
                                        <div className={cn(
                                            "relative bg-zinc-900/50 border rounded-2xl p-6 transition-all duration-300 flex items-center gap-6 overflow-hidden",
                                            chapter.unlocked
                                                ? "border-white/10 hover:border-cyan-500/50 hover:bg-zinc-800/80 cursor-pointer"
                                                : "border-white/5 opacity-50 cursor-not-allowed"
                                        )}>
                                            {/* 아이콘 */}
                                            <div className="w-16 h-16 rounded-xl bg-black/50 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                                {chapter.icon}
                                            </div>

                                            {/* 텍스트 정보 */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-mono text-cyan-500">CHAPTER {chapter.number}</span>
                                                    {!chapter.unlocked && <Lock size={12} className="text-red-500" />}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                                    {chapter.title_ko || chapter.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {chapter.description_ko || chapter.description}
                                                </p>
                                            </div>

                                            {/* 진행도/보상 버튼 */}
                                            <div className="flex flex-col items-end gap-3 z-10">
                                                {/* 진행률 바 (간략) */}
                                                <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    {/* Mock progress based on completedStages */}
                                                    <div className="h-full bg-cyan-500 w-[0%]" />
                                                </div>

                                                {/* 보상 버튼 (완료 시) */}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={cn(
                                                        "text-xs px-3 h-8",
                                                        chapter.completed ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" : "opacity-0 pointer-events-none"
                                                    )}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleClaimRewards(chapter.id);
                                                    }}
                                                >
                                                    <Award size={14} className="mr-1" /> 보상 받기
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CyberPageLayout>
    );
}
