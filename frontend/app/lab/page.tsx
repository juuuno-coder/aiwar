'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Meteors } from '@/components/ui/aceternity/effects';
import PageHeader from '@/components/PageHeader';
import { Card, CardBody } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { Progress } from '@/components/ui/custom/Progress';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { useTranslation } from '@/context/LanguageContext';
import {
    FlaskConical,
    Zap,
    Sparkles,
    Layers,
    ArrowRight,
    Lock,
    Clock,
    Coins,
    CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    RESEARCH_STATS,
    ResearchCategory,
    ResearchProgress,
    CommanderResearch,
    getResearchCost,
    getResearchTime,
    getResearchBonus,
    createInitialResearchState,
    getAvailableResearch,
    getRemainingResearchTime,
    isResearchComplete,
    getActiveResearch,
    checkResearchDependency,
    getResearchTimeBuff
} from '@/lib/research-system';
import { useFooter } from '@/context/FooterContext';
import { Tooltip } from '@/components/ui/custom/Tooltip';
import { gameStorage } from '@/lib/game-storage';

// 허브 링크
const hubLinks = [
    { name: '생성', path: '/slots', icon: <Zap className="w-6 h-6" />, color: 'from-yellow-500 to-amber-600', description: 'AI 군단 유닛 생성' },
    { name: '강화', path: '/enhance', icon: <Sparkles className="w-6 h-6" />, color: 'from-purple-500 to-pink-600', description: '카드 레벨업' },
    { name: '합성', path: '/fusion', icon: <Layers className="w-6 h-6" />, color: 'from-blue-500 to-cyan-600', description: '카드 합성' },
    { name: '유니크', path: '/unique-unit', icon: <FlaskConical className="w-6 h-6" />, color: 'from-pink-500 to-rose-600', description: '유니크 카드 제작' },
];

export default function LabPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const { level, coins, refreshData, addCoins } = useUser();
    const { showAlert, showConfirm } = useAlert();
    const { state: footerState } = useFooter();

    const [research, setResearch] = useState<CommanderResearch | null>(null);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [timeReduction, setTimeReduction] = useState(0);

    // 타이머
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 연구 상태 로드
    useEffect(() => {
        loadResearch();
    }, []);

    // 시간 단축 버프 계산
    useEffect(() => {
        const buff = getResearchTimeBuff(footerState.deck);
        setTimeReduction(buff);
    }, [footerState.deck]);

    const loadResearch = async () => {
        const state = await gameStorage.loadGameState();
        if (state.research) {
            setResearch(state.research);
        } else {
            const initial = createInitialResearchState();
            setResearch(initial);
            await gameStorage.saveGameState({ research: initial });
        }
    };

    const saveResearch = async (newResearch: CommanderResearch) => {
        setResearch(newResearch);
        await gameStorage.saveGameState({ research: newResearch });
    };

    // 연구 시작
    const startResearch = async (categoryId: ResearchCategory) => {
        if (!research) return;

        const stat = RESEARCH_STATS.find(s => s.id === categoryId);
        const progress = research.stats[categoryId];
        if (!stat || !progress) return;

        const targetLevel = progress.currentLevel + 1;
        if (targetLevel > stat.maxLevel) {
            showAlert({ title: '최대 레벨', message: '이미 최대 레벨에 도달했습니다.', type: 'info' });
            return;
        }

        // 1번에 1연구만 가능
        const activeResearch = getActiveResearch(research);
        if (activeResearch) {
            const activeStat = RESEARCH_STATS.find(s => s.id === activeResearch.categoryId);
            showAlert({
                title: '연구 중',
                message: `이미 ${activeStat?.name} 연구가 진행 중입니다. 1번에 1개의 연구만 가능합니다.`,
                type: 'warning'
            });
            return;
        }

        // 선행 조건 확인
        const dependency = checkResearchDependency(stat, research);
        if (!dependency.met) {
            showAlert({ title: '선행 연구 필요', message: dependency.message || '선행 연구가 필요합니다.', type: 'warning' });
            return;
        }

        const cost = getResearchCost(stat, targetLevel);
        const baseTimeMinutes = getResearchTime(stat, targetLevel);
        const reducedTimeMinutes = Math.max(1, Math.floor(baseTimeMinutes * (1 - timeReduction)));

        if (coins < cost) {
            showAlert({ title: '코인 부족', message: `${cost.toLocaleString()} 코인이 필요합니다.`, type: 'error' });
            return;
        }

        showConfirm({
            title: `${stat.name} 연구`,
            message: `Lv.${targetLevel} 연구를 시작하시겠습니까?\n비용: ${cost.toLocaleString()} 코인\n시간: ${reducedTimeMinutes}분${timeReduction > 0 ? ` (${Math.round(timeReduction * 100)}% 단축 적용)` : ''}`,
            type: 'info',
            confirmText: '연구 시작',
            onConfirm: async () => {
                await addCoins(-cost);

                const newResearch: CommanderResearch = {
                    ...research,
                    stats: {
                        ...research.stats,
                        [categoryId]: {
                            ...progress,
                            isResearching: true,
                            researchStartTime: Date.now(),
                            researchEndTime: Date.now() + reducedTimeMinutes * 60 * 1000,
                        }
                    }
                };

                await saveResearch(newResearch);
                showAlert({ title: '연구 시작!', message: `${stat.name} Lv.${targetLevel} 연구가 시작되었습니다.`, type: 'success' });
            }
        });
    };

    // 연구 완료
    const completeResearch = async (categoryId: ResearchCategory) => {
        if (!research) return;

        const progress = research.stats[categoryId];
        if (!progress || !isResearchComplete(progress)) return;

        const newLevel = progress.currentLevel + 1;
        const stat = RESEARCH_STATS.find(s => s.id === categoryId);

        const newResearch: CommanderResearch = {
            ...research,
            stats: {
                ...research.stats,
                [categoryId]: {
                    ...progress,
                    currentLevel: newLevel,
                    isResearching: false,
                    researchStartTime: null,
                    researchEndTime: null,
                }
            },
            totalResearchPoints: research.totalResearchPoints + 1
        };

        await saveResearch(newResearch);
        await refreshData();

        showAlert({
            title: '연구 완료!',
            message: `${stat?.name} Lv.${newLevel} 달성!\n${stat?.effects[newLevel - 1]?.description}`,
            type: 'success'
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const availableResearch = getAvailableResearch(level);

    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-35" />
            <Meteors number={8} />

            <div className="max-w-7xl mx-auto relative z-10">
                <PageHeader
                    title="연구소"
                    englishTitle="LABORATORY"
                    description="지휘관 능력을 강화하여 게임 전반의 효율을 높이세요"
                    color="cyan"
                />

                {/* 허브 링크 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {hubLinks.map((link, i) => (
                        <motion.div
                            key={link.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={link.path}>
                                <Card className="bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                                    <CardBody className="p-4 text-center">
                                        <div className={cn(
                                            "w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                            link.color
                                        )}>
                                            {link.icon}
                                        </div>
                                        <p className="font-bold text-white">{link.name}</p>
                                        <p className="text-xs text-white/50">{link.description}</p>
                                        <ArrowRight className="w-4 h-4 mx-auto mt-2 text-white/30 group-hover:text-white/60 transition-all" />
                                    </CardBody>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* 지휘관 연구 */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FlaskConical className="text-cyan-400" />
                            지휘관 연구
                        </div>
                        {timeReduction > 0 && (
                            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 animate-pulse">
                                <Sparkles size={14} />
                                연구 시간 {Math.round(timeReduction * 100)}% 단축 적용 중
                            </div>
                        )}
                    </h2>
                    <p className="text-white/60">연구를 통해 영구적인 보너스를 획득하세요. (보유: {coins.toLocaleString()} 코인)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {RESEARCH_STATS.map((stat, i) => {
                        const progress = research?.stats[stat.id];
                        const isLocked = stat.requiredLevel > level;
                        const isResearching = progress?.isResearching;
                        const canComplete = progress && isResearchComplete(progress);
                        const remainingTime = progress ? getRemainingResearchTime(progress) : 0;
                        const currentLevel = progress?.currentLevel || 0;
                        const nextLevel = currentLevel + 1;
                        const cost = getResearchCost(stat, nextLevel);
                        const time = getResearchTime(stat, nextLevel);
                        const currentBonus = getResearchBonus(stat.id, currentLevel);
                        const isMaxLevel = currentLevel >= stat.maxLevel;

                        return (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className={cn(
                                    "border transition-all overflow-hidden",
                                    isLocked
                                        ? "bg-white/5 border-white/5 opacity-50"
                                        : isResearching
                                            ? "bg-cyan-900/20 border-cyan-500/50"
                                            : "bg-white/5 border-white/10 hover:border-white/20"
                                )}>
                                    <CardBody className="p-5">
                                        {/* 헤더 */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br",
                                                stat.gradient
                                            )}>
                                                {stat.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{stat.name}</h3>
                                                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                                                        Lv.{currentLevel}/{stat.maxLevel}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50">{stat.description}</p>
                                            </div>
                                            {isLocked ? (
                                                <Lock className="text-white/30" size={20} />
                                            ) : stat.requiredResearchId && research && !checkResearchDependency(stat, research).met && (
                                                <Tooltip content={checkResearchDependency(stat, research).message}>
                                                    <div className="text-amber-500/50">
                                                        <Lock className="animate-pulse" size={20} />
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </div>

                                        {/* 현재 효과 */}
                                        {currentLevel > 0 && (
                                            <div className="mb-3 p-2 bg-green-900/20 rounded-lg border border-green-500/20">
                                                <p className="text-xs text-green-400">
                                                    현재: {stat.effects[currentLevel - 1]?.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* 진행 중인 연구 */}
                                        {isResearching && !canComplete && (
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-white/60 mb-1">
                                                    <span>Lv.{nextLevel} 연구 중...</span>
                                                    <span className="text-cyan-400">{formatTime(remainingTime)}</span>
                                                </div>
                                                <Progress
                                                    value={progress?.researchEndTime && progress?.researchStartTime
                                                        ? ((Date.now() - progress.researchStartTime) / (progress.researchEndTime - progress.researchStartTime)) * 100
                                                        : 0
                                                    }
                                                    color="primary"
                                                    size="sm"
                                                />
                                            </div>
                                        )}

                                        {/* 버튼 */}
                                        {isLocked ? (
                                            <div className="text-center text-sm text-white/40 py-2">
                                                Lv.{stat.requiredLevel} 필요
                                            </div>
                                        ) : canComplete ? (
                                            <Button
                                                color="success"
                                                className="w-full"
                                                onPress={() => completeResearch(stat.id)}
                                            >
                                                <CheckCircle size={16} />
                                                연구 완료!
                                            </Button>
                                        ) : isResearching ? (
                                            <Button
                                                isDisabled
                                                variant="flat"
                                                className="w-full"
                                            >
                                                <Clock size={16} />
                                                연구 진행 중
                                            </Button>
                                        ) : isMaxLevel ? (
                                            <Button
                                                isDisabled
                                                variant="flat"
                                                className="w-full"
                                            >
                                                최대 레벨
                                            </Button>
                                        ) : (
                                            <Button
                                                color="primary"
                                                className="w-full"
                                                onPress={() => startResearch(stat.id)}
                                                isDisabled={coins < cost}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>Lv.{nextLevel} 연구</span>
                                                    <span className="text-xs opacity-70">
                                                        ({cost.toLocaleString()} 코인 / {Math.max(1, Math.floor(time * (1 - timeReduction)))}분)
                                                    </span>
                                                </div>
                                            </Button>
                                        )}
                                    </CardBody>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
