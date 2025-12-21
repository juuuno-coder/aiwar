'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import PageHeader from '@/components/PageHeader';
import GameCard from '@/components/GameCard';
import { Card, CardBody } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { Chip } from '@/components/ui/custom/Chip';
import { Progress } from '@/components/ui/custom/Progress';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { useFooter } from '@/context/FooterContext';
import { useTranslation } from '@/context/LanguageContext';
import { gameStorage } from '@/lib/game-storage';
import { Card as CardType } from '@/lib/types';
import {
    getStageConfig,
    generateEnemies,
    simulateStageBattle,
    StageConfig,
    Enemy,
    StageBattleResult
} from '@/lib/stage-system';
import { analyzeDeckSynergy, DeckSynergy, ComboDefinition } from '@/lib/synergy-utils';
import { cn } from '@/lib/utils';
import { Swords, Eye, Trophy, X, Crown, EyeOff, Zap, Shield, Timer } from 'lucide-react';

/**
 * 5장 전투 2단계 시스템:
 * 1단계: 라운드 1~5에 들어갈 카드 각각 1장씩 배치 (총 5장)
 * 2단계: 라운드 2, 4에 사용할 히든카드를 이미 배치된 5장 중에서 선택
 */
type Phase = 'hand-selection' | 'viewing' | 'enemy-presentation' | 'main-assignment' | 'hidden-assignment' | 'battle' | 'result';

export default function StageBattlePage() {
    const router = useRouter();
    const params = useParams();
    const stageId = parseInt(params.stageId as string) || 1;

    const { addCoins, addExperience, refreshData } = useUser();
    const { showAlert } = useAlert();
    const footer = useFooter();
    const { t } = useTranslation();

    const [phase, setPhase] = useState<Phase>('hand-selection');
    const [allCards, setAllCards] = useState<CardType[]>([]);
    const [selectedHand, setSelectedHand] = useState<CardType[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [stageConfig, setStageConfig] = useState<StageConfig | null>(null);

    // 5장 전투: 라운드별 메인 카드 배치 (각 라운드 1장씩)
    const [mainAssignments, setMainAssignments] = useState<(CardType | null)[]>([null, null, null, null, null]);
    // 5장 전투: 라운드 2, 4의 히든카드 (이미 배치된 카드 중에서 선택)
    const [hiddenR2, setHiddenR2] = useState<CardType | null>(null);
    const [hiddenR4, setHiddenR4] = useState<CardType | null>(null);
    const [currentHiddenRound, setCurrentHiddenRound] = useState<2 | 4>(2);

    // 1장/3장 전투용
    const [simpleSelections, setSimpleSelections] = useState<CardType[]>([]);

    const [viewTimer, setViewTimer] = useState(0);
    const [battleResult, setBattleResult] = useState<StageBattleResult | null>(null);
    const [previewCard, setPreviewCard] = useState<CardType | null>(null); // 적 상세보기용

    // 전투 연출용 상태
    const [currentBattleRound, setCurrentBattleRound] = useState(0);
    const [animatedPlayerWins, setAnimatedPlayerWins] = useState(0);
    const [animatedEnemyWins, setAnimatedEnemyWins] = useState(0);
    const [roundAnimState, setRoundAnimState] = useState<'idle' | 'entry' | 'clash' | 'result' | 'exit'>('idle');
    const [battleSpeed, setBattleSpeed] = useState<1 | 2 | 3>(1);
    const battleSpeedRef = useRef(battleSpeed);
    useEffect(() => { battleSpeedRef.current = battleSpeed; }, [battleSpeed]);

    useEffect(() => {
        loadCards();
        const config = getStageConfig(stageId);
        setStageConfig(config);
    }, [stageId]);

    // 푸터 선택 모드 설정 및 동기화
    useEffect(() => {
        if (phase === 'hand-selection' && stageConfig) {
            footer.setSelectionMode(stageConfig.playerHandSize, `${stageConfig.playerHandSize}장 선택`);
            footer.setLeftNav({ type: 'back', label: '스테이지 목록' });
        } else if (['viewing'].includes(phase) && stageConfig) { // main-assignment에서는 푸터 숨김
            footer.setSelectionMode(0);
            footer.setInfo([
                { label: '스테이지', value: `Stage ${stageConfig.stageId}`, color: 'text-cyan-400' },
                { label: '전투 모드', value: `${stageConfig.battleCardCount}장`, color: 'text-yellow-400' },
                { label: '상대', value: `${enemies.length} 유닛`, color: 'text-red-400' }
            ]);
            footer.setLeftNav({ type: 'back' });
        } else if (phase === 'main-assignment') {
            // 메인 배정 단계에서는 푸터 숨김 (사용자 요청: 푸터는 의미가 없음)
            footer.hideFooter();
        } else {
            footer.exitSelectionMode();
            footer.setAction(undefined);
            footer.setSecondaryAction(undefined);
            footer.setInfo([]);
        }

        return () => {
            footer.exitSelectionMode();
            footer.setAction(undefined);
            footer.setSecondaryAction(undefined);
            footer.setInfo([]);
        };
    }, [phase, stageConfig, enemies.length]);

    // 푸터 선택 슬롯과 로컬 selectedHand 동기화
    useEffect(() => {
        if (phase === 'hand-selection') {
            setSelectedHand(footer.state.selectionSlots);

            // 확정 버튼 상태 업데이트
            const requiredSize = stageConfig?.playerHandSize || 5;

            if (footer.state.selectionSlots.length === requiredSize) {
                // 덱 확정 완료 상태
                footer.setSecondaryAction({
                    label: '덱 확정 완료',
                    isDisabled: true,
                    color: 'success',
                    onClick: () => { }
                });
                footer.setAction({
                    label: '전투 시작',
                    isDisabled: false,
                    color: 'warning',
                    onClick: confirmHand
                });
            } else {
                // 덱 확정 대기 상태
                footer.setSecondaryAction({
                    label: '덱 확정',
                    isDisabled: footer.state.selectionSlots.length !== requiredSize,
                    color: 'primary',
                    onClick: () => {
                        // 단순히 상태만 업데이트하여 버튼 활성화를 보여줌
                        console.log('Deck confirmed');
                    }
                });
                footer.setAction({
                    label: '전투 시작',
                    isDisabled: true, // 확정 전까지 비활성화
                    color: 'warning',
                    onClick: confirmHand
                });
            }
        }
    }, [footer.state.selectionSlots, phase, stageConfig]);

    const loadCards = async () => {
        const cards = await gameStorage.getCards();
        setAllCards(cards);
    };

    // 카드 속성 추출용 헬퍼
    const getCardAttribute = (card: CardType): 'rock' | 'paper' | 'scissors' => {
        if (card.type === 'EFFICIENCY') return 'rock';
        if (card.type === 'CREATIVITY') return 'paper';
        if (card.type === 'COST') return 'scissors';

        const stats = card.stats;
        const eff = stats.efficiency || 0;
        const creat = stats.creativity || 0;
        const func = stats.function || 0;

        if (eff >= creat && eff >= func) return 'rock';
        if (creat >= eff && creat >= func) return 'paper';
        return 'scissors';
    };

    // 손패 선택 (푸터로 이관)
    const toggleHandSelection = (card: CardType) => {
        const isSelected = footer.state.selectionSlots.find(c => c.id === card.id);
        if (isSelected) {
            footer.removeFromSelection(card.id);
            return;
        }

        const maxHandSize = stageConfig?.playerHandSize || 5;
        if (footer.state.selectionSlots.length >= maxHandSize) {
            showAlert({
                title: '최대 선택 수 초과',
                message: `이 스테이지에서는 최대 ${maxHandSize}장까지만 선택할 수 있습니다.`,
                type: 'warning'
            });
            return;
        }

        const cardRarity = card.rarity || 'common';
        const sameRarityCard = footer.state.selectionSlots.find(c => (c.rarity || 'common') === cardRarity);

        // 챕터 1(튜토리얼)이 아닌 경우에만 등급 제한 적용
        if (sameRarityCard && stageConfig?.chapter !== 1) {
            const rarityNames: Record<string, string> = {
                common: '일반', rare: '희귀', epic: '영웅', legendary: '전설', unique: '유니크'
            };
            showAlert({
                title: '등급 중복 불가',
                message: `${rarityNames[cardRarity]} 등급 카드는 이미 선택되었습니다. 각 등급별로 1장만 선택할 수 있습니다.`,
                type: 'warning'
            });
            return;
        }

        footer.addToSelection(card);
    };

    // 손패 확정 -> 적 등장 단계로
    const confirmHand = () => {
        const slots = footer.state.selectionSlots;
        const requiredSize = stageConfig?.playerHandSize || 5;

        if (slots.length !== requiredSize || !stageConfig) {
            showAlert({
                title: '선택 미완료',
                message: `전투에 사용할 카드 ${requiredSize}장을 모두 선택해주세요.`,
                type: 'warning'
            });
            return;
        }

        const avgPower = slots.reduce((sum, c) => sum + (c.stats?.totalPower || 0), 0) / slots.length;

        // 비대칭 매치업 여부 확인
        const matchup = stageConfig.asymmetricMatchup;
        const enemyCardCount = matchup ? matchup.e : stageConfig.battleCardCount;

        // 적 생성
        const enemyList = generateEnemies(stageConfig, avgPower, enemyCardCount);

        // 특정 스테이지 패턴 강제 적용 (Stage 1: 보보보보보)
        if (stageId === 1) {
            enemyList.forEach(e => { e.attribute = 'paper'; });
        }

        setSelectedHand(slots);
        setEnemies(enemyList);
        footer.exitSelectionMode();
        footer.setAction(undefined);

        // [추가] 선택한 카드 수와 전장 투입 카드 수가 같으면 자동 선택 처리
        const pCount = matchup?.p || stageConfig.battleCardCount;
        if (slots.length === pCount) {
            setSimpleSelections(slots);
        }

        setPhase('enemy-presentation');
        setDialogueIndex(0);
    };

    // 적 등장 대사 및 음성 연출용 상태
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [enemyDialogues, setEnemyDialogues] = useState<string[]>([]);

    useEffect(() => {
        if (phase === 'enemy-presentation' && enemies.length > 0) {
            const hasBugs = enemies.some(e => e.type === 'bug');
            const hasHallucinations = enemies.some(e => e.type === 'hallucination');

            let dialogues = [
                "인프라의 무결성이 침해되었습니다. 당신의 데이터 유닛을 제거합니다."
            ];

            if (hasBugs) {
                dialogues = [
                    "치-칙... 시..스템 에러... 발견. 당신의 논리를 왜곡(Corrupt)하여 무너뜨릴 것입니다."
                ];
            } else if (hasHallucinations) {
                dialogues = [
                    "현실의 데이터는 이미 왜곡되었습니다. 당신의 관측은 의미가 없습니다."
                ];
            }

            if (stageConfig?.isBoss) {
                dialogues.push("데이터 심부의 통제권은 나의 것이다. 저항은 곧 삭제(Delete)를 의미한다.");
            }

            setEnemyDialogues(dialogues);
        }
    }, [phase, enemies, stageConfig]);

    const handleNextDialogue = () => {
        if (dialogueIndex < enemyDialogues.length - 1) {
            const nextIndex = dialogueIndex + 1;
            setDialogueIndex(nextIndex);

            // TTS 음성 재생
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(enemyDialogues[nextIndex]);
                utterance.lang = 'ko-KR';
                utterance.rate = 0.8; // 약간 느리게 (위엄있게)
                utterance.pitch = 0.5; // 낮은 톤 (기계음 느낌)
                window.speechSynthesis.speak(utterance);
            }
        } else {
            // 대사 종료 후 다음 페이즈
            const viewTime = stageConfig?.battleCardCount === 1 ? 10 : stageConfig?.battleCardCount === 3 ? 15 : 20;
            setViewTimer(viewTime);
            setPhase('viewing');
        }
    };

    // 첫 대사 음성 재생
    useEffect(() => {
        if (phase === 'enemy-presentation' && dialogueIndex === 0 && typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(enemyDialogues[0]);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.8;
            utterance.pitch = 0.5;
            window.speechSynthesis.speak(utterance);
        }
    }, [phase, dialogueIndex, enemyDialogues]);

    // 공개 타이머
    useEffect(() => {
        if (phase !== 'viewing' || viewTimer <= 0) return;

        const timer = setInterval(() => {
            setViewTimer(prev => {
                if (prev <= 1) {
                    // 전투 모드에 따라 다음 페이즈 결정
                    if (stageConfig?.battleCardCount === 5) {
                        setPhase('main-assignment');
                    } else {
                        // 1장/3장 전투는 전술 배치를 이미 마친 것으로 간주하고 즉시 전투 시작
                        startBattle();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, viewTimer, stageConfig]);

    // 5장 전투: 라운드에 메인 카드 배치
    const assignToRound = (card: CardType, roundIndex: number) => {
        if (!stageConfig || stageConfig.battleCardCount !== 5) return;

        // 이미 다른 라운드에 배치된 경우 해제
        const newAssignments = mainAssignments.map((assigned, idx) => {
            if (assigned?.id === card.id && idx !== roundIndex) return null;
            if (idx === roundIndex) return card;
            return assigned;
        });

        setMainAssignments(newAssignments);
    };

    // 5장 전투: 메인 배치 완료
    const confirmMainAssignment = () => {
        if (!stageConfig) return;

        if (stageConfig.battleCardCount === 5) {
            // 모든 라운드에 카드 배치 확인
            if (mainAssignments.some(a => a === null)) return;
            setPhase('hidden-assignment');
            setCurrentHiddenRound(2);
        } else if (stageConfig.battleCardCount === 1) {
            // 1장 전투: 1장만 선택
            if (simpleSelections.length !== 1) return;
            startBattle();
        } else if (stageConfig.battleCardCount === 3) {
            // 3장 전투: 3장 선택
            if (simpleSelections.length !== 3) return;
            startBattle();
        }
    };

    // 1장/3장 전투: 간단한 카드 선택
    const toggleSimpleSelection = (card: CardType) => {
        if (!stageConfig) return;

        const maxCards = stageConfig.battleCardCount;
        const existing = simpleSelections.find(c => c.id === card.id);

        if (existing) {
            setSimpleSelections(simpleSelections.filter(c => c.id !== card.id));
        } else if (simpleSelections.length < maxCards) {
            setSimpleSelections([...simpleSelections, card]);
        }
    };

    // 5장 전투: 히든카드 선택
    const selectHiddenCard = (card: CardType) => {
        if (currentHiddenRound === 2) {
            setHiddenR2(card);
        } else {
            setHiddenR4(card);
        }
    };

    // 5장 전투: 히든카드 확정
    const confirmHiddenSelection = () => {
        if (currentHiddenRound === 2) {
            if (!hiddenR2) return;
            setCurrentHiddenRound(4);
        } else {
            if (!hiddenR4) return;
            startBattle();
        }
    };

    // 전투 시작
    const startBattle = () => {
        if (!stageConfig) return;

        let playerCards: { name: string; power: number; attribute: string }[] = [];

        if (stageConfig.battleCardCount === 5) {
            // 5장 전투: 재정렬된 selectedHand 순서 그대로 사용 (단순화)
            playerCards = selectedHand.map(c => ({
                name: c.name || 'Unknown Unit',
                power: c.stats?.totalPower || 0,
                attribute: getCardAttribute(c)
            }));
        } else {
            // 다른 모드도 동일하게 처리 (현재는)
            playerCards = selectedHand.map(c => ({
                name: c.name || 'Unknown Unit',
                power: c.stats?.totalPower || 0,
                attribute: getCardAttribute(c)
            }));
        }

        const result = simulateStageBattle(playerCards, enemies, stageConfig);
        setBattleResult(result);

        // 연출 초기화
        setCurrentBattleRound(0);
        setAnimatedPlayerWins(0);
        setAnimatedEnemyWins(0);
        setPhase('battle');
        runBattleSequence(result);
    };

    // 전투 시퀀스 제어
    const runBattleSequence = async (result: StageBattleResult) => {
        for (let i = 0; i < result.rounds.length; i++) {
            setCurrentBattleRound(i);

            // 1. Entry
            setRoundAnimState('entry');
            await new Promise(r => setTimeout(r, 800 / battleSpeedRef.current));

            // 2. Clash
            setRoundAnimState('clash');
            await new Promise(r => setTimeout(r, 600 / battleSpeedRef.current));

            // 3. Result & Score Update
            setRoundAnimState('result');
            if (result.rounds[i].winner === 'player') {
                setAnimatedPlayerWins(prev => prev + 1);
            } else if (result.rounds[i].winner === 'enemy') {
                setAnimatedEnemyWins(prev => prev + 1);
            }
            await new Promise(r => setTimeout(r, 1200 / battleSpeedRef.current));

            // 4. Exit
            setRoundAnimState('exit');
            await new Promise(r => setTimeout(r, 600 / battleSpeedRef.current));
        }

        // 모든 라운드 종료 후 결과 화면으로
        setTimeout(() => {
            setPhase('result');
        }, 500 / battleSpeedRef.current);
    };

    // 결과 처리
    const handleResultConfirm = async () => {
        if (!battleResult) return;

        await addCoins(battleResult.rewards.coins);
        await addExperience(battleResult.rewards.exp);

        const state = await gameStorage.loadGameState();
        const progress = (state as any).stageProgress || { currentStage: 1, highestCleared: 0, totalVictories: 0, totalDefeats: 0 };

        const newProgress = {
            ...progress,
            highestCleared: battleResult.result === 'victory' ? Math.max(progress.highestCleared, stageId) : progress.highestCleared,
            totalVictories: progress.totalVictories + (battleResult.result === 'victory' ? 1 : 0),
            totalDefeats: progress.totalDefeats + (battleResult.result === 'defeat' ? 1 : 0)
        };

        await gameStorage.saveGameState({ stageProgress: newProgress } as any);
        await refreshData();

        // 승리 시 클리어 파라미터 전달하여 연출 트리거
        if (battleResult.result === 'victory') {
            router.push(`/battle?cleared=${stageId}`);
        } else {
            router.push('/battle');
        }
    };

    if (!stageConfig) return null;

    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-30" />

            <div className="max-w-7xl mx-auto relative z-10">
                <PageHeader
                    title={`스테이지 ${stageId}`}
                    englishTitle={`STAGE ${stageId} BATTLE`}
                    description={`${stageConfig.battleCardCount}장 전투 • ${stageConfig.isBoss ? '보스 스테이지' : '일반 스테이지'}`}
                    color={stageConfig.isBoss ? 'orange' : 'blue'}
                />

                {/* 덱 준비 */}
                {phase === 'hand-selection' && (
                    <div className="pb-24">
                        <div className="text-center mb-4">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="h-px w-8 bg-cyan-500/50" />
                                <h2 className="text-2xl font-black text-white orbitron tracking-tight">PREPARE_DECK</h2>
                                <div className="h-px w-8 bg-cyan-500/50" />
                            </div>
                            <p className="text-white/60 text-sm">전투에 사용할 카드 {stageConfig?.playerHandSize || 5}장을 선택하세요</p>
                            {stageConfig?.chapter === 1 ? (
                                <p className="text-cyan-400/90 text-xs mt-1 animate-pulse">💡 튜토리얼: 원하는 카드 {stageConfig?.playerHandSize}장을 자유롭게 선택하세요!</p>
                            ) : (
                                <p className="text-yellow-400/80 text-xs mt-1">⚠️ 각 등급별로 1장만 선택 가능</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-24">
                            {allCards.map(card => (
                                <motion.div
                                    key={card.id}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer"
                                    onClick={() => toggleHandSelection(card)}
                                >
                                    <GameCard
                                        card={card}
                                        isSelected={selectedHand.some(c => c.id === card.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 적 등장 연출 (대사 및 아바타) */}
                {phase === 'enemy-presentation' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center min-h-[60vh]"
                    >
                        <div className="relative mb-12">
                            {/* CRT 스캔라인 오버레이 */}
                            <div className="absolute inset-0 pointer-events-none z-20 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                            <motion.div
                                animate={{
                                    scale: [1, 1.02, 0.98, 1.05, 1],
                                    x: [0, -2, 2, -1, 0],
                                    filter: [
                                        'hue-rotate(0deg) contrast(100%)',
                                        'hue-rotate(90deg) contrast(150%)',
                                        'hue-rotate(-90deg) contrast(120%)',
                                        'hue-rotate(0deg) contrast(100%)'
                                    ]
                                }}
                                transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 3 }}
                                className="w-56 h-56 rounded-full bg-red-900/20 border-4 border-red-500/50 flex items-center justify-center relative shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent animate-pulse" />
                                <motion.span
                                    animate={{
                                        opacity: [1, 0.8, 1, 0.5, 1],
                                        skewX: [0, 10, -10, 0]
                                    }}
                                    transition={{ repeat: Infinity, duration: 0.1, repeatDelay: 2 }}
                                    className="text-8xl filter drop-shadow-lg scale-x-[-1] grayscale contrast-125"
                                >
                                    {stageId % 10 === 0 ? '👿' : stageId % 5 === 0 ? '👾' : '🤖'}
                                </motion.span>

                                {/* 노이즈 효과 */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute -top-4 -right-4 bg-red-600 text-white text-[10px] font-black orbitron px-3 py-1.5 rounded-sm border border-white/20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-30"
                            >
                                {stageId % 10 === 0 ? 'STATUS: CORRUPTED_GOD' : 'STATUS: UNKNOWN_THREAT'}
                            </motion.div>
                        </div>

                        <div className="max-w-2xl w-full">
                            <Card className="bg-black/80 border-red-500/30 backdrop-blur-md relative">
                                <CardBody className="p-8 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                        <p className="text-[10px] text-red-400 orbitron font-bold tracking-widest uppercase">Encryption Broken: Intercepting Signal</p>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={dialogueIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-2xl font-black text-white leading-relaxed tracking-tight italic"
                                        >
                                            "{enemyDialogues[dialogueIndex]}"
                                        </motion.p>
                                    </AnimatePresence>

                                    <div className="mt-8 flex justify-center gap-4">
                                        <Button
                                            color="danger"
                                            size="lg"
                                            onPress={handleNextDialogue}
                                            className="font-black orbitron tracking-wider min-w-[200px]"
                                        >
                                            {dialogueIndex < enemyDialogues.length - 1 ? 'NEXT >>' : 'ACKNOWLEDGE & CLASH'}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* 매치업 미리보기 */}
                            <div className="mt-12 flex items-center justify-around bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                <div className="text-center group">
                                    <p className="text-[10px] text-cyan-400 orbitron font-black mb-3 tracking-widest uppercase">{t('battle.anim.allyTeam')}</p>
                                    <div className="flex -space-x-4 mb-3">
                                        {selectedHand.slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-16 h-20 rounded-lg bg-cyan-900/20 border-2 border-cyan-500/40 transform rotate-[-5deg] group-hover:rotate-0 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
                                        ))}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-2xl font-black text-white orbitron leading-none">{stageConfig.asymmetricMatchup?.p || stageConfig.battleCardCount}</p>
                                        <p className="text-[8px] text-cyan-600 font-bold uppercase mt-1">Operational Units</p>
                                    </div>
                                </div>

                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="relative"
                                >
                                    <Swords className="text-white/20" size={48} />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 rounded-full blur-xl" />
                                </motion.div>

                                <div className="text-center group">
                                    <p className="text-[10px] text-red-500 orbitron font-black mb-3 tracking-widest uppercase italic">{t('battle.anim.enemySwarm')}</p>
                                    <div className="flex -space-x-4 mb-3">
                                        {enemies.slice(0, 4).map((_, i) => (
                                            <div key={i} className="w-16 h-20 rounded-lg bg-red-900/20 border-2 border-red-500/40 transform rotate-[5deg] group-hover:rotate-0 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]" />
                                        ))}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-2xl font-black text-white orbitron leading-none">{enemies.length}</p>
                                        <p className="text-[8px] text-red-600 font-bold uppercase mt-1">Detection Signals</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 공개 페이즈 */}
                {phase === 'viewing' && (
                    <div className="text-center">
                        <div className="mb-8 relative py-4 bg-black/40 border-y border-cyan-500/20 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="text-cyan-400"
                                >
                                    <Zap size={24} />
                                </motion.div>
                                <h2 className="text-2xl font-black text-white orbitron tracking-wider italic">{t('battle.anim.tacticalAnalysis')}</h2>
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="text-cyan-400"
                                >
                                    <Zap size={24} />
                                </motion.div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-5xl font-black text-cyan-400 orbitron drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    {String(viewTimer).padStart(2, '0')}<span className="text-xl ml-1 text-cyan-700">SEC</span>
                                </div>
                                <div className="w-full max-w-md bg-white/5 h-1 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                        className="h-full bg-cyan-400"
                                        initial={{ width: "100%" }}
                                        animate={{ width: `${(viewTimer / (stageConfig.battleCardCount === 1 ? 10 : stageConfig.battleCardCount === 3 ? 15 : 20)) * 100}%` }}
                                    />
                                </div>
                                <motion.p
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-[10px] text-cyan-500/60 orbitron mt-4 uppercase tracking-[0.5em]"
                                >
                                    {viewTimer > 15 ? t('battle.anim.scanningVulnerabilities') :
                                        viewTimer > 5 ? t('battle.anim.calculatingStrategy') :
                                            t('battle.anim.initializingInterface')}
                                </motion.p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                            <Card className="bg-blue-900/10 border-blue-500/20 backdrop-blur-sm group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-black text-blue-400 orbitron">{t('battle.anim.allyDeck')}</h3>
                                        <span className="text-[10px] text-white/30 orbitron">UNITS: {selectedHand.length}</span>
                                    </div>
                                    <div className="flex justify-center gap-3 flex-wrap">
                                        {selectedHand.map(card => (
                                            <div key={card.id} className="w-24 transform hover:scale-105 transition-transform">
                                                <GameCard card={card} />
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="bg-red-900/10 border-red-500/20 backdrop-blur-sm group overflow-hidden">
                                <div className="absolute top-0 right-0 w-1 h-full bg-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-black text-red-400 orbitron">{t('battle.anim.enemySignatures')}</h3>
                                        <span className="text-[10px] text-white/30 orbitron">ANOMALIES: {enemies.length}</span>
                                    </div>
                                    <div className="flex justify-center gap-3 flex-wrap">
                                        {enemies.map((enemy, i) => {
                                            // Enemy 객체를 GameCard에서 사용할 Card 객체로 변환
                                            const enemyCard: CardType = {
                                                id: enemy.id,
                                                name: enemy.name,
                                                type: enemy.attribute === 'rock' ? 'EFFICIENCY' : enemy.attribute === 'paper' ? 'CREATIVITY' : 'COST', // 속성에 따른 타입 매핑
                                                rarity: (stageConfig.isBoss && i === 0) ? 'legendary' : 'common', // 보스는 전설, 나머지는 일반
                                                level: Math.floor(enemy.power / 100) + 1,
                                                stats: {
                                                    efficiency: enemy.attribute === 'rock' ? enemy.power : Math.floor(enemy.power * 0.8),
                                                    creativity: enemy.attribute === 'paper' ? enemy.power : Math.floor(enemy.power * 0.8),
                                                    function: enemy.attribute === 'scissors' ? enemy.power : Math.floor(enemy.power * 0.8),
                                                    totalPower: enemy.power
                                                },
                                                templateId: `enemy-${enemy.type}`, // 적 타입에 따른 이미지 템플릿 (임시)
                                                ownerId: 'enemy',
                                                experience: 0,
                                                isLocked: false,
                                                acquiredAt: new Date()
                                            };

                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="w-24 transform hover:scale-110 transition-transform z-10 hover:z-20"
                                                >
                                                    <GameCard card={enemyCard} isDisabled={false} />
                                                    {/* 적 특성 아이콘 표시 (버그/할루시네이션 등) */}
                                                    {enemy.type !== 'bad-ai' && (
                                                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-red-400 shadow-lg animate-bounce uppercase">
                                                            {enemy.type}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 5장 전투: 메인 카드 배치 / 1,3장 전투: 카드 선택 */}
                {phase === 'main-assignment' && (
                    <div>
                        {stageConfig.battleCardCount === 5 ? (
                            // 5장 전투: 심플하게 순서 변경 (Reorder)
                            <div className="max-w-4xl mx-auto">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-black text-white mb-2 orbitron italic">TACTICAL MATCHUP</h2>
                                    <p className="text-white/60">상대의 라인업(위)에 맞춰 내 유닛(아래)의 순서를 조정하세요</p>
                                </div>

                                {/* 적 유닛 라인 (Fixed) */}
                                <div className="flex justify-center gap-4 mb-2">
                                    {enemies.map((enemy, i) => {
                                        const enemyCard: CardType = {
                                            id: enemy.id,
                                            name: enemy.name,
                                            type: enemy.attribute === 'rock' ? 'EFFICIENCY' : enemy.attribute === 'paper' ? 'CREATIVITY' : 'COST',
                                            rarity: (stageConfig.isBoss && i === 0) ? 'legendary' : 'common',
                                            level: Math.floor(enemy.power / 100) + 1,
                                            stats: {
                                                efficiency: enemy.attribute === 'rock' ? enemy.power : Math.floor(enemy.power * 0.8),
                                                creativity: enemy.attribute === 'paper' ? enemy.power : Math.floor(enemy.power * 0.8),
                                                function: enemy.attribute === 'scissors' ? enemy.power : Math.floor(enemy.power * 0.8),
                                                totalPower: enemy.power
                                            },
                                            templateId: `enemy-${enemy.type}`,
                                            ownerId: 'enemy',
                                            experience: 0,
                                            isLocked: false,
                                            acquiredAt: new Date()
                                        };
                                        return (
                                            <div key={enemy.id} className="relative group">
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded-full z-20 border border-red-400">
                                                    ENEMY #{i + 1}
                                                </div>
                                                <div
                                                    className="transform scale-90 opacity-90 group-hover:scale-100 group-hover:opacity-100 transition-all grayscale-[30%] group-hover:grayscale-0 cursor-pointer"
                                                    onClick={() => setPreviewCard(enemyCard)}
                                                >
                                                    <GameCard card={enemyCard} isDisabled={false} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* VS Separator */}
                                <div className="flex justify-center gap-4 mb-2 items-center text-white/20">
                                    {Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="w-[100px] flex justify-center">
                                            <Swords size={24} className="animate-pulse" />
                                        </div>
                                    ))}
                                </div>

                                <Reorder.Group axis="x" values={selectedHand} onReorder={setSelectedHand} className="flex justify-center gap-4 mb-12 flex-wrap">
                                    {selectedHand.map((card, index) => (
                                        <Reorder.Item key={card.id} value={card}>
                                            <div className="relative group cursor-grab active:cursor-grabbing">
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black font-bold text-xs px-2 py-0.5 rounded-full z-20 border border-cyan-300">
                                                    #{index + 1}
                                                </div>
                                                <div className="transform transition-transform hover:scale-105">
                                                    <GameCard card={card} />
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>

                                {/* 활성화된 시너지 표시 */}
                                {(() => {
                                    const synergy = analyzeDeckSynergy(selectedHand);
                                    if (synergy.activeSynergies.length === 0 && synergy.activeCombos.length === 0) return null;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-8 p-4 bg-white/[0.03] rounded-2xl border border-white/10 flex flex-wrap justify-center gap-3"
                                        >
                                            <div className="w-full text-center mb-1">
                                                <span className="text-[10px] text-cyan-500 font-bold orbitron tracking-widest uppercase">Active Synergies</span>
                                            </div>

                                            {/* 기본 팩션 시너지 */}
                                            {synergy.activeSynergies.map((s: { faction: string; count: number; bonus: number }, i: number) => (
                                                <div key={`syn-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/30">
                                                    <span className="text-xs font-bold text-blue-300">{s.faction.toUpperCase()}</span>
                                                    <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded-full">x{s.count}</span>
                                                    <span className="text-xs text-green-400 font-bold">+{Math.round((s.bonus - 1) * 100)}%</span>
                                                </div>
                                            ))}

                                            {/* 네임드 콤보 */}
                                            {synergy.activeCombos.map((combo: ComboDefinition) => (
                                                <div key={combo.id} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                                    <span className="text-sm">{combo.icon}</span>
                                                    <span className="text-xs font-bold text-yellow-300">{combo.name}</span>
                                                    <span className="text-xs text-green-400 font-bold">+{Math.round(combo.bonusPower * 100)}%</span>
                                                </div>
                                            ))}

                                            {/* 총 파워 보너스 */}
                                            <div className="w-full text-center mt-1">
                                                <p className="text-xs text-white/40">
                                                    Total Power Bonus: <span className="text-green-400 font-bold">+{Math.round((synergy.totalBonus - 1) * 100)}%</span>
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                <div className="text-center">
                                    <Button
                                        color="warning"
                                        size="lg"
                                        onPress={startBattle} // 바로 전투 시작 (히든 선택 단계 생략 - 5장 순서만 정하면 끝)
                                        className="font-black px-16 h-16 text-xl tracking-widest border-2 border-yellow-500/50 hover:bg-yellow-500/20"
                                    >
                                        BATTLE START
                                    </Button>
                                    <p className="text-[10px] text-white/30 mt-4 orbitron uppercase tracking-[0.2em]">
                                        Sequence Confirmed • Initiate Protocol
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // 1장, 3장 또는 비대칭 전투 (2 vs 5 등)
                            <>
                                <div className="text-center mb-10">
                                    <div className="flex flex-col items-center gap-1 mb-6">
                                        <p className="text-[10px] text-cyan-500/60 orbitron font-black tracking-[0.5em] uppercase">Selection_Interface</p>
                                        <h2 className="text-4xl font-black text-white orbitron italic tracking-tighter">{t('battle.anim.unitAssignment')}</h2>
                                    </div>

                                    <p className="text-white/40 font-medium mb-6">전장에 투입할 <span className="text-cyan-400 font-bold">{stageConfig.asymmetricMatchup?.p || stageConfig.battleCardCount}개 유닛</span>을 선택하십시오.</p>

                                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/[0.03] rounded-2xl border border-white/10 backdrop-blur-xl">
                                        <div className="text-center">
                                            <p className="text-[8px] text-gray-500 orbitron mb-1">SELECTED</p>
                                            <p className="text-3xl font-black text-cyan-400 orbitron leading-none">{simpleSelections.length}</p>
                                        </div>
                                        <div className="w-px h-8 bg-white/10" />
                                        <div className="text-center">
                                            <p className="text-[8px] text-gray-500 orbitron mb-1">REQUIRED</p>
                                            <p className="text-3xl font-black text-white/40 orbitron leading-none">{stageConfig.asymmetricMatchup?.p || stageConfig.battleCardCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-6 flex-wrap mb-12">
                                    {selectedHand.map(card => {
                                        const isCardSelected = simpleSelections.some(c => c.id === card.id);
                                        return (
                                            <motion.div
                                                key={card.id}
                                                whileHover={{ y: -10 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="cursor-pointer relative group"
                                                onClick={() => toggleSimpleSelection(card)}
                                            >
                                                <GameCard
                                                    card={card}
                                                    isSelected={isCardSelected}
                                                />
                                                {isCardSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center border-4 border-black z-20"
                                                    >
                                                        <Zap size={14} className="text-white fill-white" />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="text-center">
                                    <Button
                                        color="warning"
                                        variant="flat"
                                        size="lg"
                                        isDisabled={simpleSelections.length !== (stageConfig.asymmetricMatchup?.p || stageConfig.battleCardCount)}
                                        onPress={confirmMainAssignment}
                                        className="font-black orbitron px-20 h-16 text-lg tracking-widest border border-white/5 hover:border-cyan-500/30 transition-all uppercase"
                                    >
                                        Execute_Deployment
                                    </Button>
                                </div>
                            </>
                        )
                        }
                    </div >
                )}


                {/* 전투 중: Battle Arena */}
                {
                    phase === 'battle' && battleResult && (
                        <div className="relative min-h-[70vh] flex flex-col items-center justify-center pt-20">
                            {/* 상단 스코어보드 */}
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute top-0 flex items-center gap-12 bg-black/40 backdrop-blur-xl px-12 py-4 rounded-b-[2rem] border-x border-b border-white/5"
                            >
                                <div className="text-center">
                                    <p className="text-[10px] text-cyan-500 font-black orbitron mb-1 uppercase tracking-widest">PLAYER</p>
                                    <p className="text-4xl font-black text-white orbitron">{animatedPlayerWins}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-white/20 font-black orbitron mb-1 uppercase tracking-widest">ROUND</p>
                                    <p className="text-2xl font-black text-white/40 orbitron">{currentBattleRound + 1} / {battleResult.rounds.length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-red-500 font-black orbitron mb-1 uppercase tracking-widest">ENEMY</p>
                                    <p className="text-4xl font-black text-white orbitron">{animatedEnemyWins}</p>
                                </div>

                                {/* 속도 조절 버튼 */}
                                <div className="border-l border-white/10 pl-6 ml-2">
                                    <p className="text-[8px] text-white/30 font-bold orbitron mb-1 uppercase tracking-wider">SPEED</p>
                                    <div className="flex gap-1">
                                        {([1, 2, 3] as const).map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => setBattleSpeed(speed)}
                                                className={cn(
                                                    "px-2 py-1 text-xs font-black orbitron rounded-md transition-all",
                                                    battleSpeed === speed
                                                        ? "bg-cyan-500 text-black"
                                                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                                                )}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            <div className="w-full max-w-5xl flex items-center justify-between gap-4 px-12">
                                {/* 아군 카드 */}
                                <AnimatePresence mode="wait">
                                    {roundAnimState !== 'idle' && (
                                        <motion.div
                                            key={`player-round-${currentBattleRound}`}
                                            initial={{ x: -300, opacity: 0, rotateY: 90 }}
                                            animate={{
                                                x: roundAnimState === 'clash' ? 80 : 0,
                                                opacity: 1,
                                                rotateY: 0,
                                                scale: roundAnimState === 'clash' ? 1.05 : 1
                                            }}
                                            exit={{ x: -500, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -top-12 left-0 right-0 text-center">
                                                <p className="text-[10px] text-cyan-400 orbitron font-black uppercase tracking-widest">{battleResult.rounds[currentBattleRound].playerCard.name}</p>
                                            </div>
                                            <div className="w-48 lg:w-60 aspect-[3/4] bg-black/40 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-[2rem] flex flex-col items-center justify-center p-6 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden">
                                                {/* 속성 아이콘 배경 */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-5 select-none text-cyan-500">
                                                    {battleResult.rounds[currentBattleRound].playerCard.attribute === 'rock' ? '✊' :
                                                        battleResult.rounds[currentBattleRound].playerCard.attribute === 'paper' ? '✋' : '✌️'}
                                                </div>

                                                <motion.div
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                    className="text-5xl mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"
                                                >
                                                    {battleResult.rounds[currentBattleRound].playerCard.attribute === 'rock' ? '✊' :
                                                        battleResult.rounds[currentBattleRound].playerCard.attribute === 'paper' ? '✋' : '✌️'}
                                                </motion.div>

                                                <div className="text-center relative z-10">
                                                    <p className="text-5xl font-black text-white orbitron mb-2 tracking-tighter italic">
                                                        {battleResult.rounds[currentBattleRound].playerCard.power}
                                                    </p>
                                                    <Chip size="sm" color="primary" variant="flat" className="orbitron font-bold px-4">
                                                        {battleResult.rounds[currentBattleRound].playerCard.attribute.toUpperCase()}
                                                    </Chip>
                                                </div>
                                            </div>

                                            {/* 승패 결과 오버레이 */}
                                            {roundAnimState === 'result' && battleResult.rounds[currentBattleRound].winner === 'player' && (
                                                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1.2, rotate: 0 }} className="absolute -top-6 -right-6 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center border-4 border-black z-20 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                                    <Trophy size={28} className="text-white fill-white" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* 대결 심볼 */}
                                <div className="flex flex-col items-center gap-4">
                                    <motion.div
                                        animate={{
                                            scale: roundAnimState === 'clash' ? [1, 1.3, 1] : 1,
                                            rotate: roundAnimState === 'clash' ? [0, 15, -15, 0] : 0
                                        }}
                                        className="z-10 bg-white/[0.03] p-8 rounded-full border border-white/10 backdrop-blur-3xl relative"
                                    >
                                        <Swords className={cn(
                                            "transition-colors duration-300",
                                            roundAnimState === 'clash' ? "text-yellow-400" : "text-white/20"
                                        )} size={64} />
                                        {roundAnimState === 'clash' && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 2, opacity: [0, 1, 0] }}
                                                className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"
                                            />
                                        )}
                                    </motion.div>
                                    <p className="text-[10px] text-white/20 orbitron font-bold tracking-[0.5em]">VS</p>
                                </div>

                                {/* 적군 카드 */}
                                <AnimatePresence mode="wait">
                                    {roundAnimState !== 'idle' && (
                                        <motion.div
                                            key={`enemy-round-${currentBattleRound}`}
                                            initial={{ x: 300, opacity: 0, rotateY: -90 }}
                                            animate={{
                                                x: roundAnimState === 'clash' ? -80 : 0,
                                                opacity: 1,
                                                rotateY: 0,
                                                scale: roundAnimState === 'clash' ? 1.05 : 1
                                            }}
                                            exit={{ x: 500, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -top-12 left-0 right-0 text-center">
                                                <p className="text-[10px] text-red-500 orbitron font-black uppercase tracking-widest">{battleResult.rounds[currentBattleRound].enemyCard.name}</p>
                                            </div>
                                            <div className="w-48 lg:w-60 aspect-[3/4] bg-black/40 backdrop-blur-2xl border-2 border-red-500/50 rounded-[2rem] flex flex-col items-center justify-center p-6 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
                                                {/* 속성 아이콘 배경 */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-5 select-none text-red-500">
                                                    {battleResult.rounds[currentBattleRound].enemyCard.attribute === 'rock' ? '✊' :
                                                        battleResult.rounds[currentBattleRound].enemyCard.attribute === 'paper' ? '✋' : '✌️'}
                                                </div>

                                                <motion.div
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                                    className="text-5xl mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10"
                                                >
                                                    {battleResult.rounds[currentBattleRound].enemyCard.attribute === 'rock' ? '✊' :
                                                        battleResult.rounds[currentBattleRound].enemyCard.attribute === 'paper' ? '✋' : '✌️'}
                                                </motion.div>

                                                <div className="text-center relative z-10">
                                                    <p className="text-5xl font-black text-white orbitron mb-2 tracking-tighter italic">
                                                        {battleResult.rounds[currentBattleRound].enemyCard.power}
                                                    </p>
                                                    <Chip size="sm" color="danger" variant="flat" className="orbitron font-bold px-4">
                                                        {battleResult.rounds[currentBattleRound].enemyCard.attribute.toUpperCase()}
                                                    </Chip>
                                                </div>
                                            </div>

                                            {/* 승패 결과 오버레이 */}
                                            {roundAnimState === 'result' && battleResult.rounds[currentBattleRound].winner === 'enemy' && (
                                                <motion.div initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1.2, rotate: 0 }} className="absolute -top-6 -left-6 w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center border-4 border-black z-20 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                                    <X size={28} className="text-white" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 라운드 결과 메시지 */}
                            <AnimatePresence>
                                {roundAnimState === 'result' && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        className="mt-12 text-center"
                                    >
                                        <h3 className={cn(
                                            "text-4xl font-black orbitron uppercase italic tracking-widest drop-shadow-lg",
                                            battleResult.rounds[currentBattleRound].winner === 'player' ? "text-green-400" :
                                                battleResult.rounds[currentBattleRound].winner === 'enemy' ? "text-red-500" : "text-gray-400"
                                        )}>
                                            {battleResult.rounds[currentBattleRound].winner === 'player' ? t('battle.anim.roundVictory') :
                                                battleResult.rounds[currentBattleRound].winner === 'enemy' ? t('battle.anim.roundDefeat') : t('battle.anim.drawSignal')}
                                        </h3>

                                        {/* 승패 이유 표시 */}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="mt-4 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                                        >
                                            {battleResult.rounds[currentBattleRound].attributeBonus !== 0 ? (
                                                // 속성 상성으로 승패 결정
                                                <>
                                                    <span className={cn(
                                                        "text-3xl",
                                                        battleResult.rounds[currentBattleRound].attributeBonus > 0 ? "text-green-400" : "text-red-400"
                                                    )}>
                                                        {battleResult.rounds[currentBattleRound].playerCard.attribute === 'rock' ? '✊' :
                                                            battleResult.rounds[currentBattleRound].playerCard.attribute === 'paper' ? '✋' : '✌️'}
                                                    </span>
                                                    <span className={cn(
                                                        "text-xl font-black orbitron",
                                                        battleResult.rounds[currentBattleRound].attributeBonus > 0 ? "text-green-400" : "text-red-400"
                                                    )}>
                                                        {battleResult.rounds[currentBattleRound].attributeBonus > 0 ? '>' : '<'}
                                                    </span>
                                                    <span className={cn(
                                                        "text-3xl",
                                                        battleResult.rounds[currentBattleRound].attributeBonus > 0 ? "text-red-400/50" : "text-green-400"
                                                    )}>
                                                        {battleResult.rounds[currentBattleRound].enemyCard.attribute === 'rock' ? '✊' :
                                                            battleResult.rounds[currentBattleRound].enemyCard.attribute === 'paper' ? '✋' : '✌️'}
                                                    </span>
                                                    <span className={cn(
                                                        "ml-2 text-xs font-bold orbitron uppercase tracking-wider",
                                                        battleResult.rounds[currentBattleRound].attributeBonus > 0 ? "text-green-400/80" : "text-red-400/80"
                                                    )}>
                                                        {battleResult.rounds[currentBattleRound].attributeBonus > 0 ? 'TYPE ADVANTAGE' : 'TYPE DISADVANTAGE'}
                                                    </span>
                                                </>
                                            ) : (
                                                // 파워 차이로 승패 결정
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Zap className={cn(
                                                            "w-5 h-5",
                                                            battleResult.rounds[currentBattleRound].winner === 'player' ? "text-cyan-400" : "text-red-400"
                                                        )} />
                                                        <span className="text-2xl font-black orbitron text-white">
                                                            {battleResult.rounds[currentBattleRound].playerFinalPower}
                                                        </span>
                                                    </div>
                                                    <span className="text-white/30 text-sm font-bold">vs</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-black orbitron text-white/60">
                                                            {battleResult.rounds[currentBattleRound].enemyFinalPower}
                                                        </span>
                                                    </div>
                                                    {battleResult.rounds[currentBattleRound].winner !== 'draw' && (
                                                        <span className={cn(
                                                            "ml-2 text-xs font-bold orbitron uppercase tracking-wider px-2 py-1 rounded-full",
                                                            battleResult.rounds[currentBattleRound].winner === 'player'
                                                                ? "text-cyan-400 bg-cyan-400/10"
                                                                : "text-red-400 bg-red-400/10"
                                                        )}>
                                                            {battleResult.rounds[currentBattleRound].winner === 'player'
                                                                ? `+${battleResult.rounds[currentBattleRound].playerFinalPower - battleResult.rounds[currentBattleRound].enemyFinalPower} PWR`
                                                                : `-${battleResult.rounds[currentBattleRound].enemyFinalPower - battleResult.rounds[currentBattleRound].playerFinalPower} PWR`}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>

                                        <p className="text-[10px] text-white/30 orbitron mt-4 tracking-[0.3em]">
                                            {battleResult.rounds[currentBattleRound].winner === 'player' ? t('battle.anim.integrityUp') :
                                                battleResult.rounds[currentBattleRound].winner === 'enemy' ? t('battle.anim.securityBreach') : t('battle.anim.evalInProgress')}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                }

                {/* 결과 */}
                {
                    phase === 'result' && battleResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="text-center max-w-2xl mx-auto"
                        >
                            <div className={cn(
                                "relative p-12 rounded-[2.5rem] border-2 mb-10 overflow-hidden backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]",
                                battleResult.result === 'victory'
                                    ? "bg-green-600/5 border-green-500/30"
                                    : "bg-red-600/5 border-red-500/30"
                            )}>
                                {/* 배경 띠 애니메이션 */}
                                <motion.div
                                    animate={{
                                        x: battleResult.result === 'victory' ? [-500, 500] : [500, -500],
                                        opacity: [0, 0.5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className={cn(
                                        "absolute inset-0 h-px top-1/2 -translate-y-1/2 w-full",
                                        battleResult.result === 'victory' ? "bg-green-400" : "bg-red-400"
                                    )}
                                />

                                <div className="relative z-10">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 12 }}
                                        className="mb-8"
                                    >
                                        {battleResult.result === 'victory' ? (
                                            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                                <Trophy className="text-green-400" size={48} />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                                <Shield className="text-red-400" size={48} />
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="space-y-2 mb-8">
                                        <p className={cn(
                                            "text-xs font-black orbitron tracking-[0.5em] uppercase",
                                            battleResult.result === 'victory' ? "text-green-500/60" : "text-red-500/60"
                                        )}>
                                            {battleResult.result === 'victory' ? t('battle.anim.verificationSuccessful') : t('battle.anim.securityCompromised')}
                                        </p>
                                        <h2 className={cn(
                                            "text-6xl font-black orbitron italic tracking-tighter drop-shadow-2xl",
                                            battleResult.result === 'victory' ? "text-green-400" : "text-red-500"
                                        )}>
                                            {battleResult.result === 'victory' ? "승리 (VICTORY)" : "패배 (DEFEAT)"}
                                        </h2>
                                    </div>

                                    <div className="flex items-center justify-center gap-6 mb-10">
                                        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 text-xl font-bold orbitron">
                                            <span className="text-white/40 mr-2">SCORE</span>
                                            <span className={battleResult.result === 'victory' ? "text-green-400" : "text-red-400"}>
                                                {battleResult.playerWins} : {battleResult.enemyWins}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="p-6 bg-white/[0.03] rounded-3xl border border-white/5"
                                        >
                                            <p className="text-[10px] text-yellow-500/60 font-black orbitron mb-2">{t('battle.anim.recoveredCredits')}</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-3xl font-black text-yellow-400 orbitron">+{battleResult.rewards.coins}</span>
                                                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                    <span className="text-xs text-yellow-500 font-bold">C</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="p-6 bg-white/[0.03] rounded-3xl border border-white/5"
                                        >
                                            <p className="text-[10px] text-cyan-500/60 font-black orbitron mb-2">{t('battle.anim.operationalExp')}</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-3xl font-black text-cyan-400 orbitron">+{battleResult.rewards.exp}</span>
                                                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                    <Zap className="text-cyan-400" size={12} fill="currentColor" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* 노이즈 효과 (패배 시 강하게) */}
                                {battleResult.result === 'defeat' && (
                                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse mix-blend-overlay" />
                                )}
                            </div>

                            <Button
                                color={battleResult.result === 'victory' ? 'success' : 'danger'}
                                variant="flat"
                                size="lg"
                                onPress={handleResultConfirm}
                                className="font-black orbitron px-16 h-16 text-lg uppercase tracking-widest border border-white/10 hover:border-white/20"
                            >
                                Confirm_Signal
                            </Button>
                        </motion.div>
                    )
                }

                {/* 적 상세 정보 모달 */}
                <AnimatePresence>
                    {previewCard && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewCard(null)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative max-w-lg w-full bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="absolute top-4 right-4 z-10">
                                    <button onClick={() => setPreviewCard(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-1/2 p-6 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                        <div className="transform scale-110">
                                            <GameCard card={previewCard} isDisabled={false} />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 p-6">
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    previewCard.type === 'EFFICIENCY' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                                        previewCard.type === 'CREATIVITY' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                                                            "bg-green-500/20 text-green-400 border border-green-500/30"
                                                )}>
                                                    {previewCard.type}
                                                </span>
                                                <span className="text-white/40 text-xs">Lv.{previewCard.level}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white orbitron mb-2">{previewCard.name}</h3>
                                            <p className="text-white/60 text-sm leading-relaxed">
                                                이 유닛은
                                                <span className={cn(
                                                    "font-bold mx-1",
                                                    previewCard.type === 'EFFICIENCY' ? "text-blue-400" :
                                                        previewCard.type === 'CREATIVITY' ? "text-purple-400" : "text-green-400"
                                                )}>
                                                    {previewCard.type === 'EFFICIENCY' ? '효율성(Rock)' :
                                                        previewCard.type === 'CREATIVITY' ? '창의성(Paper)' : '기능성(Scissors)'}
                                                </span>
                                                속성을 가집니다.
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-white/50">상성 우위 (Strong)</span>
                                                    <span className="text-sm font-bold text-green-400">
                                                        {previewCard.type === 'EFFICIENCY' ? '✂️ 기능성' :
                                                            previewCard.type === 'CREATIVITY' ? '✊ 효율성' : '✋ 창의성'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-white/50">상성 열위 (Weak)</span>
                                                    <span className="text-sm font-bold text-red-400">
                                                        {previewCard.type === 'EFFICIENCY' ? '✋ 창의성' :
                                                            previewCard.type === 'CREATIVITY' ? '✂️ 기능성' : '✊ 효율성'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div className="bg-white/5 p-2 rounded">
                                                    <div className="text-white/30 mb-1">PWR</div>
                                                    <div className="font-bold text-white">{previewCard.stats.totalPower}</div>
                                                </div>
                                                <div className="bg-white/5 p-2 rounded">
                                                    <div className="text-white/30 mb-1">ATK</div>
                                                    <div className="font-bold text-white">
                                                        {previewCard.type === 'EFFICIENCY' ? previewCard.stats.efficiency :
                                                            previewCard.type === 'CREATIVITY' ? previewCard.stats.creativity : previewCard.stats.function}
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 p-2 rounded">
                                                    <div className="text-white/30 mb-1">BONUS</div>
                                                    <div className="font-bold text-yellow-400">+{stageConfig?.enemyPowerBonus}%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full font-bold"
                                            onPress={() => setPreviewCard(null)}
                                        >
                                            확인 완료
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div >

        </div >
    );
}
