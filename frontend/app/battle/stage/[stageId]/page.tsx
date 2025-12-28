'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import PageHeader from '@/components/PageHeader';
import GameCard from '@/components/GameCard';
import { Card as UICard, CardBody } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { useUser } from '@/context/UserContext';
import { useAlert } from '@/context/AlertContext';
import { useFooter } from '@/context/FooterContext';
import { useTranslation } from '@/context/LanguageContext';
import { gameStorage } from '@/lib/game-storage';
import { Card as GameCardType } from '@/lib/types';
import { getStoryStage, StoryStage, completeStage } from '@/lib/story-system';
import {
    generateEnemies,
    simulateStageBattle,
    StageConfig,
    Enemy,
    StageBattleResult
} from '@/lib/stage-system';
import { Zap, Swords, Shuffle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 5장 전투 2단계 시스템:
 * 1단계: 라운드 1~5에 들어갈 카드 각각 1장씩 배치 (총 5장)
 * 2단계: 라운드 2, 4에 사용할 히든카드를 이미 배치된 5장 중에서 선택
 */
type Phase = 'hand-selection' | 'viewing' | 'enemy-presentation' | 'main-assignment' | 'hidden-assignment' | 'battle' | 'result';

export default function StageBattlePage() {
    const router = useRouter();
    const params = useParams();
    const stageIdStr = params.stageId as string;

    const { addCoins, addExperience, refreshData } = useUser();
    const { showAlert } = useAlert();
    const footer = useFooter();
    const { t } = useTranslation();

    const [phase, setPhase] = useState<Phase>('hand-selection');
    const [allCards, setAllCards] = useState<GameCardType[]>([]);
    const [selectedHand, setSelectedHand] = useState<GameCardType[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);

    // Story Data
    const [storyStage, setStoryStage] = useState<StoryStage | undefined>(undefined);
    const [stageConfig, setStageConfig] = useState<StageConfig | null>(null);

    // 5장 전투: 라운드별 메인 카드 배치 (각 라운드 1장씩)
    const [mainAssignments, setMainAssignments] = useState<(GameCardType | null)[]>([null, null, null, null, null]);
    // 5장 전투: 라운드 2, 4의 히든카드 (이미 배치된 카드 중에서 선택)
    const [hiddenR2, setHiddenR2] = useState<GameCardType | null>(null);
    const [hiddenR4, setHiddenR4] = useState<GameCardType | null>(null);
    const [currentHiddenRound, setCurrentHiddenRound] = useState<2 | 4>(2);

    // 1장/3장 전투용
    const [simpleSelections, setSimpleSelections] = useState<GameCardType[]>([]);

    const [viewTimer, setViewTimer] = useState(0);
    const [battleResult, setBattleResult] = useState<StageBattleResult | null>(null);

    // 전투 연출용 상태
    const [currentBattleRound, setCurrentBattleRound] = useState(0);
    const [animatedPlayerWins, setAnimatedPlayerWins] = useState(0);
    const [animatedEnemyWins, setAnimatedEnemyWins] = useState(0);
    const [roundAnimState, setRoundAnimState] = useState<'idle' | 'entry' | 'clash' | 'result' | 'exit'>('idle');
    const [battleSpeed, setBattleSpeed] = useState<1 | 2 | 3>(1);
    const battleSpeedRef = useRef(battleSpeed);
    useEffect(() => { battleSpeedRef.current = battleSpeed; }, [battleSpeed]);

    // 튜토리얼 상태 (스테이지 1-1 첫 진입 시)
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    // 배틀 모드 한글 이름
    const getBattleModeName = (mode: string) => {
        switch (mode) {
            case 'ONE_CARD': return '⚡ 단판 승부';
            case 'TRIPLE_THREAT': return '🎭 전략 승부';
            case 'STANDARD_5': return '⚔️ 전술 승부';
            default: return mode;
        }
    };

    const getBattleModeDescription = (mode: string) => {
        switch (mode) {
            case 'ONE_CARD': return '카드 1장으로 빠른 승부! 운과 직감이 중요합니다.';
            case 'TRIPLE_THREAT': return '카드 3장으로 전략적 대결! 히든 카드가 승부를 결정합니다.';
            case 'STANDARD_5': return '카드 5장 풀 배틀! 덱 구성과 배치가 핵심입니다.';
            default: return '';
        }
    };

    // Data Load
    useEffect(() => {
        loadCards();
        const stage = getStoryStage(stageIdStr, t);
        if (stage) {
            setStoryStage(stage);

            // Map StoryStage to StageConfig
            // 모든 모드에서 5장 선택 후 순서 결정
            // battleCardCount는 승리 조건 결정용 (1=1승 필요, 3=2승 필요, 5=3승 필요)
            const battleCount = stage.battleMode === 'ONE_CARD' ? 1 :
                stage.battleMode === 'TRIPLE_THREAT' ? 3 : 5;

            const config: StageConfig = {
                stageId: stage.step,
                chapter: 1, // Defaulting to 1 for now
                playerHandSize: 5, // 항상 5장 선택
                battleCardCount: battleCount as 1 | 3 | 5,
                isBoss: stage.difficulty === 'BOSS',
                enemyPowerBonus: 0,
                rewardMultiplier: 1,
                enemyPattern: 'random',
                stageInChapter: stage.step,
                description: stage.description
            };
            setStageConfig(config);

            // 스테이지 1-1 첫 진입 시 튜토리얼 표시
            if (stage.id === 'stage-1-1') {
                const tutorialDone = localStorage.getItem('tutorial_stage_1_1_done');
                if (!tutorialDone) {
                    setShowTutorial(true);
                }
            }
        } else {
            // Fallback: try numeric ID for legacy support or redirect
            const numericId = parseInt(stageIdStr);
            if (!isNaN(numericId)) {
                setStageConfig({
                    stageId: numericId,
                    chapter: 1,
                    playerHandSize: 5,
                    battleCardCount: 5,
                    isBoss: false,
                    enemyPowerBonus: 0,
                    rewardMultiplier: 1,
                    enemyPattern: 'random',
                    stageInChapter: numericId,
                    description: ''
                });
            }
        }
    }, [stageIdStr]);

    // 푸터 선택 모드 설정 및 동기화
    useEffect(() => {
        if (phase === 'hand-selection' && stageConfig) {
            footer.setSelectionMode(stageConfig.playerHandSize, `${stageConfig.playerHandSize}장 선택`);
            footer.setLeftNav({ type: 'back', label: '포기하기' });
        } else if (['viewing'].includes(phase) && stageConfig) {
            footer.setSelectionMode(0);
            footer.setInfo([
                { label: 'OPPONENT', value: storyStage?.enemy.name || 'Unknown', color: 'text-red-400' },
                { label: 'MODE', value: `${stageConfig.battleCardCount}-CARD`, color: 'text-yellow-400' }
            ]);
            footer.setLeftNav({ type: 'back' });
        } else if (phase === 'main-assignment') {
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
    }, [phase, stageConfig, storyStage]);

    // 푸터 선택 슬롯과 로컬 selectedHand 동기화
    useEffect(() => {
        if (phase === 'hand-selection') {
            setSelectedHand(footer.state.selectionSlots);

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
                    label: '전투 개시',
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
                    onClick: () => { }
                });
                footer.setAction({
                    label: '전투 개시',
                    isDisabled: true,
                    color: 'warning',
                    onClick: confirmHand
                });
            }
        }
    }, [footer.state.selectionSlots, phase, stageConfig]);

    const loadCards = async () => {
        // 1. 게임 스토리지에서 로드 시도
        let cards = await gameStorage.getCards();
        console.log('[BattlePage] gameStorage.getCards() 결과:', cards.length, '장');

        // 2. 카드가 없으면 인벤토리 시스템에서도 시도
        if (cards.length === 0) {
            try {
                const { loadInventory } = await import('@/lib/inventory-system');
                const inventoryCards = await loadInventory();
                console.log('[BattlePage] loadInventory() 결과:', inventoryCards.length, '장');
                cards = inventoryCards;
            } catch (e) {
                console.error('[BattlePage] 인벤토리 로드 실패:', e);
            }
        }

        // Process types if missing (Legacy logic)
        const processedCards = cards.map((card: any) => {
            if (!card.type) {
                const stats = card.stats || { efficiency: 0, creativity: 0, function: 0 };
                let type: any = 'EFFICIENCY';
                if (stats.creativity! > stats.efficiency! && stats.creativity! > stats.function!) type = 'CREATIVITY';
                else if (stats.function! > stats.efficiency! && stats.function! > stats.creativity!) type = 'FUNCTION';
                return { ...card, type };
            }
            return card;
        });
        console.log('[BattlePage] 최종 로드된 카드:', processedCards.length, '장');
        setAllCards(processedCards);
    };

    const getCardAttribute = (card: GameCardType): 'rock' | 'paper' | 'scissors' => {
        if (card.type === 'EFFICIENCY') return 'rock';
        if (card.type === 'CREATIVITY') return 'paper';
        if (card.type === 'FUNCTION') return 'scissors';
        return 'rock';
    };

    const toggleHandSelection = (card: GameCardType) => {
        const isSelected = footer.state.selectionSlots.find(c => c.id === card.id);
        if (isSelected) {
            footer.removeFromSelection(card.id);
            return;
        }

        const maxHandSize = stageConfig?.playerHandSize || 5;
        if (footer.state.selectionSlots.length >= maxHandSize) {
            showAlert({
                title: '슬롯 가득 참',
                message: `최대 ${maxHandSize}장까지만 선택할 수 있습니다.`,
                type: 'warning'
            });
            return;
        }

        const cardRarity = card.rarity || 'common';
        const sameRarityCard = footer.state.selectionSlots.find(c => (c.rarity || 'common') === cardRarity);

        // 튜토리얼(챕터 1-1, 1-2 등)에서는 제한 완화 가능하지만 일단 유지
        if (sameRarityCard && (storyStage?.step ?? 0) > 3) {
            // 1-3 이후부터 제한 적용
            showAlert({
                title: '중복 등급 제한',
                message: `${cardRarity.toUpperCase()} 등급 카드는 이미 선택되었습니다.`,
                type: 'warning'
            });
            return;
        }

        footer.addToSelection(card);
    };

    const confirmHand = () => {
        const slots = footer.state.selectionSlots;
        const requiredSize = stageConfig?.playerHandSize || 5;

        if (slots.length !== requiredSize || !stageConfig) {
            showAlert({ title: '선택 미완료', message: `카드 ${requiredSize}장을 선택해주세요.`, type: 'warning' });
            return;
        }

        const avgPower = slots.reduce((sum, c) => sum + (c.stats?.totalPower || 0), 0) / slots.length;
        const matchup = stageConfig.asymmetricMatchup;
        const enemyCardCount = matchup ? matchup.e : stageConfig.battleCardCount;

        // 적 생성 (stageId 전달하여 고정 덱 패턴 사용)
        const enemyList = generateEnemies(stageConfig, avgPower, stageIdStr);

        // [STORY INTEGRATION] Override enemy details
        if (storyStage) {
            enemyList.forEach((e, i) => {
                e.name = storyStage.enemy.name;
                if (i === 0) {
                    // Main enemy / Boss
                    (e as any).image = storyStage.enemy.image;
                }
            });
        }

        setSelectedHand(slots);
        setEnemies(enemyList);
        footer.exitSelectionMode();
        footer.setAction(undefined);

        // Auto-select for simple modes
        const pCount = matchup?.p || stageConfig.battleCardCount;
        if (slots.length === pCount) {
            setSimpleSelections(slots);
        }

        setPhase('enemy-presentation');
        setDialogueIndex(0);
    };

    // 적 대사 로직
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [enemyDialogues, setEnemyDialogues] = useState<string[]>([]);

    useEffect(() => {
        if (phase === 'enemy-presentation') {
            if (storyStage) {
                setEnemyDialogues([storyStage.enemy.dialogue.intro]);
            } else {
                setEnemyDialogues(["전투를 시작합니다."]);
            }
        }
    }, [phase, storyStage]);

    const handleNextDialogue = () => {
        if (dialogueIndex < enemyDialogues.length - 1) {
            const nextIndex = dialogueIndex + 1;
            setDialogueIndex(nextIndex);
            // TTS omitted for brevity but can be restored
        } else {
            // End dialogue
            const viewTime = stageConfig?.battleCardCount === 1 ? 5 : 10;
            setViewTimer(viewTime);
            setPhase('viewing');
        }
    };

    // 공개 타이머
    useEffect(() => {
        if (phase !== 'viewing' || viewTimer <= 0) return;
        const timer = setInterval(() => {
            setViewTimer(prev => {
                if (prev <= 1) {
                    if (stageConfig?.battleCardCount === 5) {
                        setPhase('main-assignment');
                    } else {
                        startBattle();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, viewTimer, stageConfig]);

    // 5장 전투 로직들...
    const assignToRound = (card: GameCardType, roundIndex: number) => {
        const newAssignments = mainAssignments.map((assigned, idx) => {
            if (assigned?.id === card.id && idx !== roundIndex) return null;
            if (idx === roundIndex) return card;
            return assigned;
        });
        setMainAssignments(newAssignments);
    };

    const confirmMainAssignment = () => {
        if (mainAssignments.some(a => a === null)) return;
        setPhase('hidden-assignment');
        setCurrentHiddenRound(2);
    };

    const selectHiddenCard = (card: GameCardType) => {
        if (currentHiddenRound === 2) setHiddenR2(card);
        else setHiddenR4(card);
    };

    const confirmHiddenSelection = () => {
        if (currentHiddenRound === 2) {
            if (!hiddenR2) return;
            setCurrentHiddenRound(4);
        } else {
            if (!hiddenR4) return;
            startBattle();
        }
    };

    const startBattle = () => {
        if (!stageConfig) return;
        // Construct player deck based on phases
        // Simplified: use selectedHand directly or ordered
        const playerCards = selectedHand.map(c => ({
            name: c.name || 'Unit',
            power: c.stats?.totalPower || 0,
            attribute: getCardAttribute(c)
        }));

        const result = simulateStageBattle(playerCards, enemies, stageConfig);
        setBattleResult(result);
        setCurrentBattleRound(0);
        setAnimatedPlayerWins(0);
        setAnimatedEnemyWins(0);
        setPhase('battle');
        runBattleSequence(result);
    };

    const runBattleSequence = async (result: StageBattleResult) => {
        // Simplified animation sequence
        for (let i = 0; i < result.rounds.length; i++) {
            setCurrentBattleRound(i);
            setRoundAnimState('entry');
            await new Promise(r => setTimeout(r, 800 / battleSpeedRef.current));
            setRoundAnimState('clash');
            await new Promise(r => setTimeout(r, 600 / battleSpeedRef.current));
            setRoundAnimState('result');
            if (result.rounds[i].winner === 'player') setAnimatedPlayerWins(p => p + 1);
            else if (result.rounds[i].winner === 'enemy') setAnimatedEnemyWins(p => p + 1);
            await new Promise(r => setTimeout(r, 1200 / battleSpeedRef.current));
            setRoundAnimState('exit');
        }
        setTimeout(() => setPhase('result'), 500);
    };

    const handleResultConfirm = async () => {
        if (!battleResult) return;

        await addCoins(battleResult.rewards.coins);
        await addExperience(battleResult.rewards.exp);

        // [STORY INTEGRATION] Mark stage as cleared
        if (storyStage && battleResult.result === 'victory') {
            await completeStage('chapter-1', storyStage.id); // TODO: Pass chapterId dynamically
        }

        router.push(`/story/chapter-1`); // Return to story map
    };

    if (!stageConfig) return <div className="p-12 text-center text-white">Loadiing Stage Configuration...</div>;

    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-30" />
            <div className="max-w-7xl mx-auto relative z-10">
                <PageHeader
                    title={storyStage?.title || `STAGE ${stageConfig.stageId}`}
                    englishTitle="BATTLE SEQUENCE"
                    description={`VS ${storyStage?.enemy.name || 'Unknown'}`}
                    color="orange"
                />

                {/* --- 1. Hand Selection --- */}
                {phase === 'hand-selection' && (
                    <div className="pb-24">
                        {/* 배틀 모드 표시 */}
                        <div className="text-center mb-8">
                            <div className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl mb-4">
                                <span className="text-2xl font-black text-amber-400">
                                    {getBattleModeName(storyStage?.battleMode || 'STANDARD_5')}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">
                                {getBattleModeDescription(storyStage?.battleMode || 'STANDARD_5')}
                            </p>
                            <h2 className="text-xl font-bold text-white mb-2">카드를 선택하세요</h2>
                            <p className="text-gray-500">
                                {stageConfig.playerHandSize}장의 카드를 선택하여 전투에 참가합니다
                            </p>
                        </div>

                        {/* 카드가 없을 때 안내 */}
                        {allCards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-bold text-white mb-2">카드가 없습니다!</h3>
                                <p className="text-gray-400 mb-6 text-center max-w-md">
                                    전투에 참가하려면 먼저 카드가 필요합니다.<br />
                                    AI 군단을 배치하여 카드를 생성하세요.
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        color="primary"
                                        onPress={() => router.push('/generation')}
                                    >
                                        🎲 카드 생성하기
                                    </Button>
                                    <Button
                                        color="default"
                                        onPress={() => router.push('/factions')}
                                    >
                                        🤖 AI 군단 배치
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {allCards.map(card => (
                                    <motion.div key={card.id} onClick={() => toggleHandSelection(card)} whileTap={{ scale: 0.95 }}>
                                        <GameCard card={card} isSelected={footer.state.selectionSlots.some(c => c.id === card.id)} />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* 버튼 영역 - 하단 고정 (덱 슬롯 포함) */}
                        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-4 z-50">
                            <div className="max-w-5xl mx-auto px-4">
                                {/* 덱 슬롯 5개 (크게) */}
                                <div className="flex justify-center gap-4 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const card = footer.state.selectionSlots[i];
                                        // 가위바위보 타입 결정
                                        const getTypeInfo = (c: GameCardType) => {
                                            const type = c.type || 'EFFICIENCY';
                                            if (type === 'EFFICIENCY') return { emoji: '✊', name: '바위', color: 'text-amber-400', bg: 'bg-amber-500/20' };
                                            if (type === 'CREATIVITY') return { emoji: '✌️', name: '가위', color: 'text-red-400', bg: 'bg-red-500/20' };
                                            return { emoji: '🖐️', name: '보', color: 'text-blue-400', bg: 'bg-blue-500/20' };
                                        };
                                        const typeInfo = card ? getTypeInfo(card) : null;

                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={cn(
                                                    "relative w-24 h-36 rounded-xl border-2 transition-all overflow-hidden cursor-pointer",
                                                    card
                                                        ? "border-cyan-500 bg-cyan-500/10 shadow-xl shadow-cyan-500/30"
                                                        : "border-white/20 bg-white/5 border-dashed"
                                                )}
                                                onClick={() => {
                                                    if (card) {
                                                        footer.removeFromSelection(card.id);
                                                    }
                                                }}
                                            >
                                                {card ? (
                                                    <>
                                                        {/* 카드 이미지 */}
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center"
                                                            style={{ backgroundImage: `url(${card.imageUrl || '/assets/cards/default-card.png'})` }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                                                        {/* 슬롯 번호 */}
                                                        <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                                            {i + 1}
                                                        </div>

                                                        {/* 가위바위보 타입 아이콘 */}
                                                        {typeInfo && (
                                                            <div className={cn(
                                                                "absolute top-1.5 right-1.5 px-2 py-1 rounded-full text-lg shadow-lg",
                                                                typeInfo.bg
                                                            )}>
                                                                {typeInfo.emoji}
                                                            </div>
                                                        )}

                                                        {/* 하단 전투력 표시 */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-black/50">
                                                            <div className="text-sm font-bold text-white">
                                                                ⚡{Math.floor(card.stats.totalPower)}
                                                            </div>
                                                        </div>

                                                        {/* 제거 버튼 (호버 시) */}
                                                        <div className="absolute inset-0 bg-red-500/0 hover:bg-red-500/60 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                                            <span className="text-white font-bold text-2xl drop-shadow-lg">✕</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-white/30">
                                                        <span className="text-2xl font-bold mb-1">{i + 1}</span>
                                                        <span className="text-[10px]">빈 슬롯</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => {
                                            // 자동 선택 - 등급별로 균형 잡힌 덱 구성
                                            const { selectBalancedDeck } = require('@/lib/balanced-deck-selector');
                                            const balancedDeck = selectBalancedDeck(allCards, 5);
                                            // 기존 선택 초기화 후 추가 (수동 리셋)
                                            footer.state.selectionSlots.forEach(c => footer.removeFromSelection(c.id));
                                            setTimeout(() => {
                                                balancedDeck.forEach((c: any) => footer.addToSelection(c));
                                            }, 0);
                                        }}
                                        className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <Shuffle size={20} />
                                        자동 선택
                                    </button>

                                    <div className="flex-1 text-center">
                                        <span className="text-2xl font-black orbitron">
                                            <span className={cn(
                                                footer.state.selectionSlots.length === 5 ? "text-green-400" : "text-white/60"
                                            )}>{footer.state.selectionSlots.length}</span>
                                            <span className="text-white/40">/5</span>
                                        </span>
                                        <span className="text-white/40 ml-2">선택됨</span>
                                    </div>

                                    <button
                                        onClick={confirmHand}
                                        disabled={footer.state.selectionSlots.length !== 5}
                                        className={cn(
                                            "px-8 py-3 font-bold rounded-xl transition-all flex items-center gap-2",
                                            footer.state.selectionSlots.length === 5
                                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30"
                                                : "bg-white/10 text-white/40 cursor-not-allowed"
                                        )}
                                    >
                                        <CheckCircle size={20} />
                                        전투 시작
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. Enemy Presentation --- */}
                {phase === 'enemy-presentation' && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-40 h-40 bg-red-900/40 rounded-full border-4 border-red-500 mb-8 flex items-center justify-center">
                            <span className="text-6xl">👿</span>
                        </motion.div>
                        <div className="bg-black/50 p-8 rounded-2xl border border-red-500/30 max-w-2xl text-center backdrop-blur-md">
                            <h3 className="text-red-500 text-sm font-bold tracking-widest mb-4">INCOMING TRANSMISSION</h3>
                            <p className="text-2xl text-white italic mb-8">"{enemyDialogues[dialogueIndex]}"</p>
                            <Button size="lg" color="danger" onPress={handleNextDialogue}>
                                {dialogueIndex < enemyDialogues.length - 1 ? 'NEXT' : 'BATTLE START'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* --- 3. Battle Execution (5-Card Assignment or Battle View) --- */}
                {(phase === 'viewing' || phase === 'battle' || phase === 'main-assignment' || phase === 'hidden-assignment') && (
                    <div className="flex flex-col items-center">
                        <div className="flex justify-between w-full max-w-4xl mb-8">
                            <div className="text-center">
                                <div className="text-cyan-400 font-bold mb-2">YOU</div>
                                <div className="text-4xl text-white font-black">{animatedPlayerWins}</div>
                            </div>
                            <div className="text-white/50 text-xl pt-4">VS</div>
                            <div className="text-center">
                                <div className="text-red-400 font-bold mb-2">ENEMY</div>
                                <div className="text-4xl text-white font-black">{animatedEnemyWins}</div>
                            </div>
                        </div>

                        {/* 5장 전투: 라운드별 카드 배치 UI */}
                        {phase === 'main-assignment' && (
                            <div className="w-full max-w-5xl bg-zinc-900/80 rounded-2xl border border-white/10 p-8">
                                <h3 className="text-2xl font-black text-white text-center mb-6">
                                    🎯 라운드별 카드 배치
                                </h3>
                                <p className="text-gray-400 text-center mb-8">
                                    각 라운드에 출전할 카드를 배치하세요. 순서가 승패를 결정합니다!
                                </p>

                                {/* 5개 라운드 슬롯 */}
                                <div className="grid grid-cols-5 gap-4 mb-8">
                                    {[1, 2, 3, 4, 5].map(round => {
                                        const assignedCard = mainAssignments[round - 1];
                                        const isHiddenRound = round === 2 || round === 4;
                                        return (
                                            <div key={round} className="flex flex-col items-center">
                                                <div className={`text-xs font-bold mb-2 ${isHiddenRound ? 'text-purple-400' : 'text-gray-400'}`}>
                                                    R{round} {isHiddenRound && '(히든)'}
                                                </div>
                                                <div
                                                    className={`w-full aspect-[3/4] rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${assignedCard
                                                        ? 'border-cyan-500 bg-cyan-500/10'
                                                        : 'border-white/20 bg-white/5 hover:border-white/40'
                                                        }`}
                                                >
                                                    {assignedCard ? (
                                                        <div className="text-center p-2">
                                                            <div className="text-2xl mb-1">⚔️</div>
                                                            <div className="text-xs text-white truncate">{assignedCard.name}</div>
                                                            <div className="text-xs text-cyan-400">{assignedCard.stats?.totalPower || 0}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-white/30 text-3xl">+</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 선택한 5장 카드 목록 */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-400 mb-3">선택한 카드 (클릭하여 라운드에 배치)</h4>
                                    <div className="flex gap-3 justify-center flex-wrap">
                                        {selectedHand.map((card, idx) => {
                                            const isAssigned = mainAssignments.some(a => a?.id === card.id);
                                            const assignedRound = mainAssignments.findIndex(a => a?.id === card.id) + 1;
                                            return (
                                                <motion.div
                                                    key={card.id}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        // 클릭 시 다음 빈 슬롯에 배치
                                                        const nextEmptyIdx = mainAssignments.findIndex(a => a === null);
                                                        if (!isAssigned && nextEmptyIdx !== -1) {
                                                            assignToRound(card, nextEmptyIdx);
                                                        } else if (isAssigned) {
                                                            // 이미 배치된 카드 클릭 시 해제
                                                            const newAssignments = mainAssignments.map(a => a?.id === card.id ? null : a);
                                                            setMainAssignments(newAssignments);
                                                        }
                                                    }}
                                                    className={`w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${isAssigned
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : 'border-white/20 bg-white/5 hover:border-cyan-500'
                                                        }`}
                                                >
                                                    <div className="text-lg">⚔️</div>
                                                    <div className="text-[10px] text-white truncate px-1">{card.name}</div>
                                                    <div className="text-[10px] text-cyan-400">{card.stats?.totalPower || 0}</div>
                                                    {isAssigned && (
                                                        <div className="text-[9px] text-green-400 mt-1">R{assignedRound}</div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        color="success"
                                        size="lg"
                                        isDisabled={mainAssignments.some(a => a === null)}
                                        onPress={confirmMainAssignment}
                                    >
                                        배치 완료 → 히든카드 선택
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 히든카드 선택 UI */}
                        {phase === 'hidden-assignment' && (
                            <div className="w-full max-w-4xl bg-zinc-900/80 rounded-2xl border border-purple-500/30 p-8">
                                <h3 className="text-2xl font-black text-white text-center mb-4">
                                    🎭 히든카드 선택 (라운드 {currentHiddenRound})
                                </h3>
                                <p className="text-gray-400 text-center mb-6">
                                    라운드 {currentHiddenRound}에서 사용할 히든카드를 선택하세요.<br />
                                    히든카드는 메인 카드와 함께 전투력을 발휘합니다!
                                </p>

                                {/* 현재 배치된 카드 중에서 히든카드 선택 */}
                                <div className="flex gap-4 justify-center flex-wrap mb-8">
                                    {mainAssignments.filter(c => c !== null).map((card) => {
                                        const isSelected = (currentHiddenRound === 2 && hiddenR2?.id === card!.id) ||
                                            (currentHiddenRound === 4 && hiddenR4?.id === card!.id);
                                        const alreadyUsed = (currentHiddenRound === 4 && hiddenR2?.id === card!.id);

                                        return (
                                            <motion.div
                                                key={card!.id}
                                                whileHover={{ scale: alreadyUsed ? 1 : 1.05 }}
                                                whileTap={{ scale: alreadyUsed ? 1 : 0.95 }}
                                                onClick={() => !alreadyUsed && selectHiddenCard(card!)}
                                                className={`w-24 h-32 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${isSelected
                                                    ? 'border-purple-500 bg-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                                    : alreadyUsed
                                                        ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                                                        : 'border-white/20 bg-white/5 hover:border-purple-400'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">🎭</div>
                                                <div className="text-xs text-white truncate px-2">{card!.name}</div>
                                                <div className="text-xs text-purple-400">{card!.stats?.totalPower || 0}</div>
                                                {isSelected && <div className="text-[10px] text-purple-300 mt-1">선택됨</div>}
                                                {alreadyUsed && <div className="text-[10px] text-gray-500 mt-1">R2 사용</div>}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center gap-4">
                                    <Button
                                        color="primary"
                                        size="lg"
                                        isDisabled={currentHiddenRound === 2 ? !hiddenR2 : !hiddenR4}
                                        onPress={confirmHiddenSelection}
                                    >
                                        {currentHiddenRound === 2 ? '다음 → 라운드 4 히든카드' : '전투 시작!'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Battle View (Viewing / Battle phase) */}
                        {(phase === 'viewing' || phase === 'battle') && (
                            <div className="w-full max-w-5xl h-96 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

                                <AnimatePresence mode="wait">
                                    {roundAnimState === 'clash' ? (
                                        /* Card Collision Animation */
                                        <motion.div
                                            key="clash-scene"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            {/* Player Card (from left) */}
                                            <motion.div
                                                initial={{ x: -400, scale: 0.5, rotate: -20 }}
                                                animate={{
                                                    x: -50,
                                                    scale: 1,
                                                    rotate: 0,
                                                    transition: { duration: 0.5, ease: "easeOut" }
                                                }}
                                                className="absolute w-32 h-44 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-2xl flex items-center justify-center"
                                            >
                                                <div className="text-6xl">🤖</div>
                                            </motion.div>

                                            {/* Enemy Card (from right) */}
                                            <motion.div
                                                initial={{ x: 400, scale: 0.5, rotate: 20 }}
                                                animate={{
                                                    x: 50,
                                                    scale: 1,
                                                    rotate: 0,
                                                    transition: { duration: 0.5, ease: "easeOut" }
                                                }}
                                                className="absolute w-32 h-44 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-2xl flex items-center justify-center"
                                            >
                                                <div className="text-6xl">👾</div>
                                            </motion.div>

                                            {/* Impact Effect */}
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{
                                                    scale: [0, 2, 1.5],
                                                    opacity: [0, 1, 0],
                                                    transition: { duration: 0.6, delay: 0.5 }
                                                }}
                                                className="absolute text-8xl"
                                            >
                                                ⚔️
                                            </motion.div>

                                            {/* Explosion Particles */}
                                            {[...Array(8)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                                    animate={{
                                                        scale: [0, 1, 0],
                                                        x: Math.cos(i * Math.PI / 4) * 100,
                                                        y: Math.sin(i * Math.PI / 4) * 100,
                                                        opacity: [1, 1, 0],
                                                        transition: { duration: 0.8, delay: 0.5 }
                                                    }}
                                                    className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                                                />
                                            ))}
                                        </motion.div>
                                    ) : (
                                        /* Idle State */
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                    opacity: [0.3, 0.5, 0.3]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2
                                                }}
                                                className="text-white/30 font-mono text-lg mb-4"
                                            >
                                                {phase === 'battle' ? `ROUND ${currentBattleRound + 1} ENGAGED` : 'ANALYZING STRATEGY...'}
                                            </motion.div>

                                            {/* Loading Spinner */}
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full mx-auto"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 4. Result --- */}
                {phase === 'result' && battleResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-8xl mb-8"
                            >
                                {battleResult.result === 'victory' ? '🏆' : '💀'}
                            </motion.div>
                            <h2 className="text-5xl font-black text-white orbitron mb-4">
                                {battleResult.result === 'victory' ? 'VICTORY' : 'DEFEAT'}
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                {battleResult.result === 'victory'
                                    ? storyStage?.enemy.dialogue.win
                                    : storyStage?.enemy.dialogue.lose}
                            </p>

                            <div className="flex gap-4 justify-center">
                                <Button size="lg" color="primary" onPress={handleResultConfirm}>
                                    CONTINUE
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 튜토리얼 오버레이 (스테이지 1-1) */}
            <AnimatePresence>
                {showTutorial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-br from-zinc-900 to-black border border-cyan-500/30 rounded-2xl p-8 max-w-xl w-full shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                        >
                            {tutorialStep === 0 && (
                                <>
                                    <div className="text-6xl text-center mb-6">⚔️</div>
                                    <h2 className="text-3xl font-black text-white text-center mb-4">전투 시스템 기초</h2>
                                    <p className="text-gray-400 text-center mb-6">
                                        AI 전쟁에 오신 것을 환영합니다, 지휘관님!<br />
                                        기본적인 전투 방식을 알려드리겠습니다.
                                    </p>
                                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                                        <h3 className="text-cyan-400 font-bold mb-2">📋 전투 모드</h3>
                                        <ul className="text-white/80 text-sm space-y-2">
                                            <li>⚡ <span className="text-amber-400">단판 승부</span>: 카드 1장으로 빠른 결정</li>
                                            <li>🎭 <span className="text-purple-400">전략 승부</span>: 카드 3장, 히든 카드 전략</li>
                                            <li>⚔️ <span className="text-red-400">전술 승부</span>: 카드 5장 풀 배틀</li>
                                        </ul>
                                    </div>
                                </>
                            )}
                            {tutorialStep === 1 && (
                                <>
                                    <div className="text-6xl text-center mb-6">🔄</div>
                                    <h2 className="text-3xl font-black text-white text-center mb-4">타입 상성</h2>
                                    <p className="text-gray-400 text-center mb-6">
                                        카드에는 3가지 타입이 있으며, 서로 상성 관계가 있습니다.
                                    </p>
                                    <div className="flex justify-center gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">⚙️</div>
                                            <div className="text-blue-400 font-bold">효율</div>
                                            <div className="text-xs text-gray-500">기능에 강함</div>
                                        </div>
                                        <div className="text-2xl text-white/30 pt-6">→</div>
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">💡</div>
                                            <div className="text-yellow-400 font-bold">창의</div>
                                            <div className="text-xs text-gray-500">효율에 강함</div>
                                        </div>
                                        <div className="text-2xl text-white/30 pt-6">→</div>
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🔧</div>
                                            <div className="text-green-400 font-bold">기능</div>
                                            <div className="text-xs text-gray-500">창의에 강함</div>
                                        </div>
                                    </div>
                                    <p className="text-center text-white/60 text-sm">
                                        가위바위보처럼 생각하세요: 효율 → 기능 → 창의 → 효율
                                    </p>
                                </>
                            )}
                            {tutorialStep === 2 && (
                                <>
                                    <div className="text-6xl text-center mb-6">🎯</div>
                                    <h2 className="text-3xl font-black text-white text-center mb-4">첫 번째 전투!</h2>
                                    <p className="text-gray-400 text-center mb-6">
                                        이번 스테이지는 <span className="text-amber-400 font-bold">단판 승부</span>입니다.<br />
                                        카드 1장만 선택하면 됩니다. 가장 강한 카드를 골라보세요!
                                    </p>
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                                        <p className="text-green-400 text-center font-bold">💡 팁: 카드의 전투력과 타입을 확인하세요!</p>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-center gap-4">
                                {tutorialStep > 0 && (
                                    <Button
                                        color="default"
                                        onPress={() => setTutorialStep(tutorialStep - 1)}
                                    >
                                        이전
                                    </Button>
                                )}
                                {tutorialStep < 2 ? (
                                    <Button
                                        color="primary"
                                        onPress={() => setTutorialStep(tutorialStep + 1)}
                                    >
                                        다음
                                    </Button>
                                ) : (
                                    <Button
                                        color="success"
                                        onPress={() => {
                                            setShowTutorial(false);
                                            localStorage.setItem('tutorial_stage_1_1_done', 'true');
                                        }}
                                    >
                                        전투 시작!
                                    </Button>
                                )}
                            </div>

                            {/* Progress dots */}
                            <div className="flex justify-center gap-2 mt-6">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all ${i === tutorialStep ? 'bg-cyan-400 w-6' : 'bg-white/20'
                                            }`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
