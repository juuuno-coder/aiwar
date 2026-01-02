'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    loadStoryProgress,
    getChapters,
    completeStage,
    claimChapterReward,
    Chapter,
    StoryStage
} from '@/lib/story-system';
import { Button } from "@/components/ui/custom/Button";
import { Modal, ModalBody, ModalHeader, ModalFooter, ModalContent } from "@/components/ui/custom/Modal";
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Swords, Shield, Skull, Lock, CheckCircle2, Trophy, Quote, Award } from "lucide-react";
import { cn } from '@/lib/utils';
import { addNotification } from '@/components/NotificationCenter';
import PageHeader from '@/components/PageHeader';
import { useTranslation } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';

export default function ChapterDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { language } = useTranslation();
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

    const { consumeTokens, user } = useUser();

    useEffect(() => {
        const load = async () => {
            const allChapters = getChapters();
            const found = allChapters.find((c: Chapter) => c.id === chapterId);

            if (found) {
                // Async load with user ID if logged in
                const progress = await loadStoryProgress(chapterId, user?.uid);

                found.unlocked = true;
                found.stages = found.stages.map((s: StoryStage) => ({
                    ...s,
                    isCleared: progress.completedStages.includes(s.id)
                }));

                setChapter(found);

                if (!selectedStage) {
                    const firstUncleared = found.stages.find((s: StoryStage) => !s.isCleared);
                    setSelectedStage(firstUncleared || found.stages[found.stages.length - 1]);
                }
            }
        };
        load();
    }, [chapterId, user]);

    const handleStageSelect = (stage: StoryStage) => {
        if (stage.step > 1) {
            const prevStage = chapter?.stages.find(s => s.step === stage.step - 1);
            if (prevStage && !prevStage.isCleared) {
                addNotification({
                    type: 'warning',
                    title: 'LOCKED',
                    message: language === 'ko' ? '이전 스테이지를 먼저 클리어해야 합니다.' : 'Complete previous stage first.',
                    icon: '🔒'
                });
                return;
            }
        }
        setSelectedStage(stage);
    };

    const handleBattleStart = async () => {
        if (!selectedStage) return;

        const cost = selectedStage.tokenCost || (selectedStage.difficulty === 'BOSS' ? 100 : 50);

        setModalConfig({
            isOpen: true,
            title: `VS ${selectedStage.enemy.name_ko || selectedStage.enemy.name}`,
            message: selectedStage.enemy.dialogue.appearance_ko || selectedStage.enemy.dialogue.appearance || selectedStage.enemy.dialogue.intro_ko || selectedStage.enemy.dialogue.intro,
            type: 'intro',
            onConfirm: async () => {
                // [Check Token Balance]
                const success = await consumeTokens(cost, 'STORY_MISSION');
                if (success) {
                    router.push(`/battle/stage/${selectedStage.id}`);
                }
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
                <div className="flex items-center mb-8 gap-4">
                    <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => router.push('/story')}>
                        <ArrowLeft className="mr-2" size={20} /> BACK
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 italic">
                            {chapter.title_ko || chapter.title}
                        </h1>
                        <p className="text-gray-400 font-mono text-sm">
                            {chapter.description_ko || chapter.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                    {/* 왼쪽: 스테이지 리스트 */}
                    <div className="lg:col-span-1 bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white mb-2">STAGES</h2>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="text-right text-xs text-cyan-500 mt-1">{progress}% CLEARED</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
                            {chapter.stages.map((stage) => {
                                const isLocked = stage.step > 1 && !chapter.stages.find(s => s.step === stage.step - 1)?.isCleared && !stage.isCleared;
                                const isSelected = selectedStage?.id === stage.id;

                                return (
                                    <div
                                        key={stage.id}
                                        onClick={() => handleStageSelect(stage)}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                                            isSelected
                                                ? "bg-cyan-900/20 border-cyan-500/50"
                                                : "bg-black/40 border-white/5 hover:bg-white/5",
                                            isLocked && "opacity-50 grayscale"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                    stage.isCleared ? "bg-green-500/20 text-green-500" : isLocked ? "bg-gray-800 text-gray-500" : "bg-cyan-500/20 text-cyan-500"
                                                )}>
                                                    {stage.isCleared ? <CheckCircle2 size={16} /> : stage.step}
                                                </div>
                                                <div>
                                                    <div className={cn("font-bold text-sm", isSelected ? "text-white" : "text-gray-400")}>
                                                        {stage.title_ko || stage.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">{stage.battleMode}</div>
                                                </div>
                                            </div>
                                            {isLocked && <Lock size={14} className="text-gray-600" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 오른쪽: 상세 정보 */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <AnimatePresence mode="wait">
                            {selectedStage ? (
                                <motion.div
                                    key={selectedStage.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col"
                                >
                                    {/* 배경 장식 */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

                                    <div className="relative z-10 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="text-cyan-500 font-mono text-sm mb-2">STAGE {selectedStage.id.split('-').slice(1).join('-')}</div>
                                                <h2 className="text-4xl font-black text-white italic mb-4">{selectedStage.title_ko || selectedStage.title}</h2>
                                                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                                                    {selectedStage.description_ko || selectedStage.description}
                                                </p>
                                            </div>
                                            {selectedStage.isCleared && (
                                                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-green-500/30">
                                                    <Trophy size={18} /> CLEARED
                                                </div>
                                            )}
                                        </div>

                                        {/* 적 정보 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                                <div className="flex items-center gap-2 text-red-400 font-bold mb-4">
                                                    <Skull size={18} /> ENEMY INTEL
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-red-900/20 rounded-xl flex items-center justify-center text-3xl border border-red-500/30">
                                                        👿
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold text-lg">{selectedStage.enemy.name_ko || selectedStage.enemy.name}</div>
                                                        <div className="text-gray-500 text-sm">Difficulty: <span className={cn(
                                                            "font-bold",
                                                            selectedStage.difficulty === 'EASY' ? "text-green-500" :
                                                                selectedStage.difficulty === 'NORMAL' ? "text-blue-500" :
                                                                    selectedStage.difficulty === 'HARD' ? "text-orange-500" : "text-red-500"
                                                        )}>{selectedStage.difficulty}</span></div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-gray-400 text-sm bg-white/5 p-3 rounded-lg italic">
                                                    <Quote size={12} className="inline mr-1 mb-1" />
                                                    {selectedStage.enemy.dialogue.quote_ko || selectedStage.enemy.dialogue.quote || selectedStage.enemy.dialogue.intro_ko || selectedStage.enemy.dialogue.intro}
                                                </div>
                                            </div>

                                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                                <div className="flex items-center gap-2 text-yellow-500 font-bold mb-4">
                                                    <Award size={18} /> REWARDS
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                        <span className="text-gray-400">Coins</span>
                                                        <span className="text-yellow-400 font-mono font-bold">+{selectedStage.rewards.coins}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                        <span className="text-gray-400">EXP</span>
                                                        <span className="text-cyan-400 font-mono font-bold">+{selectedStage.rewards.experience}</span>
                                                    </div>
                                                    {selectedStage.rewards.card && (
                                                        <div className="flex justify-between items-center bg-purple-500/10 p-3 rounded-lg border border-purple-500/30">
                                                            <span className="text-purple-300">Card</span>
                                                            <span className="text-purple-400 font-bold text-sm">Rare Card</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full text-lg h-16 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20"
                                        onClick={handleBattleStart}
                                    >
                                        <Swords className="mr-2" />
                                        {selectedStage.isCleared ? "REPLAY MISSION" : "START MISSION"}
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 font-mono">
                                    SELECT A STAGE TO VIEW DETAILS
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* 대화 모달 */}
            <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                <ModalContent>
                    <ModalHeader className="text-red-500 italic font-black text-2xl">
                        {modalConfig.title}
                    </ModalHeader>
                    <ModalBody className="text-center py-8">
                        <div className="text-4xl mb-6">💬</div>
                        <p className="text-xl text-white font-serif italic leading-relaxed">
                            &quot;{modalConfig.message}&quot;
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="w-full bg-red-600 hover:bg-red-500 py-6 text-lg"
                            onClick={() => {
                                // Close modal is handled inside onConfirm if needed, 
                                // but actually we need to close it first or handle loading? 
                                // The previous code closed it then called onConfirm.
                                // Let's keep that behavior but we need accurate token check.
                                // If token check fails, modal closes and notification appears. Ideally modal stays if fail?
                                // "consumeTokens" usually handles its own notification if inside hook? Or it returns false.
                                // Let's assume onConfirm handles logic.
                                setModalConfig({ ...modalConfig, isOpen: false });
                                modalConfig.onConfirm?.();
                            }}
                        >
                            FIGHT! (-{selectedStage?.tokenCost || (selectedStage?.difficulty === 'BOSS' ? 100 : 50)} 🪙)
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
