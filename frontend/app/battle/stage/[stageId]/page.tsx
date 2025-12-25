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
import { Zap, Swords } from 'lucide-react';

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

    // Data Load
    useEffect(() => {
        loadCards();
        const stage = getStoryStage(stageIdStr, t);
        if (stage) {
            setStoryStage(stage);

            // Map StoryStage to StageConfig
            const cardCount = stage.battleMode === 'ONE_CARD' ? 1 :
                stage.battleMode === 'TRIPLE_THREAT' ? 3 : 5;

            const config: StageConfig = {
                stageId: stage.step,
                chapter: 1, // Defaulting to 1 for now
                playerHandSize: cardCount === 5 ? 5 : cardCount,
                battleCardCount: cardCount,
                isBoss: stage.difficulty === 'BOSS',
                enemyPowerBonus: 0,
                rewardMultiplier: 1,
                enemyPattern: 'random',
                stageInChapter: stage.step,
                description: stage.description
            };
            setStageConfig(config);
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
        const cards = await gameStorage.getCards();
        // Process types if missing (Legacy logic)
        const processedCards = cards.map(card => {
            if (!card.type) {
                const stats = card.stats || { efficiency: 0, creativity: 0, function: 0 };
                let type: any = 'EFFICIENCY';
                if (stats.creativity! > stats.efficiency! && stats.creativity! > stats.function!) type = 'CREATIVITY';
                else if (stats.function! > stats.efficiency! && stats.function! > stats.creativity!) type = 'FUNCTION';
                return { ...card, type };
            }
            return card;
        });
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

        // 적 생성
        const enemyList = generateEnemies(stageConfig, avgPower, enemyCardCount);

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
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-white mb-2">DEPLOY YOUR SQUAD</h2>
                            <p className="text-gray-400">Select {stageConfig.playerHandSize} cards for this mission</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {allCards.map(card => (
                                <motion.div key={card.id} onClick={() => toggleHandSelection(card)} whileTap={{ scale: 0.95 }}>
                                    <GameCard card={card} isSelected={selectedHand.some(c => c.id === card.id)} />
                                </motion.div>
                            ))}
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

                {/* --- 3. Battle Execution (Simplified View) --- */}
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

                        {/* Card Slots / Battle Area */}
                        <div className="w-full max-w-5xl h-96 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                            {/* Placeholder for complex battle animation */}
                            <AnimatePresence mode="wait">
                                {roundAnimState === 'clash' ? (
                                    <motion.div
                                        key="clash"
                                        initial={{ scale: 2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="text-6xl"
                                    >
                                        ⚔️
                                    </motion.div>
                                ) : (
                                    <div className="text-white/30 font-mono">
                                        {phase === 'battle' ? `ROUND ${currentBattleRound + 1} ENGAGED` : 'ANALYZING STRATEGY...'}
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Phase specific UI for assignments would go here */}
                            {phase === 'main-assignment' && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                                    <h3 className="text-white mb-4">Assign Cards to Rounds</h3>
                                    <Button onPress={confirmMainAssignment}>Confirm Assignments</Button>
                                </div>
                            )}
                            {phase === 'hidden-assignment' && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                                    <h3 className="text-white mb-4">Assign Hidden Card (Round {currentHiddenRound})</h3>
                                    <Button onPress={confirmHiddenSelection}>Confirm Hidden</Button>
                                </div>
                            )}
                        </div>
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
        </div>
    );
}
