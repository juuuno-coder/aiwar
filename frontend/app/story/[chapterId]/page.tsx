'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    loadStoryProgress,
    completeStage,
    claimChapterReward,
    Chapter,
    StoryStage
} from '@/lib/story-system';
import { Button } from "@/components/ui/custom/Button";
import { Modal, ModalBody, ModalHeader, ModalFooter, ModalContent } from "@/components/ui/custom/Modal";
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Swords, Shield, Skull, Lock, CheckCircle2, Trophy, Quote } from "lucide-react";
import { cn } from '@/lib/utils';
import { addNotification } from '@/components/NotificationCenter';
import PageHeader from '@/components/PageHeader';
import { useTranslation } from '@/context/LanguageContext';

export default function ChapterDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { t, language } = useTranslation();
    const chapterId = params.chapterId as string;

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [selectedStage, setSelectedStage] = useState<StoryStage | null>(null);

    // 모달 상태
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'success' | 'intro';
        onConfirm?: () => void;
    }>({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        loadChapter();
    }, [chapterId]);

    const loadChapter = () => {
        const chapters = loadStoryProgress(t);
        const found = chapters.find(c => c.id === chapterId);
        setChapter(found || null);

        // 기본적으로 클리어하지 않은 첫 번째 스테이지 또는 마지막 스테이지 선택
        if (found && !selectedStage) {
            const firstUncleared = found.stages.find(s => !s.isCleared);
            setSelectedStage(firstUncleared || found.stages[found.stages.length - 1]);
        }
    };

    const handleStageSelect = (stage: StoryStage) => {
        // 이전 스테이지 클리어 여부 확인 (1-1은 항상 열림)
        if (stage.step > 1) {
            const prevStage = chapter?.stages.find(s => s.step === stage.step - 1);
            if (prevStage && !prevStage.isCleared) {
                // 잠김 알림
                addNotification({
                    type: 'warning',
                    title: 'LOCKED',
                    message: '이전 스테이지를 먼저 클리어해야 합니다.',
                    icon: '🔒'
                });
                return;
            }
        }
        setSelectedStage(stage);
    };

    // 전투 시작 핸들러
    const handleBattleStart = () => {
        if (!selectedStage) return;

        // 적 대사 모달 띄우기 (스토리 몰입감)
        setModalConfig({
            isOpen: true,
            title: `VS ${selectedStage.enemy.name}`,
            message: selectedStage.enemy.dialogue.intro,
            type: 'intro',
            onConfirm: () => {
                // 실제 전투 페이지로 이동
                router.push(`/battle/stage/${selectedStage.id}`);
            }
        });
    };

    if (!chapter) return null;

    const completedStages = chapter.stages.filter(s => s.isCleared).length;
    const progress = Math.round((completedStages / chapter.stages.length) * 100);

    return (
        <div className="min-h-screen py-12 px-4 lg:px-8 bg-[#050505] relative overflow-hidden flex flex-col">
            <BackgroundBeams className="opacity-40" />

            <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col flex-1">
                {/* 헤더 */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 w-fit text-gray-500 hover:text-white orbitron font-black tracking-widest gap-2 pl-0"
                    onClick={() => router.push('/story')}
                >
                    <ArrowLeft size={16} /> BACK TO SEASONS
                </Button>

                <PageHeader
                    title={`${chapter.title}`}
                    englishTitle={`CHAPTER ${chapter.number}`}
                    description={chapter.description}
                    color="cyan"
                    action={
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CHAPTER PROGRESS</div>
                                <div className="text-2xl font-black text-cyan-400 orbitron">{progress}% COMPLETED</div>
                            </div>
                            <div className="w-12 h-12 bg-cyan-900/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400">
                                {progress === 100 ? <Trophy size={20} /> : <Swords size={20} />}
                            </div>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 flex-1">
                    {/* [LEFT] 스테이지 타임라인 맵 */}
                    <div className="lg:col-span-5 h-full relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-cyan-900/20 to-transparent" />

                        <div className="space-y-6 relative">
                            {chapter.stages.map((stage) => {
                                // 잠금 상태 로직
                                const isUnlocked = stage.step === 1 || chapter.stages[stage.step - 2]?.isCleared;
                                const isSelected = selectedStage?.id === stage.id;

                                return (
                                    <motion.div
                                        key={stage.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: stage.step * 0.05 }}
                                        className={cn(
                                            "relative pl-16 py-2 cursor-pointer group transtion-all",
                                            !isUnlocked && "opacity-50 pointer-events-none grayscale"
                                        )}
                                        onClick={() => handleStageSelect(stage)}
                                    >
                                        {/* 노드 아이콘 */}
                                        <div className={cn(
                                            "absolute left-4 -translate-x-1/2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 z-10 transition-all duration-300",
                                            stage.isCleared ? "bg-cyan-500 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" :
                                                isSelected ? "bg-black border-cyan-400 scale-125" :
                                                    "bg-black border-gray-700"
                                        )}>
                                            {stage.isCleared && <CheckCircle2 size={12} className="text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        </div>

                                        {/* 스테이지 카드 */}
                                        <div className={cn(
                                            "p-4 rounded-xl border transition-all duration-300",
                                            isSelected
                                                ? "bg-cyan-950/30 border-cyan-500/50 translate-x-2"
                                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                        )}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={cn(
                                                    "text-[10px] font-black orbitron tracking-widest",
                                                    isSelected ? "text-cyan-400" : "text-gray-500"
                                                )}>
                                                    STAGE 1-{stage.step}
                                                </span>
                                                <span className={cn(
                                                    "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                                                    stage.difficulty === 'EASY' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        stage.difficulty === 'NORMAL' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                            stage.difficulty === 'HARD' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                                "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                                                )}>
                                                    {stage.difficulty}
                                                </span>
                                            </div>
                                            <h3 className={cn(
                                                "text-sm font-bold transition-colors",
                                                isSelected ? "text-white" : "text-gray-400"
                                            )}>
                                                {stage.title}
                                            </h3>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* [RIGHT] 상세 정보 패널 (VS SCREEN 느낌) */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {selectedStage ? (
                                <motion.div
                                    key={selectedStage.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-black/60 border border-white/10 rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-xl relative"
                                >
                                    {/* 배경 효과 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10 pointer-events-none" />

                                    {/* 상단: 적 정보 */}
                                    <div className="p-8 pb-4 flex-1 flex flex-col items-center justify-center text-center relative z-10">
                                        <div className="w-32 h-32 rounded-full border-2 border-white/10 bg-white/5 mb-6 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                                            {/* 적 이미지 (Placeholder) */}
                                            {selectedStage.difficulty === 'BOSS' ? (
                                                <Skull size={48} className="text-red-500 animate-pulse" />
                                            ) : (
                                                <div className="text-4xl">🤖</div>
                                            )}

                                            {/* 글리치 효과 장식 */}
                                            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
                                        </div>

                                        <h2 className="text-2xl font-black text-white orbitron tracking-widest mb-1">
                                            {selectedStage.enemy.name}
                                        </h2>
                                        <p className="text-xs text-gray-500 font-mono mb-8 uppercase tracking-widest">
                                            {selectedStage.difficulty} CLASS HOSTILE
                                        </p>

                                        {/* 대사 박스 */}
                                        <div className="relative bg-white/5 border border-white/10 p-6 rounded-xl max-w-md w-full">
                                            <Quote size={20} className="absolute -top-3 -left-3 text-cyan-500 bg-[#050505] p-0.5" fill="currentColor" />
                                            <p className="text-gray-300 italic text-sm leading-relaxed">
                                                "{selectedStage.enemy.dialogue.intro}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* 하단: 미션 정보 및 액션 */}
                                    <div className="bg-white/5 border-t border-white/5 p-8 relative z-10">
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                                                <div className="text-[9px] text-gray-500 font-bold mb-1">MODE</div>
                                                <div className="text-xs font-bold text-white">
                                                    {selectedStage.battleMode === 'ONE_CARD' ? '1-CARD BATTLE' :
                                                        selectedStage.battleMode === 'TRIPLE_THREAT' ? '3-CARD BATTLE' : '5-CARD STANDARD'}
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                                                <div className="text-[9px] text-gray-500 font-bold mb-1">REWARD</div>
                                                <div className="text-xs font-bold text-yellow-500">
                                                    {selectedStage.rewards.coins} COINS
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            fullWidth
                                            size="lg"
                                            variant="shadow"
                                            color={selectedStage.isCleared ? "success" : "primary"}
                                            className="h-16 orbitron font-black text-lg tracking-[0.2em] relative overflow-hidden group"
                                            onClick={handleBattleStart}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                {selectedStage.isCleared ? (
                                                    <>REPLAY BATTLE <CheckCircle2 /></>
                                                ) : (
                                                    <>ENGAGE ENEMY <Swords /></>
                                                )}
                                            </span>
                                            {/* 버튼 호버 효과 */}
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm border border-white/5 rounded-3xl">
                                    SELECT A STAGE TO VIEW INTEL
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Intro Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                size="md"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{modalConfig.title}</ModalHeader>
                            <ModalBody>
                                <p className="text-lg text-gray-300 italic text-center py-8">
                                    "{modalConfig.message}"
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    className="w-full h-12 orbitron font-bold"
                                    color="danger"
                                    size="lg"
                                    variant="shadow"
                                    onClick={() => {
                                        if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        else onClose();
                                    }}
                                >
                                    FIGHT!
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
