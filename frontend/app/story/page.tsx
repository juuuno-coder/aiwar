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
            alert(`🔒 [${season.title}] 시즌은 ${season.openDate}에 오픈됩니다.`);
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
            // 상태 갱신 로직 (간단히 현재 상태에서 완료 처리된 것처럼 보이게 하거나 리로드)
            // 여기서는 전체 리로드 대신 알림만 띄움
        } else {
            alert(result.message);
        }
    };

    if (loading) return null;

    return (
        <CyberPageLayout
            title={selectedSeason ? selectedSeason.title : "스토리 모드"}
            englishTitle={selectedSeason ? `SEASON ${selectedSeason.number}` : "CAMPAIGN SEASONS"}
            description={selectedSeason ? selectedSeason.description : "인류와 AI의 거대한 전쟁, 그 서막을 여는 이야기"}
            backPath={selectedSeason ? undefined : "/main"} // 시즌 선택 화면에서만 메인으로 이동
            onBack={selectedSeason ? handleBackToSeasons : undefined} // 시즌 상세에서는 시즌 목록으로 이동
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

                                {/* 콘텐츠 */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                    {/* 상단 뱃지 */}
                                    <div className="flex justify-between items-start">
                                        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold font-mono text-white/70">
                                            SEASON {String(season.number).padStart(2, '0')}
                                        </div>
                                        {season.isOpened ? (
                                            <div className="bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/50 text-cyan-400 text-xs font-bold animate-pulse">
                                                Active
                                            </div>
                                        ) : (
                                            <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white/50 text-xs font-bold flex items-center gap-1">
                                                <Lock size={10} /> Locked
                                            </div>
                                        )}
                                    </div>

                                    {/* 중앙 타이틀 */}
                                    <div className="text-center space-y-4">
                                        <h2 className="text-3xl font-black text-white orbitron tracking-tighter group-hover:text-cyan-400 transition-colors">
                                            {season.title}
                                        </h2>
                                        {!season.isOpened && season.openDate && (
                                            <div className="inline-flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded text-xs text-yellow-500 font-mono border border-yellow-500/30">
                                                <Clock size={12} />
                                                COMING {season.openDate}
                                            </div>
                                        )}
                                    </div>

                                    {/* 하단 설명 */}
                                    <div>
                                        <p className="text-sm text-gray-300 line-clamp-2 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {season.description}
                                        </p>
                                        <button className={cn(
                                            "w-full py-3 rounded-xl font-bold font-mono transition-all flex items-center justify-center gap-2",
                                            season.isOpened
                                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 group-hover:bg-cyan-500 group-hover:text-black"
                                                : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                                        )}>
                                            {season.isOpened ? (
                                                <>ENTER SEASON <ChevronLeft className="rotate-180" size={16} /></>
                                            ) : (
                                                <>LOCKED SEASON</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* 2. 시즌 상세 (챕터 리스트) 화면 */}
                {selectedSeason && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="relative"
                    >
                        {/* 챕터 리스트 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {selectedSeason.chapters.map((chapter, index) => {
                                // loadSeasonsWithProgress에서 이미 상태가 계산됨
                                const unlocked = chapter.unlocked;
                                const completed = chapter.completed;

                                return (
                                    <motion.div
                                        key={chapter.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={cn(
                                            "relative bg-white/5 border rounded-2xl p-6 overflow-hidden transition-all group",
                                            unlocked
                                                ? "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                                                : "border-white/5 opacity-50 grayscale"
                                        )}
                                    >
                                        {/* 챕터 번호 배경 */}
                                        <div className="absolute right-0 top-0 text-[100px] font-black text-white/5 orbitron -translate-y-8 translate-x-8 pointer-events-none">
                                            {chapter.number}
                                        </div>

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br",
                                                    unlocked
                                                        ? "from-cyan-900 to-blue-900 text-white shadow-lg shadow-cyan-900/50"
                                                        : "from-gray-800 to-gray-900 text-white/30"
                                                )}>
                                                    {chapter.icon}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-mono text-cyan-400 font-bold mb-0.5">
                                                        CHAPTER {String(chapter.number).padStart(2, '0')}
                                                    </h4>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                        <EncryptedText text={chapter.title} />
                                                    </h3>
                                                </div>
                                            </div>
                                            <div>
                                                {completed && <div className="text-green-500 bg-green-500/10 p-1.5 rounded-full"><Award size={18} /></div>}
                                                {unlocked && !completed && <div className="text-cyan-500 bg-cyan-500/10 p-1.5 rounded-full animate-pulse"><Play size={18} fill="currentColor" /></div>}
                                                {!unlocked && <Lock size={18} className="text-gray-500" />}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-400 mb-6 relative z-10 min-h-[40px]">
                                            {chapter.description}
                                        </p>

                                        {/* 미션 목록 (간략히) */}
                                        <div className="space-y-2 mb-6">
                                            {chapter.tasks.slice(0, 3).map(task => (
                                                <div key={task.id} className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        task.completed ? "bg-green-500" : "bg-gray-700"
                                                    )} />
                                                    <span className={cn(task.completed && "text-gray-400 line-through")}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div className="flex items-center gap-3 mt-auto">
                                            {unlocked ? (
                                                <Link href={`/story/${chapter.id}`} className="flex-1">
                                                    <Button
                                                        variant="flat"
                                                        className="w-full bg-white/5 hover:bg-cyan-500/20 border-white/10 hover:border-cyan-500/50"
                                                    >
                                                        {completed ? "REPLAY MISSION" : "START MISSION"}
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button disabled variant="outline" className="w-full opacity-50">
                                                    LOCKED
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CyberPageLayout>
    );
}
