'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    loadStoryProgress,
    completeTask,
    claimChapterReward,
    verifyTask,
    checkAllTasks,
    Chapter,
    Task
} from '@/lib/story-system';
import {
    Card,
    CardBody,
} from "@/components/ui/custom/Card";
import { Button } from "@/components/ui/custom/Button";
import { Progress } from "@/components/ui/custom/Progress";
import { Modal, ModalBody, ModalHeader, ModalFooter, ModalContent } from "@/components/ui/custom/Modal";
import { Chip } from "@/components/ui/custom/Chip";
import { useUser } from '@/context/UserContext';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, PlayCircle, Gift, AlertCircle, Sparkles, Coins } from "lucide-react";
import { cn } from '@/lib/utils';
import { addNotification } from '@/components/NotificationCenter';
import PageHeader from '@/components/PageHeader';
// import CutscenePlayer from '@/components/CutscenePlayer'; // Existing one
// import cutsceneData from '@/data/story-cutscenes.json'; // Existing data
import DialogueOverlay from '@/components/DialogueOverlay';
import { CHAPTER_SCRIPTS } from '@/lib/story-data';
import { useFooter } from '@/context/FooterContext';

import { useTranslation } from '@/context/LanguageContext';

export default function ChapterDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { t, language } = useTranslation();
    const chapterId = params.chapterId as string;
    const { refreshData } = useUser();
    const footer = useFooter(); // 푸터 훅 사용

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [verifying, setVerifying] = useState<string | null>(null);

    // New Cutscene State
    const [showCutscene, setShowCutscene] = useState(false);
    const chapterScript = chapterId ? CHAPTER_SCRIPTS[chapterId] : null;

    // Remove old cutscene state
    // const [showCutscene, setShowCutscene] = useState<'intro' | 'outro' | null>(null);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        targetPath?: string;
        type?: 'success' | 'error' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    /* Old Cutscene Logic Removed/Commented for replacement
    // 컷신 데이터 가져오기
    const getChapterCutscene = (type: 'intro' | 'outro') => {
        return cutsceneData.cutscenes.find(
            c => c.chapterId === chapterId && c.type === type
        );
    };

    // 컷신 재생 여부 체크 (localStorage 기반)
    const hasCutscenePlayed = (type: 'intro' | 'outro') => {
        if (typeof window === 'undefined') return true;
        const key = `cutscene-${chapterId}-${type}`;
        return localStorage.getItem(key) === 'played';
    };

    const markCutscenePlayed = (type: 'intro' | 'outro') => {
        const key = `cutscene-${chapterId}-${type}`;
        localStorage.setItem(key, 'played');
    };
    */

    useEffect(() => {
        const init = async () => {
            await checkAllTasks();
            loadChapter();

            // 인트로 컷신 자동 재생 (New Logic)
            if (chapterScript && chapterScript.length > 0) {
                // Check if already played if desired, for now always play for testing
                setShowCutscene(true);
            }
        }
        init();
    }, [chapterId]);

    // 푸터 제어: 컷신 중에는 숨기기
    useEffect(() => {
        if (showCutscene) {
            footer.hideFooter();
        } else {
            footer.showFooter();
        }

        return () => {
            footer.resetFooter();
        };
    }, [showCutscene]);

    const loadChapter = () => {
        const chapters = loadStoryProgress();
        const found = chapters.find(c => c.id === chapterId);
        setChapter(found || null);
    };

    const handleVerifyTask = async (task: Task) => {
        if (task.completed) return;
        setVerifying(task.id);

        try {
            const verified = await verifyTask(task);
            if (verified) {
                const success = await completeTask(chapterId, task.id);
                if (success) {
                    await refreshData();
                    // 성공 알림만 표시하고 푸터는 유지
                    addNotification({
                        type: 'quest',
                        title: t('story.modal.taskComplete').toUpperCase(),
                        message: language === 'ko' ? `${task.title} 태스크를 완료했습니다!` : `Completed task: ${task.title}!`,
                        icon: '✅'
                    });

                    if (task.reward) {
                        let rewardMsg = '';
                        if (task.reward.coins) rewardMsg += `💰 ${task.reward.coins} ${t('common.coins')} `;
                        if (task.reward.experience) rewardMsg += `⭐ ${task.reward.experience} EXP`;
                        addNotification({
                            type: 'reward',
                            title: language === 'ko' ? '보상 획득!' : 'Reward!',
                            message: rewardMsg,
                            icon: '🎁'
                        });
                    }
                    loadChapter();
                }
            } else {
                setModalConfig({
                    isOpen: true,
                    title: t('story.modal.missionIncomplete').toUpperCase(),
                    message: task.guide,
                    targetPath: task.targetPath,
                    type: 'error'
                });
            }
        } catch (error) {
            setModalConfig({
                isOpen: true,
                title: 'ERROR',
                message: '데이터 동기화 중 오류가 발생했습니다.',
                type: 'error'
            });
        } finally {
            setVerifying(null);
        }
    };

    const handleClaimChapterReward = async () => {
        if (!chapter || !chapter.completed) return;

        const success = await claimChapterReward(chapter.id);
        if (success) {
            await refreshData();
            setModalConfig({
                isOpen: true,
                title: t('story.modal.rewardClaimed').toUpperCase(),
                message: language === 'ko' ? '챕터 보상을 수령했습니다!' : 'Claimed chapter rewards!',
                type: 'success'
            });
            loadChapter();
        }
    };

    if (!chapter) return null;

    const completedTasks = chapter.tasks.filter(t => t.completed).length;
    const totalTasks = chapter.tasks.length;
    const progress = (completedTasks / totalTasks) * 100;

    // 컷신 재생 중일 때
    // 컷신 재생 중일 때 (New Logic)
    if (showCutscene && chapterScript) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <DialogueOverlay
                    script={chapterScript}
                    onComplete={() => setShowCutscene(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-40" />

            <div className="max-w-6xl mx-auto relative z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-8 text-gray-500 hover:text-white orbitron font-black tracking-widest gap-2 pl-0"
                    onClick={() => router.push('/story')}
                >
                    <ArrowLeft size={16} /> BACK TO LOGS
                </Button>

                {/* PageHeader 적용 */}
                <PageHeader
                    title={`${t('story.chapter')} ${chapter.number}: ${chapter.title}`}
                    englishTitle={`LOG_BUFFER_${chapter.id.toUpperCase()}`}
                    description={chapter.description}
                    color="blue"
                    action={
                        <div className="flex gap-4">
                            <div className="bg-black/40 px-6 py-4 rounded-xl border border-white/5 backdrop-blur-2xl flex items-center gap-6 shadow-xl">
                                <div className="text-right">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">{t('story.progress')}</p>
                                    <p className="text-2xl font-black text-blue-400 orbitron">
                                        {Math.round(progress)}%
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 text-blue-400">
                                    <Sparkles size={24} />
                                </div>
                            </div>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* 왼쪽: 태스크 리스트 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-black text-white orbitron tracking-[0.2em]">{t('story.tasks').toUpperCase()}</h2>
                            <span className="text-[10px] text-gray-500 font-bold orbitron">{completedTasks}/{totalTasks}</span>
                        </div>
                        {chapter.tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    "group relative p-6 rounded-2xl border transition-all duration-300",
                                    task.completed
                                        ? "bg-green-500/5 border-green-500/20"
                                        : "bg-black/40 border-white/5 hover:border-blue-500/30"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                        task.completed
                                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                                            : "bg-white/5 border-white/10 text-gray-500 group-hover:text-blue-400 group-hover:border-blue-500/30"
                                    )}>
                                        {task.completed ? <CheckCircle2 size={20} /> : <PlayCircle size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={cn(
                                            "font-bold text-base mb-1",
                                            task.completed ? "text-green-500/80" : "text-white"
                                        )}>{task.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed mb-4">{task.description}</p>

                                        {!task.completed && (
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                isLoading={verifying === task.id}
                                                className="h-8 orbitron font-black text-[10px] tracking-widest px-6"
                                                onClick={() => handleVerifyTask(task)}
                                            >
                                                {verifying === task.id ? t('story.task.verifying') : t('story.task.verify')}
                                            </Button>
                                        )}
                                    </div>

                                    {task.reward && (
                                        <div className="text-right shrink-0">
                                            <div className="flex flex-col gap-1 items-end">
                                                {task.reward.coins && (
                                                    <span className="text-[10px] font-bold text-yellow-500/80 flex items-center gap-1.5 orbitron bg-yellow-500/5 px-2 py-1 rounded-md border border-yellow-500/10">
                                                        <Coins size={10} />+{task.reward.coins}
                                                    </span>
                                                )}
                                                {task.reward.experience && (
                                                    <span className="text-[10px] font-bold text-purple-500/80 flex items-center gap-1.5 orbitron bg-purple-500/5 px-2 py-1 rounded-md border border-purple-500/10">
                                                        <Sparkles size={10} />+{task.reward.experience}EXP
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 오른쪽: 챕터 완료 및 보상 */}
                    <div className="space-y-6 lg:sticky lg:top-12">
                        <Card className="bg-black/40 backdrop-blur-2xl border-white/5 overflow-hidden">
                            <CardBody className="p-8">
                                <div className="relative mb-8 text-center">
                                    <div className="inline-flex flex-col items-center">
                                        <div className={cn(
                                            "w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 bg-white/5 border border-white/10 transition-all duration-500",
                                            chapter.completed ? "bg-green-500/10 border-green-500/30 text-6xl shadow-[0_0_50px_rgba(34,197,94,0.2)]" : "text-gray-500"
                                        )}>
                                            {chapter.icon}
                                        </div>
                                        <h2 className="text-2xl font-black text-white orbitron uppercase tracking-[0.1em]">{chapter.title}</h2>
                                        <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide">OBJECTIVE: LOG RECOVERY AND ARCHIVING</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black orbitron tracking-[0.2em] text-gray-500">
                                            <span>{t('story.rewards').toUpperCase()}</span>
                                            <Gift size={14} className="text-blue-400" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center gap-2">
                                                <Coins className="text-yellow-500" size={20} />
                                                <span className="text-lg font-black text-white orbitron">{chapter.reward.coins}</span>
                                                <span className="text-[8px] text-gray-500 font-bold orbitron tracking-widest">{t('common.coins')}</span>
                                            </div>
                                            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center gap-2">
                                                <Sparkles className="text-purple-400" size={20} />
                                                <span className="text-lg font-black text-white orbitron">{chapter.reward.experience}</span>
                                                <span className="text-[8px] text-gray-500 font-bold orbitron tracking-widest">EXP</span>
                                            </div>
                                        </div>
                                    </div>

                                    {chapter.completed ? (
                                        <Button
                                            fullWidth
                                            size="lg"
                                            variant="shadow"
                                            color="success"
                                            className="h-16 orbitron font-black text-sm tracking-[0.2em]"
                                            onClick={handleClaimChapterReward}
                                        >
                                            {t('story.reward.claim').toUpperCase()}
                                        </Button>
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <p className="text-[10px] text-gray-500 font-black orbitron tracking-widest">COMPLETE ALL TASKS TO UNLOCK REWARDS</p>
                                        </div>
                                    )}

                                    {chapter.number < 90 && (
                                        <Button
                                            fullWidth
                                            size="lg"
                                            variant="flat"
                                            className="h-14 orbitron font-black text-xs tracking-[0.2em] border border-white/5 text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            onClick={() => {
                                                // 푸터를 활성화하여 전투 준비 상태로 전환
                                                footer.showFooter();
                                                footer.setInfo([
                                                    { label: 'MISSION', value: `Chapter ${chapter.number}`, color: 'text-blue-400' },
                                                    { label: 'STATUS', value: 'READY', color: 'text-green-400' }
                                                ]);

                                                // 캐릭터 오버레이 표시 (가이드 역할)
                                                footer.setCharacterOverlay({
                                                    characterImage: '/assets/characters/chatgpt.png',
                                                    position: 'left',
                                                    name: 'AI GUIDE',
                                                    dialogue: '전투에 출전할 카드를 선택하세요! 상성을 고려해서 덱을 구성하면 승리 확률이 올라갑니다.',
                                                    emotion: 'happy'
                                                });

                                                footer.setAction({
                                                    label: 'BATTLE START',
                                                    onClick: () => {
                                                        footer.clearCharacterOverlay();
                                                        router.push('/battle');
                                                    },
                                                    color: 'primary'
                                                });
                                            }}
                                        >
                                            {t('story.battle').toUpperCase()}
                                        </Button>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                size="sm"
                classNames={{
                    base: "bg-[#0a0a0a] border border-white/10 shadow-2xl",
                    header: "border-b border-white/5",
                    footer: "border-t border-white/5"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    {modalConfig.type === 'error' ? (
                                        <AlertCircle className="text-red-500" size={24} />
                                    ) : (
                                        <CheckCircle2 className="text-green-500" size={24} />
                                    )}
                                    <h3 className="text-xl font-black text-white orbitron tracking-widest leading-none mt-1">
                                        {modalConfig.title}
                                    </h3>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-8">
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    {modalConfig.message}
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="flat"
                                    className="orbitron font-black text-[10px] tracking-widest px-8"
                                    onClick={() => onClose?.()}
                                >
                                    {t('story.modal.close').toUpperCase()}
                                </Button>
                                {modalConfig.targetPath && (
                                    <Button
                                        variant="shadow"
                                        color="primary"
                                        className="orbitron font-black text-[10px] tracking-widest px-8"
                                        onClick={() => {
                                            onClose?.();
                                            router.push(modalConfig.targetPath!);
                                        }}
                                    >
                                        {t('story.modal.move').toUpperCase()}
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
